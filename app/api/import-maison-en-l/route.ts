import { maisonEnLAvecAttiqueImportConfig } from "@/lib/house-import-configs/maison-en-l-avec-attique";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

export async function GET() {
  return runHouseImportRoute(maisonEnLAvecAttiqueImportConfig);
}
