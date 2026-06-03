import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import fs from "fs";
import path from "path";
import { optimizeHouseUploadImage } from "@/lib/optimize-house-upload-image";

const HOUSE_SLUG = "amethyste-me-kulm";

export async function GET(_req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    const layersDir = path.join(
      process.cwd(),
      "public/images/houses/Amethyste me kulm"
    );
    if (!fs.existsSync(layersDir)) {
      return NextResponse.json(
        { success: false, error: `Directory not found: ${layersDir}` },
        { status: 404 }
      );
    }

    console.log(`[Import Amethyste me Kulm] Reading files from: ${layersDir}`);
    const files = fs.readdirSync(layersDir);

    const existing = await payload.find({
      collection: "houses",
      where: { slug: { equals: HOUSE_SLUG } },
      limit: 1,
    });

    if (existing.totalDocs > 0) {
      const oldDoc = existing.docs[0];
      console.log(
        `[Import Amethyste me Kulm] Deleting existing house ID ${oldDoc.id} (media via afterDelete hook)...`
      );
      await payload.delete({
        collection: "houses",
        id: oldDoc.id,
      });
    }

    const categorySearch = await payload.find({
      collection: "house-categories",
      where: { slug: { equals: "maison-avec-etage" } },
      limit: 1,
    });

    if (categorySearch.totalDocs === 0) {
      throw new Error("Category 'maison-avec-etage' not found in database.");
    }

    const categoryId = categorySearch.docs[0].id;
    const altPrefix = "Amethyste me Kulm";

    const mapping: Record<
      string,
      { field: string; mediaType: string; alt: string }
    > = {
      "1. prapavija.png": {
        field: "backgroundLayer",
        mediaType: "hero",
        alt: `Arrière-plan ${altPrefix}`,
      },
      "1.prapavija.png": {
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
      "6. STIROPORI.png": {
        field: "iso_ext_polystyrene",
        mediaType: "material_layer",
        alt: `Isolation extérieure polystyrène ${altPrefix}`,
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
      "7.lesh guri jashte.png": {
        field: "iso_ext_roche_comprimee",
        mediaType: "material_layer",
        alt: `Isolation extérieure laine de roche ${altPrefix}`,
      },
      "8. fibra.png": {
        field: "iso_ext_fibre",
        mediaType: "material_layer",
        alt: `Isolation extérieure fibre de bois ${altPrefix}`,
      },
      "9. listelat dhe folia.png": {
        field: "etancheite_epdm",
        mediaType: "material_layer",
        alt: `Pare-pluie et lattage ${altPrefix}`,
      },
      "9. folia dhe listelat.png": {
        field: "etancheite_epdm",
        mediaType: "material_layer",
        alt: `Pare-pluie et lattage ${altPrefix}`,
      },
      "10. fasada e bardhe.png": {
        field: "facade_blanche",
        mediaType: "material_layer",
        alt: `Façade blanche enduit ${altPrefix}`,
      },
      "10. faada e bardhe.png": {
        field: "facade_blanche",
        mediaType: "material_layer",
        alt: `Façade blanche enduit ${altPrefix}`,
      },
      "11. fasada arish.png": {
        field: "facade_bardage",
        mediaType: "material_layer",
        alt: `Façade bardage mélèze ${altPrefix}`,
      },
      "11. fasada aridh.png": {
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
      "15. llamarina.png": {
        field: "couverture_bac_acier_gouttieres",
        mediaType: "material_layer",
        alt: `Couverture bac acier ${altPrefix}`,
      },
      "amethyste me kulm 7.jpg": {
        field: "defaultImage",
        mediaType: "hero",
        alt: `${altPrefix} — 60×160`,
      },
      "amethyste me kulm 10.jpg": {
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
          `[Import Amethyste me Kulm] Skipping file: ${filename} (no schema mapping)`
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
        `[Import Amethyste me Kulm] Uploading ${filename} (${(beforeSize / 1024 / 1024).toFixed(2)} MB → ${(size / 1024 / 1024).toFixed(2)} MB)...`
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

      if (filename === "amethyste me kulm 7.jpg") {
        defaultImageId = mediaId;
      } else if (filename === "amethyste me kulm 10.jpg") {
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
        title: "Amethyste me Kulm",
        slug: HOUSE_SLUG,
        category: categoryId,
        subheading:
          "AMÉTHYSTE avec toiture est une maison modulaire à deux étages à ossature bois, dotée d'une toiture inclinée, alliant volumes généreux, confort et performance.",
        description:
          "AMÉTHYSTE avec toiture est une maison modulaire contemporaine à deux étages, construite sur une ossature bois robuste garantissant durabilité, stabilité et excellente performance thermique. Sa toiture inclinée assure une protection efficace contre les intempéries et confère à la maison une esthétique harmonieuse et intemporelle. Répartie sur deux niveaux, elle offre des espaces de vie lumineux et fonctionnels, adaptés à une famille ou à une résidence principale. Grâce à une préfabrication soignée en atelier, AMÉTHYSTE permet une installation rapide sur site, une qualité constante et des finitions extérieures personnalisables telles que le bardage bois naturel, l'enduit moderne ou les panneaux composites. Élégante et performante, cette maison constitue un choix durable pour un projet résidentiel exigeant.",
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
          "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l'ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle type fermette sur deux niveaux. Le prix inclut le transport et le montage sur site sous garantie décennale.",
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
      message: "Amethyste me Kulm created successfully.",
      houseId,
      slug: HOUSE_SLUG,
      category: "maison-avec-etage",
      uploadedLayersCount: Object.keys(mediaIds).length,
      layerFields: Object.keys(mediaIds),
      skippedFiles,
      optimizationStats,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to process import";
    console.error(`[Import Amethyste me Kulm Error]:`, error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
