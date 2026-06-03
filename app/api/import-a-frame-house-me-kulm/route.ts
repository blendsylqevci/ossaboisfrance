import { aFrameHouseMeKulmImportConfig } from "@/lib/house-import-configs/a-frame-house-me-kulm";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

export async function GET() {
  return runHouseImportRoute(aFrameHouseMeKulmImportConfig);
}
