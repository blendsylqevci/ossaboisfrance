import fs from "fs";
import path from "path";
import type { Payload } from "payload";
import { optimizeHouseUploadImage } from "@/lib/optimize-house-upload-image";
import { buildPlanimetryVisualBuffer } from "@/lib/planimetry-visual-crop";

const RAW_DIR = path.join(process.cwd(), "public/planimetries-raw");

export type UploadPlanimetryResult = {
  mediaId: number | string;
  mediaUrl: string | null;
  visualMediaId?: number | string;
  visualMediaUrl?: string | null;
  houseIds: (number | string)[];
  slugs: string[];
};

/**
 * Upload a planimetry image from `public/planimetries-raw/` and attach it to
 * one or more houses by slug.
 */
export async function uploadPlanimetryFromRaw(
  payload: Payload,
  options: {
    filename: string;
    houseSlugs: string[];
    alt?: string;
  }
): Promise<UploadPlanimetryResult> {
  const { filename, houseSlugs, alt } = options;
  const filePath = path.join(RAW_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Planimetry file not found: ${filePath}`);
  }

  const houses = await payload.find({
    collection: "houses",
    where: { slug: { in: houseSlugs } },
    limit: houseSlugs.length,
    depth: 0,
  });

  const foundSlugs = new Set(houses.docs.map((d) => d.slug));
  const missing = houseSlugs.filter((s) => !foundSlugs.has(s));
  if (missing.length > 0) {
    throw new Error(`House slug(s) not found: ${missing.join(", ")}`);
  }

  const rawBuffer = fs.readFileSync(filePath);
  const { buffer, mimetype, size } = await optimizeHouseUploadImage(
    rawBuffer,
    filename
  );

  const uploadName = filename.replace(/\s+/g, "-").toLowerCase();

  const mediaDoc = await payload.create({
    collection: "media",
    overrideAccess: true,
    data: {
      alt: alt ?? `Planimétrie ${houseSlugs.join(", ")}`,
      mediaType: "plan",
    },
    file: {
      data: buffer,
      name: uploadName,
      mimetype,
      size,
    },
  });

  const mediaId = mediaDoc.id;
  let visualMediaId: number | string | undefined;
  let visualMediaUrl: string | null | undefined;

  const primarySlug = houseSlugs[0];
  const visualBuffer = primarySlug
    ? await buildPlanimetryVisualBuffer(buffer, primarySlug)
    : null;

  if (visualBuffer) {
    const visualName = uploadName.replace(/\.png$/i, "-plan.png");
    const visualDoc = await payload.create({
      collection: "media",
      overrideAccess: true,
      data: {
        alt: alt ? `${alt} (plan visuel)` : `Plan visuel ${houseSlugs.join(", ")}`,
        mediaType: "plan",
      },
      file: {
        data: visualBuffer,
        name: visualName,
        mimetype: "image/png",
        size: visualBuffer.length,
      },
    });
    visualMediaId = visualDoc.id;
    visualMediaUrl = typeof visualDoc.url === "string" ? visualDoc.url : null;
  }

  const updatedIds: (number | string)[] = [];

  for (const doc of houses.docs) {
    await payload.update({
      collection: "houses",
      id: doc.id,
      overrideAccess: true,
      data: {
        planimetry: mediaId,
        ...(visualMediaId ? { planimetryVisual: visualMediaId } : {}),
      },
    });
    updatedIds.push(doc.id);
  }

  return {
    mediaId,
    mediaUrl: typeof mediaDoc.url === "string" ? mediaDoc.url : null,
    visualMediaId,
    visualMediaUrl,
    houseIds: updatedIds,
    slugs: houses.docs.map((d) => d.slug as string),
  };
}

/** Rebuild planimetryVisual from raw source without replacing the full planimetry. */
export async function regeneratePlanimetryVisualFromRaw(
  payload: Payload,
  options: {
    filename: string;
    houseSlugs: string[];
    alt?: string;
  }
): Promise<{
  visualMediaId: number | string;
  visualMediaUrl: string | null;
  houseIds: (number | string)[];
  slugs: string[];
}> {
  const { filename, houseSlugs, alt } = options;
  const filePath = path.join(RAW_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Planimetry file not found: ${filePath}`);
  }

  const houses = await payload.find({
    collection: "houses",
    where: { slug: { in: houseSlugs } },
    limit: houseSlugs.length,
    depth: 0,
  });

  const foundSlugs = new Set(houses.docs.map((d) => d.slug));
  const missing = houseSlugs.filter((s) => !foundSlugs.has(s));
  if (missing.length > 0) {
    throw new Error(`House slug(s) not found: ${missing.join(", ")}`);
  }

  const rawBuffer = fs.readFileSync(filePath);
  const { buffer: optimizedBuffer } = await optimizeHouseUploadImage(
    rawBuffer,
    filename
  );

  const primarySlug = houseSlugs[0];
  const visualBuffer = primarySlug
    ? await buildPlanimetryVisualBuffer(optimizedBuffer, primarySlug)
    : null;

  if (!visualBuffer) {
    throw new Error(`No visual crop config for slug: ${primarySlug}`);
  }

  const uploadName = filename.replace(/\s+/g, "-").toLowerCase();
  const visualName = uploadName.replace(/\.png$/i, "-plan.png");

  const visualDoc = await payload.create({
    collection: "media",
    overrideAccess: true,
    data: {
      alt: alt ? `${alt} (plan visuel)` : `Plan visuel ${houseSlugs.join(", ")}`,
      mediaType: "plan",
    },
    file: {
      data: visualBuffer,
      name: visualName,
      mimetype: "image/png",
      size: visualBuffer.length,
    },
  });

  const visualMediaId = visualDoc.id;
  const visualMediaUrl =
    typeof visualDoc.url === "string" ? visualDoc.url : null;
  const updatedIds: (number | string)[] = [];

  for (const doc of houses.docs) {
    await payload.update({
      collection: "houses",
      id: doc.id,
      overrideAccess: true,
      data: { planimetryVisual: visualMediaId },
    });
    updatedIds.push(doc.id);
  }

  return {
    visualMediaId,
    visualMediaUrl,
    houseIds: updatedIds,
    slugs: houses.docs.map((d) => d.slug as string),
  };
}
