import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // 1. Locate the target directory
    const layersDir = path.join(process.cwd(), "public/images/houses/enea me atike");
    if (!fs.existsSync(layersDir)) {
      return NextResponse.json(
        { success: false, error: `Directory not found: ${layersDir}` },
        { status: 404 }
      );
    }

    console.log(`[Import Enea Atike] Reading files from: ${layersDir}`);
    const files = fs.readdirSync(layersDir);

    // 2. Check if Enea avec Attique already exists. If yes, delete it and its media
    const existing = await payload.find({
      collection: "houses",
      where: { slug: { equals: "enea-avec-attique" } },
      limit: 1,
    });

    if (existing.totalDocs > 0) {
      const oldDoc = existing.docs[0];
      console.log(`[Import Enea Atike] Deleting existing house ID ${oldDoc.id} and its media...`);
      await payload.delete({
        collection: "media",
        where: { house: { equals: oldDoc.id } }
      });
      await payload.delete({
        collection: "houses",
        where: { id: { equals: oldDoc.id } }
      });
    }

    // 3. Mapping configuration
    const mapping: Record<string, { field: string; mediaType: string; alt: string }> = {
      "1. prapavija.png": { field: "backgroundLayer", mediaType: "hero", alt: "Arrière-plan Enea avec Attique" },
      "2. kons.png": { field: "constructionLayer", mediaType: "construction_layer", alt: "Structure bois Enea avec Attique" },
      "3. lesh guri.png": { field: "iso_inter_roche", mediaType: "material_layer", alt: "Isolation laine de roche Enea" },
      "4. lesh druri.png": { field: "iso_inter_bois", mediaType: "material_layer", alt: "Isolation laine de bois Enea" },
      "5. lesh xhami.png": { field: "iso_inter_verre", mediaType: "material_layer", alt: "Isolation laine de verre Enea" },
      "6. stiropori.png": { field: "iso_ext_polystyrene", mediaType: "material_layer", alt: "Isolation extérieure polystyrène Enea" },
      "7. fibra.png": { field: "iso_ext_fibre", mediaType: "material_layer", alt: "Isolation extérieure fibre de bois Enea" },
      "8. lesh guri jashte.png": { field: "iso_ext_roche_comprimee", mediaType: "material_layer", alt: "Isolation extérieure laine de roche Enea" },
      "9. stiropori atikes.png": { field: "terrace_etancheite_epdm", mediaType: "material_layer", alt: "Polystyrène d'attique Enea" },
      "10. epdm.png": { field: "etancheite_epdm", mediaType: "material_layer", alt: "Étanchéité EPDM Enea" },
      "11. fasada e bardhe.png": { field: "facade_blanche", mediaType: "material_layer", alt: "Façade blanche enduit Enea" },
      "12. fasada arish.png": { field: "facade_bardage", mediaType: "material_layer", alt: "Façade bardage mélèze Enea" },
      "13. dritare alumin.png": { field: "windows_aluminium", mediaType: "material_layer", alt: "Menuiseries aluminium Enea" },
      "14. dritare pvc.png": { field: "windows_pvc", mediaType: "material_layer", alt: "Menuiseries PVC Enea" },
      "4 enea.jpg": { field: "defaultImage", mediaType: "hero", alt: "Maison Enea avec Attique 60x160" },
      "5 enea.jpg": { field: "finalImage", mediaType: "final_render", alt: "Maison Enea avec Attique 60x200" },
    };

    // 4. Upload ALL media files first
    let defaultImageId: number | undefined;
    let finalImageId: number | undefined;
    const mediaIds: Record<string, number> = {};
    const allUploadedMediaIds: number[] = [];

    for (const filename of files) {
      const mapInfo = mapping[filename];
      if (!mapInfo) {
        console.log(`[Import Enea Atike] Skipping file: ${filename} (no schema mapping)`);
        continue;
      }

      const filePath = path.join(layersDir, filename);
      if (!fs.existsSync(filePath)) continue;

      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fs.statSync(filePath).size;
      const mimetype = filename.endsWith(".jpg") ? "image/jpeg" : "image/png";

      console.log(`[Import Enea Atike] Uploading ${filename}...`);
      const mediaDoc = await payload.create({
        collection: "media",
        data: {
          alt: mapInfo.alt,
          mediaType: mapInfo.mediaType,
        },
        file: {
          data: fileBuffer,
          name: filename,
          mimetype: mimetype,
          size: fileSize,
        },
      });

      const mediaId = Number(mediaDoc.id);
      allUploadedMediaIds.push(mediaId);

      if (filename === "4 enea.jpg") {
        defaultImageId = mediaId;
      } else if (filename === "5 enea.jpg") {
        finalImageId = mediaId;
      } else {
        mediaIds[mapInfo.field] = mediaId;
      }
    }

    if (!defaultImageId || !finalImageId) {
      throw new Error("Failed to upload default or final images for Enea.");
    }
    if (!mediaIds.backgroundLayer || !mediaIds.constructionLayer) {
      throw new Error("Failed to upload required graphic layers (backgroundLayer, constructionLayer) for Enea.");
    }

    // 5. Create the new House document in Payload CMS with all layers populated
    console.log(`[Import Enea Atike] Creating new house document...`);
    const newHouse = await payload.create({
      collection: "houses",
      locale: "fr",
      data: {
        title: "Enea avec Attique",
        slug: "enea-avec-attique",
        category: 2, // Maisons à toiture terrasse avec étage (ID 2, slug: maison-sans-faitage)
        subheading: "Le modèle Enea avec Attique réunit l'élégance d'une toiture terrasse plate à la fonctionnalité d'un attique moderne.",
        description: "Le modèle Enea avec Attique réunit l'élégance d'une toiture terrasse plate à la fonctionnalité d'un attique moderne. Bâtie sur une structure robuste en ossature bois à haute performance énergétique (conforme RE2020), cette maison modulaire contemporaine offre des volumes intérieurs baignés de lumière grâce à ses larges ouvertures.",
        specification: "Fiche technique disponible sur demande.",
        price60x160: 27850,
        price60x200: 29300,
        enableFlags: {
          enableRoofOption: false,
          enableEtancheiteOption: true,
          enableEtancheiteTerrasse: true, // attic polystyrene
          enableCouvertureOption: false,
          enableFauxPlafondOption: false,
        },
        defaultImage: defaultImageId,
        finalImage: finalImageId,
        layers: mediaIds,
        perdhesa: {
          bruto: 110.0,
          neto: 96.0,
          mure_te_jashtme: 130,
          mure_mbajtese: 30,
          mure_ndarese: 50,
          pllaka_e_kulmit: 145,
          pllaka_e_katit_0: 0,
          pllaka_e_katit_1: 0,
          pllaka_e_katit_2: 0,
          pllaka_e_katit: 0,
          kulmi: 0,
        },
        windows: {
          aluminiumPrice: 8850,
          pvcPrice: 6200,
        },
        structureInfo: "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l’ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle type fermette. Le prix inclut le transport et le montage sur site sous garantie décennale.",
      },
    });

    const houseId = newHouse.id;
    console.log(`[Import Enea Atike] Created house record with ID: ${houseId}`);

    // 6. Update all uploaded media files to link them to the newly created house
    console.log(`[Import Enea Atike] Linking media files to house ID ${houseId}...`);
    for (const mediaId of allUploadedMediaIds) {
      await payload.update({
        collection: "media",
        id: mediaId,
        data: { house: houseId },
      });
    }



    console.log(`[Import Enea Atike] Done!`);
    return NextResponse.json({
      success: true,
      message: "Enea avec Attique created and updated successfully.",
      houseId: houseId,
      slug: "enea-avec-attique",
      uploadedLayersCount: Object.keys(mediaIds).length,
    });
  } catch (error: any) {
    console.error(`[Import Enea Atike Error]:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process import" },
      { status: 500 }
    );
  }
}

