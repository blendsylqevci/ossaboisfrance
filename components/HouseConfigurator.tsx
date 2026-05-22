"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfigCategory, ConfigOption, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";

function formatPrice(value: number) {
  // Format exactly with space as thousands separator and comma for decimals
  const formatted = value.toFixed(2);
  const [integerPart, decimalPart] = formatted.split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${groupedInteger},${decimalPart}`;
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

function isOuterLayer(key: string): boolean {
  return (
    key.startsWith("couverture_") ||
    key.startsWith("terrace_etancheite_") ||
    key.startsWith("etancheite_")
  );
}

export const PERDHESA_LABELS: Record<string, { fr: string; en: string }> = {
  bruto: { fr: "Surface Brute", en: "Gross Surface" },
  neto: { fr: "Surface Nette", en: "Net Surface" },
  mure_te_jashtme: { fr: "Murs Extérieurs", en: "Exterior Walls" },
  mure_mbajtese: { fr: "Murs Porteurs", en: "Load-bearing Walls" },
  mure_ndarese: { fr: "Murs Séparateurs", en: "Partition Walls" },
  pllaka_e_kulmit: { fr: "Dalle de Toit", en: "Roof Plate" },
  pllaka_e_katit_0: { fr: "Dalle d'Étage 0", en: "Floor Slab 0" },
  pllaka_e_katit_1: { fr: "Dalle d'Étage 1", en: "Floor Slab 1" },
  pllaka_e_katit_2: { fr: "Dalle d'Étage 2", en: "Floor Slab 2" },
  pllaka_e_katit: { fr: "Dalle d'Étage", en: "Floor Slab" },
  kulmi: { fr: "Toiture", en: "Roof Area" },
};

export function HouseConfigurator({ config }: HouseConfiguratorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isEn = pathname?.startsWith("/en") || false;
  const [selection, setSelection] = useState(config.defaultSelection);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [activeTab, setActiveTab] = useState<"description" | "specification">("description");
  const [layoutMode, setLayoutMode] = useState<"split" | "narrow" | "clean">("split");
  const [isZoomed, setIsZoomed] = useState(false);
  const [facadeWarning, setFacadeWarning] = useState("");
  const [isMobileDrawerExpanded, setIsMobileDrawerExpanded] = useState(false);
  const [materialModal, setMaterialModal] = useState<{
    category: ConfigCategory;
    option: ConfigOption;
    unitPrice: number;
  } | null>(null);
  const [formFields, setFormFields] = useState({
    emri: "",
    mbiemri: "",
    orari: "",
    kontaktimi: "",
    prefix: "+33",
    telefon: "",
    email: "",
    kodiPostar: "",
    qyteti: "",
    adresa: "",
    mesazh: "",
    pranoje: false
  });
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setSelection(config.defaultSelection);
    setBreakdownOpen(false);
    setSliderPos(50);
    setActiveTab("description");
    setFacadeWarning("");
    setMaterialModal(null);
    setLayoutMode("split");
  }, [config.id, config.defaultSelection]);

  useEffect(() => {
    if (layoutMode === "clean") {
      document.documentElement.classList.add("layout-clean-mode");
    } else {
      document.documentElement.classList.remove("layout-clean-mode");
    }
    return () => {
      document.documentElement.classList.remove("layout-clean-mode");
    };
  }, [layoutMode]);

  const handleLayoutToggle = useCallback(() => {
    setLayoutMode((prev) => {
      if (prev === "split") return "narrow";
      if (prev === "narrow") return "clean";
      return "split";
    });
  }, []);



  const selectedSize = useMemo(() => {
    const rawSize = config.sizes.find((size) => size.id === selection.size) ?? config.sizes[0];
    const marginMultiplier = 1 + (config.marginPercent ?? 40) / 100;
    return {
      ...rawSize,
      price: rawSize.price * marginMultiplier
    };
  }, [config.sizes, selection.size, config.marginPercent]);

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
    if (selection.couverture) {
      keys.add("couverture_pare_pluie_lattage");
    }
    return keys;
  }, [selectedOptions, selection.couverture]);

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

  const handleInterestSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    const hasCustomMaterials = config.categories.some((category) => {
      const selectedOptionId = (selection as any)[category.id];
      const defaultOptionId = (config.defaultSelection as any)[category.id];
      return selectedOptionId !== defaultOptionId;
    });

    let detailsText = "";
    if (hasCustomMaterials) {
      detailsText = `Modèle de maison : ${config.name} (${selectedSize.label})\n\n`;
      detailsText += `Options de matériaux sélectionnées :\n`;
      
      config.categories.forEach((category) => {
        const selectedOptionId = (selection as any)[category.id];
        if (selectedOptionId) {
          const option = category.options.find((o) => o.id === selectedOptionId);
          if (option) {
            detailsText += `- ${category.label} : ${option.label}\n`;
          }
        }
      });
      
      detailsText += `\nPrix total estimé : € ${formatPrice(total)}\n`;
    } else {
      detailsText = `Modèle de maison : ${config.name} (${selectedSize.label})\n`;
    }

    const emailBody = `Bonjour Ossa Bois France,

Une nouvelle expression d'intérêt a été envoyée pour un projet de maison.

Détails du client :
- Prénom : ${formFields.emri}
- Nom : ${formFields.mbiemri}
- Téléphone : ${formFields.prefix} ${formFields.telefon}
- E-mail : ${formFields.email}
- Horaire souhaité : ${formFields.orari || "Non spécifié"}
- Mode de contact préféré : ${formFields.kontaktimi || "Non spécifié"}
- Adresse : ${formFields.adresa || "Non spécifiée"}, ${formFields.kodiPostar} ${formFields.qyteti}

Message du client :
${formFields.mesazh || "Aucun message."}

Configuration de la maison :
${detailsText}

Cordialement,
L'équipe Ossa Bois France`;

    const mailtoUrl = `mailto:sylqevciblendi@gmail.com?subject=${encodeURIComponent(
      `Expression d'intérêt - ${config.name}`
    )}&body=${encodeURIComponent(emailBody)}`;
    
    window.location.href = mailtoUrl;

    setFormStatus("success");
    setFormFields({
      emri: "",
      mbiemri: "",
      orari: "",
      kontaktimi: "",
      prefix: "+33",
      telefon: "",
      email: "",
      kodiPostar: "",
      qyteti: "",
      adresa: "",
      mesazh: "",
      pranoje: false
    });
    setTimeout(() => {
      setFormStatus("idle");
    }, 5000);
  }, [config, selection, selectedSize, total, formFields]);
  const primaryCategories = renderedCategories.filter((category) => !config.optionalCategoryIds.includes(category.id));
  const optionalCategories = renderedCategories.filter((category) => config.optionalCategoryIds.includes(category.id));

  function selectSize(size: SizeOption) {
    // WordPress: size change = nuclear reset of ALL selections
    // But preserve couverture default (pare-pluie) if the house has it
    setSelection(() => ({
      size: size.id,
      ...(config.defaultSelection.couverture ? { couverture: config.defaultSelection.couverture } : {}),
    }));
    setFacadeWarning("");
    setSliderPos(50);
  }

  function selectOption(category: ConfigCategory, option: ConfigOption) {
    if (["isolation", "outerIsolation", "roof", "fauxPlafond"].includes(category.id)) {
      setSliderPos(0);
    } else if (["facade", "couverture", "dritaret"].includes(category.id)) {
      setSliderPos(100);
    }

    setSelection((current) => {
      // Special handling for couverture to keep "Pare Pluie et Lattage" sticky
      if (category.id === "couverture") {
        const next = { ...current };
        if (option.id === "pare-pluie") {
          // Revert to only pare-pluie, removing tiles/bac-acier covering
          next.couverture = "pare-pluie";
        } else {
          // If Tuiles or Bac Acier is clicked
          if (current.couverture === option.id) {
            // Toggle off -> revert to pare-pluie
            next.couverture = "pare-pluie";
          } else {
            // Select this covering option
            next.couverture = option.id;
          }
        }
        delete next.terraceEtancheite;
        return next;
      }

      const isSelected = current[category.id] === option.id;

      // Toggle off if already selected
      if (isSelected) {
        const next = { ...current };
        delete next[category.id];

        if (category.id === "facade") {
          setFacadeWarning("");
        }

        // If toggling off an isolation type, check if facade needs to be deselected
        if (category.id === "isolation" || category.id === "outerIsolation") {
          const bothIsolationsSelected = !!next.isolation && !!next.outerIsolation;
          if (next.facade && !bothIsolationsSelected) {
            const facadeCategory = config.categories.find((c) => c.id === "facade");
            const selectedFacadeOption = facadeCategory?.options.find((o) => o.id === next.facade);
            const label = selectedFacadeOption?.label || "";
            setFacadeWarning(`Vous ne pouvez pas sélectionner ${label} sans avoir choisi l’isolation.`);
            delete next.facade;
          } else {
            setFacadeWarning("");
          }
        }

        return next;
      }

      // Facade validation: requires both isolations
      if (category.id === "facade" && (!current.isolation || !current.outerIsolation)) {
        setFacadeWarning(`Vous ne pouvez pas sélectionner ${option.label} sans avoir choisi l’isolation.`);
        return current;
      }

      const next = {
        ...current,
        [category.id]: option.id
      };

      // If isolation or outerIsolation changes, check if both are selected
      if (category.id === "isolation" || category.id === "outerIsolation") {
        const bothIsolationsSelected = !!next.isolation && !!next.outerIsolation;
        if (next.facade && !bothIsolationsSelected) {
          const facadeCategory = config.categories.find((c) => c.id === "facade");
          const selectedFacadeOption = facadeCategory?.options.find((o) => o.id === next.facade);
          const label = selectedFacadeOption?.label || "";
          setFacadeWarning(`Vous ne pouvez pas sélectionner ${label} sans avoir choisi l’isolation.`);
          delete next.facade;
        } else {
          setFacadeWarning("");
        }
      }

      // Couverture ↔ Terrasse exclusivity:
      // If selecting couverture, clear terrasse étanchéité
      if (category.id === "couverture") {
        delete next.terraceEtancheite;
      }

      if (category.id === "facade") {
        setFacadeWarning("");
      }

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
    if (!config.sliderConfig) {
      return (
        <div
          id={className === "house-layer-stage" ? "house-layer-stage" : undefined}
          className={className}
          style={{ position: "relative", width: "100%", height: "100%" }}
          aria-label={`Apercu configurateur ${config.name}`}
        >
          {/* Background */}
          <img
            className="house-layer is-on"
            data-layer="bg"
            src={config.backgroundLayer}
            alt=""
          />

          {/* Render all house layers in exact order */}
          {layers.map((layer) => (
            <img
              key={layer.key}
              className={`house-layer${activeLayerKeys.has(layer.key) ? " is-on" : ""}`}
              data-layer={layer.key}
              src={layer.src}
              alt=""
            />
          ))}
        </div>
      );
    }

    const sliderTop = config.sliderConfig.top ?? 0;
    const sliderHeight = config.sliderConfig.height ?? "100%";
    const sliderLeft = config.sliderConfig.left ?? 0;
    const sliderWidth = config.sliderConfig.width ?? "100%";
    const clippableOptions = config.sliderConfig.clippableOptions;
    const slantOffset = config.sliderConfig?.slantOffset ?? 0;
    const slantAngle = config.sliderConfig?.slantAngle ?? 0;

    const leftVal = typeof sliderLeft === "string" ? parseFloat(sliderLeft) : sliderLeft;
    const widthVal = typeof sliderWidth === "string" ? parseFloat(sliderWidth) : sliderWidth;
    const splitPercent = leftVal + (sliderPos * widthVal) / 100;

    const sliderTopPercent = typeof sliderTop === "string" ? parseFloat(sliderTop) : 0;
    const sliderHeightPercent = typeof sliderHeight === "string" ? parseFloat(sliderHeight) : 100;
    const lineCenterYPercent = sliderTopPercent + sliderHeightPercent / 2;

    const activeClippedLayer = [...layers].reverse().find((layer) => {
      if (!activeLayerKeys.has(layer.key)) return false;
      if (!isOuterLayer(layer.key)) return false;
      if (!clippableOptions) return true;
      const category = config.categories.find((c) =>
        c.options.some((opt) => opt.layerKey === layer.key)
      );
      const selectedOptionId = category ? selection[category.id] : undefined;
      return selectedOptionId ? clippableOptions.includes(selectedOptionId) : false;
    });

    const hasClippedLayers = !!activeClippedLayer;

    return (
      <div
        id={className === "house-layer-stage" ? "house-layer-stage" : undefined}
        className={className}
        style={{ position: "relative", width: "100%", height: "100%" }}
        aria-label={`Apercu configurateur ${config.name}`}
      >
        {/* Background */}
        <img
          className="house-layer is-on"
          data-layer="bg"
          src={config.backgroundLayer}
          alt=""
        />

        {/* Render all house layers in exact order */}
        {layers.map((layer) => {
          let isClipped = false;
          if (isOuterLayer(layer.key)) {
            if (!clippableOptions) {
              isClipped = true;
            } else {
              const category = config.categories.find((c) =>
                c.options.some((opt) => opt.layerKey === layer.key)
              );
              const selectedOptionId = category ? selection[category.id] : undefined;
              if (selectedOptionId && clippableOptions.includes(selectedOptionId)) {
                isClipped = true;
              }
            }
          }

          let clipPathValue = undefined;
          if (isClipped) {
            if (sliderPos === 0) {
              clipPathValue = "polygon(0 0, 0 0, 0 100%, 0 100%)";
            } else if (sliderPos === 100) {
              clipPathValue = undefined;
            } else {
              const topPercent = splitPercent + slantOffset / 2;
              const bottomPercent = splitPercent - slantOffset / 2;
              clipPathValue = `polygon(0 0, ${topPercent}% 0, ${bottomPercent}% 100%, 0 100%)`;
            }
          }

          return (
            <img
              key={layer.key}
              className={`house-layer${activeLayerKeys.has(layer.key) ? " is-on" : ""}`}
              data-layer={layer.key}
              src={layer.src}
              alt=""
              style={
                isClipped && clipPathValue
                  ? {
                      clipPath: clipPathValue,
                      WebkitClipPath: clipPathValue,
                    }
                  : undefined
              }
            />
          );
        })}

        {/* Slider Line & Handle (only rendered if there is an active clipped layer) */}
        {hasClippedLayers && activeClippedLayer && (
          <>
            {/* Slider Line — SVG exactly matching the clip-path edge */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 8,
                WebkitMaskImage: `url("${activeClippedLayer.src}")`,
                maskImage: `url("${activeClippedLayer.src}")`,
                WebkitMaskSize: "cover",
                maskSize: "cover",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
              }}
            >
              <svg
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <line
                  x1={splitPercent + slantOffset / 2}
                  y1="0"
                  x2={splitPercent - slantOffset / 2}
                  y2="100"
                  stroke="rgba(255, 255, 255, 0.7)"
                  strokeWidth="0.3"
                  style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }}
                />
              </svg>
            </div>

            {/* Handle — positioned at the midpoint of the clip edge, rotated to match line */}
            {(() => {
              const topX = splitPercent + slantOffset / 2;
              const bottomX = splitPercent - slantOffset / 2;
              const handleX = topX + (bottomX - topX) * (lineCenterYPercent / 100);
              return (
                <div
                  className="house-slider-handle"
                  style={{
                    left: `${handleX}%`,
                    top: `${lineCenterYPercent}%`,
                    transform: `translate(-50%, -50%) rotate(${slantAngle}deg)`,
                    zIndex: 9,
                  }}
                >
                  <div className="grip-line" />
                  <div className="grip-line" />
                </div>
              );
            })()}
          </>
        )}

        {/* Transparent Range Input Overlay for Dragging (only active if there is an active clipped layer) */}
        {hasClippedLayers && (
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            style={{
              position: "absolute",
              top: sliderTop,
              height: sliderHeight,
              left: `${leftVal}%`,
              width: `${widthVal}%`,
              opacity: 0,
              cursor: "ew-resize",
              zIndex: 9,
              margin: 0,
              padding: 0,
              outline: "none",
              appearance: "none",
              WebkitAppearance: "none",
            }}
          />
        )}
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
            let selected = selection[category.id] === option.id;
            if (category.id === "couverture" && option.id === "pare-pluie") {
              selected = selection.couverture === "pare-pluie" || selection.couverture === "tuiles" || selection.couverture === "bac-acier";
            }
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
                  type={category.id === "couverture" ? "checkbox" : category.selectionMode === "checkbox" ? "checkbox" : "radio"}
                  name={category.id === "couverture" ? undefined : category.inputName}
                  value={option.id}
                  checked={selected}
                  readOnly
                />
                <div className="option-content">
                  <div className="option-check">{checkIcon()}</div>
                  <div className="option-details">
                    <span className="option-name">{option.label}</span>
                    {category.id === "couverture" && option.id === "pare-pluie" && (
                      <span className="option-included-note">Inclus dans le prix de la structure</span>
                    )}
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
                    {(option.thumbnail || getEffectiveLayer(category, option)) ? (
                      <Image
                        className="option-mini-image"
                        src={option.thumbnail ?? getEffectiveLayer(category, option)}
                        alt=""
                        width={50}
                        height={50}
                        aria-hidden="true"
                      />
                    ) : null}
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
    <div className={`house-builder-container layout-${layoutMode}`}>
      <div className={`house-product-page ${isMobileDrawerExpanded ? "drawer-expanded" : ""}`}>
        <div className="house-main-section">
          <div className="house-image-section">
            <div className="house-main-image">
              {renderLayerStage()}
            </div>
            <button
              type="button"
              className="house-stage-zoom-trigger"
              onClick={() => setIsZoomed(true)}
              aria-label="Agrandir l'image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6 M21 3l-6 6 M9 3H3v6 M3 3l6 6 M9 21H3v-6 M3 21l6-6 M15 21h6v-6 M21 21l-6-6" />
              </svg>
            </button>
          </div>

          <div className="house-details-section">
            <button
              type="button"
              className={`sidebar-toggle-handle mode-${layoutMode}`}
              onClick={handleLayoutToggle}
              title="Changer de disposition"
              aria-label="Changer de disposition"
            >
              <div className="handle-line" />
              <div className="handle-line" />
            </button>
            <div
              className="mobile-drawer-handle"
              onClick={() => setIsMobileDrawerExpanded(!isMobileDrawerExpanded)}
              style={{ cursor: "pointer" }}
            >
              <div className="handle-bar" />
            </div>
            <div className="details-scrollable-content">
              <div className="house-header-left">
                <h1 className="house-title">{config.name}</h1>
                <div className="house-description">{config.subheading}</div>
              </div>
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
              {optionalCategories.map((category) => renderOptionCategory(category, "optional-option-group"))}

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
                        {Object.entries(config.perdhesa)
                          .filter(([_, value]) => value && Number(value) > 0)
                          .map(([key, value]) => {
                            const translation = PERDHESA_LABELS[key];
                            const label = translation ? (isEn ? translation.en : translation.fr) : key.replaceAll("_", " ");
                            return (
                              <div className="perdhesa-row" key={key}>
                                <span>{label}</span>
                                <strong>{value} m²</strong>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expression of Interest Form */}
              <div className="interest-form-container">
                <h2 className="interest-form-title">Envoyer une expression d&apos;intérêt</h2>
                <p className="interest-form-subtitle">
                  Nous rendons les choses simples et pratiques pour vous. Remplissez le formulaire ci-dessous et nous vous contacterons pour répondre à toutes vos questions. Cette demande d&apos;intérêt est entièrement gratuite et sans engagement.
                </p>
                
                <form onSubmit={handleInterestSubmit} className="interest-form">
                  <div className="form-row-2">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Prénom"
                        required
                        value={formFields.emri}
                        onChange={(e) => setFormFields({ ...formFields, emri: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Nom"
                        required
                        value={formFields.mbiemri}
                        onChange={(e) => setFormFields({ ...formFields, mbiemri: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <div className="select-wrapper">
                        <select
                          required
                          value={formFields.orari}
                          onChange={(e) => setFormFields({ ...formFields, orari: e.target.value })}
                        >
                          <option value="">Horaire souhaité</option>
                          <option value="Kurdo">À tout moment</option>
                          <option value="Mëngjes">Matin</option>
                          <option value="Pasdite">Après-midi</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="select-wrapper">
                        <select
                          required
                          value={formFields.kontaktimi}
                          onChange={(e) => setFormFields({ ...formFields, kontaktimi: e.target.value })}
                        >
                          <option value="">Mode de contact préféré</option>
                          <option value="Telefon">Téléphone</option>
                          <option value="E-mail">E-mail</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group form-row-phone">
                      <div className="select-wrapper">
                        <select
                          value={formFields.prefix}
                          onChange={(e) => setFormFields({ ...formFields, prefix: e.target.value })}
                        >
                          <option value="+33">+33</option>
                          <option value="+355">+355</option>
                          <option value="+383">+383</option>
                          <option value="+41">+41</option>
                          <option value="+49">+49</option>
                        </select>
                      </div>
                      <input
                        type="tel"
                        placeholder="Numéro de téléphone"
                        required
                        value={formFields.telefon}
                        onChange={(e) => setFormFields({ ...formFields, telefon: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="email"
                        placeholder="E-mail"
                        required
                        value={formFields.email}
                        onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Code postal"
                        required
                        value={formFields.kodiPostar}
                        onChange={(e) => setFormFields({ ...formFields, kodiPostar: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Ville"
                        required
                        value={formFields.qyteti}
                        onChange={(e) => setFormFields({ ...formFields, qyteti: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group-full">
                    <input
                      type="text"
                      placeholder="Adresse"
                      value={formFields.adresa}
                      onChange={(e) => setFormFields({ ...formFields, adresa: e.target.value })}
                    />
                  </div>

                  <div className="form-group-full">
                    <textarea
                      placeholder="Écrivez votre message ici..."
                      value={formFields.mesazh}
                      onChange={(e) => setFormFields({ ...formFields, mesazh: e.target.value })}
                    />
                  </div>

                  <div className="form-agreement">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        required
                        checked={formFields.pranoje}
                        onChange={(e) => setFormFields({ ...formFields, pranoje: e.target.checked })}
                      />
                      <span className="checkbox-text">
                        J&apos;accepte le traitement de mes données personnelles conformément à la politique de confidentialité.
                      </span>
                    </label>
                  </div>

                  <button type="submit" className="interest-submit-button">
                    Envoyer l&apos;expression d&apos;intérêt
                  </button>

                  {formStatus === "success" && (
                    <div className="form-success-msg">
                      Merci ! Votre expression d&apos;intérêt a été envoyée avec succès. Nous vous contacterons très prochainement.
                    </div>
                  )}
                </form>
              </div>
            </div>

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
          </div>
        </div>
      </div>
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
              {materialModal.option.attributes && materialModal.option.attributes.length > 0 && (
                <div className="material-attributes-grid">
                  {materialModal.option.attributes.map((attr, idx) => (
                    <div key={idx} className="material-attribute-card">
                      <span className="material-attribute-label">{attr.name}</span>
                      <span className="material-attribute-value">{attr.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
      {isZoomed ? (
        <div
          className="image-zoom-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsZoomed(false);
          }}
        >
          <div className="image-zoom-modal">
            <button
              type="button"
              className="image-zoom-close"
              aria-label="Fermer"
              onClick={() => setIsZoomed(false)}
            >
              ×
            </button>
            {renderLayerStage("image-zoom-stage")}
          </div>
        </div>
      ) : null}
    </div>
  );
}
