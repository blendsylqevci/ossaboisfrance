import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // 1. Locate the target directory
    const layersDir = path.join(process.cwd(), "public/images/houses/emmy house etage me atike");
    if (!fs.existsSync(layersDir)) {
      return NextResponse.json(
        { success: false, error: `Directory not found: ${layersDir}` },
        { status: 404 }
      );
    }

    console.log(`[Import Emmy] Reading files from: ${layersDir}`);
    const files = fs.readdirSync(layersDir);
    console.log(`[Import Emmy] Found files:`, files);

    // 2. Find the house record by slug 'maison-emmy'
    const houseSearch = await payload.find({
      collection: "houses",
      where: { slug: { equals: "maison-emmy" } },
      limit: 1,
    });

    if (houseSearch.totalDocs === 0) {
      return NextResponse.json(
        { success: false, error: "House 'maison-emmy' not found in database." },
        { status: 404 }
      );
    }

    const houseDoc = houseSearch.docs[0];
    console.log(`[Import Emmy] Found house document: ID ${houseDoc.id}, Title: ${houseDoc.title}`);

    // 3. Map layer filenames to their corresponding house_layers schema fields
    const mapping: Record<string, { field: string; mediaType: string; alt: string }> = {
      "1. prapavija.png": { field: "backgroundLayer", mediaType: "hero", alt: "Arrière-plan Emmy avec Attique" },
      "2. kons.png": { field: "constructionLayer", mediaType: "construction_layer", alt: "Structure bois Emmy avec Attique" },
      "3. lesh guri.png": { field: "iso_inter_roche", mediaType: "material_layer", alt: "Isolation laine de roche Emmy" },
      "4. lesh druri.png": { field: "iso_inter_bois", mediaType: "material_layer", alt: "Isolation laine de bois Emmy" },
      "5. lesh xhami.png": { field: "iso_inter_verre", mediaType: "material_layer", alt: "Isolation laine de verre Emmy" },
      "6. stiropori.png": { field: "iso_ext_polystyrene", mediaType: "material_layer", alt: "Isolation extérieure polystyrène Emmy" },
      "7. lesh guri jashte.png": { field: "iso_ext_roche_comprimee", mediaType: "material_layer", alt: "Isolation extérieure laine de roche Emmy" },
      "8. fibra.png": { field: "iso_ext_fibre", mediaType: "material_layer", alt: "Isolation extérieure fibre de bois Emmy" },
      "9. stiropori atikes.png": { field: "terrace_etancheite_epdm", mediaType: "material_layer", alt: "Polystyrène d'attique Emmy" },
      "10 epdm.png": { field: "etancheite_epdm", mediaType: "material_layer", alt: "Étanchéité EPDM Emmy" },
      "11. fasada e bardhe.png": { field: "facade_blanche", mediaType: "material_layer", alt: "Façade blanche enduit Emmy" },
      "12. fasada arish.png": { field: "facade_bardage", mediaType: "material_layer", alt: "Façade bardage mélèze Emmy" },
      "13. dritaret alumin.png": { field: "windows_aluminium", mediaType: "material_layer", alt: "Menuiseries aluminium Emmy" },
      "14. dritaret pvc.png": { field: "windows_pvc", mediaType: "material_layer", alt: "Menuiseries PVC Emmy" },
      "EMMY 7.jpg": { field: "defaultImage", mediaType: "hero", alt: "Maison Emmy avec Attique 60x160" },
      "EMMY 10.jpg": { field: "finalImage", mediaType: "final_render", alt: "Maison Emmy avec Attique 60x200" },
    };

    // 2.5 Clean up existing media documents for this house to prevent duplicates
    console.log(`[Import Emmy] Cleaning up existing media documents for house ID ${houseDoc.id}...`);
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
        console.log(`[Import Emmy] Skipping file: ${filename} (no schema mapping)`);
        continue;
      }

      const filePath = path.join(layersDir, filename);
      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fs.statSync(filePath).size;
      const mimetype = filename.endsWith(".png") ? "image/png" : "image/jpeg";

      console.log(`[Import Emmy] Uploading ${filename} (${fileSize} bytes)...`);

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

      console.log(`[Import Emmy] Uploaded ${filename} successfully. Media ID: ${mediaDoc.id}`);
      mediaIds[mapInfo.field] = Number(mediaDoc.id);
    }

    // 5. Update the house document with the uploaded layers, new title, new slug, new category, and price60x200
    console.log(`[Import Emmy] Updating house document ID ${houseDoc.id}...`);

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
        title: "Emmy avec Attique",
        slug: "maison-emmy",
        category: 2, // Maison toiture terrasse avec étage (slug: maison-sans-faitage)
        price60x160: 37157,
        price60x200: 38657,
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
          bruto: 170.59,
          neto: 134.55,
          mure_te_jashtme: 290,
          mure_mbajtese: 58,
          mure_ndarese: 50,
          pllaka_e_kulmit: 98,
          pllaka_e_katit_0: 0,
          pllaka_e_katit_1: 0,
          pllaka_e_katit_2: 0,
          pllaka_e_katit: 98,
          kulmi: 0,
        },
        windows: {
          aluminiumPrice: 12913,
          pvcPrice: 7585,
        },
      },
    });

    // Update for all other locales (en, de, nl) to keep title/slug consistent
    const otherLocales = ["en", "de", "nl"];
    for (const loc of otherLocales) {
      await payload.update({
        collection: "houses",
        id: houseDoc.id,
        locale: loc as any,
        data: {
          title: "Emmy avec Attique",
          slug: "maison-emmy",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Emmy avec Attique imported and updated successfully.",
      houseId: houseDoc.id,
      slug: "maison-emmy",
      uploadedFiles: Object.keys(mediaIds),
    });
  } catch (error: any) {
    console.error(`[Import Emmy Error]:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process import" },
      { status: 500 }
    );
  }
}
