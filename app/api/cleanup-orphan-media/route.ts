import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

function collectMediaId(value: unknown, active: Set<number>) {
  if (value == null) return;
  if (typeof value === "number") {
    active.add(value);
    return;
  }
  if (typeof value === "object") {
    if ("id" in value && value.id != null) {
      active.add(Number((value as { id: number }).id));
    }
    if (Array.isArray(value)) {
      for (const item of value) collectMediaId(item, active);
      return;
    }
    for (const nested of Object.values(value)) {
      collectMediaId(nested, active);
    }
  }
}

/** Orphan import leftovers — never delete asebra-me-atike_* (used by asebra-avec-attique). */
function isSafeOrphanFilename(filename: string): boolean {
  const lower = filename.toLowerCase();
  if (lower === "enea me kulm 7.jpg" || lower === "enea me kulm 10.jpg") {
    return true;
  }
  if (lower === "asebra me kulm 10-1.jpg") return true;
  if (lower.includes("maison-enea-me-kulm")) return true;
  // Timestamp-prefixed re-import uploads (engine uses batch prefix)
  if (/^\d{10,}-/.test(filename)) return true;
  return false;
}

export async function GET(req: NextRequest) {
  const dryRun = req.nextUrl.searchParams.get("dryRun") !== "false";
  const forceIdsParam = req.nextUrl.searchParams.get("forceIds");
  const forceIds = forceIdsParam
    ? forceIdsParam.split(",").map((s) => Number(s.trim())).filter((n) => n > 0)
    : [];

  try {
    const payload = await getPayload({ config });
    const active = new Set<number>();

    const houses = await payload.find({
      collection: "houses",
      limit: 500,
      depth: 2,
      pagination: false,
    });

    for (const house of houses.docs) {
      collectMediaId(house.defaultImage, active);
      collectMediaId(house.finalImage, active);
      collectMediaId(house.planimetry, active);
      collectMediaId(house.layers, active);
      collectMediaId(house.isoOptions, active);
      collectMediaId(house.couvertureOptions, active);
      collectMediaId(house.customFields, active);
    }

    const candidates = await payload.find({
      collection: "media",
      limit: 500,
      pagination: false,
      where: {
        or: [
          { filename: { equals: "enea me kulm 7.jpg" } },
          { filename: { equals: "enea me kulm 10.jpg" } },
          { filename: { equals: "asebra me kulm 10-1.jpg" } },
          { filename: { contains: "maison-enea-me-kulm" } },
          { filename: { contains: "-enea-me-kulm-" } },
          { filename: { contains: "-asebra-me-kulm-" } },
          { filename: { contains: "-a-frame-house-me-kulm-" } },
        ],
      },
    });

    const toDelete = candidates.docs.filter((doc) => {
      const id = Number(doc.id);
      const filename = String(doc.filename ?? "");
      if (forceIds.includes(id)) return true;
      return !active.has(id) && isSafeOrphanFilename(filename);
    });

    for (const forcedId of forceIds) {
      if (toDelete.some((d) => Number(d.id) === forcedId)) continue;
      try {
        const doc = await payload.findByID({
          collection: "media",
          id: forcedId,
        });
        if (doc && isSafeOrphanFilename(String(doc.filename ?? ""))) {
          toDelete.push(doc);
        }
      } catch {
        // skip missing
      }
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        activeMediaCount: active.size,
        wouldDelete: toDelete.map((d) => ({
          id: d.id,
          filename: d.filename,
        })),
      });
    }

    const deleted: { id: number; filename: string }[] = [];
    const failed: { id: number; error: string }[] = [];

    for (const doc of toDelete) {
      try {
        await payload.delete({ collection: "media", id: doc.id });
        deleted.push({
          id: Number(doc.id),
          filename: String(doc.filename ?? ""),
        });
      } catch (err) {
        failed.push({
          id: Number(doc.id),
          error: err instanceof Error ? err.message : "delete failed",
        });
      }
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      deletedCount: deleted.length,
      deleted,
      failed,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Cleanup failed";
    console.error("[cleanup-orphan-media]", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
