import { floraAvecAttiqueImportConfig } from "@/lib/house-import-configs/flora-avec-attique";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

export async function GET() {
  return runHouseImportRoute(floraAvecAttiqueImportConfig);
}
