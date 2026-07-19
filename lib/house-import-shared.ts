/** All houses configured via `*me kulm*` import routes (plain-pied + étage). */
export const ME_KULM_HOUSE_SLUGS = [
  "asebra-avec-toit",
  "enea-avec-toit",
  "emeraude-me-kulm",
  "ambre-me-kulm",
  "a-frame-house-me-kulm",
  "amethyste-me-kulm",
] as const;

export function isMeKulmHouseSlug(slug: string): boolean {
  return (ME_KULM_HOUSE_SLUGS as readonly string[]).includes(slug);
}

/** France plain-pied me kulm: pare-pluie in Couverture, not Étanchéité EPDM. */
export const FRANCE_KULM_ENABLE_FLAGS = {
  enableRoofOption: true,
  enableEtancheiteOption: false,
  enableEtancheiteTerrasse: false,
  enableCouvertureOption: true,
  enableFauxPlafondOption: false,
} as const;

/** Two-story me kulm: étanchéité section + couverture (not France plain-pied pattern). */
export const ETAGE_KULM_ENABLE_FLAGS = {
  enableRoofOption: true,
  enableEtancheiteOption: true,
  enableEtancheiteTerrasse: false,
  enableCouvertureOption: true,
  enableFauxPlafondOption: false,
} as const;

/** Placeholder until real dimensions/prices are entered in CMS. */
export const PLACEHOLDER_PERDHESA = {
  bruto: 1,
  neto: 0,
  mure_te_jashtme: 1,
  mure_mbajtese: 1,
  mure_ndarese: 1,
  pllaka_e_kulmit: 1,
  pllaka_e_katit_0: 1,
  pllaka_e_katit_1: 1,
  pllaka_e_katit_2: 1,
  pllaka_e_katit: 1,
  kulmi: 1,
} as const;

export const PLACEHOLDER_WINDOWS = {
  aluminiumPrice: 1,
  pvcPrice: 1,
} as const;

export const DEFAULT_STRUCTURE_INFO_FR =
  "Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l'ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle type fermette. Le transport et le montage sont en supplément et sont calculés séparément lors de la validation du projet.";

/** Toiture terrasse avec attique — EPDM + polystyrène d'attique (not me kulm). */
export const ATTIQUE_TERRASSE_ENABLE_FLAGS = {
  enableRoofOption: false,
  enableEtancheiteOption: true,
  enableEtancheiteTerrasse: true,
  enableCouvertureOption: false,
  enableFauxPlafondOption: false,
} as const;

export const ATTIQUE_TERRASSE_REQUIRED_LAYERS = [
  "backgroundLayer",
  "constructionLayer",
  "etancheite_epdm",
] as const;

/** Fields kept from CMS on re-import when `preservePricingOnUpdate` is true. */
export const PRESERVE_ON_UPDATE_FIELDS = [
  "price60x160",
  "price60x200",
  "perdhesa",
  "windows",
] as const;

export function collectMediaIdFromValue(
  value: unknown,
  target: Set<number>
): void {
  if (typeof value === "number") {
    target.add(value);
    return;
  }
  if (typeof value === "object" && value !== null && "id" in value) {
    target.add(Number((value as { id: number }).id));
  }
}

export function collectHouseMediaIds(houseDoc: {
  defaultImage?: unknown;
  finalImage?: unknown;
  layers?: unknown;
}): Set<number> {
  const ids = new Set<number>();
  collectMediaIdFromValue(houseDoc.defaultImage, ids);
  collectMediaIdFromValue(houseDoc.finalImage, ids);
  if (houseDoc.layers && typeof houseDoc.layers === "object") {
    for (const layerValue of Object.values(houseDoc.layers)) {
      collectMediaIdFromValue(layerValue, ids);
    }
  }
  return ids;
}

export function assertRequiredLayers(
  mediaIds: Record<string, number>,
  required: string[],
  logLabel: string
): void {
  for (const field of required) {
    if (!mediaIds[field]) {
      throw new Error(
        `[${logLabel}] Missing required layer field "${field}" — check file mapping and folder contents.`
      );
    }
  }
}
