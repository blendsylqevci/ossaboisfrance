"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { ConfigCategory, ConfigOption, HouseConfiguratorData, SizeOption } from "@/data/house-configurator";
import { Locale } from "@/lib/i18n";

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
  locale: Locale;
  dict: any;
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

export const PERDHESA_LABELS: Record<string, { fr: string; en: string; de: string; nl: string }> = {
  bruto: { fr: "Bruto", en: "Bruto", de: "Bruto", nl: "Bruto" },
  neto: { fr: "Neto", en: "Neto", de: "Neto", nl: "Neto" },
  mure_te_jashtme: { fr: "Murs Extérieurs", en: "Exterior Walls", de: "Außenwände", nl: "Buitenmuren" },
  mure_mbajtese: { fr: "Murs Porteurs", en: "Load-bearing Walls", de: "Tragende Wände", nl: "Dragende muren" },
  mure_ndarese: { fr: "Murs Séparateurs", en: "Partition Walls", de: "Trennwände", nl: "Tussenmuren" },
  pllaka_e_kulmit: { fr: "Dalle de Toit", en: "Roof Plate", de: "Dachplatte", nl: "Dakplaat" },
  pllaka_e_katit_0: { fr: "Dalle d'Étage 0", en: "Floor Slab 0", de: "Bodenplatte 0", nl: "Vloerplaat 0" },
  pllaka_e_katit_1: { fr: "Dalle d'Étage 1", en: "Floor Slab 1", de: "Bodenplatte 1", nl: "Vloerplaat 1" },
  pllaka_e_katit_2: { fr: "Dalle d'Étage 2", en: "Floor Slab 2", de: "Bodenplatte 2", nl: "Vloerplaat 2" },
  pllaka_e_katit: { fr: "Dalle d'Étage", en: "Floor Slab", de: "Bodenplatte", nl: "Vloerplaat" },
  kulmi: { fr: "Toiture", en: "Roof Area", de: "Dachbereich", nl: "Dakgebied" },
};

export function HouseConfigurator({ config, locale, dict }: HouseConfiguratorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isEn = locale === "en";
  const [selection, setSelection] = useState(config.defaultSelection);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [activeTab, setActiveTab] = useState<"description" | "specification">("description");
  const [layoutMode, setLayoutMode] = useState<"split" | "narrow" | "clean">("split");
  const [isZoomed, setIsZoomed] = useState(false);
  const [planimetryOpen, setPlanimetryOpen] = useState(false);
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
  const [isStructureOpen, setIsStructureOpen] = useState(false);

  const scrollableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelection(config.defaultSelection);
    setBreakdownOpen(false);
    setSliderPos(50);
    setActiveTab("description");
    setFacadeWarning("");
    setMaterialModal(null);
    setPlanimetryOpen(false);
    setLayoutMode("split");
    setIsStructureOpen(false);
    if (scrollableRef.current) {
      scrollableRef.current.scrollTop = 0;
    }
  }, [config.id, config.defaultSelection]);

  useEffect(() => {
    if (typeof window !== "undefined" && config?.name) {
      const timer = setTimeout(() => {
        const event = new CustomEvent("house-title-loaded", { detail: config.name });
        window.dispatchEvent(event);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [config?.name]);

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
      label: dict.breakdown.basePrice,
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
    router.push(`/${locale}/checkout`);
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
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
                      <span className="option-included-note">
                        {locale === "en" ? "Included in the structure price" :
                         locale === "de" ? "Im Preis der Struktur enthalten" :
                         locale === "nl" ? "Inbegrepen in de prijs van de structuur" :
                         "Inclus dans le prix de la structure"}
                      </span>
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
            <div className="house-stage-controls">
              <button
                type="button"
                className="configurator-planimetry-btn"
                onClick={() => setPlanimetryOpen(true)}
                aria-label="View floor plan"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18M9 13h12M15 13v8M3 9h6" />
                </svg>
              </button>
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
              {layoutMode === "split" && <div className="handle-line" />}
            </button>
            <div
              className="mobile-drawer-handle"
              onClick={() => setIsMobileDrawerExpanded(!isMobileDrawerExpanded)}
              style={{ cursor: "pointer" }}
            >
              <div className="handle-bar" />
            </div>
            <div ref={scrollableRef} className="details-scrollable-content">
              <div className="house-header-left">
                <h1 className="house-title">{config.name}</h1>
                <div className="house-description">{config.subheading}</div>
              </div>
              <div className="house-option-group">
                <h3 className="option-group-title">
                  {locale === "en" ? "Timber frame structure" : locale === "de" ? "Holzrahmenstruktur" : locale === "nl" ? "Houtskeletstructuur" : "Structure en ossature bois"}
                </h3>
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
                  <button
                    type="button"
                    className={`structure-accordion-header${isStructureOpen ? " active" : ""}`}
                    onClick={() => setIsStructureOpen(!isStructureOpen)}
                  >
                    <span>
                      {locale === "en"
                        ? "Descriptive Price & Structure Details"
                        : locale === "de"
                        ? "Richtpreis & Strukturdetails"
                        : locale === "nl"
                        ? "Richtprijs & Structuurdetails"
                        : "Prix descriptif & structure"}
                    </span>
                    <svg className="dropdown-arrow" width="20" height="10" viewBox="0 0 20 10" fill="none">
                      <path d="M0.640137 0.768219L9.64014 8.26822L18.6401 0.768219" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                  {isStructureOpen && (
                    <div className="structure-accordion-content">
                      {locale === "en" ? (
                        <>
                          <p>
                            <strong>Descriptive price:</strong>
                            <br />
                            <strong style={{ color: "rgb(255, 0, 0)", fontSize: "22px" }}>Starting from only €350 excl. VAT.</strong>
                          </p>
                          <p>
                            You have the choice between two types of exterior walls with different thicknesses:{" "}
                            <strong>160 mm wall</strong> or <strong>200 mm wall</strong>, depending on your choice.
                          </p>
                          <p>
                            The structure is braced with a 12 mm OSB panel, with intermediate floor or flat roof.
                            <br />
                            For houses with convertible attics, this includes a traditional framework with load-bearing rafters and vapor barrier film.
                          </p>
                          <p>
                            Including shear walls and separation walls are also braced with a 12 mm OSB panel.
                          </p>
                          <p>
                            The price includes transport as well as the assembly of your structure under a French decennial guarantee.
                          </p>
                        </>
                      ) : locale === "de" ? (
                        <>
                          <p>
                            <strong>Richtpreis:</strong>
                            <br />
                            <strong style={{ color: "rgb(255, 0, 0)", fontSize: "22px" }}>Ab nur 350 € zzgl. MwSt.</strong>
                          </p>
                          <p>
                            Sie haben die Wahl zwischen zwei Arten von Außenwänden mit unterschiedlichen Dicken:{" "}
                            <strong>160 mm Wand</strong> oder <strong>200 mm Wand</strong>, je nach Ihrer Wahl.
                          </p>
                          <p>
                            Die Struktur ist mit einer 12 mm OSB-Platte versteift, mit Zwischendecke oder Flachdach.
                            <br />
                            Bei Häusern mit ausbaufähigem Dachgeschoss umfasst dies einen traditionellen Dachstuhl mit tragenden Sparren und Dampfsperrfolie.
                          </p>
                          <p>
                            Auch tragende Innenwände und Trennwände sind mit einer 12 mm OSB-Platte versteift.
                          </p>
                          <p>
                            Der Preis beinhaltet den Transport sowie die Montage Ihrer Struktur unter einer zehnjährigen französischen Garantie.
                          </p>
                        </>
                      ) : locale === "nl" ? (
                        <>
                          <p>
                            <strong>Richtprijs:</strong>
                            <br />
                            <strong style={{ color: "rgb(255, 0, 0)", fontSize: "22px" }}>Vanaf slechts € 350 excl. btw.</strong>
                          </p>
                          <p>
                            U heeft de keuze uit twee soorten buitenmuren met verschillende diktes:{" "}
                            <strong>muur van 160 mm</strong> of <strong>muur van 200 mm</strong>, afhankelijk van uw keuze.
                          </p>
                          <p>
                            De structuur is geschoord met een 12 mm OSB-plaat, met tussenvloer of plat dak.
                            <br />
                            Voor woningen met een inrichtbare zolder omvat dit een traditioneel dakspant met dragende kepers en dampschermfolie.
                          </p>
                          <p>
                            Ook de binnenmuren en scheidingswanden zijn geschoord met een 12 mm OSB-plaat.
                          </p>
                          <p>
                            De prijs is inclusief transport en de montage van uw structuur onder een Franse tienjarige garantie.
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            <strong>Prix descriptif :</strong>
                            <br />
                            <strong style={{ color: "rgb(255, 0, 0)", fontSize: "22px" }}>À partir de seulement 350 € HT.</strong>
                          </p>
                          <p>
                            Vous avez le choix entre deux types de murs extérieurs avec différentes épaisseurs :{" "}
                            <strong>mur de 160 mm</strong> ou <strong>mur de 200 mm</strong>, selon votre choix.
                          </p>
                          <p>
                            La structure est contreventée avec un panneau OSB de 12 mm, avec plancher intermédiaire ou toiture terrasse.
                            <br />
                            Pour les maisons avec combles aménageables, cela comprend une charpente traditionnelle avec chevrons porteurs et film pare-vapeur.
                          </p>
                          <p>
                            Y compris les murs de refend et de séparation sont également contreventés avec un panneau OSB de 12 mm.
                          </p>
                          <p>
                            Le prix comprend le transport ainsi que le montage de votre structure sous garantie décennale française.
                          </p>
                        </>
                      )}
                    </div>
                  )}
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
                    {dict.labels.description}
                  </button>
                  <button
                    className={`tab-button${activeTab === "specification" ? " active" : ""}`}
                    type="button"
                    onClick={() => setActiveTab("specification")}
                  >
                    {dict.labels.specification}
                  </button>
                </div>
                <div className="tab-content">
                  <div className={`tab-pane${activeTab === "description" ? " active" : ""}`}>
                    <div className="description-content">
                      {(() => {
                        const desc = config.description || "";
                        const sub = config.subheading || "";
                        if (!sub) return desc;

                        const trimmedDesc = desc.trim();
                        const trimmedSub = sub.trim();

                        // If description starts with subheading, move subheading to the end
                        if (trimmedDesc.startsWith(trimmedSub)) {
                          let remaining = trimmedDesc.substring(trimmedSub.length).trim();
                          if (remaining.startsWith('.') || remaining.startsWith(',') || remaining.startsWith('—')) {
                            remaining = remaining.substring(1).trim();
                          }
                          return `${remaining} ${trimmedSub}`;
                        }

                        // If description doesn't contain subheading at all, append it to the end
                        if (!trimmedDesc.includes(trimmedSub)) {
                          const separator = (trimmedDesc.endsWith('.') || trimmedDesc.endsWith('!') || trimmedDesc.endsWith('?')) ? ' ' : '. ';
                          return `${trimmedDesc}${separator}${trimmedSub}`;
                        }

                        return trimmedDesc;
                      })()}
                    </div>
                  </div>
                  <div className={`tab-pane${activeTab === "specification" ? " active" : ""}`}>
                    <div className="specification-content">
                      <p>{config.specification}</p>
                      <div className="perdhesa-table">
                        {Object.entries(config.perdhesa)
                          .filter(([_, value]) => value && Number(value) > 0)
                          .map(([key, value]) => {
                            const translation = PERDHESA_LABELS[key];
                            const label = translation ? (translation[locale as keyof typeof translation] || translation.fr) : key.replaceAll("_", " ");
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
                <h2 className="interest-form-title">{dict.labels.interestFormTitle}</h2>
                <p className="interest-form-subtitle">
                  {dict.labels.interestFormText}
                </p>
                
                <form onSubmit={handleInterestSubmit} className="interest-form">
                  <div className="form-row-2">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder={dict.labels.firstName}
                        required
                        value={formFields.emri}
                        onChange={(e) => setFormFields({ ...formFields, emri: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder={dict.labels.lastName}
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
                          <option value="">{dict.labels.preferredTime}</option>
                          <option value="Kurdo">{dict.labels.anytime}</option>
                          <option value="Mëngjes">{dict.labels.morning}</option>
                          <option value="Pasdite">{dict.labels.afternoon}</option>
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
                          <option value="">{dict.labels.preferredContact}</option>
                          <option value="Telefon">{dict.labels.phone}</option>
                          <option value="E-mail">{dict.labels.email}</option>
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
                      <div className="phone-input-with-notice" style={{ width: '100%' }}>
                        <input
                          type="tel"
                          placeholder={dict.labels.phone}
                          required
                          value={formFields.telefon}
                          onChange={(e) => setFormFields({ ...formFields, telefon: e.target.value })}
                          style={{ width: '100%' }}
                        />
                        {dict.labels.phoneNotice && (
                          <span className="phone-notice-legal" style={{ display: 'block', marginTop: '6px' }}>
                            {dict.labels.phoneNotice}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <input
                        type="email"
                        placeholder={dict.labels.email}
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
                        placeholder={dict.labels.postalCode}
                        required
                        value={formFields.kodiPostar}
                        onChange={(e) => setFormFields({ ...formFields, kodiPostar: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder={dict.labels.city}
                        required
                        value={formFields.qyteti}
                        onChange={(e) => setFormFields({ ...formFields, qyteti: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group-full">
                    <input
                      type="text"
                      placeholder={dict.labels.address}
                      value={formFields.adresa}
                      onChange={(e) => setFormFields({ ...formFields, adresa: e.target.value })}
                    />
                  </div>

                  <div className="form-group-full">
                    <textarea
                      placeholder={dict.labels.message}
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
                        {dict.labels.gdpr}
                      </span>
                    </label>
                  </div>

                  <button type="submit" className="interest-submit-button">
                    {dict.labels.sendInterest}
                  </button>

                  {formStatus === "success" && (
                    <div className="form-success-msg">
                      {dict.labels.successInterest}
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
                    aria-label={dict.breakdown.title}
                    onClick={() => setBreakdownOpen((open) => !open)}
                  >
                    <svg className="dropdown-arrow" width="20" height="10" viewBox="0 0 20 10" fill="none">
                      <path d="M0.640137 0.768219L9.64014 8.26822L18.6401 0.768219" stroke="black" strokeWidth="2" />
                    </svg>
                  </button>
                </div>
                <button className="continue-button" type="button" onClick={continueToCheckout}>
                  {dict.labels.orderNow}
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
                    <span className="breakdown-label">{dict.breakdown.total}:</span>
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
              aria-label={dict.labels.close}
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
                className="modal-image-el"
              />
            </div>
            <div className="material-modal-content">
              <p className="material-modal-kicker">{materialModal.category.label}</p>
              <h2 id="material-modal-title">{materialModal.option.label}</h2>
              <p>
                {materialModal.option.materialDescription ?? (
                  locale === "en" ? "Material information to be completed from the CMS during the final migration." :
                  locale === "de" ? "Materialinformationen, die während der finalen Migration aus dem CMS ausgefüllt werden müssen." :
                  locale === "nl" ? "Materiaalgegevens die tijdens de uiteindelijke migratie vanuit het CMS moeten worden ingevuld." :
                  "Information du materiau a completer depuis le CMS lors de la migration finale."
                )}
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
              aria-label={dict.labels?.close || "Close"}
              onClick={() => setIsZoomed(false)}
            >
              ×
            </button>
            {renderLayerStage("image-zoom-stage")}
          </div>
        </div>
      ) : null}
      {planimetryOpen ? (
        <div
          className="material-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPlanimetryOpen(false);
          }}
        >
          <div className="material-modal" role="dialog" aria-modal="true" aria-labelledby="planimetry-modal-title">
            <button
              type="button"
              className="material-modal-close"
              onClick={() => setPlanimetryOpen(false)}
            >
              ×
            </button>
            <div className="material-modal-media">
              <Image
                src={config.planimetry || '/api/media/file/asebra-me-atike_default.jpg'}
                alt={`Planimetria - ${config.name}`}
                width={1100}
                height={620}
                className="modal-image-el"
                style={{ width: "100%", height: "100%", objectFit: "contain", background: "#f9fafb", padding: "20px" }}
              />
            </div>
            <div className="material-modal-content" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {config.category && (
                <p className="material-modal-kicker">{config.category}</p>
              )}
              <h2 id="planimetry-modal-title" style={{ margin: "0 0 10px 0" }}>{config.name}</h2>
              <p style={{ margin: "0 0 24px 0", color: "#4B5563", fontSize: "14px", lineHeight: "1.6" }}>
                {locale === "en" ? "Planimetry / Floor plan layout details. This plan showcases the interior room distribution and usable living spaces." :
                 locale === "de" ? "Planimetrie / Grundriss. Dieser Plan zeigt die Aufteilung der Innenräume und die nutzbaren Wohnflächen." :
                 locale === "nl" ? "Planimetrie / Plattegrond. Dit plan toont de indeling van de binnenruimtes en de bruikbare woonoppervlaktes." :
                 "Planimétrie / Plan de sol. Ce plan présente l'aménagement intérieur et la distribution des espaces de vie."}
              </p>
              <div className="material-attributes-grid" style={{ marginTop: "0" }}>
                {config.perdhesa?.neto && (
                  <div className="material-attribute-card">
                    <span className="material-attribute-label">Neto</span>
                    <span className="material-attribute-value">{config.perdhesa.neto} m²</span>
                  </div>
                )}
                {config.perdhesa?.bruto && (
                  <div className="material-attribute-card">
                    <span className="material-attribute-label">Bruto</span>
                    <span className="material-attribute-value">{config.perdhesa.bruto} m²</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
