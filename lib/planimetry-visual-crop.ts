import sharp from "sharp";

/**
 * Fraction of width to hide on the right (OSSA logo + A FRAME HOUSE table).
 * Full height, house + side dimension lines stay visible.
 */
const RIGHT_STRIP_BY_SLUG: Record<string, number> = {
  "a-frame-house": 0.28,
  "a-frame-house-me-kulm": 0.28,
};

/**
 * Build a plan-only PNG: full plan + side dimensions, without the right column.
 */
export async function buildPlanimetryVisualBuffer(
  input: Buffer,
  slug: string
): Promise<Buffer | null> {
  const rightStrip = RIGHT_STRIP_BY_SLUG[slug];
  if (rightStrip == null) return null;

  const meta = await sharp(input).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) return null;

  const keepWidth = Math.max(1, Math.round(width * (1 - rightStrip)));

  return sharp(input)
    .extract({ left: 0, top: 0, width: keepWidth, height })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** CSS fallback: hide the same right strip when no visual asset exists yet. */
export function getPlanimetryImageCropRight(slug: string): number | null {
  const strip = RIGHT_STRIP_BY_SLUG[slug];
  if (strip == null) return null;
  return Math.round(strip * 100);
}
