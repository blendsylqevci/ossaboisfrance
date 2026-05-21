export type PriceMode = "base" | "wall_m2" | "roof_m2" | "fixed";

export type SelectionMode = "radio-toggle" | "checkbox";

export type ConfigCategory = {
  id: string;
  inputName: string;
  label: string;
  description?: string;
  priceMode: PriceMode;
  selectionMode?: SelectionMode;
  options: ConfigOption[];
};

export type ConfigOption = {
  id: string;
  label: string;
  price160: number;
  price200?: number;
  layerKey: string;
  layer: string;
  thumbnail?: string;
  modalImage?: string;
  materialDescription?: string;
  description?: string;
  /** Facade-dependent alternate layer for enduit facade */
  layerEnduit?: string;
  /** Facade-dependent alternate layer for bardage facade */
  layerBardage?: string;
  attributes?: Array<{ name: string; value: string }>;
};

export type SizeOption = {
  id: "60x160" | "60x200";
  label: string;
  price: number;
  image: string;
};

export type HouseSurfaceData = {
  bruto: number;
  neto: number;
  mure_te_jashtme: number;
  mure_mbajtese: number;
  mure_ndarese: number;
  pllaka_e_kulmit: number;
  /** Fallback roof surface when pllaka_e_kulmit is 0 or unavailable */
  kulmi?: number;
  pllaka_e_katit_0?: number;
  pllaka_e_katit_1?: number;
  pllaka_e_katit_2?: number;
  pllaka_e_katit?: number;
};

export type HouseEnableFlags = {
  enableRoofOption: boolean;
  enableEtancheiteOption: boolean;
  enableEtancheiteTerrasse: boolean;
  enableCouvertureOption: boolean;
  enableFauxPlafondOption: boolean;
};

export type HouseConfiguratorData = {
  id: string;
  name: string;
  category: string;
  subheading: string;
  description: string;
  specification: string;
  defaultImage: string;
  finalImage: string;
  backgroundLayer: string;
  constructionLayer: string;
  marginPercent: number;
  perdhesa: HouseSurfaceData;
  sizes: SizeOption[];
  categories: ConfigCategory[];
  layerOrder: readonly string[];
  defaultSelection: Record<string, string>;
  optionalCategoryIds: string[];
  structureInfo: string;
  enableFlags: HouseEnableFlags;
  /** Category IDs where the image changes based on selected facade type */
  facadeDependentCategoryIds?: string[];
  /** Dynamic custom fields (ACF-like) values defined for this house */
  customFields?: Record<string, any>;
};
