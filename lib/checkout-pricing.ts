import type {
  ConfigCategory,
  HouseConfiguratorData,
  HouseSurfaceData,
} from "@/data/house-configurator";

export function applyMarginToBasePrice(
  basePrice: number,
  marginPercent: number
): number {
  return basePrice * (1 + marginPercent / 100);
}

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
};

export type CheckoutSelection = Record<string, CheckoutSelectionOption | undefined> & {
  size?: CheckoutSelectionOption;
};

export function getRoofAreaM2(perdhesa: HouseSurfaceData): number {
  return perdhesa.pllaka_e_kulmit || perdhesa.kulmi || 0;
}

export function calculateOptionsTotal(
  categories: ConfigCategory[],
  selection: CheckoutSelection,
  selectedSizeId: string,
  perdhesa: HouseSurfaceData
): number {
  const roofArea = getRoofAreaM2(perdhesa);
  let total = 0;

  for (const category of categories) {
    const payloadKey =
      CHECKOUT_CATEGORY_PAYLOAD_KEYS[category.id] || category.id;
    const selectedOptionPayload = selection[payloadKey];
    if (!selectedOptionPayload?.value) continue;

    const option = category.options.find(
      (o) =>
        o.label === selectedOptionPayload.value ||
        o.id === selectedOptionPayload.value
    );
    if (!option) continue;

    const rawPrice =
      selectedSizeId === "60x200"
        ? (option.price200 ?? option.price160)
        : option.price160;

    let multiplier = 1;
    if (category.priceMode === "wall_m2") {
      multiplier = perdhesa.mure_te_jashtme || 0;
    } else if (category.priceMode === "roof_m2") {
      multiplier = roofArea;
    }

    total += rawPrice * multiplier;
  }

  return total;
}

export function getTransportCost(selectedSizeId: string): number {
  return selectedSizeId === "60x160" || selectedSizeId === "60x200" ? 0 : 3000;
}

export function calculateCheckoutGrandTotal(
  configData: Pick<HouseConfiguratorData, "sizes" | "categories" | "perdhesa">,
  selection: CheckoutSelection,
  marginPercent: number
): { grandTotal: number; selectedSizeId: string } | { error: string } {
  const selectedSizeId = selection.size?.value;
  if (!selectedSizeId) {
    return { error: "Missing size selection." };
  }

  const selectedSize = configData.sizes.find(
    (s) => s.id === selectedSizeId || s.label === selectedSizeId
  );
  if (!selectedSize) {
    return { error: "Invalid house size." };
  }

  const serverBasePrice = applyMarginToBasePrice(
    selectedSize.price,
    marginPercent
  );
  const serverOptionsTotal = calculateOptionsTotal(
    configData.categories,
    selection,
    selectedSizeId,
    configData.perdhesa
  );
  const transport = getTransportCost(selectedSizeId);
  const grandTotal =
    Math.round(serverBasePrice + serverOptionsTotal) + transport;

  return { grandTotal, selectedSizeId };
}

export function isCheckoutTotalValid(
  clientTotal: number,
  serverTotal: number,
  toleranceEur = 5
): boolean {
  return Math.abs(serverTotal - clientTotal) <= toleranceEur;
}
