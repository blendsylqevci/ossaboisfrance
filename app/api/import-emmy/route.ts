import { maisonEmmyImportConfig } from "@/lib/house-import-configs/maison-emmy";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

export async function GET() {
  return runHouseImportRoute(maisonEmmyImportConfig);
}
