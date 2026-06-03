import type { HouseImportConfig } from "@/lib/house-import";
import { buildHouseImportConfigFromDefinition } from "@/lib/build-house-import-config";
import { additionalHouseImportDefinitions } from "@/lib/house-import-definitions";
import { amethysteMeKulmImportConfig } from "@/lib/house-import-configs/amethyste-me-kulm";
import { ambreMeKulmImportConfig } from "@/lib/house-import-configs/ambre-me-kulm";
import { aFrameHouseMeKulmImportConfig } from "@/lib/house-import-configs/a-frame-house-me-kulm";
import { asebraMeKulmImportConfig } from "@/lib/house-import-configs/asebra-me-kulm";
import { emeraudeMeKulmImportConfig } from "@/lib/house-import-configs/emeraude-me-kulm";
import { eneaMeKulmImportConfig } from "@/lib/house-import-configs/enea-me-kulm";
import { eneaAvecAttiqueImportConfig } from "@/lib/house-import-configs/enea-avec-attique";
import { emeraudeAvecAttiqueImportConfig } from "@/lib/house-import-configs/emeraude-avec-attique";
import { floraAvecAttiqueImportConfig } from "@/lib/house-import-configs/flora-avec-attique";
import { forestSideCabinAvecAttiqueImportConfig } from "@/lib/house-import-configs/forest-side-cabin-avec-attique";
import { franceEtageAvecAttiqueImportConfig } from "@/lib/house-import-configs/france-etage-avec-attique";
import { liberteEtageAvecAttiqueImportConfig } from "@/lib/house-import-configs/liberte-etage-avec-attique";
import { maisonEnLAvecAttiqueImportConfig } from "@/lib/house-import-configs/maison-en-l-avec-attique";
import { maisonEmmyImportConfig } from "@/lib/house-import-configs/maison-emmy";

/** Slug aliases (old CMS / folder names → canonical import slug). */
export const HOUSE_IMPORT_SLUG_ALIASES: Record<string, string> = {
  "emeraude-toiture-terrasse": "emeraude-avec-attique",
  "emeraude-me-atike": "emeraude-avec-attique",
  "flora-me-atike": "flora-avec-attique",
  "france-etage-me-atike": "france-etage-avec-attique",
  "liberte-etage-me-atike": "liberte-etage-avec-attique",
  "enea-me-atike": "enea-avec-attique",
  "forest-side-cabin-me-atike": "forest-side-cabin-avec-attique",
  "monna-me-atike": "monna-avec-attique",
  "ambre-me-atike": "ambre-avec-attique",
  "boreale-me-atike": "boreale-avec-attique",
  "asebra-me-atike": "asebra-avec-attique",
  "maison-enea-me-kulm": "enea-avec-toit",
  "asebra-me-kulm": "asebra-avec-toit",
  "calme-me-atike": "calme-avec-attique",
  "maison-calme": "calme-avec-attique",
  "escape-villa-me-atike": "escape-villa-avec-attique",
  "melodie-me-atike": "melodie-avec-attique",
  "palma-etage-me-atike": "palma-etage-avec-attique",
  "regence-me-atike": "regence-avec-attique",
  "sira-me-atike": "sira-avec-attique",
  "symphonie-me-atike": "symphonie-avec-attique",
  "marinela-me-atike": "marinela-avec-attique",
  "maison-2-etage-me-atike": "maison-2-etages-avec-attique",
  "emmy-house-etage-toiture-terrasse": "maison-emmy",
  "mountain-valley-villa": "mountain-valley-villa-comble",
};

const manualConfigs: HouseImportConfig[] = [
  asebraMeKulmImportConfig,
  eneaMeKulmImportConfig,
  emeraudeMeKulmImportConfig,
  ambreMeKulmImportConfig,
  aFrameHouseMeKulmImportConfig,
  amethysteMeKulmImportConfig,
  floraAvecAttiqueImportConfig,
  eneaAvecAttiqueImportConfig,
  franceEtageAvecAttiqueImportConfig,
  liberteEtageAvecAttiqueImportConfig,
  maisonEnLAvecAttiqueImportConfig,
  forestSideCabinAvecAttiqueImportConfig,
  emeraudeAvecAttiqueImportConfig,
  maisonEmmyImportConfig,
];

const generatedConfigs = additionalHouseImportDefinitions.map(
  buildHouseImportConfigFromDefinition
);

const allConfigs: HouseImportConfig[] = [...manualConfigs, ...generatedConfigs];

const bySlug = new Map<string, HouseImportConfig>();
for (const config of allConfigs) {
  bySlug.set(config.slug, config);
  if (config.legacySlug) {
    bySlug.set(config.legacySlug, config);
  }
}
for (const [alias, canonical] of Object.entries(HOUSE_IMPORT_SLUG_ALIASES)) {
  const target = bySlug.get(canonical);
  if (target) bySlug.set(alias, target);
}

export function resolveHouseImportSlug(slug: string): string {
  return HOUSE_IMPORT_SLUG_ALIASES[slug] ?? slug;
}

export function getHouseImportConfig(
  slugOrAlias: string
): HouseImportConfig | undefined {
  const resolved = resolveHouseImportSlug(slugOrAlias);
  return bySlug.get(resolved) ?? bySlug.get(slugOrAlias);
}

export function listHouseImportSlugs(): string[] {
  return Array.from(new Set(allConfigs.map((c) => c.slug))).sort();
}

export { allConfigs as allHouseImportConfigs };
