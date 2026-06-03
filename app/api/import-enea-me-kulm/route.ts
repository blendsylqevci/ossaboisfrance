import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import fs from "fs";
import path from "path";
import { optimizeHouseUploadImage } from "@/lib/optimize-house-upload-image";

const HOUSE_SLUG = "enea-avec-toit";

export async function GET(_req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    const layersDir = path.join(
      process.cwd(),
      "public/images/houses/maison enea me kulm"
    );
    if (!fs.existsSync(layersDir)) {
      return NextResponse.json(
        { success: false, error: `Directory not found: ${layersDir}` },
        { status: 404 }
      );
    }

    console.log(`[Import Enea me Kulm] Reading files from: ${layersDir}`);
    const files = fs.readdirSync(layersDir);

    const existing = await payload.find({
      collection: "houses",
      where: { slug: { equals: HOUSE_SLUG } },
      limit: 1,
    });

    if (existing.totalDocs > 0) {
      const oldDoc = existing.docs[0];
      console.log(
        `[Import Enea me Kulm] Deleting existing house ID ${oldDoc.id} (media via afterDelete hook)...`
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
    const altPrefix = "Enea avec Toit";

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
      "8. fibta.png": {
        field: "iso_ext_fibre",
        mediaType: "material_layer",
        alt: `Isolation extérieure fibre de bois ${altPrefix}`,
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
      "10 fasada e bardhe.png": {
        field: "facade_blanche",
        mediaType: "material_layer",
        alt: `Façade blanche enduit ${altPrefix}`,
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
      "12 dritaret alumin.png": {
        field: "windows_aluminium",
        mediaType: "material_layer",
        alt: `Menuiseries aluminium ${altPrefix}`,
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
      "enea me kulm 7.jpg": {
        field: "defaultImage",
        mediaType: "hero",
        alt: `${altPrefix} — 60×160`,
      },
      "enea me kulm 10.jpg": {
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

    for (const filename of files) {
      const mapInfo = mapping[filename];
      if (!mapInfo) {
        skippedFiles.push(filename);
        console.log(
          `[Import Enea me Kulm] Skipping file: ${filename} (no schema mapping)`
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
        `[Import Enea me Kulm] Uploading ${filename} (${(beforeSize / 1024 / 1024).toFixed(2)} MB → ${(size / 1024 / 1024).toFixed(2)} MB)...`
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

      if (filename === "enea me kulm 7.jpg") {
        defaultImageId = mediaId;
      } else if (filename === "enea me kulm 10.jpg") {
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
      throw new Error("Failed to upload tuiles layer (14. qeremidet.png).");
    }
    if (!mediaIds.couverture_bac_acier_gouttieres) {
      throw new Error("Failed to upload bac acier layer (15. llamarina.png).");
    }

    const newHouse = await payload.create({
      collection: "houses",
      locale: "fr",
      data: {
        title: "Enea avec Toit",
        slug: HOUSE_SLUG,
        category: categoryId,
        subheading:
          "Découvrez l'élégance moderne d'une maison de plain-pied d'exception à ossature bois, sublimée par une toiture traditionnelle à double pente. Le modèle Enea avec Toit allie confort thermique RE2020 et design contemporain personnalisable.",
        description:
          "Le modèle Enea avec Toit réinterprète le charme intemporel de la maison individuelle de plain-pied. Son architecture associe la convivialité d'un grand espace de vie ouvert à l'efficacité énergétique d'une isolation bois multicouche de pointe. Entièrement configurable, elle s'adapte à vos envies : choix des isolations, bardage en mélèze naturel, menuiseries premium et toiture en tuiles céramiques ou bac acier moderne. Grâce à une préfabrication soignée en atelier, Enea avec Toit permet une installation rapide sur site et des finitions extérieures personnalisables.",
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
      message: "Enea avec Toit created successfully.",
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
    console.error(`[Import Enea me Kulm Error]:`, error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
