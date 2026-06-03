import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import fs from "fs";
import path from "path";
import { optimizeHouseUploadImage } from "@/lib/optimize-house-upload-image";

const HOUSE_SLUG = "asebra-avec-toit";

export async function GET(_req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    const layersDir = path.join(
      process.cwd(),
      "public/images/houses/asebra me kulm"
    );
    if (!fs.existsSync(layersDir)) {
      return NextResponse.json(
        { success: false, error: `Directory not found: ${layersDir}` },
        { status: 404 }
      );
    }

    console.log(`[Import Asebra me Kulm] Reading files from: ${layersDir}`);
    const files = fs.readdirSync(layersDir);

    const existing = await payload.find({
      collection: "houses",
      where: { slug: { equals: HOUSE_SLUG } },
      limit: 1,
      depth: 1,
    });

    let existingHouseId: number | undefined;
    const oldMediaIds = new Set<number>();

    if (existing.totalDocs > 0) {
      const oldDoc = existing.docs[0];
      existingHouseId = Number(oldDoc.id);

      const collectMediaId = (value: unknown) => {
        if (typeof value === "number") oldMediaIds.add(value);
        else if (typeof value === "object" && value !== null && "id" in value) {
          oldMediaIds.add(Number((value as { id: number }).id));
        }
      };

      collectMediaId(oldDoc.defaultImage);
      collectMediaId(oldDoc.finalImage);
      if (oldDoc.layers && typeof oldDoc.layers === "object") {
        for (const layerValue of Object.values(oldDoc.layers)) {
          collectMediaId(layerValue);
        }
      }

      console.log(
        `[Import Asebra me Kulm] Updating existing house ID ${existingHouseId} (${oldMediaIds.size} old media refs)...`
      );
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
    const altPrefix = "Asebra avec Toit";

    const mapping: Record<
      string,
      { field: string; mediaType: string; alt: string }
    > = {
      "1. prapavija.png": {
        field: "backgroundLayer",
        mediaType: "hero",
        alt: `Arrière-plan ${altPrefix}`,
      },
      "2. kons.png": {
        field: "constructionLayer",
        mediaType: "construction_layer",
        alt: `Structure bois ${altPrefix}`,
      },
      "3. lesh guri.png": {
        field: "iso_inter_roche",
        mediaType: "material_layer",
        alt: `Isolation laine de roche ${altPrefix}`,
      },
      "3. LESHGURI.png": {
        field: "iso_inter_roche",
        mediaType: "material_layer",
        alt: `Isolation laine de roche ${altPrefix}`,
      },
      "4. lesh druri.png": {
        field: "iso_inter_bois",
        mediaType: "material_layer",
        alt: `Isolation laine de bois ${altPrefix}`,
      },
      "5. lesh xhami.png": {
        field: "iso_inter_verre",
        mediaType: "material_layer",
        alt: `Isolation laine de verre ${altPrefix}`,
      },
      "6. stiropori.png": {
        field: "iso_ext_polystyrene",
        mediaType: "material_layer",
        alt: `Isolation extérieure polystyrène ${altPrefix}`,
      },
      "7. lesh guri jashte.png": {
        field: "iso_ext_roche_comprimee",
        mediaType: "material_layer",
        alt: `Isolation extérieure laine de roche ${altPrefix}`,
      },
      "8. fibra.png": {
        field: "iso_ext_fibre",
        mediaType: "material_layer",
        alt: `Isolation extérieure fibre de bois ${altPrefix}`,
      },
      "9. folia dhe listelat.png": {
        field: "couverture_pare_pluie_lattage",
        mediaType: "material_layer",
        alt: `Pare-pluie et lattage ${altPrefix}`,
      },
      "9. listelat dhe folia.png": {
        field: "couverture_pare_pluie_lattage",
        mediaType: "material_layer",
        alt: `Pare-pluie et lattage ${altPrefix}`,
      },
      "10. fasada e bardhe.png": {
        field: "facade_blanche",
        mediaType: "material_layer",
        alt: `Façade blanche enduit ${altPrefix}`,
      },
      "11. fasada arish.png": {
        field: "facade_bardage",
        mediaType: "material_layer",
        alt: `Façade bardage mélèze ${altPrefix}`,
      },
      "12. dritaret alumin.png": {
        field: "windows_aluminium",
        mediaType: "material_layer",
        alt: `Menuiseries aluminium ${altPrefix}`,
      },
      "13. dritaret pvc.png": {
        field: "windows_pvc",
        mediaType: "material_layer",
        alt: `Menuiseries PVC ${altPrefix}`,
      },
      "14. qeremidet.png": {
        field: "couverture_tuiles_gouttieres",
        mediaType: "material_layer",
        alt: `Couverture tuiles ${altPrefix}`,
      },
      "14. qeramika.png": {
        field: "couverture_tuiles_gouttieres",
        mediaType: "material_layer",
        alt: `Couverture tuiles ${altPrefix}`,
      },
      "15. llamarina.png": {
        field: "couverture_bac_acier_gouttieres",
        mediaType: "material_layer",
        alt: `Couverture bac acier ${altPrefix}`,
      },
      "15a. llamarina.png": {
        field: "couverture_bac_acier_gouttieres",
        mediaType: "material_layer",
        alt: `Couverture bac acier ${altPrefix}`,
      },
      "15.a llamarina.png": {
        field: "couverture_bac_acier_gouttieres",
        mediaType: "material_layer",
        alt: `Couverture bac acier ${altPrefix}`,
      },
      "asebra me kulm 7.jpg": {
        field: "defaultImage",
        mediaType: "hero",
        alt: `${altPrefix} — 60×160`,
      },
      "asebra me kulm 10.jpg": {
        field: "finalImage",
        mediaType: "final_render",
        alt: `${altPrefix} — 60×200`,
      },
    };

    let defaultImageId: number | undefined;
    let finalImageId: number | undefined;
    const mediaIds: Record<string, number> = {};
    const allUploadedMediaIds: number[] = [];
    const optimizationStats: { file: string; before: number; after: number }[] =
      [];
    const skippedFiles: string[] = [];
    const uploadBatch = Date.now();

    for (const filename of files) {
      const mapInfo = mapping[filename];
      if (!mapInfo) {
        skippedFiles.push(filename);
        console.log(
          `[Import Asebra me Kulm] Skipping file: ${filename} (no schema mapping)`
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
        `[Import Asebra me Kulm] Uploading ${filename} (${(beforeSize / 1024 / 1024).toFixed(2)} MB → ${(size / 1024 / 1024).toFixed(2)} MB)...`
      );

      const mediaDoc = await payload.create({
        collection: "media",
        data: {
          alt: mapInfo.alt,
          mediaType: mapInfo.mediaType,
        },
        file: {
          data: buffer,
          name: `${uploadBatch}-${filename.replace(/\s+/g, "-")}`,
          mimetype,
          size,
        },
      });

      const mediaId = Number(mediaDoc.id);
      allUploadedMediaIds.push(mediaId);

      if (filename === "asebra me kulm 7.jpg") {
        defaultImageId = mediaId;
      } else if (filename === "asebra me kulm 10.jpg") {
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
    if (!mediaIds.couverture_pare_pluie_lattage) {
      throw new Error("Failed to upload pare-pluie layer (9. folia dhe listelat.png).");
    }
    if (!mediaIds.couverture_tuiles_gouttieres) {
      throw new Error("Failed to upload tuiles layer (14. qeramika.png).");
    }
    if (!mediaIds.couverture_bac_acier_gouttieres) {
      throw new Error("Failed to upload bac acier layer (15.a llamarina.png).");
    }

    const houseData = {
      title: "Asebra avec Toit",
      slug: HOUSE_SLUG,
      category: categoryId,
      subheading:
        "ASEBRA avec toiture est une maison modulaire de plain-pied à ossature bois, dotée d'une toiture inclinée, offrant un style chaleureux, équilibré et performant.",
      description:
        "Le modèle Asebra avec Toit allie les espaces de vie spacieux et ouverts de plain-pied de la gamme Asebra au charme intemporel d'une toiture à double pente. Construite sur une ossature bois robuste garantissant durabilité, stabilité et excellente performance thermique, cette maison modulaire contemporaine permet une installation rapide sur site et des finitions extérieures personnalisables. Fonctionnelle, lumineuse et élégante, elle est idéale pour une résidence principale ou un projet résidentiel durable.",
      specification:
        "Maison à ossature bois de plain-pied avec toiture à pans inclinés. Couverture en tuiles ou bac acier sur pare-pluie et lattage inclus dans le prix de la structure.",
      price60x160: 1,
      price60x200: 1,
      enableFlags: {
        enableRoofOption: true,
        enableEtancheiteOption: false,
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
    };

    const newHouse = existingHouseId
      ? await payload.update({
          collection: "houses",
          id: existingHouseId,
          locale: "fr",
          data: houseData,
        })
      : await payload.create({
          collection: "houses",
          locale: "fr",
          data: houseData,
        });

    const houseId = newHouse.id;

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
          `[Import Asebra me Kulm] Could not delete old media ID ${oldMediaId}:`,
          deleteErr
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: existingHouseId
        ? "Asebra avec Toit updated successfully."
        : "Asebra avec Toit created successfully.",
      houseId,
      slug: HOUSE_SLUG,
      category: "maison-plein-pied",
      uploadedLayersCount: Object.keys(mediaIds).length,
      layerFields: Object.keys(mediaIds),
      skippedFiles,
      optimizationStats,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to process import";
    console.error(`[Import Asebra me Kulm Error]:`, error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
