import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { uploadPlanimetryFromRaw, regeneratePlanimetryVisualFromRaw } from "@/lib/upload-planimetry-from-raw";

/**
 * Dev/staging helper: upload planimetry from public/planimetries-raw/ and link
 * to house slug(s). Blocked in production via middleware.
 *
 * GET /api/upload-planimetry?file=A%20FRAME%20HOUSE.png&slugs=a-frame-house,a-frame-house-me-kulm
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
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
