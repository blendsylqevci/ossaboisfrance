import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // 1. Locate the target directory
    const layersDir = path.join(process.cwd(), "public/images/houses/forest side cabin me atike");
    if (!fs.existsSync(layersDir)) {
      return NextResponse.json(
        { success: false, error: `Directory not found: ${layersDir}` },
        { status: 404 }
      );
    }

    console.log(`[Import Forest Side Cabin] Reading files from: ${layersDir}`);
    const files = fs.readdirSync(layersDir);

    // 2. Check if Forest side cabin me atike already exists. If yes, delete it and its media
    const existing = await payload.find({
      collection: "houses",
      where: { slug: { equals: "forest-side-cabin-avec-attique" } },
      limit: 1,
    });

    if (existing.totalDocs > 0) {
      const oldDoc = existing.docs[0];
      console.log(`[Import Forest Side Cabin] Deleting existing house ID ${oldDoc.id} and its media...`);
      await payload.delete({
        collection: "media",
        where: { house: { equals: oldDoc.id } }
      });
      await payload.delete({
        collection: "houses",
        where: { id: { equals: oldDoc.id } }
      });
    }

    // 2.5 Query the category dynamically by slug 'maison-sans-faitage' (Maisons à toiture terrasse avec étage)
    const categorySearch = await payload.find({
      collection: "house-categories",
      where: { slug: { equals: "maison-sans-faitage" } },
      limit: 1,
    });

    if (categorySearch.totalDocs === 0) {
      throw new Error("Category 'maison-sans-faitage' not found in database.");
    }

    const categoryId = categorySearch.docs[0].id;
    console.log(`[Import Forest Side Cabin] Found category 'maison-sans-faitage' with ID: ${categoryId}`);

    // 3. Mapping configuration
    const mapping: Record<string, { field: string; mediaType: string; alt: string }> = {
      "1. prapavija.png": { field: "backgroundLayer", mediaType: "hero", alt: "Arrière-plan Forest Side Cabin avec Attique" },
      "2. kons.png": { field: "constructionLayer", mediaType: "construction_layer", alt: "Structure bois Forest Side Cabin avec Attique" },
      "3. lesh guri.png": { field: "iso_inter_roche", mediaType: "material_layer", alt: "Isolation laine de roche Forest Side Cabin" },
      "4. lesh druri.png": { field: "iso_inter_bois", mediaType: "material_layer", alt: "Isolation laine de bois Forest Side Cabin" },
      "5. lesh xhami.png": { field: "iso_inter_verre", mediaType: "material_layer", alt: "Isolation laine de verre Forest Side Cabin" },
      "6. stiropori.png": { field: "iso_ext_polystyrene", mediaType: "material_layer", alt: "Isolation extérieure polystyrène Forest Side Cabin" },
      "7. lesh guri.png": { field: "iso_ext_roche_comprimee", mediaType: "material_layer", alt: "Isolation extérieure laine de roche Forest Side Cabin" },
      "8. fibra.png": { field: "iso_ext_fibre", mediaType: "material_layer", alt: "Isolation extérieure fibre de bois Forest Side Cabin" },
      "9. fasada e bardhe.png": { field: "facade_blanche", mediaType: "material_layer", alt: "Façade blanche enduit Forest Side Cabin" },
      "10. fasada arish.png": { field: "facade_bardage", mediaType: "material_layer", alt: "Façade bardage mélèze Forest Side Cabin" },
      "11. dritaret alumin.png": { field: "windows_aluminium", mediaType: "material_layer", alt: "Menuiseries aluminium Forest Side Cabin" },
      "12. dritaret pvc.png": { field: "windows_pvc", mediaType: "material_layer", alt: "Menuiseries PVC Forest Side Cabin" },
      "13. kulmi.png": { field: "etancheite_epdm", mediaType: "material_layer", alt: "Étanchéité EPDM Forest Side Cabin" },
      "forest side cabin atike 7.jpg": { field: "defaultImage", mediaType: "hero", alt: "Maison Forest Side Cabin avec Attique 60x160" },
      "forest side cabin atike 10.jpg": { field: "finalImage", mediaType: "final_render", alt: "Maison Forest Side Cabin avec Attique 60x200" },
    };

    // 4. Upload ALL media files first
    let defaultImageId: number | undefined;
    let finalImageId: number | undefined;
    const mediaIds: Record<string, number> = {};
    const allUploadedMediaIds: number[] = [];

    for (const filename of files) {
      const mapInfo = mapping[filename];
      if (!mapInfo) {
        console.log(`[Import Forest Side Cabin] Skipping file: ${filename} (no schema mapping)`);
        continue;
      }

      const filePath = path.join(layersDir, filename);
      if (!fs.existsSync(filePath)) continue;

      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fs.statSync(filePath).size;
      const mimetype = filename.endsWith(".jpg") ? "image/jpeg" : "image/png";

      console.log(`[Import Forest Side Cabin] Uploading ${filename}...`);
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

      if (filename === "forest side cabin atike 7.jpg") {
        defaultImageId = mediaId;
      } else if (filename === "forest side cabin atike 10.jpg") {
        finalImageId = mediaId;
      } else {
        mediaIds[mapInfo.field] = mediaId;
      }
    }

    if (!defaultImageId || !finalImageId) {
      throw new Error("Failed to upload default or final images for Forest Side Cabin.");
    }
    if (!mediaIds.backgroundLayer || !mediaIds.constructionLayer) {
      throw new Error("Failed to upload required graphic layers (backgroundLayer, constructionLayer) for Forest Side Cabin.");
    }

    // 5. Create the new House document in Payload CMS with all layers populated
    console.log(`[Import Forest Side Cabin] Creating new house document...`);
    const newHouse = await payload.create({
      collection: "houses",
      locale: "fr",
      data: {
        title: "Forest Side Cabin avec Attique",
        slug: "forest-side-cabin-avec-attique",
        category: categoryId, // Maisons à toiture terrasse avec étage
        subheading: "Le modèle Forest Side Cabin avec Attique allie architecture contemporaine et performance énergétique.",
        description: "Le modèle Forest Side Cabin avec Attique séduit par son design contemporain, ses volumes harmonieux et sa structure robuste en ossature bois à haute performance thermique. Cette maison modulaire contemporaine propose une toiture terrasse plate avec attique, créant des lignes géométriques épurées qui s'intègrent parfaitement dans les environnements urbains et résidentiels modernes.",
        specification: "Fiche technique disponible sur demande.",
        price60x160: 1,
        price60x200: 1,
        enableFlags: {
          enableRoofOption: false,
          enableEtancheiteOption: true,
          enableEtancheiteTerrasse: false, // no attic polystyrene layer (no stiropori atikes)
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
    console.log(`[Import Forest Side Cabin] Created house record with ID: ${houseId}`);

    // 6. Update all uploaded media files to link them to the newly created house
    console.log(`[Import Forest Side Cabin] Linking media files to house ID ${houseId}...`);
    for (const mediaId of allUploadedMediaIds) {
      await payload.update({
        collection: "media",
        id: mediaId,
        data: { house: houseId },
      });
    }



    console.log(`[Import Forest Side Cabin] Done!`);
    return NextResponse.json({
      success: true,
      message: "Forest side cabin me atike created and updated successfully.",
      houseId: houseId,
      slug: "forest-side-cabin-avec-attique",
      uploadedLayersCount: Object.keys(mediaIds).length,
    });
  } catch (error: any) {
    console.error(`[Import Forest Side Cabin Error]:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process import" },
      { status: 500 }
    );
  }
}
