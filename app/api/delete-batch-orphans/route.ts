import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // We execute the same query as the safe script to ensure 100% database safety
    // To do it in Next.js/Payload, we can run a custom SQL query using payload.db or drizzle if accessible,
    // or we can query payload.find for houses and house-options to compile the list of referenced media IDs.
    // Let's do it using payload.find to avoid pg-client import and keep it standard.
    
    console.log("[Clean Safe Orphans] Fetching all houses to compile referenced media IDs...");
    const houses = await payload.find({
      collection: "houses",
      limit: 1000,
      depth: 0,
      locale: "all" as any,
    });

    const referencedIds = new Set<number>();

    // 1. Add all direct house media references
    for (const h of houses.docs) {
      if (h.defaultImage) referencedIds.add(Number(h.defaultImage));
      if (h.finalImage) referencedIds.add(Number(h.finalImage));
      if (h.layers) {
        for (const [key, value] of Object.entries(h.layers)) {
          if (value) referencedIds.add(Number(value));
        }
      }
      // Add customFields image values
      if (h.customFields && Array.isArray(h.customFields)) {
        for (const block of h.customFields) {
          if (block && block.blockType === 'imageValue' && block.value) {
            referencedIds.add(Number(block.value));
          } else if (block && block.blockType === 'repeaterValue' && Array.isArray(block.rows)) {
            for (const row of block.rows) {
              if (row && row.image) {
                referencedIds.add(Number(row.image));
              }
            }
          }
        }
      }
    }

    // 2. Fetch global options to find referenced media IDs
    console.log("[Clean Safe Orphans] Fetching global options...");
    let globalOptions = null;
    try {
      globalOptions = await payload.findGlobal({
        slug: 'house-options',
        depth: 0,
        locale: "all" as any,
      });
    } catch (e) {
      console.warn("Failed to fetch global options:", e);
    }

    if (globalOptions) {
      const optionArraysKeys = [
        'global_isolation_options',
        'global_outer_isolation_options',
        'global_facade_options',
        'global_roof_options',
        'global_menuiseries_options',
        'global_roof_isolation_options',
        'global_couverture_options',
        'global_terrace_etancheite_options',
        'global_faux_plafond_options',
        'dynamic_options'
      ];

      for (const key of optionArraysKeys) {
        const arr = globalOptions[key];
        if (Array.isArray(arr)) {
          for (const item of arr) {
            if (item.option_image) referencedIds.add(Number(item.option_image));
            if (item.option_mini_image) referencedIds.add(Number(item.option_mini_image));
            // Check nested dynamic options arrays
            if (Array.isArray(item.options)) {
              for (const nested of item.options) {
                if (nested.option_image) referencedIds.add(Number(nested.option_image));
                if (nested.option_mini_image) referencedIds.add(Number(nested.option_mini_image));
              }
            }
          }
        }
      }
    }

    console.log(`[Clean Safe Orphans] Found ${referencedIds.size} unique referenced media IDs.`);

    // 3. Find unreferenced media documents
    const mediaRes = await payload.find({
      collection: "media",
      limit: 1000,
      depth: 0,
    });

    const safeToClear = mediaRes.docs.filter((m: any) => !referencedIds.has(Number(m.id))).slice(0, 24);

    if (safeToClear.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No genuinely unreferenced media files found.",
        deletedCount: 0,
        deletedFiles: [],
      });
    }

    const deletedFiles: Array<{ id: number; filename: string; size: string }> = [];

    // 4. Delete exactly up to 24 unreferenced files
    for (const doc of safeToClear) {
      const id = Number(doc.id);
      const filename = doc.filename || "unknown";
      const sizeBytes = Number(doc.filesize || 0);
      const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(2) + " MB";

      console.log(`[Clean Safe Orphans] Deleting Media ID ${id}: ${filename} (${sizeMb})...`);

      await payload.delete({
        collection: "media",
        id,
      });

      deletedFiles.push({ id, filename, size: sizeMb });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedFiles.length} unreferenced media files.`,
      deletedCount: deletedFiles.length,
      deletedFiles,
    });
  } catch (error: any) {
    console.error("[Clean Safe Orphans Error]:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to delete safe orphans batch",
    });
  }
}
