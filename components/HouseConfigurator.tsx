"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfigCategory, ConfigOption, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true
});

function formatPrice(value: number) {
  return euroFormatter.format(value);
}

function checkIcon() {
  return (
    <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 7.5L6.5 11L14.5 1.5" stroke="white" strokeWidth="2" />
    </svg>
  );
}

type HouseConfiguratorProps = {
  config: HouseConfiguratorData;
};

/**
 * Detects facade type from selected facade option name.
 * Matches WordPress house-builder.js: getSelectedFacadeType()
 */
function detectFacadeType(facadeOptionLabel: string | undefined): "enduit" | "bardage" | null {
  if (!facadeOptionLabel) return null;
  const name = facadeOptionLabel.toLowerCase();
  if (name.includes("enduit") || name.includes("crepis") || name.includes("crépis")) return "enduit";
  if (name.includes("bardage") || name.includes("bois")) return "bardage";
  return "enduit"; // default per WordPress
}

export function HouseConfigurator({ config }: HouseConfiguratorProps) {
  const router = useRouter();
  const [selection, setSelection] = useState(config.defaultSelection);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specification">("description");
  const [facadeWarning, setFacadeWarning] = useState("");
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [materialModal, setMaterialModal] = useState<{
    category: ConfigCategory;
    option: ConfigOption;
    unitPrice: number;
  } | null>(null);

  useEffect(() => {
    setSelection(config.defaultSelection);
    setBreakdownOpen(false);
    setActiveTab("description");
    setFacadeWarning("");
    setImageZoomOpen(false);
    setMaterialModal(null);
  }, [config.id, config.defaultSelection]);

  const selectedSize = useMemo(
    () => config.sizes.find((size) => size.id === selection.size) ?? config.sizes[0],
    [config.sizes, selection.size]
  );

  // Determine effective roof area (fallback to kulmi if pllaka_e_kulmit is 0)
  const roofArea = useMemo(() => {
    return config.perdhesa.pllaka_e_kulmit || config.perdhesa.kulmi || 0;
  }, [config.perdhesa.pllaka_e_kulmit, config.perdhesa.kulmi]);

  // Filter categories based on enableFlags
  const visibleCategories = useMemo(() => {
    const flags = config.enableFlags;
    return config.categories.filter((category) => {
      switch (category.id) {
        case "etancheite":
          return flags.enableEtancheiteOption;
        case "roof":
          return flags.enableRoofOption;
        case "couverture":
          return flags.enableRoofOption && flags.enableCouvertureOption;
        case "terraceEtancheite":
          // Only show if roof option is disabled AND terrasse is enabled
          // WordPress: shown only if enable_roof_option=0 AND enable_etancheite_terrasse=1
          return !flags.enableRoofOption && flags.enableEtancheiteTerrasse;
        case "fauxPlafond":
          return flags.enableFauxPlafondOption;
        default:
          return true; // isolation, outerIsolation, facade, dritaret always visible
      }
    });
  }, [config.categories, config.enableFlags]);

  // Detect selected facade type for facade-dependent images
  const selectedFacadeType = useMemo(() => {
    const facadeOption = visibleCategories
      .find((c) => c.id === "facade")
      ?.options.find((o) => o.id === selection.facade);
    return detectFacadeType(facadeOption?.label);
  }, [visibleCategories, selection.facade]);

  // Get effective layer for an option, considering facade-dependent images
  const getEffectiveLayer = useCallback(
    (category: ConfigCategory, option: ConfigOption): string => {
      const isFacadeDependent = config.facadeDependentCategoryIds?.includes(category.id);
      if (isFacadeDependent && selectedFacadeType) {
        if (selectedFacadeType === "bardage" && option.layerBardage) {
          return option.layerBardage;
        }
        if (selectedFacadeType === "enduit" && option.layerEnduit) {
          return option.layerEnduit;
        }
      }
      return option.layer;
    },
    [config.facadeDependentCategoryIds, selectedFacadeType]
  );

  // Couverture ↔ Terrasse exclusivity
  // WordPress: if house_toiture is checked → hide terrasse section and clear its selection
  const isCouvertureSelected = useMemo(() => {
    return !!selection.couverture;
  }, [selection.couverture]);

  // Determine which categories to actually render (after exclusivity)
  const renderedCategories = useMemo(() => {
    return visibleCategories.filter((category) => {
      // If couverture is selected, hide terrasse étanchéité
      if (category.id === "terraceEtancheite" && isCouvertureSelected) {
        return false;
      }
      return true;
    });
  }, [visibleCategories, isCouvertureSelected]);

  const selectedOptions = useMemo(
    () =>
      renderedCategories
        .map((category) => {
          const option = category.options.find((item) => item.id === selection[category.id]);
          if (!option) return null;
          const rawPrice = selectedSize.id === "60x200" ? option.price200 ?? option.price160 : option.price160;
          const multiplier =
            category.priceMode === "wall_m2"
              ? config.perdhesa.mure_te_jashtme
              : category.priceMode === "roof_m2"
                ? roofArea
                : 1;
          return {
            category,
            option,
            unitPrice: rawPrice,
            value: rawPrice * multiplier
          };
        })
        .filter(Boolean),
    [renderedCategories, config.perdhesa.mure_te_jashtme, roofArea, selection, selectedSize.id]
  );

  const activeLayerKeys = useMemo(() => {
    const keys = new Set<string>(["konstruksioni"]);
    selectedOptions.forEach((item) => {
      if (item?.option.layerKey) keys.add(item.option.layerKey);
    });
    return keys;
  }, [selectedOptions]);

  const layers = useMemo(() => {
    const byKey = new Map<string, string>([
      ["konstruksioni", config.constructionLayer],
      ...renderedCategories.flatMap((category) =>
        category.options.map((option) => [option.layerKey, getEffectiveLayer(category, option)] as const)
      )
    ]);
    const orderedLayers: { key: string; src: string }[] = [];
    config.layerOrder.forEach((key) => {
      const src = byKey.get(key);
      if (src) {
        orderedLayers.push({ key, src });
      }
    });
    return orderedLayers;
  }, [renderedCategories, config.constructionLayer, config.layerOrder, getEffectiveLayer]);

  const priceBreakdown = useMemo(() => {
    const baseItem = {
      label: "Structure en ossature bois",
      value: selectedSize.price
    };
    const optionItems = selectedOptions.map((item) => ({
      label: `${item?.category.label} — ${item?.option.label}`,
      value: item?.value ?? 0
    }));
    return [baseItem, ...optionItems.filter((item) => item.value > 0)];
  }, [selectedOptions, selectedSize.price]);

  const total = priceBreakdown.reduce((sum, item) => sum + item.value, 0);
  const primaryCategories = renderedCategories.filter((category) => !config.optionalCategoryIds.includes(category.id));
  const optionalCategories = renderedCategories.filter((category) => config.optionalCategoryIds.includes(category.id));

  function selectSize(size: SizeOption) {
    // WordPress: size change = nuclear reset of ALL selections
    setSelection(() => ({
      size: size.id
    }));
    setFacadeWarning("");
  }

  function selectOption(category: ConfigCategory, option: ConfigOption) {
    setSelection((current) => {
      const isSelected = current[category.id] === option.id;

      // Toggle off if already selected
      if (isSelected) {
        const next = { ...current };
        delete next[category.id];

        // If unchecking couverture, terrasse section becomes visible again
        // (no need to clear terrasse - it was already hidden)
        return next;
      }

      // Facade validation: requires both isolations
      if (category.id === "facade" && (!current.isolation || !current.outerIsolation)) {
        setFacadeWarning("Selectionnez d'abord l'isolation intermediaire et l'isolation exterieure.");
        return current;
      }

      const next = {
        ...current,
        [category.id]: option.id
      };

      // If changing isolation, clear facade (WordPress behavior)
      if (category.id === "isolation" || category.id === "outerIsolation") {
        delete next.facade;
      }

      // Couverture ↔ Terrasse exclusivity:
      // If selecting couverture, clear terrasse étanchéité
      if (category.id === "couverture") {
        delete next.terraceEtancheite;
      }

      setFacadeWarning("");
      return next;
    });
  }

  function continueToCheckout() {
    // Build payload matching WordPress house-builder.js structure
    const getOptionPayload = (categoryId: string) => {
      const item = selectedOptions.find((item) => item?.category.id === categoryId);
      if (!item) return null;
      return {
        value: item.option.label,
        price: String(item.unitPrice),
        image: getEffectiveLayer(item.category, item.option)
      };
    };

    const payload = {
      house: {
        name: config.name,
        id: config.id,
        image: config.finalImage
      },
      size: {
        value: selectedSize.label,
        price: String(selectedSize.price),
        image: selectedSize.image
      },
      currentImage: config.finalImage,
      isolation: getOptionPayload("isolation"),
      outerIsolation: getOptionPayload("outerIsolation"),
      facade: getOptionPayload("facade"),
      etancheite: getOptionPayload("etancheite"),
      toiture: getOptionPayload("couverture"),
      etancheiteTerrasse: getOptionPayload("terraceEtancheite"),
      strukturaPlloqes: getOptionPayload("roof"),
      izolimiPlloqes: getOptionPayload("fauxPlafond"),
      dritaret: getOptionPayload("dritaret"),
      basePrice: selectedSize.price,
      priceBreakdown,
      totalPrice: total,
      perdhesa: config.perdhesa
    };
    sessionStorage.setItem("house_selections", JSON.stringify(payload));
    router.push("/fr/checkout");
  }

  function renderLayerStage(className = "house-layer-stage") {
    return (
      <div
        id={className === "house-layer-stage" ? "house-layer-stage" : undefined}
        className={className}
        aria-label={`Apercu configurateur ${config.name}`}
      >
        <Image
          className="house-layer is-on"
          data-layer="bg"
          src={config.backgroundLayer}
          alt=""
          width={3840}
          height={2160}
          priority={className === "house-layer-stage"}
        />
        {layers.map((layer) => (
          <Image
            key={layer.key}
            className={`house-layer${activeLayerKeys.has(layer.key) ? " is-on" : ""}`}
            data-layer={layer.key}
            src={layer.src}
            alt=""
            width={3840}
            height={2160}
          />
        ))}
      </div>
    );
  }

  function renderOptionCategory(category: ConfigCategory, extraClassName = "") {
    return (
      <div className={`house-option-group ${extraClassName}`.trim()} key={category.id}>
        <h3 className="option-group-title">{category.label}</h3>
        {category.description ? <p className="option-group-description">{category.description}</p> : null}
        {category.id === "facade" && facadeWarning ? (
          <div className="facade-validation-warning" role="status">
            {facadeWarning}
          </div>
        ) : null}
        <div className={`${category.id}-options house-options-grid`}>
          {category.options.map((option) => {
            const selected = selection[category.id] === option.id;
            const unitPrice = selectedSize.id === "60x200" ? option.price200 ?? option.price160 : option.price160;
            return (
              <label
                className="house-option-label"
                key={option.id}
                onClick={(event) => {
                  event.preventDefault();
                  selectOption(category, option);
                }}
              >
                <input
                  type={category.selectionMode === "checkbox" ? "checkbox" : "radio"}
                  name={category.inputName}
                  value={option.id}
                  checked={selected}
                  readOnly
                />
                <div className="option-content">
                  <div className="option-check">{checkIcon()}</div>
                  <div className="option-details">
                    <span className="option-name">{option.label}</span>
                  </div>
                  <button
                    type="button"
                    className="option-mini-trigger"
                    aria-label={`Voir les details: ${option.label}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setMaterialModal({ category, option, unitPrice });
                    }}
                  >
                    <Image
                      className="option-mini-image"
                      src={option.thumbnail ?? getEffectiveLayer(category, option)}
                      alt=""
                      width={50}
                      height={50}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="house-builder-container">
      <div className="house-product-page">
        <div className="house-main-section">
          <div className="house-image-section">
            <div className="house-header-left">
              <h1 className="house-title">{config.name}</h1>
              <div className="house-description">{config.subheading}</div>
            </div>
            <div className="house-main-image">
              <button
                type="button"
                className="house-stage-zoom-trigger"
                aria-label="Agrandir l'image"
                onClick={() => setImageZoomOpen(true)}
              >
                ⤢
              </button>
              <div
                className="house-stage-click-area"
                role="button"
                tabIndex={0}
                aria-label="Agrandir l'image"
                onClick={() => setImageZoomOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setImageZoomOpen(true);
                  }
                }}
              >
                {renderLayerStage()}
              </div>
            </div>
          </div>

          <div className="house-details-section">
            <div className="house-option-group">
              <h3 className="option-group-title">Structure en ossature bois</h3>
              <div className="size-options">
                {config.sizes.map((size) => (
                  <div className="size-option-wrapper" key={size.id}>
                    <label className="size-option">
                      <input
                        type="radio"
                        name="house_size"
                        value={size.id}
                        checked={selection.size === size.id}
                        onChange={() => selectSize(size)}
                      />
                      <div className="size-option-content">
                        <div className="option-check">{checkIcon()}</div>
                        <div className="option-details">
                          <span className="option-name">{size.label}</span>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="size-info-div">
                <span>
                  {config.structureInfo}
                </span>
              </div>
            </div>

            {primaryCategories.map((category) => renderOptionCategory(category))}

            <div className="price-calculator">
              <div className="price-total-section">
                <div className="price-total" id="price-total">
                  <span className="price-label">€</span>
                  <span className="price-value">{formatPrice(total)}</span>
                  <button
                    type="button"
                    className={`price-dropdown${breakdownOpen ? " active" : ""}`}
                    id="price-dropdown"
                    aria-label="Voir le detail du prix"
                    onClick={() => setBreakdownOpen((open) => !open)}
                  >
                    <svg className="dropdown-arrow" width="20" height="10" viewBox="0 0 20 10" fill="none">
                      <path d="M0.640137 0.768219L9.64014 8.26822L18.6401 0.768219" stroke="black" strokeWidth="2" />
                    </svg>
                  </button>
                </div>
                <button className="continue-button" type="button" onClick={continueToCheckout}>
                  Continuer
                </button>
              </div>

              {breakdownOpen ? (
                <div className="price-breakdown" id="price-breakdown">
                  {priceBreakdown.map((item) => (
                    <div className="breakdown-item" key={item.label}>
                      <span className="breakdown-label">{item.label}</span>
                      <span className="breakdown-value">€ {formatPrice(item.value)}</span>
                    </div>
                  ))}
                  <div className="breakdown-total">
                    <span className="breakdown-label">Total:</span>
                    <span className="breakdown-value">€ {formatPrice(total)}</span>
                  </div>
                </div>
              ) : null}
            </div>

            {optionalCategories.map((category) => renderOptionCategory(category, "optional-option-group"))}
          </div>
        </div>

        <div className="house-details-tabs">
          <div className="tab-buttons">
            <button
              className={`tab-button${activeTab === "description" ? " active" : ""}`}
              type="button"
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`tab-button${activeTab === "specification" ? " active" : ""}`}
              type="button"
              onClick={() => setActiveTab("specification")}
            >
              Specification
            </button>
          </div>
          <div className="tab-content">
            <div className={`tab-pane${activeTab === "description" ? " active" : ""}`}>
              <div className="description-content">{config.description}</div>
            </div>
            <div className={`tab-pane${activeTab === "specification" ? " active" : ""}`}>
              <div className="specification-content">
                <p>{config.specification}</p>
                <div className="perdhesa-table">
                  {Object.entries(config.perdhesa).map(([key, value]) => (
                    <div className="perdhesa-row" key={key}>
                      <span>{key.replaceAll("_", " ")}</span>
                      <strong>{value} m2</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {imageZoomOpen ? (
        <div
          className="image-zoom-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setImageZoomOpen(false);
          }}
        >
          <div className="image-zoom-modal" role="dialog" aria-modal="true" aria-label="Image agrandie">
            <button
              type="button"
              className="image-zoom-close"
              aria-label="Fermer"
              onClick={() => setImageZoomOpen(false)}
            >
              ×
            </button>
            {renderLayerStage("image-zoom-stage")}
          </div>
        </div>
      ) : null}
      {materialModal ? (
        <div
          className="material-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMaterialModal(null);
          }}
        >
          <div className="material-modal" role="dialog" aria-modal="true" aria-labelledby="material-modal-title">
            <button
              type="button"
              className="material-modal-close"
              aria-label="Fermer"
              onClick={() => setMaterialModal(null)}
            >
              ×
            </button>
            <div className="material-modal-media">
              <Image
                src={materialModal.option.modalImage ?? getEffectiveLayer(materialModal.category, materialModal.option)}
                alt={materialModal.option.label}
                width={1100}
                height={620}
              />
            </div>
            <div className="material-modal-content">
              <p className="material-modal-kicker">{materialModal.category.label}</p>
              <h2 id="material-modal-title">{materialModal.option.label}</h2>
              <p>
                {materialModal.option.materialDescription ??
                  "Information du materiau a completer depuis le CMS lors de la migration finale."}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
