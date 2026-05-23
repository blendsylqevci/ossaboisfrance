import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    const layersDir = path.join(process.cwd(), "public/images/houses/Australe");
    if (!fs.existsSync(layersDir)) {
      return NextResponse.json(
        { success: false, error: `Directory not found: ${layersDir}` },
        { status: 404 }
      );
    }

    console.log(`[Import Australe] Reading files from: ${layersDir}`);
    const files = fs.readdirSync(layersDir);

    // 1. Delete existing house and media if it already exists
    const existing = await payload.find({
      collection: "houses",
      where: { slug: { equals: "australe" } },
      limit: 1,
    });

    if (existing.totalDocs > 0) {
      const oldDoc = existing.docs[0];
      console.log(`[Import Australe] Deleting existing house ID ${oldDoc.id} and its media...`);
      
      const oldMedia = await payload.find({
        collection: "media",
        where: { house: { equals: oldDoc.id } },
        limit: 100,
        depth: 0,
      });

      for (const mediaDoc of oldMedia.docs) {
        try {
          console.log(`[Import Australe] Deleting Media ID ${mediaDoc.id} (${mediaDoc.filename})...`);
          await payload.delete({
            collection: "media",
            id: mediaDoc.id,
          });
        } catch (err: any) {
          console.error(`Failed to delete old media ${mediaDoc.id}:`, err);
        }
      }

      await payload.delete({
        collection: "houses",
        id: oldDoc.id,
      });
    }

    // 2. Fetch the category 'maison-sans-faitage'
    const categorySearch = await payload.find({
      collection: "house-categories",
      where: { slug: { equals: "maison-sans-faitage" } },
      limit: 1,
    });

    if (categorySearch.totalDocs === 0) {
      throw new Error("Category 'maison-sans-faitage' not found in database.");
    }

    const categoryId = categorySearch.docs[0].id;

    // 3. Mapping configuration for files
    const mapping: Record<string, { field: string; mediaType: string; alt: string }> = {
      "1. prapavija.png": { field: "backgroundLayer", mediaType: "hero", alt: "Arrière-plan Australe" },
      "2. kons.png": { field: "constructionLayer", mediaType: "construction_layer", alt: "Structure bois Australe" },
      "3. lesh guri.png": { field: "iso_inter_roche", mediaType: "material_layer", alt: "Isolation laine de roche Australe" },
      "4. lesh druri.png": { field: "iso_inter_bois", mediaType: "material_layer", alt: "Isolation laine de bois Australe" },
      "5. lesh xhami.png": { field: "iso_inter_verre", mediaType: "material_layer", alt: "Isolation laine de verre Australe" },
      "6. stiropori.png": { field: "iso_ext_polystyrene", mediaType: "material_layer", alt: "Isolation extérieure polystyrène Australe" },
      "7. lesh guri jashte.png": { field: "iso_ext_roche_comprimee", mediaType: "material_layer", alt: "Isolation extérieure laine de roche Australe" },
      "8. fibra.png": { field: "iso_ext_fibre", mediaType: "material_layer", alt: "Isolation extérieure fibre de bois Australe" },
      "9. stiropori i atikes.png": { field: "terrace_etancheite_epdm", mediaType: "material_layer", alt: "Polystyrène d'attique Australe" },
      "10. epdm.png": { field: "etancheite_epdm", mediaType: "material_layer", alt: "Étanchéité EPDM Australe" },
      "11. fasada e bardhe.png": { field: "facade_blanche", mediaType: "material_layer", alt: "Façade blanche enduit Australe" },
      "12. fasada arish.png": { field: "facade_bardage", mediaType: "material_layer", alt: "Façade bardage mélèze Australe" },
      "13. dritaret alumin.png": { field: "windows_aluminium", mediaType: "material_layer", alt: "Menuiseries aluminium Australe" },
      "14. dritaret pvc.png": { field: "windows_pvc", mediaType: "material_layer", alt: "Menuiseries PVC Australe" },
      "australe 7.jpg": { field: "defaultImage", mediaType: "hero", alt: "Maison Australe avec Attique 60x160" },
      "australe 10.jpg": { field: "finalImage", mediaType: "final_render", alt: "Maison Australe avec Attique 60x200" },
    };

    // 4. Upload media files
    let defaultImageId: number | undefined;
    let finalImageId: number | undefined;
    const mediaIds: Record<string, number> = {};
    const allUploadedMediaIds: number[] = [];

    for (const filename of files) {
      const mapInfo = mapping[filename];
      if (!mapInfo) {
        console.log(`[Import Australe] Skipping file: ${filename} (no schema mapping)`);
        continue;
      }

      const filePath = path.join(layersDir, filename);
      if (!fs.existsSync(filePath)) continue;

      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fs.statSync(filePath).size;
      const mimetype = filename.endsWith(".jpg") ? "image/jpeg" : "image/png";

      console.log(`[Import Australe] Uploading ${filename}...`);
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

      if (filename === "australe 7.jpg") {
        defaultImageId = mediaId;
      } else if (filename === "australe 10.jpg") {
        finalImageId = mediaId;
      } else {
        mediaIds[mapInfo.field] = mediaId;
      }
    }

    if (!defaultImageId || !finalImageId) {
      throw new Error("Failed to upload default or final images for Australe.");
    }
    if (!mediaIds.backgroundLayer || !mediaIds.constructionLayer) {
      throw new Error("Failed to upload required graphic layers (backgroundLayer, constructionLayer) for Australe.");
    }

    // 5. Create the new House document in Payload CMS
    console.log(`[Import Australe] Creating new house document...`);
    const newHouse = await payload.create({
      collection: "houses",
      locale: "fr",
      data: {
        title: "Australe",
        slug: "australe",
        category: categoryId, // Maisons à toiture terrasse avec étage
        subheading: "AUSTRALE avec attique est une maison modulaire contemporaine à deux étages, construite sur une ossature bois robuste.",
        description: "AUSTRALE avec attique est une maison modulaire contemporaine à deux étages, construite sur une ossature bois robuste garantissant stabilité, durabilité et excellente performance thermique. Son architecture à toiture plate avec attique, complétée par deux terrasses au deuxième étage, offre de vastes espaces extérieurs idéals pour la détente tout en valorisant des lignes modernes et épurées.",
        specification: "Fiche technique disponible sur demande.",
        price60x160: 30393, // Keep original price
        price60x200: 30393, // Set 60x200 to original price
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
          bruto: 1,
          neto: 1,
          mure_te_jashtme: 1,
          mure_mbajtese: 1,
          mure_ndarese: 1,
          pllaka_e_kulmit: 1,
          pllaka_e_katit_0: 1,
          pllaka_e_katit: 1,
        },
        windows: {
          aluminiumPrice: 7564, // Keep original values
          pvcPrice: 6176, // Keep original values
        },
        structureInfo: "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l’ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle type fermette. Le prix inclut le transport et le montage sur site sous garantie décennale.",
      },
    });

    const houseId = newHouse.id;
    console.log(`[Import Australe] Created house record with ID: ${houseId}`);

    // 6. Link media files to house ID
    console.log(`[Import Australe] Linking media files to house ID ${houseId}...`);
    for (const mediaId of allUploadedMediaIds) {
      await payload.update({
        collection: "media",
        id: mediaId,
        data: { house: houseId },
      });
    }

    // 7. Update other locales (en, de, nl) for consistency
    const otherLocales = ["en", "de", "nl"];
    for (const loc of otherLocales) {
      await payload.update({
        collection: "houses",
        id: houseId,
        locale: loc as any,
        data: {
          title: "Australe",
          slug: "australe",
        },
      });
    }

    console.log(`[Import Australe] Done!`);
    return NextResponse.json({
      success: true,
      message: "Australe imported and updated successfully.",
      houseId: houseId,
      slug: "australe",
      uploadedFiles: Object.keys(mediaIds),
    });
  } catch (error: any) {
    console.error(`[Import Australe Error]:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process import" },
      { status: 500 }
    );
  }
}
