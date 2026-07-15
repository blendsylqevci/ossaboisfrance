import sharp from "sharp";

/** Target 4K canvas for configurator layers (3840×2160). Never upscale. */
const MAX_DIMENSION = 3840;

type OptimizeHouseUploadImageOptions = {
  /** Reject metadata that declares more pixels before Sharp rasterizes it. */
  limitInputPixels?: number;
};

export async function optimizeHouseUploadImage(
  input: Buffer,
  filename: string,
  options: OptimizeHouseUploadImageOptions = {}
): Promise<{ buffer: Buffer; mimetype: string; size: number }> {
  const { limitInputPixels } = options;
  if (
    limitInputPixels !== undefined &&
    (!Number.isSafeInteger(limitInputPixels) || limitInputPixels <= 0)
  ) {
    throw new RangeError("limitInputPixels must be a positive safe integer");
  }

  const lower = filename.toLowerCase();
  let pipeline = sharp(
    input,
    limitInputPixels === undefined ? undefined : { limitInputPixels }
  );
  const meta = await pipeline.metadata();

  if (
    meta.width &&
    meta.height &&
    (meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION)
  ) {
    pipeline = pipeline.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  if (lower.endsWith(".png")) {
    const buffer = await pipeline
      .png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 })
      .toBuffer();
    return { buffer, mimetype: "image/png", size: buffer.length };
  }

  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    const buffer = await pipeline
      .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:4:4" })
      .toBuffer();
    return { buffer, mimetype: "image/jpeg", size: buffer.length };
  }

  return { buffer: input, mimetype: "application/octet-stream", size: input.length };
}
