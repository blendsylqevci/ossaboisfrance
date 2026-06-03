import { emeraudeAvecAttiqueImportConfig } from "@/lib/house-import-configs/emeraude-avec-attique";
import { runHouseImportRoute } from "@/lib/run-house-import-route";

export async function GET() {
  return runHouseImportRoute(emeraudeAvecAttiqueImportConfig);
}
