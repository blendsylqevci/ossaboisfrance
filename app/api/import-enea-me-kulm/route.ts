import { eneaMeKulmImportConfig } from "@/lib/house-import-configs/enea-me-kulm";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

export async function GET() {
  return runHouseImportRoute(eneaMeKulmImportConfig);
}
