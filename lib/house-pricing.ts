export type StructureSizeId = "60x160" | "60x200";

export type InstallationMode = "professional" | "ossa";

export const TRUCK_PRICE_EUR = 3_500;
export const TRUCK_CAPACITY_GROSS_M2 = 50;

// Every business rate in this module is supplied excluding VAT. VAT is not
// added by the configurator; it is calculated later in the personalized quote.

type StructureRates = Record<StructureSizeId, number>;

/**
 * Final structure rates supplied by Ossa Bois. They are applied to the gross
 * house surface (Bruto), without the legacy 40% margin calculation.
 */
export const STRUCTURE_RATES_BY_CATEGORY: Record<string, StructureRates> = {
  "maison-combles-ammenageable": {
    "60x160": 140,
    "60x200": 160,
  },
  "maison-avec-etage": {
    "60x160": 140,
    "60x200": 160,
  },
  "maison-plein-pied": {
    "60x160": 130,
    "60x200": 150,
  },
  "maison-toitu-terrasse": {
    "60x160": 150,
    "60x200": 170,
  },
  "maison-sans-faitage": {
    "60x160": 150,
    "60x200": 170,
  },
};

export type TransportQuote = {
  truckCount: number;
  cost: number;
};

export function isValidGrossArea(grossArea: number | null | undefined): grossArea is number {
  // Imports historically used 0/1 as placeholders for unknown measurements.
  return typeof grossArea === "number" && Number.isFinite(grossArea) && grossArea > 1;
}

export function isStructureSizeId(value: unknown): value is StructureSizeId {
  return value === "60x160" || value === "60x200";
}

export function isInstallationMode(value: unknown): value is InstallationMode {
  return value === "professional" || value === "ossa";
}

export function getStructureRate(
  categorySlug: string | null | undefined,
  sizeId: StructureSizeId
): number | null {
  if (!categorySlug) return null;
  return STRUCTURE_RATES_BY_CATEGORY[categorySlug]?.[sizeId] ?? null;
}

export function calculateStructurePrice(
  categorySlug: string | null | undefined,
  grossArea: number | null | undefined,
  sizeId: StructureSizeId
): number | null {
  const rate = getStructureRate(categorySlug, sizeId);
  if (rate === null || !isValidGrossArea(grossArea)) return null;
  return Math.round(grossArea * rate * 100) / 100;
}

/** One truck carries up to 50 m² gross; every truck costs EUR 3,500. */
export function getTransportQuote(
  grossArea: number | null | undefined
): TransportQuote | null {
  if (!isValidGrossArea(grossArea)) return null;
  const truckCount = Math.ceil(grossArea / TRUCK_CAPACITY_GROSS_M2);
  return {
    truckCount,
    cost: truckCount * TRUCK_PRICE_EUR,
  };
}

/**
 * Ossa Bois assembly is optional and charged by gross-area tier. A
 * professional/third-party installer keeps this line at EUR 0.
 */
export function getAssemblyCost(
  grossArea: number | null | undefined,
  installationMode: InstallationMode
): number | null {
  if (!isValidGrossArea(grossArea)) return null;
  if (installationMode === "professional") return 0;
  if (grossArea >= 80 && grossArea <= 100) return 6_500;
  if (grossArea > 100 && grossArea <= 150) return 9_000;
  if (grossArea > 150 && grossArea <= 200) return 10_000;
  return null;
}
