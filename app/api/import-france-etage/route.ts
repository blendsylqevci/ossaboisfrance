import { franceEtageAvecAttiqueImportConfig } from "@/lib/house-import-configs/france-etage-avec-attique";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

export async function GET() {
  return runHouseImportRoute(franceEtageAvecAttiqueImportConfig);
}
