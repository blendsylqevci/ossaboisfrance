import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // 1. Locate the target directory
    const layersDir = path.join(process.cwd(), "public/images/houses/emeraude me atike");
    if (!fs.existsSync(layersDir)) {
      return NextResponse.json(
        { success: false, error: `Directory not found: ${layersDir}` },
        { status: 404 }
      );
    }

    console.log(`[Import Emeraude] Reading files from: ${layersDir}`);
    const files = fs.readdirSync(layersDir);
    console.log(`[Import Emeraude] Found files:`, files);

    // 2. We find the house record. Let's search by ID 10 or slug 'emeraude-toiture-terrasse'
    const houseSearch = await payload.find({
      collection: "houses",
      where: { slug: { equals: "emeraude-toiture-terrasse" } },
      limit: 1,
    });

    if (houseSearch.totalDocs === 0) {
      return NextResponse.json(
        { success: false, error: "House 'emeraude-toiture-terrasse' not found in database." },
        { status: 404 }
      );
    }

    const houseDoc = houseSearch.docs[0];
    console.log(`[Import Emeraude] Found house document: ID ${houseDoc.id}, Title: ${houseDoc.title}`);

    // 3. Map layer filenames to their corresponding house_layers schema fields
    const mapping: Record<string, { field: string; mediaType: string; alt: string }> = {
      "1. Prapavija.png": { field: "backgroundLayer", mediaType: "hero", alt: "Arrière-plan Emeraude avec Attique" },
      "2. kons.png": { field: "constructionLayer", mediaType: "construction_layer", alt: "Structure bois Emeraude avec Attique" },
      "3. lesh guri.png": { field: "iso_inter_roche", mediaType: "material_layer", alt: "Isolation laine de roche Emeraude" },
      "4. lesh druri.png": { field: "iso_inter_bois", mediaType: "material_layer", alt: "Isolation laine de bois Emeraude" },
      "5.lesh xhami.png": { field: "iso_inter_verre", mediaType: "material_layer", alt: "Isolation laine de verre Emeraude" },
      "6. stiropori.png": { field: "iso_ext_polystyrene", mediaType: "material_layer", alt: "Isolation extérieure polystyrène Emeraude" },
      "7. lesh guri jashte.png": { field: "iso_ext_roche_comprimee", mediaType: "material_layer", alt: "Isolation extérieure laine de roche Emeraude" },
      "8. fibra.png": { field: "iso_ext_fibre", mediaType: "material_layer", alt: "Isolation extérieure fibre de bois Emeraude" },
      "9. stiropori atikes.png": { field: "terrace_etancheite_epdm", mediaType: "material_layer", alt: "Polystyrène d'attique Emeraude" },
      "10. epdm.png": { field: "etancheite_epdm", mediaType: "material_layer", alt: "Étanchéité EPDM Emeraude" },
      "11. fasada e bardhe.png": { field: "facade_blanche", mediaType: "material_layer", alt: "Façade blanche enduit Emeraude" },
      "12. fasada arish.png": { field: "facade_bardage", mediaType: "material_layer", alt: "Façade bardage mélèze Emeraude" },
      "13. dritaret alumin.png": { field: "windows_aluminium", mediaType: "material_layer", alt: "Menuiseries aluminium Emeraude" },
      "14. dritaret pvc.png": { field: "windows_pvc", mediaType: "material_layer", alt: "Menuiseries PVC Emeraude" },
      "7 EMERAUDE.jpg": { field: "defaultImage", mediaType: "hero", alt: "Maison Emeraude avec Attique 60x160" },
      "10 EMERAUDE.jpg": { field: "finalImage", mediaType: "final_render", alt: "Maison Emeraude avec Attique 60x200" },
    };

    // 2.5 Clean up existing media documents for this house to prevent duplicates
    console.log(`[Import Emeraude] Cleaning up existing media documents for house ID ${houseDoc.id}...`);
    await payload.delete({
      collection: "media",
      where: {
        house: { equals: houseDoc.id }
      }
    });

    const mediaIds: Record<string, number> = {};

    // 4. Loop over files and create Media documents
    for (const filename of files) {
      const mapInfo = mapping[filename];
      if (!mapInfo) {
        console.log(`[Import Emeraude] Skipping file: ${filename} (no schema mapping)`);
        continue;
      }

      const filePath = path.join(layersDir, filename);
      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fs.statSync(filePath).size;
      const mimetype = filename.endsWith(".png") ? "image/png" : "image/jpeg";

      console.log(`[Import Emeraude] Uploading ${filename} (${fileSize} bytes)...`);

      // Create Media record using Payload local API (it will trigger S3 upload automatically!)
      const mediaDoc = await payload.create({
        collection: "media",
        data: {
          alt: mapInfo.alt,
          mediaType: mapInfo.mediaType,
          house: houseDoc.id,
        },
        file: {
          data: fileBuffer,
          name: filename,
          mimetype: mimetype,
          size: fileSize,
        },
      });

      console.log(`[Import Emeraude] Uploaded ${filename} successfully. Media ID: ${mediaDoc.id}`);
      mediaIds[mapInfo.field] = Number(mediaDoc.id);
    }

    // 5. Update the house document with the uploaded layers, new title, new slug, new category, and price60x200
    console.log(`[Import Emeraude] Updating house document ID ${houseDoc.id}...`);

    // Prepare layers data object
    const updatedLayers: any = {};
    for (const field in mediaIds) {
      if (field !== "defaultImage" && field !== "finalImage") {
        updatedLayers[field] = mediaIds[field];
      }
    }

    // Resolve old default/final images safely
    const oldDefaultImageId = typeof houseDoc.defaultImage === 'object' ? houseDoc.defaultImage?.id : houseDoc.defaultImage;
    const oldFinalImageId = typeof houseDoc.finalImage === 'object' ? houseDoc.finalImage?.id : houseDoc.finalImage;

    // Update house locales title and subtitle first (for French locale)
    await payload.update({
      collection: "houses",
      id: houseDoc.id,
      locale: "fr",
      data: {
        title: "Emeraude avec Attique",
        slug: "emeraude-avec-attique",
        category: 2, // Maison toiture terrasse avec étage (slug: maison-sans-faitage)
        price60x160: 28800,
        price60x200: 30300,
        enableFlags: {
          enableRoofOption: false,
          enableEtancheiteOption: true,
          enableEtancheiteTerrasse: true, // attic polystyrene
          enableCouvertureOption: false,
          enableFauxPlafondOption: false,
        },
        defaultImage: mediaIds.defaultImage || oldDefaultImageId,
        finalImage: mediaIds.finalImage || mediaIds.defaultImage || oldFinalImageId,
        layers: updatedLayers,
        perdhesa: {
          bruto: 114.7,
          neto: 98.4,
          mure_te_jashtme: 147.2,
          mure_mbajtese: 28.5,
          mure_ndarese: 55.4,
          pllaka_e_kulmit: 122.5,
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
      },
    });

    return NextResponse.json({
      success: true,
      message: "Emeraude avec Attique imported and updated successfully.",
      houseId: houseDoc.id,
      slug: "emeraude-avec-attique",
      uploadedFiles: Object.keys(mediaIds),
    });
  } catch (error: any) {
    console.error(`[Import Emeraude Error]:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process import" },
      { status: 500 }
    );
  }
}
