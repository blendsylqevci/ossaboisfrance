import { HouseConfiguratorData, ConfigCategory, SizeOption } from "@/data/house-configurator";
import { Locale } from "@/lib/i18n";
import { translateText, translateHouseDescription } from "./translation-helper";

export function calculateStructureSizePrice(
  sizeId: string,
  neto: number,
  fallbackPrice: number,
  rate60x160?: number,
  rate60x200?: number
): number {
  const r160 = typeof rate60x160 === 'number' ? rate60x160 : 350;
  const r200 = typeof rate60x200 === 'number' ? rate60x200 : 370;
  if (sizeId === "60x160") {
    if (neto > 0) {
      if (neto >= 131) {
        return (neto * r160) + 3500;
      } else {
        return neto * r160;
      }
    }
  } else if (sizeId === "60x200") {
    if (neto > 0) {
      if (neto >= 131) {
        return (neto * r200) + 3500;
      } else {
        return neto * r200;
      }
    }
  }
  return fallbackPrice;
}


function buildCategoryOptions(
  hardcodedDefaults: Array<{
    id: string;
    label: string;
    price160: number;
    price200: number;
    layerKey: string;
    materialDescription?: string;
  }>,
  cmsOptions: any[] | undefined,
  layers: Record<string, string>,
  houseDoc: any,
  locale: Locale
): any[] {
  const finalOptions: any[] = [];
  const processedLayerKeys = new Set<string>();

  if (cmsOptions && cmsOptions.length > 0) {
    for (const cmsOpt of cmsOptions) {
      if (!cmsOpt.layer_key) continue;
      const layerUrl = layers[cmsOpt.layer_key] || '';
      if (!layerUrl) continue; // Only show if the current house has this layer!

      // Pricing logic: menuiseries exception or standard
      let price160 = cmsOpt.option_price;
      let price200 = typeof cmsOpt.option_price_200 === 'number' ? cmsOpt.option_price_200 : price160;

      // Special case: Menuiseries prices are house-specific (defined on the Houses collection document)
      if (cmsOpt.layer_key === 'windows_aluminium') {
        price160 = houseDoc.windows?.aluminiumPrice || 7564;
        price200 = houseDoc.windows?.aluminiumPrice || 7564;
      } else if (cmsOpt.layer_key === 'windows_pvc') {
        price160 = houseDoc.windows?.pvcPrice || 6176;
        price200 = houseDoc.windows?.pvcPrice || 6176;
      }

      const defaultOpt = hardcodedDefaults.find(d => d.layerKey === cmsOpt.layer_key);
      const id = defaultOpt ? defaultOpt.id : cmsOpt.layer_key.replace(/_/g, '-');

      let optionLabel = translateText(cmsOpt.option_name || defaultOpt?.label || '', locale);
      if (cmsOpt.layer_key === 'etancheite_epdm') {
        const categoryId = typeof houseDoc?.category === 'object' ? houseDoc?.category?.id : houseDoc?.category;
        const categorySlug = typeof houseDoc?.category === 'object' ? houseDoc?.category?.slug : '';
        const isTerraceOrTerraceEtage = 
          houseDoc?.category_id === 1 ||
          houseDoc?.category_id === 2 ||
          categoryId === 1 ||
          categoryId === 2 ||
          categorySlug === 'maison-toitu-terrasse' ||
          categorySlug === 'maison-sans-faitage';
        
        if (isTerraceOrTerraceEtage) {
          optionLabel = "EPDM";
        } else {
          optionLabel = translateText("Film pare-pluie avec tas", locale);
        }
      }

      finalOptions.push({
        id,
        label: optionLabel,
        price160,
        price200,
        layerKey: cmsOpt.layer_key,
        layer: layerUrl,
        materialDescription: translateText(cmsOpt.option_description || defaultOpt?.materialDescription || '', locale),
        thumbnail: cmsOpt.option_mini_image?.url || undefined,
        modalImage: cmsOpt.option_image?.url || undefined,
      });
      processedLayerKeys.add(cmsOpt.layer_key);
    }
  }

  // Fallback for hardcoded defaults
  for (const defOpt of hardcodedDefaults) {
    if (processedLayerKeys.has(defOpt.layerKey)) continue;
    const layerUrl = layers[defOpt.layerKey] || '';
    if (!layerUrl) continue;

    let optionLabel = translateText(defOpt.label, locale);
    if (defOpt.layerKey === 'etancheite_epdm') {
      const categoryId = typeof houseDoc?.category === 'object' ? houseDoc?.category?.id : houseDoc?.category;
      const categorySlug = typeof houseDoc?.category === 'object' ? houseDoc?.category?.slug : '';
      const isTerraceOrTerraceEtage = 
        houseDoc?.category_id === 1 ||
        houseDoc?.category_id === 2 ||
        categoryId === 1 ||
        categoryId === 2 ||
        categorySlug === 'maison-toitu-terrasse' ||
        categorySlug === 'maison-sans-faitage';
      
      if (isTerraceOrTerraceEtage) {
        optionLabel = "EPDM";
      } else {
        optionLabel = translateText("Film pare-pluie avec tas", locale);
      }
    }

    finalOptions.push({
      id: defOpt.id,
      label: optionLabel,
      price160: defOpt.price160,
      price200: defOpt.price200,
      layerKey: defOpt.layerKey,
      layer: layerUrl,
      materialDescription: translateText(defOpt.materialDescription || '', locale),
    });
  }

  return finalOptions;
}


export function mapHouseDocToConfiguratorData(
  houseDoc: any,
  globalOptions?: any,
  mediaMap?: Record<string, string>,
  locale: Locale = "fr"
): HouseConfiguratorData | null {
  if (!houseDoc) return null;

  // Extract media URLs
  const defaultImage = houseDoc.defaultImage?.url || '';
  const finalImage = houseDoc.finalImage?.url || '';
  const backgroundLayer = houseDoc.layers?.backgroundLayer?.url || '';
  const constructionLayer = houseDoc.layers?.constructionLayer?.url || '';

  // If there is no background or construction layer, this house is not configurator-ready
  if (!backgroundLayer || !constructionLayer) {
    return null;
  }

  // Extract layers mapping
  const layers: Record<string, string> = {};
  if (houseDoc.layers) {
    for (const [key, value] of Object.entries(houseDoc.layers)) {
      if (value && typeof value === 'object' && 'url' in value) {
        layers[key] = (value as any).url || '';
      }
    }
  }

  // Build sizes
  const sizes: SizeOption[] = [];
  const netoSurface = houseDoc.perdhesa?.neto || 0;

  if (houseDoc.price60x160) {
    const calculatedPrice = calculateStructureSizePrice(
      "60x160",
      netoSurface,
      houseDoc.price60x160,
      globalOptions?.priceRate60x160,
      globalOptions?.priceRate60x200
    );
    sizes.push({
      id: "60x160",
      label: "60x160",
      price: calculatedPrice,
      image: defaultImage
    });
  }
  if (houseDoc.price60x200) {
    const calculatedPrice = calculateStructureSizePrice(
      "60x200",
      netoSurface,
      houseDoc.price60x200,
      globalOptions?.priceRate60x160,
      globalOptions?.priceRate60x200
    );
    sizes.push({
      id: "60x200",
      label: "60x200",
      price: calculatedPrice,
      image: finalImage || defaultImage
    });
  }

  if (sizes.length === 0) {
    return null;
  }

  // Build a dictionary of custom fields values
  const customFields: Record<string, any> = {};
  const dynamicCategories: ConfigCategory[] = [];
  const dynamicDefaultSelections: Record<string, string> = {};

  if (houseDoc.customFields && Array.isArray(houseDoc.customFields)) {
    for (const block of houseDoc.customFields) {
      if (!block || !block.definition) continue;

      const def = block.definition;
      const slug = typeof def === 'object' ? def.name : '';

      if (!slug) continue;

      // Extract raw value
      let blockVal: any = undefined;
      if (block.blockType === 'booleanValue') {
        blockVal = block.value;
      } else if (block.blockType === 'numberValue') {
        blockVal = block.value;
      } else if (block.blockType === 'textValue') {
        blockVal = block.value;
      } else if (block.blockType === 'selectValue') {
        blockVal = block.value;
      } else if (block.blockType === 'textareaValue') {
        blockVal = block.value;
      } else if (block.blockType === 'imageValue') {
        blockVal = typeof block.value === 'object' ? block.value?.url : block.value;
      } else if (block.blockType === 'repeaterValue') {
        blockVal = block.rows;
      }

      if (blockVal !== undefined) {
        customFields[slug] = blockVal;
      }
    }
  }

  // Parse new ACF-like dynamic fields configuration
  const houseDynamicConfig = houseDoc.dynamicFieldsConfig
    ? typeof houseDoc.dynamicFieldsConfig === 'string'
      ? JSON.parse(houseDoc.dynamicFieldsConfig)
      : houseDoc.dynamicFieldsConfig
    : {};

  if (globalOptions?.dynamic_options && Array.isArray(globalOptions.dynamic_options)) {
    for (const dynOptConfig of globalOptions.dynamic_options) {
      if (!dynOptConfig || !dynOptConfig.field_definition) continue;

      const def = dynOptConfig.field_definition;
      const slug = typeof def === 'object' ? def.name : '';
      const label = typeof def === 'object' && def.label
        ? (typeof def.label === 'object' ? def.label.fr || Object.values(def.label)[0] || slug : def.label || slug)
        : (typeof def === 'object' ? slug : '');
      const type = typeof def === 'object' ? def.type : '';
      const description = typeof def === 'object' && def.description
        ? (typeof def.description === 'object' ? def.description.fr || Object.values(def.description)[0] || '' : def.description || '')
        : '';
      const subFields: any[] = typeof def === 'object' && Array.isArray(def.subFields) ? def.subFields : [];

      if (!slug) continue;

      // Check if this custom field is enabled for this house
      const houseFieldConfig = houseDynamicConfig[slug];
      if (!houseFieldConfig || !houseFieldConfig.enabled) {
        continue; // Not enabled for this house
      }

      // Map the options configured globally
      if (Array.isArray(dynOptConfig.options) && dynOptConfig.options.length > 0) {
        const optionsList = dynOptConfig.options.map((o: any) => {
          // Resolve layer URL: check for house override first, fallback to house default layer
          let layerUrl = '';
          const overrideMediaId = houseFieldConfig.options?.[o.layer_key];
          if (overrideMediaId && mediaMap && mediaMap[overrideMediaId]) {
            layerUrl = mediaMap[overrideMediaId];
          } else if (o.layer_key) {
            layerUrl = layers[o.layer_key] || '';
          }

          const optionId = o.option_name ? o.option_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `opt-${o.id}`;

          // Map dynamic values to attributes
          const dynamicValues = o.dynamicValues
            ? typeof o.dynamicValues === 'string'
              ? JSON.parse(o.dynamicValues)
              : o.dynamicValues
            : {};

          const mappedAttributes: Array<{ name: string; value: string }> = [];

          // Map each subfield to an attribute entry
          subFields.forEach((sf: any) => {
            const val = dynamicValues[sf.name];
            if (val !== undefined && val !== null && val !== '') {
              let valStr = String(val);
              if (sf.type === 'checkbox') {
                valStr = val
                  ? locale === 'en' ? 'Yes' : locale === 'de' ? 'Ja' : locale === 'nl' ? 'Ja' : 'Oui'
                  : locale === 'en' ? 'No' : locale === 'de' ? 'Nein' : locale === 'nl' ? 'Nee' : 'Non';
              }

              mappedAttributes.push({
                name: translateText(sf.label || sf.name, locale),
                value: translateText(valStr, locale)
              });
            }
          });

          return {
            id: optionId,
            label: translateText(o.option_name, locale),
            price160: o.option_price || 0,
            price200: typeof o.option_price_200 === 'number' ? o.option_price_200 : (o.option_price || 0),
            layerKey: o.layer_key || '',
            layer: layerUrl,
            thumbnail: o.option_mini_image?.url || undefined,
            modalImage: o.option_image?.url || undefined,
            materialDescription: translateText(o.option_description || '', locale),
            attributes: mappedAttributes.length > 0 ? mappedAttributes : undefined,
          };
        });

        if (optionsList.length > 0) {
          const selectionMode = type === 'checkbox' ? 'checkbox' : 'radio-toggle';

          dynamicCategories.push({
            id: slug,
            inputName: `house_${slug}`,
            label: translateText(label || slug, locale),
            description: translateText(description || undefined, locale),
            priceMode: 'fixed',
            selectionMode,
            options: optionsList,
          });

          // Set default selection
          const defaultOpt = optionsList.find((o: any, idx: number) => {
            const rawOpt = dynOptConfig.options[idx];
            return rawOpt && rawOpt.checkbox === true;
          });

          if (defaultOpt) {
            dynamicDefaultSelections[slug] = defaultOpt.id;
          } else {
            dynamicDefaultSelections[slug] = optionsList[0].id;
          }
        }
      }
    }
  }

  // Build categories dynamically
  const categories: ConfigCategory[] = [
    {
      id: "isolation",
      inputName: "house_isolation",
      label: translateText("Isolation intermédiaire", locale),
      description: translateText("Choix de l'isolation entre les éléments de structure.", locale),
      priceMode: "wall_m2",
      selectionMode: "radio-toggle",
      options: buildCategoryOptions(
        [
          {
            id: "laine-verre",
            label: "Laine de verre",
            price160: 11.15,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 12.5 : 12.25,
            layerKey: "iso_inter_verre",
            materialDescription: "Solution d'isolation légère et efficace pour les parois de la structure."
          },
          {
            id: "laine-roche",
            label: "Laine de roche",
            price160: 12.5,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 13.8 : 14.0,
            layerKey: "iso_inter_roche",
            materialDescription: "Isolation minérale avec une bonne tenue thermique et acoustique."
          },
          {
            id: "laine-bois",
            label: "Laine de bois",
            price160: 16.5,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 18.2 : 18.0,
            layerKey: "iso_inter_bois",
            materialDescription: "Isolation biosourcée, choisie pour le confort thermique et l'inertie naturelle."
          }
        ],
        globalOptions?.global_isolation_options,
        layers,
        houseDoc,
        locale
      )
    },
    {
      id: "outerIsolation",
      inputName: "house_outer_isolation",
      label: translateText("Isolation extérieure", locale),
      description: translateText("Isolation appliquée depuis l'extérieur.", locale),
      priceMode: "wall_m2",
      selectionMode: "radio-toggle",
      options: buildCategoryOptions(
        [
          {
            id: "laine-roche-ext",
            label: "Laine de roche comprimée",
            price160: 15.9,
            price200: 17.4,
            layerKey: "iso_ext_roche_comprimee",
            materialDescription: "Isolation extérieure dense en laine de roche comprimée, robuste et stable."
          },
          {
            id: "polystyrene-ext",
            label: "Polystyrene",
            price160: 10.15,
            price200: 11.4,
            layerKey: "iso_ext_polystyrene",
            materialDescription: "Isolation extérieure en polystyrène pour une enveloppe continue et un coût maîtrisé."
          },
          {
            id: "fibre",
            label: "Fibre",
            price160: 14.2,
            price200: 15.6,
            layerKey: "iso_ext_fibre",
            materialDescription: "Isolation extérieure biosourcée haute densité en fibre de bois."
          }
        ],
        globalOptions?.global_outer_isolation_options,
        layers,
        houseDoc,
        locale
      )
    },
    {
      id: "terraceEtancheite",
      inputName: "house_terrace_etancheite",
      label: translateText("Étanchéité toiture terrasse avec couvertine", locale),
      description: translateText("Isolation pour toiture terrasse.", locale),
      priceMode: "roof_m2",
      selectionMode: "checkbox",
      options: buildCategoryOptions(
        [
          {
            id: "terrace-epdm",
            label: "Polystyrène d'attique",
            price160: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 14.0,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 14.0,
            layerKey: "terrace_etancheite_epdm",
            materialDescription: "Plaques de polystyrène expansé spécifiques pour l'étanchéité d'attique."
          }
        ],
        globalOptions?.global_terrace_etancheite_options,
        layers,
        houseDoc,
        locale
      )
    },
    {
      id: "etancheite",
      inputName: "house_etancheite",
      label: translateText("Étanchéité", locale),
      description: translateText("Membrane d'étanchéité pour toiture plate.", locale),
      priceMode: "roof_m2",
      selectionMode: "checkbox",
      options: buildCategoryOptions(
        [
          {
            id: "epdm",
            label: "Membrane EPDM",
            price160: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 14.0,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 14.0,
            layerKey: "etancheite_epdm",
            materialDescription: "Membrane synthétique monocouche offrant une étanchéité totale et durable."
          }
        ],
        globalOptions?.global_roof_options,
        layers,
        houseDoc,
        locale
      )
    },
    {
      id: "facade",
      inputName: "house_facade",
      label: translateText("Finition de la façade", locale),
      description: translateText("Choisissez le revêtement extérieur de votre maison.", locale),
      priceMode: "wall_m2",
      selectionMode: "radio-toggle",
      options: buildCategoryOptions(
        [
          {
            id: "enduit",
            label: "Façade blanche (Enduit)",
            price160: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 25.5,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 25.5,
            layerKey: "facade_blanche",
            materialDescription: "Finition par enduit blanc offrant un aspect propre, moderne et lumineux."
          },
          {
            id: "bardage",
            label: "Bardage Mélèze",
            price160: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 38.5,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 38.5,
            layerKey: "facade_bardage",
            materialDescription: "Finition par clin de bois en Mélèze naturel pour un look chaleureux et authentique."
          }
        ],
        globalOptions?.global_facade_options,
        layers,
        houseDoc,
        locale
      )
    },
    {
      id: "roof",
      inputName: "house_roof_isolation",
      label: translateText("Isolation de la toiture par l'extérieur", locale),
      description: translateText("Isolation pour charpente fermette.", locale),
      priceMode: "roof_m2",
      selectionMode: "radio-toggle",
      options: buildCategoryOptions(
        [
          {
            id: "verre",
            label: "Laine de Verre - 220mm",
            price160: 11.67,
            price200: 11.67,
            layerKey: "roof_verre",
            materialDescription: "Laine de verre soufflée offrant une excellente barrière thermique homogène."
          },
          {
            id: "roche",
            label: "Laine de Roche - 220mm",
            price160: 14.06,
            price200: 14.06,
            layerKey: "roof_roche",
            materialDescription: "Isolation par soufflage de laine de roche stable, dense et résistante au feu."
          },
          {
            id: "bois",
            label: "Laine de Bois - 220mm",
            price160: 30.0,
            price200: 30.0,
            layerKey: "roof_bois",
            materialDescription: "Isolation rigide haute performance par plaques de fibre de bois."
          }
        ],
        globalOptions?.global_roof_isolation_options,
        layers,
        houseDoc,
        locale
      )
    },
    {
      id: "couverture",
      inputName: "house_couverture",
      label: translateText("Couverture", locale),
      description: translateText("Matériaux de couverture pour toit incliné.", locale),
      priceMode: "roof_m2",
      selectionMode: "radio-toggle",
      options: buildCategoryOptions(
        [
          {
            id: "pare-pluie",
            label: "Pare Pluie et Lattage",
            price160: 0,
            price200: 0,
            layerKey: "couverture_pare_pluie_lattage",
            materialDescription: "Écran sous toiture HPV et contre-lattage assurant la ventilation."
          },
          {
            id: "tuiles",
            label: "Tuiles et Gouttières",
            price160: 70.0,
            price200: 70.0,
            layerKey: "couverture_tuiles_gouttieres",
            materialDescription: "Tuiles béton ou terre cuite avec gouttières de récupération d'eau pluviale."
          },
          {
            id: "bac-acier",
            label: "Bac Acier et Gouttières",
            price160: 80.0,
            price200: 80.0,
            layerKey: "couverture_bac_acier_gouttieres",
            materialDescription: "Couverture sèche en tôle d'acier profilée très résistante aux intempéries."
          }
        ],
        globalOptions?.global_couverture_options,
        layers,
        houseDoc,
        locale
      )
    },
    {
      id: "fauxPlafond",
      inputName: "house_faux_plafond",
      label: translateText("Faux plafond", locale),
      description: translateText("Isolation acoustique et thermique des faux plafonds.", locale),
      priceMode: "wall_m2",
      selectionMode: "radio-toggle",
      options: buildCategoryOptions(
        [
          {
            id: "verre",
            label: "Laine de Verre",
            price160: 8.9,
            price200: 11.15,
            layerKey: "faux_plafond_verre",
            materialDescription: "Isolation soufflée légère et thermiquement performante."
          },
          {
            id: "roche",
            label: "Laine de Roche",
            price160: 10.8,
            price200: 13.45,
            layerKey: "faux_plafond_roche",
            materialDescription: "Soufflage dense offrant d'excellentes qualités d'absorption acoustique."
          },
          {
            id: "bois",
            label: "Laine de Bois",
            price160: 22.55,
            price200: 25.7,
            layerKey: "faux_plafond_bois",
            materialDescription: "Fibre de bois soufflée naturelle, écologique et à fort pouvoir isolant."
          }
        ],
        globalOptions?.global_faux_plafond_options,
        layers,
        houseDoc,
        locale
      )
    },
    {
      id: "dritaret",
      inputName: "house_windows",
      label: translateText("Menuiseries extérieures", locale),
      description: translateText("Choisissez les huisseries de votre maison (fenêtres et baies).", locale),
      priceMode: "fixed",
      selectionMode: "radio-toggle",
      options: buildCategoryOptions(
        [
          {
            id: "aluminium",
            label: "Menuiseries Aluminium",
            price160: houseDoc.windows?.aluminiumPrice || 7564,
            price200: houseDoc.windows?.aluminiumPrice || 7564,
            layerKey: "windows_aluminium",
            materialDescription: "Menuiseries en aluminium thermolaqué de couleur anthracite avec double vitrage performant."
          },
          {
            id: "pvc",
            label: "Menuiseries PVC",
            price160: houseDoc.windows?.pvcPrice || 6176,
            price200: houseDoc.windows?.pvcPrice || 6176,
            layerKey: "windows_pvc",
            materialDescription: "Menuiseries PVC haute isolation offrant le meilleur rapport performance/prix."
          }
        ],
        globalOptions?.global_menuiseries_options,
        layers,
        houseDoc,
        locale
      )
    }
  ];

  // Standard layer order mapping
  const layerOrder = [
    "konstruksioni",
    "iso_inter_verre",
    "iso_inter_roche",
    "iso_inter_bois",
    "iso_ext_roche_comprimee",
    "iso_ext_polystyrene",
    "iso_ext_fibre",
    "faux_plafond_verre",
    "faux_plafond_roche",
    "faux_plafond_bois",
    "roof_polystyrene",
    "roof_bois",
    "roof_roche",
    "roof_verre",
    "couverture_pare_pluie_lattage",
    "couverture_tuiles_gouttieres",
    "couverture_bac_acier_gouttieres",
    "terrace_etancheite_epdm",
    "etancheite_epdm",
    "facade_blanche",
    "facade_bardage",
    "windows_aluminium",
    "windows_pvc"
  ];

  const isComble = 
    ['elegance-comble', 'cristal', 'azura-comble', 'dianne', 'els-house-comble', 'els-house', 'france-comble', 'france-house', 'mountain-valley-villa-comble', 'mountain-valley-villa-house', 'nina-house', 'nina-comble', 'orenda'].includes(houseDoc.slug) ||
    houseDoc.category_id === 4 ||
    houseDoc.category === 4 ||
    (typeof houseDoc.category === 'object' && (houseDoc.category?.id === 4 || houseDoc.category?.slug === 'maison-combles-ammenageable'));

  const mappedCategories = [...categories, ...dynamicCategories].filter(c => c.options.length > 0);
  if (isComble) {
    const fauxPlafondIdx = mappedCategories.findIndex(c => c.id === 'fauxPlafond');
    const roofIdx = mappedCategories.findIndex(c => c.id === 'roof');
    if (fauxPlafondIdx !== -1 && roofIdx !== -1 && fauxPlafondIdx > roofIdx) {
      const [fauxPlafondCat] = mappedCategories.splice(fauxPlafondIdx, 1);
      mappedCategories.splice(roofIdx, 0, fauxPlafondCat);
    }
  }

  return {
    id: houseDoc.slug,
    name: translateText(houseDoc.title, locale),
    category: translateText(houseDoc.category?.name || 'Maison ossature bois', locale),
    subheading: translateText(houseDoc.subheading || '', locale),
    description: translateHouseDescription(houseDoc.description || houseDoc.subheading || '', houseDoc.slug, locale),
    specification: translateText(houseDoc.specification || '', locale),
    defaultImage,
    finalImage: finalImage || defaultImage,
    backgroundLayer,
    constructionLayer,
    planimetry: typeof houseDoc.planimetry === 'object' && houseDoc.planimetry !== null
      ? houseDoc.planimetry.url || null
      : typeof houseDoc.planimetry === 'string'
        ? houseDoc.planimetry
        : null,
    marginPercent: houseDoc.marginPercent ?? globalOptions?.marginPercent ?? 40,
    perdhesa: {
      bruto: houseDoc.perdhesa?.bruto || 0,
      neto: houseDoc.perdhesa?.neto || 0,
      mure_te_jashtme: houseDoc.perdhesa?.mure_te_jashtme || 0,
      mure_mbajtese: houseDoc.perdhesa?.mure_mbajtese || 0,
      mure_ndarese: houseDoc.perdhesa?.mure_ndarese || 0,
      pllaka_e_kulmit: houseDoc.perdhesa?.pllaka_e_kulmit || 0,
      pllaka_e_katit_0: houseDoc.perdhesa?.pllaka_e_katit_0 || 0,
      pllaka_e_katit_1: houseDoc.perdhesa?.pllaka_e_katit_1 || 0,
      pllaka_e_katit_2: houseDoc.perdhesa?.pllaka_e_katit_2 || 0,
      pllaka_e_katit: houseDoc.perdhesa?.pllaka_e_katit || 0,
      kulmi: houseDoc.perdhesa?.kulmi || 0,
    },
    sizes,
    categories: mappedCategories,
    layerOrder: Array.from(new Set([
      ...layerOrder,
      ...dynamicCategories.flatMap(cat => cat.options.map(opt => opt.layerKey).filter(Boolean))
    ])),
    defaultSelection: {
      size: "60x160",
      ...(isComble ? { couverture: "pare-pluie" } : {}),
      ...dynamicDefaultSelections
    },
    optionalCategoryIds: ["dritaret"],
    enableFlags: {
      enableRoofOption: houseDoc.enableFlags?.enableRoofOption ?? false,
      enableEtancheiteOption: houseDoc.enableFlags?.enableEtancheiteOption ?? true,
      enableEtancheiteTerrasse: houseDoc.enableFlags?.enableEtancheiteTerrasse ?? false,
      enableCouvertureOption: houseDoc.enableFlags?.enableCouvertureOption ?? false,
      enableFauxPlafondOption: houseDoc.enableFlags?.enableFauxPlafondOption ?? false,
    },
    structureInfo: translateText(houseDoc.structureInfo || 'Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l’ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle type fermette. Le prix inclut le transport et le montage sur site sous garantie décennale.', locale),
    customFields,
    sliderConfig: houseDoc.sliderConfig || (isComble ? {
      top: "10%",
      height: "55%",
      left: "15%",
      width: "80%",
      slantAngle: -40,
      slantOffset: -57.61,
      clippableOptions: ["pare-pluie", "tuiles", "bac-acier"],
    } : undefined),
  };
}
