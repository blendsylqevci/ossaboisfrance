import { eneaAvecAttiqueImportConfig } from "@/lib/house-import-configs/enea-avec-attique";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

export async function GET() {
  return runHouseImportRoute(eneaAvecAttiqueImportConfig);
}
