import { emeraudeMeKulmImportConfig } from "@/lib/house-import-configs/emeraude-me-kulm";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

export async function GET() {
  return runHouseImportRoute(emeraudeMeKulmImportConfig);
}
