import { asebraMeKulmImportConfig } from "@/lib/house-import-configs/asebra-me-kulm";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

export async function GET() {
  return runHouseImportRoute(asebraMeKulmImportConfig);
}
