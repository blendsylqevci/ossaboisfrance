import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import fs from "fs";
import path from "path";
import { optimizeHouseUploadImage } from "@/lib/optimize-house-upload-image";

const HOUSE_SLUG = "a-frame-house-me-kulm";

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    const layersDir = path.join(
      process.cwd(),
      "public/images/houses/a frame house me kulm"
    );
    if (!fs.existsSync(layersDir)) {
      return NextResponse.json(
        { success: false, error: `Directory not found: ${layersDir}` },
        { status: 404 }
      );
    }

    console.log(`[Import A Frame me Kulm] Reading files from: ${layersDir}`);
    const files = fs.readdirSync(layersDir);

    const existing = await payload.find({
      collection: "houses",
      where: { slug: { equals: HOUSE_SLUG } },
      limit: 1,
    });

    if (existing.totalDocs > 0) {
      const oldDoc = existing.docs[0];
      console.log(
        `[Import A Frame me Kulm] Deleting existing house ID ${oldDoc.id} (media via afterDelete hook)...`
      );
      await payload.delete({
        collection: "houses",
        id: oldDoc.id,
      });
    }

    const categorySearch = await payload.find({
      collection: "house-categories",
      where: { slug: { equals: "maison-plein-pied" } },
      limit: 1,
    });

    if (categorySearch.totalDocs === 0) {
      throw new Error("Category 'maison-plein-pied' not found in database.");
    }

    const categoryId = categorySearch.docs[0].id;

    const mapping: Record<
      string,
      { field: string; mediaType: string; alt: string }
    > = {
      "1. Prapavija.png": {
        field: "backgroundLayer",
        mediaType: "hero",
        alt: "Arrière-plan A Frame House me Kulm",
      },
      "2. kons.png": {
        field: "constructionLayer",
        mediaType: "construction_layer",
        alt: "Structure bois A Frame House me Kulm",
      },
      "3. leshguri.png": {
        field: "iso_inter_roche",
        mediaType: "material_layer",
        alt: "Isolation laine de roche A Frame House me Kulm",
      },
      "4. lesh druri.png": {
        field: "iso_inter_bois",
        mediaType: "material_layer",
        alt: "Isolation laine de bois A Frame House me Kulm",
      },
      "5. lsh xhami.png": {
        field: "iso_inter_verre",
        mediaType: "material_layer",
        alt: "Isolation laine de verre A Frame House me Kulm",
      },
      "6. stiropori.png": {
        field: "iso_ext_polystyrene",
        mediaType: "material_layer",
        alt: "Isolation extérieure polystyrène A Frame House me Kulm",
      },
      "7. lesh guri jashte.png": {
        field: "iso_ext_roche_comprimee",
        mediaType: "material_layer",
        alt: "Isolation extérieure laine de roche A Frame House me Kulm",
      },
      "8. fibra.png": {
        field: "iso_ext_fibre",
        mediaType: "material_layer",
        alt: "Isolation extérieure fibre de bois A Frame House me Kulm",
      },
      "9. folia dhe listelat.png": {
        field: "etancheite_epdm",
        mediaType: "material_layer",
        alt: "Pare-pluie et lattage A Frame House me Kulm",
      },
      "14. qeramika.png": {
        field: "couverture_tuiles_gouttieres",
        mediaType: "material_layer",
        alt: "Couverture tuiles A Frame House me Kulm",
      },
      "14. qeremidet.png": {
        field: "couverture_tuiles_gouttieres",
        mediaType: "material_layer",
        alt: "Couverture tuiles A Frame House me Kulm",
      },
      "15.a llamarina.png": {
        field: "couverture_bac_acier_gouttieres",
        mediaType: "material_layer",
        alt: "Couverture bac acier A Frame House me Kulm",
      },
      "15. llamarina.png": {
        field: "couverture_bac_acier_gouttieres",
        mediaType: "material_layer",
        alt: "Couverture bac acier A Frame House me Kulm",
      },
      "10. fasada e bardhe.png": {
        field: "facade_blanche",
        mediaType: "material_layer",
        alt: "Façade blanche enduit A Frame House me Kulm",
      },
      "11. fasada arish.png": {
        field: "facade_bardage",
        mediaType: "material_layer",
        alt: "Façade bardage mélèze A Frame House me Kulm",
      },
      "12. dritaret alumin.png": {
        field: "windows_aluminium",
        mediaType: "material_layer",
        alt: "Menuiseries aluminium A Frame House me Kulm",
      },
      "13. dritaret pvc.png": {
        field: "windows_pvc",
        mediaType: "material_layer",
        alt: "Menuiseries PVC A Frame House me Kulm",
      },
      "a frame house me kulm 7.jpg": {
        field: "defaultImage",
        mediaType: "hero",
        alt: "A Frame House me Kulm — 60×160",
      },
      "a frame house me kulm 10.jpg": {
        field: "finalImage",
        mediaType: "final_render",
        alt: "A Frame House me Kulm — 60×200",
      },
    };

    let defaultImageId: number | undefined;
    let finalImageId: number | undefined;
    const mediaIds: Record<string, number> = {};
    const allUploadedMediaIds: number[] = [];
    const optimizationStats: { file: string; before: number; after: number }[] =
      [];
    const skippedFiles: string[] = [];

    for (const filename of files) {
      const mapInfo = mapping[filename];
      if (!mapInfo) {
        skippedFiles.push(filename);
        console.log(
          `[Import A Frame me Kulm] Skipping file: ${filename} (no schema mapping)`
        );
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
        `[Import A Frame me Kulm] Uploading ${filename} (${(beforeSize / 1024 / 1024).toFixed(2)} MB → ${(size / 1024 / 1024).toFixed(2)} MB)...`
      );

      const mediaDoc = await payload.create({
        collection: "media",
        data: {
          alt: mapInfo.alt,
          mediaType: mapInfo.mediaType,
        },
        file: {
          data: buffer,
          name: filename,
          mimetype,
          size,
        },
      });

      const mediaId = Number(mediaDoc.id);
      allUploadedMediaIds.push(mediaId);

      if (filename === "a frame house me kulm 7.jpg") {
        defaultImageId = mediaId;
      } else if (filename === "a frame house me kulm 10.jpg") {
        finalImageId = mediaId;
      } else {
        mediaIds[mapInfo.field] = mediaId;
      }
    }

    if (!defaultImageId || !finalImageId) {
      throw new Error("Failed to upload default or final images.");
    }
    if (!mediaIds.backgroundLayer || !mediaIds.constructionLayer) {
      throw new Error(
        "Failed to upload required layers (backgroundLayer, constructionLayer)."
      );
    }
    if (!mediaIds.etancheite_epdm) {
      throw new Error("Failed to upload pare-pluie layer (9. folia dhe listelat.png).");
    }

    const missingKulmCoverFiles = [
      "14. qeramika.png",
      "15.a llamarina.png",
    ].filter((name) => !files.includes(name));

    const newHouse = await payload.create({
      collection: "houses",
      locale: "fr",
      data: {
        title: "A Frame House me Kulm",
        slug: HOUSE_SLUG,
        category: categoryId,
        subheading:
          "A Frame House avec toit est une maison modulaire élégante à ossature bois, offrant un design chaleureux et une performance thermique optimale.",
        description:
          "A Frame House avec toit est une maison modulaire moderne construite sur une ossature bois robuste, conçue pour offrir un confort exceptionnel en toutes saisons. Son toit incliné améliore l'évacuation des eaux pluviales, optimise l'isolation naturelle et donne à la maison une esthétique chaleureuse et intemporelle. Grâce à une préfabrication de haute précision, l'installation est rapide, durable et adaptable à différents types de finitions extérieures (bois naturel, panneaux composites, enduit moderne). Ce modèle combine élégance, efficacité énergétique et fonctionnalité, parfaitement adapté aux familles, résidences secondaires ou projets touristiques.",
        specification: "Fiche technique disponible sur demande.",
        price60x160: 1,
        price60x200: 1,
        enableFlags: {
          enableRoofOption: true,
          enableEtancheiteOption: true,
          enableEtancheiteTerrasse: false,
          enableCouvertureOption: true,
          enableFauxPlafondOption: false,
        },
        defaultImage: defaultImageId,
        finalImage: finalImageId,
        layers: mediaIds,
        perdhesa: {
          bruto: 1,
          neto: 0,
          mure_te_jashtme: 1,
          mure_mbajtese: 1,
          mure_ndarese: 1,
          pllaka_e_kulmit: 1,
          pllaka_e_katit_0: 1,
          pllaka_e_katit_1: 1,
          pllaka_e_katit_2: 1,
          pllaka_e_katit: 1,
          kulmi: 1,
        },
        windows: {
          aluminiumPrice: 1,
          pvcPrice: 1,
        },
        structureInfo:
          "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l'ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle type fermette. Le prix inclut le transport et le montage sur site sous garantie décennale.",
      },
    });

    const houseId = newHouse.id;

    for (const mediaId of allUploadedMediaIds) {
      await payload.update({
        collection: "media",
        id: mediaId,
        data: { house: houseId },
      });
    }

    return NextResponse.json({
      success: true,
      message: "A Frame House me Kulm created successfully.",
      houseId,
      slug: HOUSE_SLUG,
      category: "maison-plein-pied",
      uploadedLayersCount: Object.keys(mediaIds).length,
      layerFields: Object.keys(mediaIds),
      skippedFiles,
      missingKulmCoverFiles,
      optimizationStats,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to process import";
    console.error(`[Import A Frame me Kulm Error]:`, error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
