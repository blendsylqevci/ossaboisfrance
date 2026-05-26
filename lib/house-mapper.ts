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
    modalImage?: string;
    thumbnail?: string;
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
        thumbnail: (defaultOpt as any)?.thumbnail || cmsOpt.option_mini_image?.url || undefined,
        modalImage: (defaultOpt as any)?.modalImage || cmsOpt.option_image?.url || undefined,
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
      modalImage: (defOpt as any).modalImage || undefined,
      thumbnail: (defOpt as any).thumbnail || undefined,
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
            materialDescription: "La laine de verre est un excellent isolant thermique et acoustique, incombustible et respectueux de l'environnement. Elle épouse parfaitement la structure en bois pour éliminer les ponts thermiques, garantissant une température intérieure douce en hiver et agréable en été.",
            modalImage: "/api/media/file/laine-de-verre.webp",
            thumbnail: "/api/media/file/laine-de-verre.webp",
          },
          {
            id: "laine-roche",
            label: "Laine de roche",
            price160: 12.5,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 13.8 : 14.0,
            layerKey: "iso_inter_roche",
            materialDescription: "Fabriquée à partir de roche volcanique naturelle, la laine de roche offre une isolation thermique supérieure et une excellente absorption acoustique contre les bruits aériens et d'impact. Elle possède une résistance exceptionnelle au feu et reste stable dans le temps sans tassement.",
            modalImage: "/api/media/file/laine-de-roche.webp",
            thumbnail: "/api/media/file/laine-de-roche.webp",
          },
          {
            id: "laine-bois",
            label: "Laine de bois",
            price160: 16.5,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 18.2 : 18.0,
            layerKey: "iso_inter_bois",
            materialDescription: "Isolant biosourcé et écologique par excellence, la laine de bois offre une forte inertie thermique (déphasage important). Elle protège remarquablement de la chaleur en été et conserve la chaleur en hiver tout en régulant naturellement l'humidité ambiante.",
            modalImage: "/api/media/file/laine-de-bois.webp",
            thumbnail: "/api/media/file/laine-de-bois.webp",
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
            materialDescription: "Isolation extérieure haute densité qui enveloppe la maison pour supprimer tous les ponts thermiques structurels. Offre une robustesse mécanique exceptionnelle, une barrière acoustique contre les bruits extérieurs et une sécurité incendie maximale.",
            modalImage: "/api/media/file/laine-de-roche.webp",
            thumbnail: "/api/media/file/laine-de-roche.webp",
          },
          {
            id: "polystyrene-ext",
            label: "Polystyrene",
            price160: 10.15,
            price200: 11.4,
            layerKey: "iso_ext_polystyrene",
            materialDescription: "Le polystyrène expansé (PSE) assure une isolation par l'extérieur continue et performante à un rapport qualité-prix optimal. Il crée un bouclier thermique étanche, léger et imperméable, idéal pour réduire efficacement les factures énergétiques.",
            modalImage: "/api/media/file/polystyrene.webp",
            thumbnail: "/api/media/file/polystyrene.webp",
          },
          {
            id: "fibre",
            label: "Fibre",
            price160: 14.2,
            price200: 15.6,
            layerKey: "iso_ext_fibre",
            materialDescription: "La fibre de bois rigide pour ITE est un matériau biosourcé 100% naturel. Elle assure une excellente respirabilité des murs tout en offrant un déphasage thermique exceptionnel, idéal pour préserver la fraîcheur intérieure en période estivale.",
            modalImage: "/api/media/file/fibre-de-bois.webp",
            thumbnail: "/api/media/file/fibre-de-bois.webp",
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
            materialDescription: "Plaques isolantes en polystyrène expansé haute densité spécialement formulées pour supporter l'étanchéité des toitures terrasses. Elles offrent une haute résistance à la compression et garantissent une isolation continue sous la membrane EPDM.",
            modalImage: "/api/media/file/polystyrene.webp",
            thumbnail: "/api/media/file/polystyrene.webp",
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
            materialDescription: "La membrane élastomère EPDM est la référence absolue pour l'étanchéité des toits plats. Offrant une longévité de plus de 50 ans, elle est extrêmement résistant aux UV, aux températures extrêmes et reste parfaitement élastique sans aucun entretien.",
            modalImage: "/api/media/file/membrane-epdm.webp",
            thumbnail: "/api/media/file/membrane-epdm.webp",
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
            materialDescription: "L'enduit minéral blanc apporte une finition épurée, lumineuse et moderne. Il protège durablement la structure en bois contre les intempéries tout en laissant respirer les parois de votre maison.",
            modalImage: "/api/media/file/facade-blanche-enduit.webp",
            thumbnail: "/api/media/file/facade-blanche-enduit.webp",
          },
          {
            id: "bardage",
            label: "Bardage Mélèze",
            price160: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 38.5,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 38.5,
            layerKey: "facade_bardage",
            materialDescription: "Finition haut de gamme en clin de bois de Mélèze naturel. Ce bois robuste et naturellement imputrescible (sans traitement chimique) apporte un aspect chaleureux et développe avec le temps une élégante patine grise argentée très esthétique.",
            modalImage: "/api/media/file/bardage-meleze.webp",
            thumbnail: "/api/media/file/bardage-meleze.webp",
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
            materialDescription: "Épaisse couche d'isolation en laine de verre pour toiture assurant une barrière thermique continue. Elle réduit fortement les pertes de chaleur par le toit, assurant de grandes économies de chauffage et un excellent confort.",
            modalImage: "/api/media/file/laine-de-verre.webp",
            thumbnail: "/api/media/file/laine-de-verre.webp",
          },
          {
            id: "roche",
            label: "Laine de Roche - 220mm",
            price160: 14.06,
            price200: 14.06,
            layerKey: "roof_roche",
            materialDescription: "Isolation de toiture en laine de roche soufflée offrant une excellente densité. Elle assure un grand confort thermique et acoustique (bruits de pluie, de vent) tout en apportant une protection incendie passive renforcée.",
            modalImage: "/api/media/file/laine-de-roche.webp",
            thumbnail: "/api/media/file/laine-de-roche.webp",
          },
          {
            id: "bois",
            label: "Laine de Bois - 220mm",
            price160: 30.0,
            price200: 30.0,
            layerKey: "roof_bois",
            materialDescription: "Isolant de toiture biosourcé en fibre de bois de 220mm. Sa forte densité offre la meilleure protection contre la chaleur estivale sous les combles grâce à un temps de déphasage thermique exceptionnel d'environ 12 heures.",
            modalImage: "/api/media/file/laine-de-bois.webp",
            thumbnail: "/api/media/file/laine-de-bois.webp",
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
            materialDescription: "Écran de sous-toiture hautement perméable à la vapeur (HPV) avec contre-lattage. Il protège la charpente des infiltrations accidentelles d'eau et de poussière tout en assurant une ventilation continue et saine de la toiture."
          },
          {
            id: "tuiles",
            label: "Tuiles et Gouttières",
            price160: 70.0,
            price200: 70.0,
            layerKey: "couverture_tuiles_gouttieres",
            materialDescription: "Couverture traditionnelle en tuiles de béton ou terre cuite haute résistance incluant gouttières et descentes de récupération d'eau. Assure une protection robuste face aux pires intempéries avec une esthétique intemporelle.",
            modalImage: "/api/media/file/tuiles.webp",
            thumbnail: "/api/media/file/tuiles.webp",
          },
          {
            id: "bac-acier",
            label: "Bac Acier et Gouttières",
            price160: 80.0,
            price200: 80.0,
            layerKey: "couverture_bac_acier_gouttieres",
            materialDescription: "Couverture moderne en plaques d'acier nervurées (bac acier) avec traitement anti-condensation. Très résistant, léger et étanche face aux tempêtes et à la grêle, il apporte une allure contemporaine et épurée à votre maison.",
            modalImage: "/api/media/file/bac-acier.webp",
            thumbnail: "/api/media/file/bac-acier.webp",
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
            materialDescription: "Isolation thermique et acoustique légère insérée dans le plénum du faux plafond. Limite les pertes de chaleur vers les combles et atténue les bruits intérieurs entre les pièces.",
            modalImage: "/api/media/file/laine-de-verre.webp",
            thumbnail: "/api/media/file/laine-de-verre.webp",
          },
          {
            id: "roche",
            label: "Laine de Roche",
            price160: 10.8,
            price200: 13.45,
            layerKey: "faux_plafond_roche",
            materialDescription: "Isolant thermique et acoustique dense inséré en faux plafond. Ses propriétés fibreuses permettent d'absorber efficacement les bruits aériens (voix, musique) pour une tranquillité totale d'une pièce à l'autre.",
            modalImage: "/api/media/file/laine-de-roche.webp",
            thumbnail: "/api/media/file/laine-de-roche.webp",
          },
          {
            id: "bois",
            label: "Laine de Bois",
            price160: 22.55,
            price200: 25.7,
            layerKey: "faux_plafond_bois",
            materialDescription: "Isolation en fibre de bois naturelle pour faux plafond. Écologique et saine, elle contribue à la régulation de l'humidité intérieure tout en apportant un excellent confort thermo-acoustique.",
            modalImage: "/api/media/file/laine-de-bois.webp",
            thumbnail: "/api/media/file/laine-de-bois.webp",
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
            materialDescription: "Châssis haut de gamme en aluminium gris anthracite (RAL 7016) avec double vitrage thermique renforcé à gaz Argon. Leurs profilés ultra-fins maximisent la luminosité intérieure pour un design moderne et d'excellents apports solaires.",
            modalImage: "/api/media/file/menuiseries-aluminium.webp",
            thumbnail: "/api/media/file/menuiseries-aluminium.webp",
          },
          {
            id: "pvc",
            label: "Menuiseries PVC",
            price160: houseDoc.windows?.pvcPrice || 6176,
            price200: houseDoc.windows?.pvcPrice || 6176,
            layerKey: "windows_pvc",
            materialDescription: "Menuiseries en PVC blanc haute isolation avec double vitrage thermique renforcé. Offrant le meilleur rapport performance/prix, elles garantissent une excellente isolation thermique naturelle et ne nécessitent aucun entretien.",
            modalImage: "/api/media/file/menuiseries-pvc.webp",
            thumbnail: "/api/media/file/menuiseries-pvc.webp",
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
