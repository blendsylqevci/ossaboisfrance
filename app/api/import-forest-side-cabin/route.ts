import { forestSideCabinAvecAttiqueImportConfig } from "@/lib/house-import-configs/forest-side-cabin-avec-attique";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

export async function GET() {
  return runHouseImportRoute(forestSideCabinAvecAttiqueImportConfig);
}
