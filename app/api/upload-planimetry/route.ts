import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { PLANIMETRY_RAW_MANIFEST } from "@/lib/planimetry-raw-manifest";
import { uploadPlanimetryFromRaw, regeneratePlanimetryVisualFromRaw } from "@/lib/upload-planimetry-from-raw";

const RAW_DIR = path.join(process.cwd(), "public/planimetries-raw");

async function resolveHouseSlugs(
  payload: Awaited<ReturnType<typeof getPayload>>,
  candidates: string[]
): Promise<string[]> {
  if (candidates.length === 0) return [];

  const res = await payload.find({
    collection: "houses",
    where: { slug: { in: candidates } },
    limit: candidates.length,
    depth: 0,
  });

  const found = new Set(res.docs.map((d) => d.slug as string));
  return candidates.filter((s) => found.has(s));
}

/**
 * Dev/staging helper: upload planimetry from public/planimetries-raw/ and link
 * to house slug(s). Blocked in production via middleware.
 *
 * GET /api/upload-planimetry?batch=1
 * GET /api/upload-planimetry?file=A%20FRAME%20HOUSE.png&slugs=a-frame-house,a-frame-house-me-kulm
 */
export async function GET(req: Request) {
  const url = new URL(req.url);

  if (url.searchParams.get("batch") === "1") {
    try {
      const payload = await getPayload({ config });
      const results: Array<{
        filename: string;
        ok: boolean;
        detail: string;
        slugs?: string[];
        mediaId?: number | string;
      }> = [];

      for (const entry of PLANIMETRY_RAW_MANIFEST) {
        const filePath = path.join(RAW_DIR, entry.filename);
        if (!fs.existsSync(filePath)) {
          results.push({
            filename: entry.filename,
            ok: false,
            detail: "file missing in planimetries-raw",
          });
          continue;
        }

        const houseSlugs = await resolveHouseSlugs(payload, entry.slugs);
        if (houseSlugs.length === 0) {
          results.push({
            filename: entry.filename,
            ok: false,
            detail: `no matching house in DB for: ${entry.slugs.join(", ")}`,
          });
          continue;
        }

        try {
          const out = await uploadPlanimetryFromRaw(payload, {
            filename: entry.filename,
            houseSlugs,
            alt: `Planimétrie ${houseSlugs.join(" / ")}`,
          });
          results.push({
            filename: entry.filename,
            ok: true,
            detail: `linked → ${out.slugs.join(", ")}`,
            slugs: out.slugs,
            mediaId: out.mediaId,
          });
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Failed to upload planimetry";
          results.push({ filename: entry.filename, ok: false, detail: message });
        }
      }

      const okCount = results.filter((r) => r.ok).length;
      return NextResponse.json({
        success: okCount === results.length,
        ok: okCount,
        failed: results.length - okCount,
        total: results.length,
        results,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Batch upload failed";
      console.error("[upload-planimetry batch]", error);
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  }

  const filename = url.searchParams.get("file");
  const slugsParam = url.searchParams.get("slugs");

  if (!filename || !slugsParam) {
    return NextResponse.json(
      {
        success: false,
        error: "Query params required: file, slugs (comma-separated house slugs)",
      },
      { status: 400 }
    );
  }

  const houseSlugs = slugsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const payload = await getPayload({ config });
    const visualOnly = url.searchParams.get("visualOnly") === "1";

    if (visualOnly) {
      const result = await regeneratePlanimetryVisualFromRaw(payload, {
        filename,
        houseSlugs,
        alt: `Planimétrie ${houseSlugs.join(" / ")}`,
      });
      return NextResponse.json({ success: true, visualOnly: true, ...result });
    }

    const result = await uploadPlanimetryFromRaw(payload, {
      filename,
      houseSlugs,
      alt: `Planimétrie ${houseSlugs.join(" / ")}`,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to upload planimetry";
    console.error("[upload-planimetry]", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
