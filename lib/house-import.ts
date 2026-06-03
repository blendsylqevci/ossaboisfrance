import fs from "fs";
import path from "path";
import type { Payload } from "payload";
import { optimizeHouseUploadImage } from "@/lib/optimize-house-upload-image";
import {
  assertRequiredLayers,
  collectHouseMediaIds,
} from "@/lib/house-import-shared";

export interface HouseFileMappingEntry {
  field: string;
  mediaType: string;
  alt: string;
}

export interface HouseImportConfig {
  /** e.g. "Import Asebra me Kulm" */
  logLabel: string;
  /** Folder under `public/images/houses/` */
  layersFolderName: string;
  slug: string;
  categorySlug: string;
  fileMapping: Record<string, HouseFileMappingEntry>;
  defaultImageFile: string;
  finalImageFile: string;
  /** Layer field keys that must be present after upload (excluding default/final images). */
  requiredLayerFields: string[];
  buildHousePayload: (
    categoryId: number | string
  ) => Record<string, unknown>;
  /** When true (default), prefixes uploads with a batch timestamp to avoid S3 collisions. */
  useUniqueUploadFilenames?: boolean;
}

export interface HouseImportSuccess {
  success: true;
  message: string;
  houseId: number | string;
  slug: string;
  categorySlug: string;
  wasUpdate: boolean;
  uploadedLayersCount: number;
  layerFields: string[];
  skippedFiles: string[];
  optimizationStats: { file: string; before: number; after: number }[];
  couvertureLayers?: {
    tuiles?: number;
    bac_acier?: number;
    pare_pluie?: number;
  };
}

/**
 * Safe house import: update existing house by slug, upload layers, link media,
 * delete only replaced media IDs after success (never deletes the house row).
 */
export async function importHouseFromFolder(
  payload: Payload,
  config: HouseImportConfig
): Promise<HouseImportSuccess> {
  const {
    logLabel,
    layersFolderName,
    slug,
    categorySlug,
    fileMapping,
    defaultImageFile,
    finalImageFile,
    requiredLayerFields,
    buildHousePayload,
    useUniqueUploadFilenames = true,
  } = config;

  const layersDir = path.join(
    process.cwd(),
    "public/images/houses",
    layersFolderName
  );

  if (!fs.existsSync(layersDir)) {
    throw new Error(`Directory not found: ${layersDir}`);
  }

  console.log(`[${logLabel}] Reading files from: ${layersDir}`);
  const files = fs.readdirSync(layersDir);

  const existing = await payload.find({
    collection: "houses",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });

  let existingHouseId: number | undefined;
  const oldMediaIds = new Set<number>();

  if (existing.totalDocs > 0) {
    const oldDoc = existing.docs[0];
    existingHouseId = Number(oldDoc.id);
    const collected = collectHouseMediaIds(
      oldDoc as {
        defaultImage?: unknown;
        finalImage?: unknown;
        layers?: unknown;
      }
    );
    collected.forEach((id) => oldMediaIds.add(id));
    console.log(
      `[${logLabel}] Updating existing house ID ${existingHouseId} (${oldMediaIds.size} old media refs)...`
    );
  }

  const categorySearch = await payload.find({
    collection: "house-categories",
    where: { slug: { equals: categorySlug } },
    limit: 1,
  });

  if (categorySearch.totalDocs === 0) {
    throw new Error(`Category '${categorySlug}' not found in database.`);
  }

  const categoryId = categorySearch.docs[0].id;
  const uploadBatch = Date.now();

  let defaultImageId: number | undefined;
  let finalImageId: number | undefined;
  const mediaIds: Record<string, number> = {};
  const allUploadedMediaIds: number[] = [];
  const optimizationStats: { file: string; before: number; after: number }[] =
    [];
  const skippedFiles: string[] = [];

  for (const filename of files) {
    const mapInfo = fileMapping[filename];
    if (!mapInfo) {
      skippedFiles.push(filename);
      console.log(`[${logLabel}] Skipping file: ${filename} (no schema mapping)`);
      continue;
    }

    const filePath = path.join(layersDir, filename);
    if (!fs.existsSync(filePath)) continue;

    const rawBuffer = fs.readFileSync(filePath);
    const beforeSize = rawBuffer.length;
    const { buffer, mimetype, size } = await optimizeHouseUploadImage(
      rawBuffer,
      filename
    );
    optimizationStats.push({
      file: filename,
      before: beforeSize,
      after: size,
    });

    console.log(
      `[${logLabel}] Uploading ${filename} (${(beforeSize / 1024 / 1024).toFixed(2)} MB → ${(size / 1024 / 1024).toFixed(2)} MB)...`
    );

    const uploadName = useUniqueUploadFilenames
      ? `${uploadBatch}-${filename.replace(/\s+/g, "-")}`
      : filename;

    const mediaDoc = await payload.create({
      collection: "media",
      data: {
        alt: mapInfo.alt,
        mediaType: mapInfo.mediaType,
      },
      file: {
        data: buffer,
        name: uploadName,
        mimetype,
        size,
      },
    });

    const mediaId = Number(mediaDoc.id);
    allUploadedMediaIds.push(mediaId);

    if (filename === defaultImageFile) {
      defaultImageId = mediaId;
    } else if (filename === finalImageFile) {
      finalImageId = mediaId;
    } else {
      mediaIds[mapInfo.field] = mediaId;
    }
  }

  if (!defaultImageId || !finalImageId) {
    throw new Error(
      `[${logLabel}] Failed to upload default or final images (${defaultImageFile}, ${finalImageFile}).`
    );
  }

  assertRequiredLayers(mediaIds, requiredLayerFields, logLabel);

  const housePayload = {
    ...buildHousePayload(categoryId),
    slug,
    category: categoryId,
    defaultImage: defaultImageId,
    finalImage: finalImageId,
    layers: mediaIds,
  };

  const savedHouse = existingHouseId
    ? await payload.update({
        collection: "houses",
        id: existingHouseId,
        locale: "fr",
        data: housePayload,
      })
    : await payload.create({
        collection: "houses",
        locale: "fr",
        data: housePayload,
      });

  const houseId = savedHouse.id;

  for (const mediaId of allUploadedMediaIds) {
    await payload.update({
      collection: "media",
      id: mediaId,
      data: { house: houseId },
    });
  }

  const newMediaIdSet = new Set(allUploadedMediaIds);
  for (const oldMediaId of Array.from(oldMediaIds)) {
    if (newMediaIdSet.has(oldMediaId)) continue;
    try {
      await payload.delete({
        collection: "media",
        id: oldMediaId,
      });
    } catch (deleteErr) {
      console.warn(
        `[${logLabel}] Could not delete old media ID ${oldMediaId}:`,
        deleteErr
      );
    }
  }

  const title =
    typeof savedHouse.title === "string" ? savedHouse.title : slug;

  return {
    success: true,
    message: existingHouseId
      ? `${title} updated successfully.`
      : `${title} created successfully.`,
    houseId,
    slug,
    categorySlug,
    wasUpdate: Boolean(existingHouseId),
    uploadedLayersCount: Object.keys(mediaIds).length,
    layerFields: Object.keys(mediaIds),
    skippedFiles,
    optimizationStats,
    couvertureLayers: {
      tuiles: mediaIds.couverture_tuiles_gouttieres,
      bac_acier: mediaIds.couverture_bac_acier_gouttieres,
      pare_pluie: mediaIds.couverture_pare_pluie_lattage,
    },
  };
}
