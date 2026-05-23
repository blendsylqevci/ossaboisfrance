import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // 1. Locate the target directory
    const layersDir = path.join(process.cwd(), "public/images/houses/l shaped house me atike");
    if (!fs.existsSync(layersDir)) {
      return NextResponse.json(
        { success: false, error: `Directory not found: ${layersDir}` },
        { status: 404 }
      );
    }

    console.log(`[Import Maison en L] Reading files from: ${layersDir}`);
    const files = fs.readdirSync(layersDir);

    // 2. Check if Maison en L avec Attique already exists. If yes, delete it and its media
    const existing = await payload.find({
      collection: "houses",
      where: { slug: { equals: "maison-en-l-avec-attique" } },
      limit: 1,
    });

    if (existing.totalDocs > 0) {
      const oldDoc = existing.docs[0];
      console.log(`[Import Maison en L] Deleting existing house ID ${oldDoc.id} and its media...`);
      await payload.delete({
        collection: "media",
        where: { house: { equals: oldDoc.id } }
      });
      await payload.delete({
        collection: "houses",
        where: { id: { equals: oldDoc.id } }
      });
    }

    // 2.5 Query the category dynamically by slug 'maison-sans-faitage'
    const categorySearch = await payload.find({
      collection: "house-categories",
      where: { slug: { equals: "maison-sans-faitage" } },
      limit: 1,
    });

    if (categorySearch.totalDocs === 0) {
      throw new Error("Category 'maison-sans-faitage' not found in database.");
    }

    const categoryId = categorySearch.docs[0].id;
    console.log(`[Import Maison en L] Found category 'maison-sans-faitage' with ID: ${categoryId}`);

    // 3. Mapping configuration
    const mapping: Record<string, { field: string; mediaType: string; alt: string }> = {
      "1. prapavija.png": { field: "backgroundLayer", mediaType: "hero", alt: "Arrière-plan Maison en L avec Attique" },
      "2. kons.png": { field: "constructionLayer", mediaType: "construction_layer", alt: "Structure bois Maison en L avec Attique" },
      "3. lesh guri.png": { field: "iso_inter_roche", mediaType: "material_layer", alt: "Isolation laine de roche Maison en L" },
      "4. lesh druri.png": { field: "iso_inter_bois", mediaType: "material_layer", alt: "Isolation laine de bois Maison en L" },
      "5. lesh xhami.png": { field: "iso_inter_verre", mediaType: "material_layer", alt: "Isolation laine de verre Maison en L" },
      "6. stiropori.png": { field: "iso_ext_polystyrene", mediaType: "material_layer", alt: "Isolation extérieure polystyrène Maison en L" },
      "7. fibra.png": { field: "iso_ext_fibre", mediaType: "material_layer", alt: "Isolation extérieure fibre de bois Maison en L" },
      "8. lesh guri jashte.png": { field: "iso_ext_roche_comprimee", mediaType: "material_layer", alt: "Isolation extérieure laine de roche Maison en L" },
      "9. stiropori atikes.png": { field: "terrace_etancheite_epdm", mediaType: "material_layer", alt: "Polystyrène d'attique Maison en L" },
      "10 epdm.png": { field: "etancheite_epdm", mediaType: "material_layer", alt: "Étanchéité EPDM Maison en L" },
      "11. fasada e bardhe.png": { field: "facade_blanche", mediaType: "material_layer", alt: "Façade blanche enduit Maison en L" },
      "12. fasada arish.png": { field: "facade_bardage", mediaType: "material_layer", alt: "Façade bardage mélèze Maison en L" },
      "13. dritaret alumin.png": { field: "windows_aluminium", mediaType: "material_layer", alt: "Menuiseries aluminium Maison en L" },
      "14. dritaret pvc.png": { field: "windows_pvc", mediaType: "material_layer", alt: "Menuiseries PVC Maison en L" },
      "4 l shaped house.jpg": { field: "defaultImage", mediaType: "hero", alt: "Maison en L avec Attique 60x160" },
      "5 l shaped house.jpg": { field: "finalImage", mediaType: "final_render", alt: "Maison en L avec Attique 60x200" },
    };

    // 4. Upload ALL media files first
    let defaultImageId: number | undefined;
    let finalImageId: number | undefined;
    const mediaIds: Record<string, number> = {};
    const allUploadedMediaIds: number[] = [];

    for (const filename of files) {
      const mapInfo = mapping[filename];
      if (!mapInfo) {
        console.log(`[Import Maison en L] Skipping file: ${filename} (no schema mapping)`);
        continue;
      }

      const filePath = path.join(layersDir, filename);
      if (!fs.existsSync(filePath)) continue;

      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fs.statSync(filePath).size;
      const mimetype = filename.endsWith(".jpg") ? "image/jpeg" : "image/png";

      console.log(`[Import Maison en L] Uploading ${filename}...`);
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

      if (filename === "4 l shaped house.jpg") {
        defaultImageId = mediaId;
      } else if (filename === "5 l shaped house.jpg") {
        finalImageId = mediaId;
      } else {
        mediaIds[mapInfo.field] = mediaId;
      }
    }

    if (!defaultImageId || !finalImageId) {
      throw new Error("Failed to upload default or final images for Maison en L.");
    }
    if (!mediaIds.backgroundLayer || !mediaIds.constructionLayer) {
      throw new Error("Failed to upload required graphic layers (backgroundLayer, constructionLayer) for Maison en L.");
    }

    // 5. Create the new House document in Payload CMS with all layers populated
    console.log(`[Import Maison en L] Creating new house document...`);
    const newHouse = await payload.create({
      collection: "houses",
      locale: "fr",
      data: {
        title: "Maison en L avec Attique",
        slug: "maison-en-l-avec-attique",
        category: categoryId, // Maisons à toiture terrasse avec étage
        subheading: "Le modèle Maison en L avec Attique allie architecture contemporaine et performance énergétique.",
        description: "Le modèle Maison en L avec Attique séduit par son design contemporain, ses volumes en L harmonieux et sa structure robuste en ossature bois à haute performance thermique. Cette maison modulaire contemporaine propose une toiture terrasse plate avec attique, créant des lignes géométriques épurées qui s'intègrent parfaitement dans les environnements urbains et résidentiels modernes.",
        specification: "Fiche technique disponible sur demande.",
        price60x160: 1,
        price60x200: 1,
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
          pllaka_e_katit_1: 1,
          pllaka_e_katit_2: 1,
          pllaka_e_katit: 1,
          kulmi: 1,
        },
        windows: {
          aluminiumPrice: 1,
          pvcPrice: 1,
        },
        structureInfo: "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l’ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle type fermette. Le prix inclut le transport et le montage sur site sous garantie décennale.",
      },
    });

    const houseId = newHouse.id;
    console.log(`[Import Maison en L] Created house record with ID: ${houseId}`);

    // 6. Update all uploaded media files to link them to the newly created house
    console.log(`[Import Maison en L] Linking media files to house ID ${houseId}...`);
    for (const mediaId of allUploadedMediaIds) {
      await payload.update({
        collection: "media",
        id: mediaId,
        data: { house: houseId },
      });
    }

    // 7. Update other locales (en, de, nl) for title/slug consistency
    const otherLocales = ["en", "de", "nl"];
    for (const loc of otherLocales) {
      await payload.update({
        collection: "houses",
        id: houseId,
        locale: loc as any,
        data: {
          title: "Maison en L avec Attique",
          slug: "maison-en-l-avec-attique",
        },
      });
    }

    console.log(`[Import Maison en L] Done!`);
    return NextResponse.json({
      success: true,
      message: "Maison en L avec Attique imported and updated successfully.",
      houseId: houseId,
      slug: "maison-en-l-avec-attique",
      uploadedFiles: Object.keys(mediaIds),
    });
  } catch (error: any) {
    console.error(`[Import Maison en L Error]:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process import" },
      { status: 500 }
    );
  }
}
