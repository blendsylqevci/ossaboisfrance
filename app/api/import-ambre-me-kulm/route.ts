import { ambreMeKulmImportConfig } from "@/lib/house-import-configs/ambre-me-kulm";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

export async function GET() {
  return runHouseImportRoute(ambreMeKulmImportConfig);
}
