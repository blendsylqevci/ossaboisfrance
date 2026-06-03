import { amethysteMeKulmImportConfig } from "@/lib/house-import-configs/amethyste-me-kulm";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

export async function GET() {
  return runHouseImportRoute(amethysteMeKulmImportConfig);
}
