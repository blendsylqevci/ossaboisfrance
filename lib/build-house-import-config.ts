import type { HouseImportConfig, HouseFileMappingEntry } from "@/lib/house-import";
import { buildAFrameAttiqueMapping } from "@/lib/house-import-a-frame-attique-shared";
import { buildCalmeHyphenAttiqueMapping } from "@/lib/house-import-calme-shared";
import {
  buildCombleFileMapping,
  COMBLE_ENABLE_FLAGS,
  COMBLE_REQUIRED_LAYERS,
} from "@/lib/house-import-comble-shared";
import { mergeAttiqueMapping } from "@/lib/house-import-attique-shared";
import {
  ATTIQUE_TERRASSE_ENABLE_FLAGS,
  ATTIQUE_TERRASSE_REQUIRED_LAYERS,
  DEFAULT_STRUCTURE_INFO_FR,
  PLACEHOLDER_PERDHESA,
  PLACEHOLDER_WINDOWS,
} from "@/lib/house-import-shared";
import type { HouseImportDefinition } from "@/lib/house-import-definitions";

function heroEntry(
  filename: string,
  field: "defaultImage" | "finalImage",
  title: string,
  size: "60×160" | "60×200"
): HouseFileMappingEntry {
  return {
    field,
    mediaType: field === "defaultImage" ? "hero" : "final_render",
    alt: `${title} — ${size}`,
  };
}

function buildFileMapping(def: HouseImportDefinition): Record<string, HouseFileMappingEntry> {
  const hero = {
    [def.defaultImageFile]: heroEntry(
      def.defaultImageFile,
      "defaultImage",
      def.title,
      "60×160"
    ),
    [def.finalImageFile]: heroEntry(
      def.finalImageFile,
      "finalImage",
      def.title,
      "60×200"
    ),
  };

  let base: Record<string, HouseFileMappingEntry>;
  switch (def.template) {
    case "attique":
      base = mergeAttiqueMapping(def.title, hero);
      break;
    case "attique-calme":
      base = { ...buildCalmeHyphenAttiqueMapping(def.title), ...hero };
      break;
    case "attique-a-frame":
      base = buildAFrameAttiqueMapping(
        def.title,
        def.defaultImageFile,
        def.finalImageFile
      );
      break;
    case "comble":
      base = buildCombleFileMapping(def.title, hero);
      break;
    default:
      base = mergeAttiqueMapping(def.title, hero);
  }

  return { ...base, ...def.fileMappingExtras };
}

export function buildHouseImportConfigFromDefinition(
  def: HouseImportDefinition
): HouseImportConfig {
  const isComble = def.template === "comble";
  const enableFlags = isComble
    ? { ...COMBLE_ENABLE_FLAGS }
    : { ...ATTIQUE_TERRASSE_ENABLE_FLAGS };

  const requiredLayerFields = isComble
    ? [...COMBLE_REQUIRED_LAYERS]
    : [...ATTIQUE_TERRASSE_REQUIRED_LAYERS];

  const price160 = def.price60x160 ?? 1;
  const price200 = def.price60x200 ?? 1;

  return {
    logLabel: `Import ${def.title}`,
    layersFolderName: def.layersFolderName,
    slug: def.slug,
    legacySlug: def.legacySlugs?.[0],
    categorySlug: def.categorySlug,
    defaultImageFile: def.defaultImageFile,
    finalImageFile: def.finalImageFile,
    requiredLayerFields,
    fileMapping: buildFileMapping(def),
    preservePricingOnUpdate: def.preservePricingOnUpdate,
    allowMissingHeroOnUpdate: def.allowMissingHeroOnUpdate,
    buildHousePayload: (categoryId) => ({
      title: def.title,
      category: categoryId,
      subheading: def.subheading ?? `${def.title} — ossature bois haute performance.`,
      description:
        def.description ??
        `Le modèle ${def.title} est une maison modulaire contemporaine en ossature bois, entièrement configurable dans le configurateur Ossa Bois France.`,
      specification: "Fiche technique disponible sur demande.",
      price60x160: price160,
      price60x200: price200,
      enableFlags,
      perdhesa: def.preservePricingOnUpdate
        ? { ...PLACEHOLDER_PERDHESA, neto: 0 }
        : { ...PLACEHOLDER_PERDHESA, neto: def.placeholderNeto ?? 1 },
      windows: { ...PLACEHOLDER_WINDOWS },
      structureInfo: DEFAULT_STRUCTURE_INFO_FR,
    }),
  };
}
