import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { importHouseFromFolder, type HouseImportConfig } from "@/lib/house-import";

/**
 * Shared GET handler for `/api/import-*` routes using `importHouseFromFolder`.
 */
export async function runHouseImportRoute(importConfig: HouseImportConfig) {
  try {
    const payload = await getPayload({ config });
    const result = await importHouseFromFolder(payload, importConfig);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to process import";
    console.error(`[${importConfig.logLabel} Error]:`, error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
