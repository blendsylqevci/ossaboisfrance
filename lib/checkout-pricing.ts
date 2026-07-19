import type {
  ConfigCategory,
  HouseConfiguratorData,
  HouseSurfaceData,
} from "@/data/house-configurator";
import {
  calculateStructurePrice,
  getAssemblyCost,
  getTransportQuote,
  isInstallationMode,
  isStructureSizeId,
  type InstallationMode,
  type StructureSizeId,
} from "./house-pricing.ts";

export const CHECKOUT_CATEGORY_PAYLOAD_KEYS: Record<string, string> = {
  isolation: "isolation",
  outerIsolation: "outerIsolation",
  facade: "facade",
  etancheite: "etancheite",
  couverture: "toiture",
  terraceEtancheite: "etancheiteTerrasse",
  roof: "strukturaPlloqes",
  fauxPlafond: "izolimiPlloqes",
  dritaret: "dritaret",
};

export type CheckoutSelectionOption = {
  value?: string;
  label?: string;
};

export type CheckoutSelection = Record<string, unknown> & {
  size?: CheckoutSelectionOption;
  installationMode?: InstallationMode | string;
};

export function getRoofAreaM2(perdhesa: HouseSurfaceData): number {
  return perdhesa.pllaka_e_kulmit || perdhesa.kulmi || 0;
}

export function calculateOptionsTotal(
  categories: ConfigCategory[],
  selection: CheckoutSelection,
  selectedSizeId: string,
  perdhesa: HouseSurfaceData
): number | { error: string } {
  const roofArea = getRoofAreaM2(perdhesa);
  let total = 0;

  for (const category of categories) {
    const payloadKey =
      CHECKOUT_CATEGORY_PAYLOAD_KEYS[category.id] || category.id;
    const rawSelectedOptionPayload = selection[payloadKey];
    if (rawSelectedOptionPayload === null || rawSelectedOptionPayload === undefined) {
      continue;
    }
    if (
      typeof rawSelectedOptionPayload !== "object" ||
      Array.isArray(rawSelectedOptionPayload)
    ) {
      return { error: `Invalid option selection for ${category.id}.` };
    }
    const selectedOptionPayload = rawSelectedOptionPayload as CheckoutSelectionOption;
    if (!selectedOptionPayload.value) continue;
    if (typeof selectedOptionPayload.value !== "string") {
      return { error: `Invalid option selection for ${category.id}.` };
    }

    const option = category.options.find(
      (o) =>
        o.label === selectedOptionPayload.value ||
        o.id === selectedOptionPayload.value
    );
    if (!option) {
      return { error: `Unknown option selection for ${category.id}.` };
    }

    const rawPrice =
      selectedSizeId === "60x200"
        ? (option.price200 ?? option.price160)
        : option.price160;
    if (!Number.isFinite(rawPrice) || rawPrice < 0) {
      return { error: `Invalid option price for ${category.id}.` };
    }

    let multiplier = 1;
    if (category.priceMode === "wall_m2") {
      multiplier = perdhesa.mure_te_jashtme || 0;
    } else if (category.priceMode === "roof_m2") {
      multiplier = roofArea;
    }
    if (
      (category.priceMode === "wall_m2" || category.priceMode === "roof_m2") &&
      (!Number.isFinite(multiplier) || multiplier <= 0)
    ) {
      return { error: `Missing pricing surface for ${category.id}.` };
    }

    total += rawPrice * multiplier;
  }

  return total;
}

export type CheckoutQuote = {
  priceBasis: "excl_vat";
  vatIncluded: false;
  selectedSizeId: StructureSizeId;
  installationMode: InstallationMode;
  baseStructurePrice: number;
  optionsTotal: number;
  configurationSubtotal: number;
  truckCount: number;
  transportCost: number;
  assemblyCost: number;
  grandTotal: number;
};

export function calculateCheckoutGrandTotal(
  configData: Pick<
    HouseConfiguratorData,
    "categorySlug" | "sizes" | "categories" | "perdhesa"
  >,
  selection: CheckoutSelection
): CheckoutQuote | { error: string } {
  const selectedSizeId = selection.size?.value;
  if (!selectedSizeId) {
    return { error: "Missing size selection." };
  }
  if (!isStructureSizeId(selectedSizeId)) {
    return { error: "Invalid house size." };
  }

  const selectedSize = configData.sizes.find(
    (s) => s.id === selectedSizeId || s.label === selectedSizeId
  );
  if (!selectedSize) {
    return { error: "Invalid house size." };
  }
  if (selectedSize.priceAvailable === false) {
    return { error: "House pricing is not published." };
  }

  const baseStructurePrice = calculateStructurePrice(
    configData.categorySlug,
    configData.perdhesa.bruto,
    selectedSizeId
  );
  if (baseStructurePrice === null) {
    return { error: "House gross area or category pricing is unavailable." };
  }

  if (!isInstallationMode(selection.installationMode)) {
    return { error: "Missing installation selection." };
  }

  const serverOptionsTotal = calculateOptionsTotal(
    configData.categories,
    selection,
    selectedSizeId,
    configData.perdhesa
  );
  if (typeof serverOptionsTotal !== "number") {
    return serverOptionsTotal;
  }
  const transport = getTransportQuote(configData.perdhesa.bruto);
  if (!transport) {
    return { error: "Transport cannot be calculated without a gross area." };
  }
  const assemblyCost = getAssemblyCost(
    configData.perdhesa.bruto,
    selection.installationMode
  );
  if (assemblyCost === null) {
    return { error: "Assembly pricing is unavailable for this gross area." };
  }

  const configurationSubtotal = baseStructurePrice + serverOptionsTotal;
  const grandTotal =
    Math.round(
      (configurationSubtotal + transport.cost + assemblyCost) * 100
    ) / 100;

  return {
    priceBasis: "excl_vat",
    vatIncluded: false,
    selectedSizeId,
    installationMode: selection.installationMode,
    baseStructurePrice,
    optionsTotal: serverOptionsTotal,
    configurationSubtotal,
    truckCount: transport.truckCount,
    transportCost: transport.cost,
    assemblyCost,
    grandTotal,
  };
}

export function isCheckoutTotalValid(
  clientTotal: unknown,
  serverTotal: number
): boolean {
  if (typeof clientTotal !== "number" || !Number.isFinite(clientTotal)) {
    return false;
  }
  return Math.round(clientTotal * 100) === Math.round(serverTotal * 100);
}
