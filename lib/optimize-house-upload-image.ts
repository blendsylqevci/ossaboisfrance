import sharp from "sharp";

/** Target 4K canvas for configurator layers (3840×2160). Never upscale. */
const MAX_DIMENSION = 3840;

export async function optimizeHouseUploadImage(
  input: Buffer,
  filename: string
): Promise<{ buffer: Buffer; mimetype: string; size: number }> {
  const lower = filename.toLowerCase();
  let pipeline = sharp(input);
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
