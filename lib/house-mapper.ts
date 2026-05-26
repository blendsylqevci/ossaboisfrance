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
    attributes?: Array<{ name: string; value: string }>;
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
        attributes: (defaultOpt as any)?.attributes || undefined,
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
      attributes: (defOpt as any).attributes || undefined,
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

  const categoryId = typeof houseDoc.category === 'object' ? houseDoc.category?.id : houseDoc.category;
  const categorySlug = typeof houseDoc.category === 'object' ? houseDoc.category?.slug : '';
  const isTerraceOrTerraceEtage = 
    houseDoc.category_id === 1 ||
    houseDoc.category_id === 2 ||
    categoryId === 1 ||
    categoryId === 2 ||
    categorySlug === 'maison-toitu-terrasse' ||
    categorySlug === 'maison-sans-faitage';

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
            label: locale === "en" ? "Glass wool" : locale === "de" ? "Glaswolle" : locale === "nl" ? "Glaswol" : "Laine de verre",
            price160: 11.15,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 12.5 : 12.25,
            layerKey: "iso_inter_verre",
            materialDescription: 
              locale === "en" ? "Glass wool is an excellent thermal and acoustic insulator, non-combustible and environmentally friendly. It fits perfectly into the timber structure to eliminate thermal bridges, ensuring a mild indoor temperature in winter and pleasant cool in summer." :
              locale === "de" ? "Glaswolle ist ein hervorragender Wärme- und Schalldämmstoff, nicht brennbar und umweltfreundlich. Sie fügt sich perfekt in die Holzkonstruktion ein, um Kältebrücken zu eliminieren, und sorgt für milde Innenraumtemperaturen im Winter und angenehme Kühle im Sommer." :
              locale === "nl" ? "Glaswol is een uitstekende thermische en akoestische isolator, onbrandbaar en milieuvriendelijk. Het past perfect in de houten structuur om koudebruggen te elimineren, wat zorgt voor een zachte binnentemperatuur in de winter en aangename koelte in de zomer." :
              "La laine de verre est un excellent isolant thermique et acoustique, incombustible et respectueux de l'environnement. Elle épouse parfaitement la structure en bois pour éliminer les ponts thermiques, garantissant une température intérieure douce en hiver et agréable en été.",
            modalImage: "/api/media/file/laine-de-verre.webp",
            thumbnail: "/api/media/file/laine-de-verre.webp",
            attributes: [
              { name: locale === "en" ? "Thermal conductivity" : locale === "de" ? "Wärmeleitfähigkeit" : locale === "nl" ? "Thermische geleidbaarheid" : "Conductivité thermique", value: "0.035 W/m.K" },
              { name: locale === "en" ? "Fire rating" : locale === "de" ? "Brandschutzklasse" : locale === "nl" ? "Brandklasse" : "Classement feu", value: "A1 (Incombustible)" },
              { name: locale === "en" ? "Density" : locale === "de" ? "Dichte" : locale === "nl" ? "Dichtheid" : "Densité", value: "15 - 22 kg/m³" },
              { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur", value: locale === "en" ? "160mm / 200mm (Depending on structure)" : locale === "de" ? "160mm / 200mm (Je nach Struktur)" : locale === "nl" ? "160mm / 200mm (Afhankelijk van structuur)" : "160mm / 200mm (Selon structure)" },
              { name: locale === "en" ? "Material type" : locale === "de" ? "Materialtyp" : locale === "nl" ? "Materiaaltype" : "Type de matériau", value: locale === "en" ? "Mineral wool (recycled glass)" : locale === "de" ? "Mineralwolle (Recyclingglas)" : locale === "nl" ? "Minerale wol (gerecycled glas)" : "Laine minérale (verre recyclé)" }
            ]
          },
          {
            id: "laine-roche",
            label: locale === "en" ? "Rock wool" : locale === "de" ? "Steinwolle" : locale === "nl" ? "Steenwol" : "Laine de roche",
            price160: 12.5,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 13.8 : 14.0,
            layerKey: "iso_inter_roche",
            materialDescription: 
              locale === "en" ? "Made from natural volcanic rock, rock wool offers superior thermal insulation and excellent acoustic absorption against airborne and impact noise. It has exceptional fire resistance and remains stable over time without sagging." :
              locale === "de" ? "Aus natürlichem Vulkangestein hergestellt, bietet Steinwolle eine hervorragende Wärmedämmung und eine ausgezeichnete Schallabsorption gegen Luft- und Trittschall. Sie besitzt eine außergewöhnliche Feuerbeständigkeit und bleibt über die Zeit stabil ohne Setzung." :
              locale === "nl" ? "Gemaakt van natuurlijk vulkanisch gesteente, biedt steenwol een superieure thermische isolatie en een uitstekende akoestische absorptie tegen lucht- en contactgeluid. Het heeft een uitzonderlijke brandwerendheid en blijft in de loop van de tijd stabiel zonder verzakking." :
              "Fabriquée à partir de roche volcanique naturelle, la laine de roche offre une isolation thermique supérieure et une excellente absorption acoustique contre les bruits aériens et d'impact. Elle possède une résistance exceptionnelle au feu et reste stable dans le temps sans tassement.",
            modalImage: "/api/media/file/laine-de-roche.webp",
            thumbnail: "/api/media/file/laine-de-roche.webp",
            attributes: [
              { name: locale === "en" ? "Thermal conductivity" : locale === "de" ? "Wärmeleitfähigkeit" : locale === "nl" ? "Thermische geleidbaarheid" : "Conductivité thermique", value: "0.036 W/m.K" },
              { name: locale === "en" ? "Fire rating" : locale === "de" ? "Brandschutzklasse" : locale === "nl" ? "Brandklasse" : "Classement feu", value: "A1 (Incombustible - 1000°C)" },
              { name: locale === "en" ? "Sound insulation" : locale === "de" ? "Schalldämmung" : locale === "nl" ? "Geluidsisolatie" : "Isolation acoustique", value: locale === "en" ? "Excellent (Rw -45dB)" : locale === "de" ? "Hervorragend (Rw -45dB)" : locale === "nl" ? "Uitstekend (Rw -45dB)" : "Excellente (Rw -45dB)" },
              { name: locale === "en" ? "Density" : locale === "de" ? "Dichte" : locale === "nl" ? "Dichtheid" : "Densité", value: "45 kg/m³" },
              { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur", value: locale === "en" ? "160mm / 200mm (Depending on structure)" : locale === "de" ? "160mm / 200mm (Je nach Struktur)" : locale === "nl" ? "160mm / 200mm (Afhankelijk van structuur)" : "160mm / 200mm (Selon structure)" }
            ]
          },
          {
            id: "laine-bois",
            label: locale === "en" ? "Wood wool" : locale === "de" ? "Holzwolle" : locale === "nl" ? "Houtwol" : "Laine de bois",
            price160: 16.5,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 18.2 : 18.0,
            layerKey: "iso_inter_bois",
            materialDescription: 
              locale === "en" ? "As a bio-sourced and ecological insulation material par excellence, wood wool offers high thermal inertia (significant phase shift). It provides remarkable protection against summer heat, retains winter heat, and naturally regulates ambient humidity." :
              locale === "de" ? "Als ökologischer Dämmstoff par excellence bietet Holzwolle eine hohe thermische Trägheit (erhebliche Phasenverschiebung). Sie bietet einen hervorragenden Schutz vor Sommerhitze, speichert die Winterwärme und reguliert auf natürliche Weise die Raumfeuchtigkeit." :
              locale === "nl" ? "Als ecologisch isolatiemateriaal bij uitstek biedt houtwol een hoge thermische traagheid (aanzienlijke faseverschuiving). Het biedt een opmerkelijke bescherming tegen zomerhitte, houdt winterwarmte vast en reguleert op natuurlijke wijze de luchtvochtigheid." :
              "Isolant biosourcé et écologique par excellence, la laine de bois offre une forte inertie thermique (déphasage important). Elle protège remarquablement de la chaleur en été et conserve la chaleur en hiver tout en régulant naturellement l'humidité ambiante.",
            modalImage: "/api/media/file/laine-de-bois.webp",
            thumbnail: "/api/media/file/laine-de-bois.webp",
            attributes: [
              { name: locale === "en" ? "Thermal conductivity" : locale === "de" ? "Wärmeleitfähigkeit" : locale === "nl" ? "Thermische geleidbaarheid" : "Conductivité thermique", value: "0.038 W/m.K" },
              { name: locale === "en" ? "Thermal lag" : locale === "de" ? "Phasenverschiebung" : locale === "nl" ? "Faseverschieving" : "Déphasage thermique", value: "10 - 12 heures" },
              { name: locale === "en" ? "Density" : locale === "de" ? "Dichte" : locale === "nl" ? "Dichtheid" : "Densité", value: "50 kg/m³" },
              { name: locale === "en" ? "Humidity regulation" : locale === "de" ? "Feuchtigkeitsregulierung" : locale === "nl" ? "Vochtregulatie" : "Régulation d'humidité", value: locale === "en" ? "Active (breathable)" : locale === "de" ? "Aktiv (atmungsaktiv)" : locale === "nl" ? "Actief (dampopen)" : "Active (perspirant)" },
              { name: locale === "en" ? "Material type" : locale === "de" ? "Materialtyp" : locale === "nl" ? "Materiaaltype" : "Type de matériau", value: locale === "en" ? "Bio-sourced (wood fiber)" : locale === "de" ? "Ökologisch (Holzfaser)" : locale === "nl" ? "Bio-ecologisch (houtvezel)" : "Biosourcé (fibre de bois)" }
            ]
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
            label: locale === "en" ? "Compressed rock wool" : locale === "de" ? "Komprimierte Steinwolle" : locale === "nl" ? "Gecomprimeerde steenwol" : "Laine de roche comprimée",
            price160: 15.9,
            price200: 17.4,
            layerKey: "iso_ext_roche_comprimee",
            materialDescription: 
              locale === "en" ? "High-density exterior insulation that wraps the house to eliminate all structural thermal bridges. Offers exceptional mechanical strength, an acoustic barrier against external noise, and maximum fire safety." :
              locale === "de" ? "Hochdichte Außendämmung, die das Haus umhüllt, um alle strukturellen Kältebrücken to eliminieren. Bietet außergewöhnliche mechanische Festigkeit, eine Schallbarriere gegen Außenlärm und maximale Brandsicherheit." :
              locale === "nl" ? "Buitenisolatie met hoge dichtheid die het huis omhult om alle structurele koudebruggen te elimineren. Biedt uitzonderlijke mechanische sterkte, een akoestische barrière tegen omgevingslawaai en maximale brandveiligheid." :
              "Isolation extérieure haute densité qui enveloppe la maison pour supprimer tous les ponts thermiques structurels. Offre une robustesse mécanique exceptionnelle, une barrière acoustique contre les bruits extérieurs et une sécurité incendie maximale.",
            modalImage: "/api/media/file/laine-de-roche.webp",
            thumbnail: "/api/media/file/laine-de-roche.webp",
            attributes: [
              { name: locale === "en" ? "Density" : locale === "de" ? "Dichte" : locale === "nl" ? "Dichtheid" : "Densité", value: "150 kg/m³" },
              { name: locale === "en" ? "Thermal conductivity" : locale === "de" ? "Wärmeleitfähigkeit" : locale === "nl" ? "Thermische geleidbaarheid" : "Conductivité thermique", value: "0.039 W/m.K" },
              { name: locale === "en" ? "Fire rating" : locale === "de" ? "Brandschutzklasse" : locale === "nl" ? "Brandklasse" : "Classement feu", value: "A1 (Incombustible)" },
              { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur standard", value: "40 mm" },
              { name: locale === "en" ? "Permeability" : locale === "de" ? "Durchlässigkeit" : locale === "nl" ? "Doorlatendheid" : "Perméabilité à la vapeur", value: locale === "en" ? "Breathable (Mu = 1)" : locale === "de" ? "Atmungsaktiv (Mu = 1)" : locale === "nl" ? "Dampopen (Mu = 1)" : "Perspirant (Mu = 1)" }
            ]
          },
          {
            id: "polystyrene-ext",
            label: locale === "en" ? "Polystyrene" : locale === "de" ? "Polystyrol" : locale === "nl" ? "Polystyreen" : "Polystyrène",
            price160: 10.15,
            price200: 11.4,
            layerKey: "iso_ext_polystyrene",
            materialDescription: 
              locale === "en" ? "Expanded polystyrene (EPS) provides continuous and high-performance exterior insulation at an optimal quality-to-price ratio. It creates a waterproof, lightweight, and airtight thermal shield, ideal for reducing energy bills." :
              locale === "de" ? "Expandiertes Polystyrol (EPS) bietet eine kontinuierliche und leistungsstarke Außendämmung bei optimalem Preis-Leistungs-Verhältnis. Es schafft einen wasserdichten, leichten und luftdichten Thermoschild, ideal zur Senkung der Energiekosten." :
              locale === "nl" ? "Geëxpandeerd polystyreen (EPS) zorgt voor een doorlopende en hoogwaardige buitenisolatie met een optimale prijs-kwaliteitverhouding. Het creëert een waterdicht, licht en luchtdicht thermisch schild, ideaal voor het verlagen van de energierekening." :
              "Le polystyrène expansé (PSE) assure une isolation par l'extérieur continue et performante à un rapport qualité-prix optimal. Il crée un bouclier thermique étanche, léger et imperméable, idéal pour réduire efficacement les factures énergétiques.",
            modalImage: "/api/media/file/polystyrene.webp",
            thumbnail: "/api/media/file/polystyrene.webp",
            attributes: [
              { name: locale === "en" ? "Thermal conductivity" : locale === "de" ? "Wärmeleitfähigkeit" : locale === "nl" ? "Thermische geleidbaarheid" : "Conductivité thermique", value: "0.032 W/m.K" },
              { name: locale === "en" ? "Density" : locale === "de" ? "Dichte" : locale === "nl" ? "Dichtheid" : "Densité", value: "15 - 20 kg/m³" },
              { name: locale === "en" ? "Moisture resistance" : locale === "de" ? "Feuchtigkeitsbeständigkeit" : locale === "nl" ? "Vochtbestendigheid" : "Résistance à l'humidité", value: locale === "en" ? "Hydrophobic / Waterproof" : locale === "de" ? "Hydrophob / Wasserdicht" : locale === "nl" ? "Waterafstotend / Waterdicht" : "Hydrophobe / Imperméable" },
              { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur standard", value: "40 mm" },
              { name: locale === "en" ? "Fire rating" : locale === "de" ? "Brandschutzklasse" : locale === "nl" ? "Brandklasse" : "Classement feu", value: "Euroclasse E" }
            ]
          },
          {
            id: "fibre",
            label: locale === "en" ? "Wood fiber" : locale === "de" ? "Holzfaser" : locale === "nl" ? "Houtvezel" : "Fibre de bois",
            price160: 14.2,
            price200: 15.6,
            layerKey: "iso_ext_fibre",
            materialDescription: 
              locale === "en" ? "Rigid wood fiber board for ETICS is a 100% natural bio-sourced material. It ensures excellent vapor permeability of the walls while offering exceptional thermal lag, ideal for preserving indoor coolness during summer." :
              locale === "de" ? "Feste Holzfaserplatten für WDVS sind ein 100 % natürlicher, ökologischer Dämmstoff. Sie sorgen für eine hervorragende Dampfdurchlässigkeit der Wände und bieten gleichzeitig eine außergewöhnliche Phasenverschiebung, ideal zum Erhalt der Kühle im Sommer." :
              locale === "nl" ? "Harde houtvezelplaten voor gevelisolatie zijn een 100% natuurlijk, biologisch isolatiemateriaal. Ze zorgen voor een uitstekende dampopenheid van de muren en bieden tegelijkertijd een uitzonderlijke faseverschuiving, ideaal om de koelte in de zomer te behouden." :
              "La fibre de bois rigide pour ITE est un matériau biosourcé 100% naturel. Elle assure une excellente respirabilité des murs tout en offrant un déphasage thermique exceptionnel, idéal pour préserver la fraîcheur intérieure en période estivale.",
            modalImage: "/api/media/file/fibre-de-bois.webp",
            thumbnail: "/api/media/file/fibre-de-bois.webp",
            attributes: [
              { name: locale === "en" ? "Thermal lag" : locale === "de" ? "Phasenverschiebung" : locale === "nl" ? "Faseverschuiving" : "Déphasage thermique", value: "12 heures" },
              { name: locale === "en" ? "Thermal conductivity" : locale === "de" ? "Wärmeleitfähigkeit" : locale === "nl" ? "Thermische geleidbaarheid" : "Conductivité thermique", value: "0.040 W/m.K" },
              { name: locale === "en" ? "Vapor permeability" : locale === "de" ? "Dampfdurchlässigkeit" : locale === "nl" ? "Dampopenheid" : "Perméabilité à la vapeur", value: "Perspirant (Mu = 5)" },
              { name: locale === "en" ? "Density" : locale === "de" ? "Dichte" : locale === "nl" ? "Dichtheid" : "Densité", value: "110 - 140 kg/m³" },
              { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur standard", value: "40 mm" }
            ]
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
            label: locale === "en" ? "Attic polystyrene" : locale === "de" ? "Attika-Polystyrol" : locale === "nl" ? "Attiek-polystyreen" : "Polystyrène d'attique",
            price160: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 14.0,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 14.0,
            layerKey: "terrace_etancheite_epdm",
            materialDescription: 
              locale === "en" ? "High-density expanded polystyrene insulation boards specially formulated to support flat roof waterproofing. They offer high compressive strength and guarantee continuous insulation under the EPDM membrane." :
              locale === "de" ? "Hochdichte Dämmplatten aus expandiertem Polystyrol, speziell entwickelt zur Aufnahme von Flachdachabdichtungen. Sie bieten eine hohe Druckfestigkeit und garantieren eine durchgehende Dämmung unter der EPDM-Membran." :
              locale === "nl" ? "Geëxpandeerde polystyreen isolatieplaten met hoge dichtheid, speciaal geformuleerd ter ondersteuning van platdakwaterdichting. Ze怸 bieden een hoge druksterkte en garanderen een continue isolatie onder het EPDM-membraan." :
              "Plaques isolantes en polystyrène expansé haute densité spécialement formulées pour supporter l'étanchéité des toitures terrasses. Elles offrent une haute résistance à la compression et garantissent une isolation continue sous la membrane EPDM.",
            modalImage: "/api/media/file/polystyrene.webp",
            thumbnail: "/api/media/file/polystyrene.webp",
            attributes: [
              { name: locale === "en" ? "Compressive strength" : locale === "de" ? "Druckfestigkeit" : locale === "nl" ? "Druksterkte" : "Résistance à la compression", value: "≥ 150 kPa" },
              { name: locale === "en" ? "Thermal conductivity" : locale === "de" ? "Wärmeleitfähigkeit" : locale === "nl" ? "Thermische geleidbaarheid" : "Conductivité thermique", value: "0.034 W/m.K" },
              { name: locale === "en" ? "Density" : locale === "de" ? "Dichte" : locale === "nl" ? "Dichtheid" : "Densité", value: "30 kg/m³" },
              { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur standard", value: "140 mm" },
              { name: locale === "en" ? "Fire rating" : locale === "de" ? "Brandschutzklasse" : locale === "nl" ? "Brandklasse" : "Classement feu", value: "Euroclasse E" }
            ]
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
            label: isTerraceOrTerraceEtage
              ? "EPDM"
              : (locale === "en" ? "Rain barrier with lathing" : locale === "de" ? "Regenschutz mit Lattung" : locale === "nl" ? "Regenscherm met latwerk" : "Film pare-pluie avec tas"),
            price160: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 14.0,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 14.0,
            layerKey: "etancheite_epdm",
            materialDescription: isTerraceOrTerraceEtage
              ? (locale === "en" ? "The EPDM elastomeric membrane is the absolute reference for flat roof waterproofing. Offering a lifespan of over 50 years, it is extremely resistant to UV rays, extreme temperatures and remains perfectly elastic without any maintenance." :
                 locale === "de" ? "Die EPDM-Elastomermembran ist die absolute Referenz für die Flachdachabdichtung. Mit einer Lebensdauer von über 50 Jahren ist sie extrem widerstandsfähig gegen UV-Strahlen und extreme Temperaturen und bleibt ohne Wartung elastisch." :
                 locale === "nl" ? "Het EPDM elastomeer membraan is de absolute referentie voor platdakwaterdichting. Met een levensduur van meer dan 50 jaar is het extreem bestand tegen UV-straling en extreme temperaturen, en blijft het elastisch zonder onderhoud." :
                 "La membrane élastomère EPDM est la référence absolue pour l'étanchéité des toits plats. Offrant une longévité de plus de 50 ans, elle est extrêmement résistante aux UV, aux températures extrêmes et reste parfaitement élastique sans aucun entretien.")
              : (locale === "en" ? "Highly vapor-permeable (HPV) under-roof rain screen installed under the battens. It provides long-term protection for the framework and insulation against accidental water, snow, and wind infiltration while evacuating internal vapor." :
                 locale === "de" ? "Hochdampfdurchlässige (HPV) Unterspannbahn, die unter den Dachlatten installiert wird. Sie schützt Dachstuhl und Dämmung dauerhaft vor eindringendem Wasser, Schnee und Wind, während Wasserdampf nach außen abgeführt wird." :
                 locale === "nl" ? "Zeer dampopen (HPV) onderdakfolie geïnstalleerd onder de panlatten. Het biedt langdurige bescherming voor het dakgebinte en de isolatie tegen binnendringend water, sneeuw en wind, tandis waterdamp van binnenuit wordt afgevoerd." :
                 "Écran de sous-toiture pare-pluie hautement perméable à la vapeur d'eau (HPV) posé sous les liteaux. Il protège durablement la charpente et l'isolation contre les infiltrations accidentelles d'eau, de neige et de vent, tout en évacuant la vapeur intérieure."),
            modalImage: isTerraceOrTerraceEtage ? "/api/media/file/membrane-epdm.webp" : undefined,
            thumbnail: isTerraceOrTerraceEtage ? "/api/media/file/membrane-epdm.webp" : undefined,
            attributes: isTerraceOrTerraceEtage
              ? [
                  { name: locale === "en" ? "Lifespan" : locale === "de" ? "Lebensdauer" : locale === "nl" ? "Levensduur" : "Durabilité estimée", value: locale === "en" ? "Over 50 years" : locale === "de" ? "Über 50 Jahre" : locale === "nl" ? "Meer dan 50 jaar" : "Plus de 50 ans" },
                  { name: locale === "en" ? "Elongation" : locale === "de" ? "Dehnung" : locale === "nl" ? "Rek bij breuk" : "Élongation maximale", value: "> 300 %" },
                  { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur", value: "1.2 mm" },
                  { name: locale === "en" ? "Elasticity" : locale === "de" ? "Elastizität" : locale === "nl" ? "Elastiteit" : "Élasticité", value: locale === "en" ? "Excellent (thermal buffer)" : locale === "de" ? "Hervorragend" : locale === "nl" ? "Uitstekend" : "Excellente (conséquence thermique)" },
                  { name: locale === "en" ? "Maintenance" : locale === "de" ? "Wartung" : locale === "nl" ? "Onderhoud" : "Entretien requis", value: locale === "en" ? "None" : locale === "de" ? "Keine" : locale === "nl" ? "Geen" : "Aucun" }
                ]
              : [
                  { name: locale === "en" ? "Vapor permeability" : locale === "de" ? "Dampfdurchlässigkeit" : locale === "nl" ? "Dampopenheid" : "Perméabilité à la vapeur", value: "HPV (Sd ≤ 0.02 m)" },
                  { name: locale === "en" ? "Tear resistance" : locale === "de" ? "Reißfestigkeit" : locale === "nl" ? "Scheurweerstand" : "Résistance à la déchirure", value: locale === "en" ? "R2 (Very robust)" : locale === "de" ? "R2 (Sehr robust)" : locale === "nl" ? "R2 (Zeer robuust)" : "R2 (Très robuste)" },
                  { name: locale === "en" ? "UV resistance" : locale === "de" ? "UV-Beständigkeit" : locale === "nl" ? "UV-bestendigheid" : "Résistance aux UV", value: locale === "en" ? "3 months exposure" : locale === "de" ? "3 Monate Exposition" : locale === "nl" ? "3 maanden blootstelling" : "3 mois d'exposition" },
                  { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur", value: "0.5 mm" },
                  { name: locale === "en" ? "Batten size" : locale === "de" ? "Lattengröße" : locale === "nl" ? "Latdikte" : "Lattage ventilation", value: "20 x 40 mm" }
                ]
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
            label: locale === "en" ? "White facade (Render)" : locale === "de" ? "Weiße Fassade (Putz)" : locale === "nl" ? "Witte gevel (Pleisterwerk)" : "Façade blanche (Enduit)",
            price160: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 25.5,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 25.5,
            layerKey: "facade_blanche",
            materialDescription: 
              locale === "en" ? "The white mineral render provides a clean, bright, and modern finish. It durably protects the timber structure against weathering while allowing the walls of your house to breathe." :
              locale === "de" ? "Der weiße Mineralputz sorgt für ein sauberes, helles und modernes Finish. Er schützt die Holzkonstruktion dauerhaft vor Witterungseinflüssen und lässt gleichzeitig die Wände Ihres Hauses atmen." :
              locale === "nl" ? "De witte minerale pleister zorgt voor een strakke, lichte en moderne afwerking. Het beschermt de houten structuur duurzaam tegen weersinvloeden terwijl de muren van uw huis kunnen blijven ademen." :
              "L'enduit minéral blanc apporte une finition épurée, lumineuse et moderne. Il protège durablement la structure en bois contre les intempéries tout en laissant respirer les parois de votre maison.",
            modalImage: "/api/media/file/facade-blanche-enduit.webp",
            thumbnail: "/api/media/file/facade-blanche-enduit.webp",
            attributes: [
              { name: locale === "en" ? "Finish texture" : locale === "de" ? "Oberfläche" : locale === "nl" ? "Afwerkingstextuur" : "Finition", value: locale === "en" ? "Scraped fine grain" : locale === "de" ? "Kratzputz feine Körnung" : locale === "nl" ? "Fijn geschraapt" : "Gratté grain fin" },
              { name: locale === "en" ? "Vapor permeability" : locale === "de" ? "Dampfdurchlässigkeit" : locale === "nl" ? "Dampopenheid" : "Perméabilité à la vapeur", value: locale === "en" ? "High (breathable)" : locale === "de" ? "Hoch (atmungsaktiv)" : locale === "nl" ? "Hoog (dampopen)" : "Élevée (respirant)" },
              { name: locale === "en" ? "Maintenance" : locale === "de" ? "Wartung" : locale === "nl" ? "Onderhoud" : "Entretien requis", value: locale === "en" ? "Very low" : locale === "de" ? "Sehr gering" : locale === "nl" ? "Zeer laag" : "Très faible" },
              { name: locale === "en" ? "Weather resistance" : locale === "de" ? "Witterungsbeständigkeit" : locale === "nl" ? "Weerbestendigheid" : "Résistance UV & Intempéries", value: locale === "en" ? "Class A (Excellent)" : locale === "de" ? "Klasse A (Hervorragend)" : locale === "nl" ? "Klasse A (Uitstekend)" : "Classe A (Excellente)" },
              { name: locale === "en" ? "Render thickness" : locale === "de" ? "Putzstärke" : locale === "nl" ? "Dikte pleister" : "Épaisseur de l'enduit", value: "12 - 15 mm" }
            ]
          },
          {
            id: "bardage",
            label: locale === "en" ? "Larch cladding" : locale === "de" ? "Lärchenschalung" : locale === "nl" ? "Larix bekleding" : "Bardage Mélèze",
            price160: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 38.5,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 38.5,
            layerKey: "facade_bardage",
            materialDescription: 
              locale === "en" ? "Premium cladding in natural Larch wood siding. This robust and naturally rot-resistant wood (without chemical treatment) brings a warm look and develops a beautiful silver-grey patina over time." :
              locale === "de" ? "Premium-Verkleidung aus natürlicher Lärche. Dieses robuste und natürlich fäulnisresistente Holz (ohne chemische Behandlung) verleiht eine warme Optik und entwickelt mit der Zeit eine schöne silbergraue Patina." :
              locale === "nl" ? "Premium gevelbekleding van natuurlijk larix. Dit robuuste en van nature rotbestendige hout (zonder chemische behandeling) geeft een warme uitstraling en ontwikkelt in de loop van de tijd een mooie zilvergrijze patina." :
              "Finition haut de gamme en clin de bois de Mélèze naturel. Ce bois robuste et naturellement imputrescible (sans traitement chimique) apporte un aspect chaleureux et développe avec le temps une élégante patine grise argentée très esthétique.",
            modalImage: "/api/media/file/bardage-meleze.webp",
            thumbnail: "/api/media/file/bardage-meleze.webp",
            attributes: [
              { name: locale === "en" ? "Wood species" : locale === "de" ? "Holzart" : locale === "nl" ? "Houtsoort" : "Essence de bois", value: locale === "en" ? "European Larch" : locale === "de" ? "Europäische Lärche" : locale === "nl" ? "Europees larix" : "Mélèze d'Europe" },
              { name: locale === "en" ? "Durability class" : locale === "de" ? "Dauerhaftigkeitsklasse" : locale === "nl" ? "Duurzaamheidsklasse" : "Classe d'emploi", value: locale === "en" ? "Class 3 (Naturally durable)" : locale === "de" ? "Klasse 3 (Natürlich dauerhaft)" : locale === "nl" ? "Klasse 3 (Van nature duurzaam)" : "Classe 3 (Naturellement imputrescible)" },
              { name: locale === "en" ? "Treatment" : locale === "de" ? "Behandlung" : locale === "nl" ? "Behandeling" : "Traitement", value: locale === "en" ? "None (Eco-friendly)" : locale === "de" ? "Keine" : locale === "nl" ? "Geen" : "Aucun (Écologique sans chimie)" },
              { name: locale === "en" ? "Installation" : locale === "de" ? "Montage" : locale === "nl" ? "Installatie" : "Pose & Fixation", value: locale === "en" ? "Horizontal, stainless steel nails" : locale === "de" ? "Horizontal, Edelstahlnägel" : locale === "nl" ? "Horizontaal, rvs-nagels" : "Horizontale, clous inox" },
              { name: locale === "en" ? "Siding thickness" : locale === "de" ? "Brettstärke" : locale === "nl" ? "Plaatdikte" : "Épaisseur des clins", value: "21 mm" }
            ]
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
            label: locale === "en" ? "Glass wool - 220mm" : locale === "de" ? "Glaswolle - 220mm" : locale === "nl" ? "Glaswol - 220mm" : "Laine de Verre - 220mm",
            price160: 11.67,
            price200: 11.67,
            layerKey: "roof_verre",
            materialDescription: 
              locale === "en" ? "Thick layer of glass wool roof insulation ensuring a continuous thermal barrier. It significantly reduces heat loss through the roof, ensuring major savings on heating and excellent comfort." :
              locale === "de" ? "Dicke Schicht aus Glaswolle-Dachdämmung sorgt für eine durchgehende Wärmebarriere. Sie reduziert den Wärmeverlust durch das Dach erheblich, was zu großen Heizkostenersparnissen und hervorragendem Komfort führt." :
              locale === "nl" ? "Dikke laag glaswol dakisolatie die zorgt voor een continue thermische barrière. Het vermindert het warmteverlies via het dak aanzienlijk, wat zorgt voor grote besparingen op verwarming en un uitstekend confort." :
              "Épaisse couche d'isolation en laine de verre pour toiture assurant une barrière thermique continue. Elle réduit fortement les pertes de chaleur par le toit, assurant de grandes économies de chauffage et un excellent confort.",
            modalImage: "/api/media/file/laine-de-verre.webp",
            thumbnail: "/api/media/file/laine-de-verre.webp",
            attributes: [
              { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur", value: "220 mm" },
              { name: locale === "en" ? "Thermal resistance" : locale === "de" ? "Wärmewiderstand" : locale === "nl" ? "Warmteweerstand" : "Résistance thermique (R)", value: "R = 6.25 m².K/W" },
              { name: locale === "en" ? "Thermal conductivity" : locale === "de" ? "Wärmeleitfähigkeit" : locale === "nl" ? "Thermische geleidbaarheid" : "Conductivité thermique", value: "0.035 W/m.K" },
              { name: locale === "en" ? "Fire rating" : locale === "de" ? "Brandschutzklasse" : locale === "nl" ? "Brandklasse" : "Classement feu", value: "A1 (Incombustible)" },
              { name: locale === "en" ? "Application" : locale === "de" ? "Anwendung" : locale === "nl" ? "Toepassing" : "Application", value: locale === "en" ? "Trusses / Lofts" : locale === "de" ? "Dachstuhl / Dachboden" : locale === "nl" ? "Spanten / Zolder" : "Charpente / Combles" }
            ]
          },
          {
            id: "roche",
            label: locale === "en" ? "Rock wool - 220mm" : locale === "de" ? "Steinwolle - 220mm" : locale === "nl" ? "Steenwol - 220mm" : "Laine de Roche - 220mm",
            price160: 14.06,
            price200: 14.06,
            layerKey: "roof_roche",
            materialDescription: 
              locale === "en" ? "Roof insulation in blown rock wool offering excellent density. It ensures great thermal and acoustic comfort (noise from rain, wind) while providing reinforced passive fire protection." :
              locale === "de" ? "Dachdämmung aus Einblas-Steinwolle mit hervorragender Dichte. Sie sorgt für hohen thermischen und akustischen Komfort (Regen-, Windgeräusche) bei gleichzeitig verstärktem passiven Brandschutz." :
              locale === "nl" ? "Dakisolatie van ingeblazen steenwol die een uitstekende dichtheid biedt. Het zorgt voor een groot thermisch en akoestisch comfort (geluid van regen, wind) en biedt tegelijkertijd een versterkte passieve brandbeveiliging." :
              "Isolation de toiture en laine de roche soufflée offrant une excellente densité. Elle assure un grand confort thermique et acoustique (bruits de pluie, de vent) tout en apportant une protection incendie passive renforcée.",
            modalImage: "/api/media/file/laine-de-roche.webp",
            thumbnail: "/api/media/file/laine-de-roche.webp",
            attributes: [
              { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur", value: "220 mm" },
              { name: locale === "en" ? "Thermal resistance" : locale === "de" ? "Wärmewiderstand" : locale === "nl" ? "Warmteweerstand" : "Résistance thermique (R)", value: "R = 6.10 m².K/W" },
              { name: locale === "en" ? "Thermal conductivity" : locale === "de" ? "Wärmeleitfähigkeit" : locale === "nl" ? "Thermische geleidbaarheid" : "Conductivité thermique", value: "0.036 W/m.K" },
              { name: locale === "en" ? "Fire rating" : locale === "de" ? "Brandschutzklasse" : locale === "nl" ? "Brandklasse" : "Classement feu", value: "A1 (Incombustible)" },
              { name: locale === "en" ? "Sound insulation" : locale === "de" ? "Schalldämmung" : locale === "nl" ? "Geluidsisolatie" : "Isolation acoustique", value: locale === "en" ? "Excellent (Rw -46dB)" : locale === "de" ? "Hervorragend (Rw -46dB)" : locale === "nl" ? "Uitstekend (Rw -46dB)" : "Excellente (Rw -46dB)" }
            ]
          },
          {
            id: "bois",
            label: locale === "en" ? "Wood wool - 220mm" : locale === "de" ? "Holzwolle - 220mm" : locale === "nl" ? "Houtwol - 220mm" : "Laine de Bois - 220mm",
            price160: 30.0,
            price200: 30.0,
            layerKey: "roof_bois",
            materialDescription: 
              locale === "en" ? "Bio-sourced roof insulation in 220mm wood fiber. Its high density offers the best protection against summer heat in the attic thanks to an exceptional thermal lag of around 12 hours." :
              locale === "de" ? "Ökologische Dachdämmung aus 220 mm Holzfaser. Ihre hohe Dichte bietet dank einer außergewöhnlichen Phasenverschiebung von ca. 12 Stunden den besten Schutz vor Sommerhitze im Dachgeschoss." :
              locale === "nl" ? "Biologische dakisolatie in 220mm houtvezel. De hoge dichtheid biedt de beste bescherming tegen zomerhitte op de zolder dankzij een uitzonderlijke faseverschuiving van ongeveer 12 uur." :
              "Isolant de toiture biosourcé en fibre de bois de 220mm. Sa forte densité offre la meilleure protection contre la chaleur estivale sous les combles grâce à un temps de déphasage thermique exceptionnel d'environ 12 heures.",
            modalImage: "/api/media/file/laine-de-bois.webp",
            thumbnail: "/api/media/file/laine-de-bois.webp",
            attributes: [
              { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur", value: "220 mm" },
              { name: locale === "en" ? "Thermal lag" : locale === "de" ? "Phasenverschiebung" : locale === "nl" ? "Faseverschuiving" : "Déphasage thermique", value: locale === "en" ? "12 hours (Ideal for summer)" : locale === "de" ? "12 Stunden (Ideal für Sommer)" : locale === "nl" ? "12 uur (Ideaal voor de zomer)" : "12 heures (Idéal été)" },
              { name: locale === "en" ? "Thermal resistance" : locale === "de" ? "Wärmewiderstand" : locale === "nl" ? "Warmteweerstand" : "Résistance thermique (R)", value: "R = 5.80 m².K/W" },
              { name: locale === "en" ? "Density" : locale === "de" ? "Dichte" : locale === "nl" ? "Dichtheid" : "Densité", value: "55 kg/m³" },
              { name: locale === "en" ? "Material type" : locale === "de" ? "Materialtyp" : locale === "nl" ? "Materiaaltype" : "Type de matériau", value: locale === "en" ? "Bio-sourced (wood fiber)" : locale === "de" ? "Ökologisch (Holzfaser)" : locale === "nl" ? "Bio-ecologisch (houtvezel)" : "Biosourcé (fibre de bois)" }
            ]
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
            label: locale === "en" ? "Rain barrier & Lathing" : locale === "de" ? "Regenschutz & Lattung" : locale === "nl" ? "Regenscherm & Latwerk" : "Pare Pluie et Lattage",
            price160: 0,
            price200: 0,
            layerKey: "couverture_pare_pluie_lattage",
            materialDescription: 
              locale === "en" ? "Highly vapor-permeable (HPV) under-roof screen with counter-lathing. It protects the framework from accidental water and dust infiltration while ensuring healthy and continuous roof ventilation." :
              locale === "de" ? "Hochdampfdurchlässige (HPV) Unterspannbahn mit Konterlattung. Sie schützt den Dachstuhl vor eindringendem Wasser und Staub und sorgt gleichzeitig für eine gesunde und kontinuierliche Dachbelüftung." :
              locale === "nl" ? "Zeer dampopen (HPV) onderdakfolie met tegenlatten. Het beschermt het dakgebinte tegen binnendringend water en stof en zorgt tegelijkertijd voor een gezonde en continue dakventilatie." :
              "Écran de sous-toiture hautement perméable à la vapeur (HPV) avec contre-lattage. Il protège la charpente des infiltrations accidentelles d'eau et de poussière tout en assurant une ventilation continue et saine de la toiture.",
            attributes: [
              { name: locale === "en" ? "Screen type" : locale === "de" ? "Folientyp" : locale === "nl" ? "Folietype" : "Type d'écran", value: locale === "en" ? "HPV (High Vapor Permeability)" : locale === "de" ? "HPV (Hochdampfdurchlässig)" : locale === "nl" ? "HPV (Haute Perméabilité Vapeur)" : "HPV (Haute Perméabilité Vapeur)" },
              { name: locale === "en" ? "Tear resistance" : locale === "de" ? "Reißfestigkeit" : locale === "nl" ? "Scheurweerstand" : "Résistance à la déchirure", value: locale === "en" ? "R2 (Very robust)" : locale === "de" ? "R2 (Sehr robust)" : locale === "nl" ? "R2 (Zeer robuust)" : "R2 (Très robuste)" },
              { name: locale === "en" ? "Batten size" : locale === "de" ? "Lattengröße" : locale === "nl" ? "Latdikte" : "Lattage ventilation", value: "20 x 40 mm" },
              { name: locale === "en" ? "Function" : locale === "de" ? "Funktion" : locale === "nl" ? "Functie" : "Fonction", value: locale === "en" ? "Protection & Ventilation" : locale === "de" ? "Schutz & Belüftung" : locale === "nl" ? "Bescherming & Ventilatie" : "Protection & Ventilation" }
            ]
          },
          {
            id: "tuiles",
            label: locale === "en" ? "Tiles & Gutters" : locale === "de" ? "Ziegel & Dachrinnen" : locale === "nl" ? "Dakpannen & Dakgoten" : "Tuiles et Gouttières",
            price160: 70.0,
            price200: 70.0,
            layerKey: "couverture_tuiles_gouttieres",
            materialDescription: 
              locale === "en" ? "Traditional roofing in high-strength concrete or clay tiles including gutters and rainwater downpipes. Provides robust protection against severe weather with a timeless aesthetic." :
              locale === "de" ? "Traditionelle Eindeckung aus hochfesten Beton- oder Tonziegeln inklusive Dachrinnen und Regenwasserfallrohren. Bietet robusten Schutz vor Unwettern mit zeitloser Ästhetik." :
              locale === "nl" ? "Traditionele dakbedekking in betonnen of gebakken dakpannen van hoge sterkte inclusief dakgoten en regenpijpen. Biedt robuuste bescherming tegen zwaar weer met een tijdloze esthetiek." :
              "Couverture traditionnelle en tuiles de béton ou terre cuite haute résistance incluant gouttières et descentes de récupération d'eau. Assure une protection robuste face aux pires intempéries avec une esthétique intemporelle.",
            modalImage: "/api/media/file/tuiles.webp",
            thumbnail: "/api/media/file/tuiles.webp",
            attributes: [
              { name: locale === "en" ? "Material" : locale === "de" ? "Material" : locale === "nl" ? "Materiaal" : "Matériau", value: locale === "en" ? "Clay or high-strength concrete" : locale === "de" ? "Ton oder hochfester Beton" : locale === "nl" ? "Klei of betonnen dakpannen" : "Terre cuite ou Béton haute résistance" },
              { name: locale === "en" ? "Warranty" : locale === "de" ? "Garantie" : locale === "nl" ? "Garantie" : "Garantie constructeur", value: locale === "en" ? "30 years" : locale === "de" ? "30 Jahre" : locale === "nl" ? "30 jaar" : "30 ans" },
              { name: locale === "en" ? "Gutters" : locale === "de" ? "Dachrinnen" : locale === "nl" ? "Dakgoten" : "Gouttières incluses", value: locale === "en" ? "Zinc / Lacquered Alu" : locale === "de" ? "Zink / Alu lackiert" : locale === "nl" ? "Zink / Gelakt alu" : "Zinc / Alu laqué" },
              { name: locale === "en" ? "Weight per m²" : locale === "de" ? "Gewicht pro m²" : locale === "nl" ? "Gewicht per m²" : "Poids au m²", value: "approx 45 kg/m²" }
            ]
          },
          {
            id: "bac-acier",
            label: locale === "en" ? "Steel sheet & Gutters" : locale === "de" ? "Trapezblech & Dachrinnen" : locale === "nl" ? "Stalen dakplaten & Dakgoten" : "Bac Acier et Gouttières",
            price160: 80.0,
            price200: 80.0,
            layerKey: "couverture_bac_acier_gouttieres",
            materialDescription: 
              locale === "en" ? "Modern roofing in ribbed steel sheets (metal cladding) with anti-condensation treatment. Highly resistant, lightweight, and watertight against storms and hail, it brings a contemporary and sleek look to your house." :
              locale === "de" ? "Moderne Eindeckung aus Trapezblech mit Anti-Kondensationsbeschichtung. Sehr widerstandsfähig, leicht und wasserdicht gegen Stürme und Hagel, verleiht sie Ihrem Haus ein zeitgemäßes und elegantes Aussehen." :
              locale === "nl" ? "Moderne dakbedekking in geprofileerde stalen platen (damwandplaten) met anti-condenslaag. Zeer resistent, lichtgewicht en waterdicht tegen storm en hagel, het geeft een eigentijdse en strakke uitstraling aan uw huis." :
              "Couverture moderne en plaques d'acier nervurées (bac acier) avec traitement anti-condensation. Très résistant, léger et étanche face aux tempêtes et à la grêle, il apporte une allure contemporaine et épurée à votre maison.",
            modalImage: "/api/media/file/bac-acier.webp",
            thumbnail: "/api/media/file/bac-acier.webp",
            attributes: [
              { name: locale === "en" ? "Anti-condensation" : locale === "de" ? "Antikondensschutz" : locale === "nl" ? "Anti-condenslaag" : "Anti-condensation", value: locale === "en" ? "Felt lining active regulator" : locale === "de" ? "Vlies-Kondensationsschutz" : locale === "nl" ? "Actieve viltlaagregulator" : "Régulateur feutre actif" },
              { name: locale === "en" ? "Steel thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur acier", value: "75/100" },
              { name: locale === "en" ? "Wind resistance" : locale === "de" ? "Windbeständigkeit" : locale === "nl" ? "Windweerstand" : "Résistance au vent", value: locale === "en" ? "Extreme (hurricane class)" : locale === "de" ? "Extrem (Sturmklasse)" : locale === "nl" ? "Extreem (stormklasse)" : "Extrême (classe tempête)" },
              { name: locale === "en" ? "Warranty" : locale === "de" ? "Garantie" : locale === "nl" ? "Garantie" : "Garantie", value: locale === "en" ? "20 years" : locale === "de" ? "20 Jahre" : locale === "nl" ? "20 jaar" : "20 ans" }
            ]
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
            label: locale === "en" ? "Glass wool" : locale === "de" ? "Glaswolle" : locale === "nl" ? "Glaswol" : "Laine de Verre",
            price160: 8.9,
            price200: 11.15,
            layerKey: "faux_plafond_verre",
            materialDescription: 
              locale === "en" ? "Lightweight thermal and acoustic insulation inserted into the false ceiling plenum. Limits heat loss to the loft space and dampens interior noise between rooms." :
              locale === "de" ? "Leichte Wärme- und Schalldämmung im Deckenhohlraum der Zwischendecke. Begrenzt den Wärmeverlust zum Dachboden und dämpft den Innenlärm zwischen den Räumen." :
              locale === "nl" ? "Lichte thermische en akoestische isolatie geplaatst in de spouw van het verlaagde plafond. Beperkt warmteverlies naar de zolderruimte en dempt binnenshuis geluid tussen kamers." :
              "Isolation thermique et acoustique légère insérée dans le plénum du faux plafond. Limite les pertes de chaleur vers les combles et atténue les bruits intérieurs entre les pièces.",
            modalImage: "/api/media/file/laine-de-verre.webp",
            thumbnail: "/api/media/file/laine-de-verre.webp",
            attributes: [
              { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur", value: "100 mm" },
              { name: locale === "en" ? "Sound insulation" : locale === "de" ? "Schalldämmung" : locale === "nl" ? "Geluidsisolatie" : "Isolation acoustique", value: locale === "en" ? "Airborne noise reduction" : locale === "de" ? "Luftschalldämpfung" : locale === "nl" ? "Demping van luchtgeluid" : "Réduction des bruits aériens" },
              { name: locale === "en" ? "Conductivity" : locale === "de" ? "Wärmeleitfähigkeit" : locale === "nl" ? "Geleidbaarheid" : "Conductivité", value: "0.040 W/m.K" },
              { name: locale === "en" ? "Fire rating" : locale === "de" ? "Brandschutzklasse" : locale === "nl" ? "Brandklasse" : "Classement feu", value: "A1 (Incombustible)" }
            ]
          },
          {
            id: "roche",
            label: locale === "en" ? "Rock wool" : locale === "de" ? "Steinwolle" : locale === "nl" ? "Steenwol" : "Laine de Roche",
            price160: 10.8,
            price200: 13.45,
            layerKey: "faux_plafond_roche",
            materialDescription: 
              locale === "en" ? "Dense thermal and acoustic insulation inserted in the false ceiling. Its fibrous properties allow it to effectively absorb airborne noise (voices, music) for total peace of mind from one room to another." :
              locale === "de" ? "Dichte Wärme- und Schalldämmung in der Zwischendecke. Ihre faserige Struktur absorbiert Luftschall (Stimmen, Musik) effektiv und sorgt für Ruhe von einem Raum zum anderen." :
              locale === "nl" ? "Dichte thermische en akoestische isolatie geplaatst in het verlaagde plafond. De vezelige eigenschappen zorgen voor een effectieve absorptie van luchtgeluid (stemmen, muziek) voor een totale rust van de ene kamer naar de andere." :
              "Isolant thermique et acoustique dense inséré en faux plafond. Ses propriétés fibreuses permettent d'absorber efficacement les bruits aériens (voix, musique) pour une tranquillité totale d'une pièce à l'autre.",
            modalImage: "/api/media/file/laine-de-roche.webp",
            thumbnail: "/api/media/file/laine-de-roche.webp",
            attributes: [
              { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur", value: "100 mm" },
              { name: locale === "en" ? "Density" : locale === "de" ? "Dichte" : locale === "nl" ? "Dichtheid" : "Densité", value: "40 kg/m³" },
              { name: locale === "en" ? "Sound absorption" : locale === "de" ? "Schallabsorption" : locale === "nl" ? "Geluidsabsorptie" : "Absorption acoustique", value: "Alpha w = 0.90" },
              { name: locale === "en" ? "Fire rating" : locale === "de" ? "Brandschutzklasse" : locale === "nl" ? "Brandklasse" : "Classement feu", value: "A1 (Incombustible)" }
            ]
          },
          {
            id: "bois",
            label: locale === "en" ? "Wood wool" : locale === "de" ? "Holzwolle" : locale === "nl" ? "Houtwol" : "Laine de Bois",
            price160: 22.55,
            price200: 25.7,
            layerKey: "faux_plafond_bois",
            materialDescription: 
              locale === "en" ? "Natural wood fiber insulation for false ceilings. Ecological and healthy, it contributes to indoor humidity regulation while providing excellent thermal and acoustic comfort." :
              locale === "de" ? "Natürliche Holzfaserisolierung für Zwischendecken. Ökologisch und wohngesund trägt sie zur Regulierung der Raumfeuchtigkeit bei und bietet gleichzeitig hervorragenden Wärme- und Schallschutz." :
              locale === "nl" ? "Natuurlijke houtvezelisolatie voor verlaagde plafonds. Ecologisch en gezond draagt het bij aan de regulering van de luchtvochtigheid binnenshuis, terwijl het een uitstekend thermisch en akoestisch comfort biedt." :
              "Isolation en fibre de bois naturelle pour faux plafond. Écologique et saine, elle contribue à la régulation de l'humidité intérieure tout en apportant un excellent confort thermo-acoustique.",
            modalImage: "/api/media/file/laine-de-bois.webp",
            thumbnail: "/api/media/file/laine-de-bois.webp",
            attributes: [
              { name: locale === "en" ? "Thickness" : locale === "de" ? "Dicke" : locale === "nl" ? "Dikte" : "Épaisseur", value: "100 mm" },
              { name: locale === "en" ? "Humidity regulation" : locale === "de" ? "Feuchtigkeitsregulierung" : locale === "nl" ? "Vochtregulatie" : "Régulation d'humidité", value: locale === "en" ? "Active (breathable)" : locale === "de" ? "Aktiv (atmungsaktiv)" : locale === "nl" ? "Actief (dampopen)" : "Active (perspirant)" },
              { name: locale === "en" ? "Composition" : locale === "de" ? "Zusammensetzung" : locale === "nl" ? "Samenstelling" : "Composition", value: locale === "en" ? "95% Wood fiber" : locale === "de" ? "95% Holzfaser" : locale === "nl" ? "95% houtvezel" : "95% fibre de bois" },
              { name: locale === "en" ? "Conductivity" : locale === "de" ? "Wärmeleitfähigkeit" : locale === "nl" ? "Geleidbaarheid" : "Conductivité", value: "0.038 W/m.K" }
            ]
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
            label: locale === "en" ? "Aluminium Joinery" : locale === "de" ? "Aluminiumfenster" : locale === "nl" ? "Aluminium buitenschrijnwerk" : "Menuiseries Aluminium",
            price160: houseDoc.windows?.aluminiumPrice || 7564,
            price200: houseDoc.windows?.aluminiumPrice || 7564,
            layerKey: "windows_aluminium",
            materialDescription: 
              locale === "en" ? "High-end aluminum frames in anthracite gray (RAL 7016) with double glazing reinforced with Argon gas. Their ultra-thin profiles maximize indoor light for a modern design and excellent solar heat gain." :
              locale === "de" ? "Hochwertige Aluminiumrahmen in Anthrazitgrau (RAL 7016) with Argon-verstärkter Doppelverglasung. Ihre ultraschmalen Profile maximieren das Innenlicht für ein modernes Design und hervorragende solare Gewinne." :
              locale === "nl" ? "Hoogwaardige aluminium profielen in antracietgrijs (RAL 7016) met dubbele beglazing versterkt met argongas. Hun ultraslanke profielen maximaliseren het daglicht binnen voor een modern design en uitstekende zonnewinst." :
              "Châssis haut de gamme en aluminium gris anthracite (RAL 7016) avec double vitrage thermique renforcé à gaz Argon. Leurs profilés ultra-fins maximisent la luminosité intérieure pour un design moderne et d'excellents apports solaires.",
            modalImage: "/api/media/file/menuiseries-aluminium.webp",
            thumbnail: "/api/media/file/menuiseries-aluminium.webp",
            attributes: [
              { name: locale === "en" ? "Color" : locale === "de" ? "Farbe" : locale === "nl" ? "Kleur" : "Couleur extérieure", value: locale === "en" ? "Anthracite Gray (RAL 7016)" : locale === "de" ? "Anthrazitgrau (RAL 7016)" : locale === "nl" ? "Antracietgrijs (RAL 7016)" : "Gris Anthracite (RAL 7016)" },
              { name: locale === "en" ? "Glazing type" : locale === "de" ? "Verglasungstyp" : locale === "nl" ? "Beglazingstype" : "Type de vitrage", value: locale === "en" ? "Double 4/16/4 Low-E Argon" : locale === "de" ? "Doppelverglasung 4/16/4 Low-E Argon" : locale === "nl" ? "Dubbel glas 4/16/4 Low-E Argon" : "Double 4/16/4 Low-E Argon" },
              { name: locale === "en" ? "Thermal transmittance" : locale === "de" ? "U-Wert" : locale === "nl" ? "U-waarde" : "Performance thermique (Uw)", value: "Uw ≤ 1.3 W/m².K" },
              { name: locale === "en" ? "AEV Rating" : locale === "de" ? "AEV Klasse" : locale === "nl" ? "AEV klasse" : "Classement AEV", value: "A*4 E*7B V*C2 (Excellente)" },
              { name: locale === "en" ? "Profile material" : locale === "de" ? "Rahmenmaterial" : locale === "nl" ? "Profielmateriaal" : "Matériau profilés", value: locale === "en" ? "Thermal break Aluminum" : locale === "de" ? "Aluminium thermisch getrennt" : locale === "nl" ? "Thermisch onderbroken aluminium" : "Aluminium à rupture de pont thermique" }
            ]
          },
          {
            id: "pvc",
            label: locale === "en" ? "PVC Joinery" : locale === "de" ? "PVC-Fenster" : locale === "nl" ? "PVC buitenschrijnwerk" : "Menuiseries PVC",
            price160: houseDoc.windows?.pvcPrice || 6176,
            price200: houseDoc.windows?.pvcPrice || 6176,
            layerKey: "windows_pvc",
            materialDescription: 
              locale === "en" ? "White PVC frames with high thermal insulation and reinforced double glazing. Offering the best performance-to-price ratio, they guarantee excellent natural thermal insulation and require zero maintenance." :
              locale === "de" ? "Weiße PVC-Fenster mit hoher Wärmedämmung und verstärkter Doppelverglasung. Mit dem besten Preis-Leistungs-Verhältnis garantieren sie eine hervorragende natürliche Wärmedämmung und sind wartungsfrei." :
              locale === "nl" ? "Witte PVC profielen met hoge thermische isolatie en versterkt dubbel glas. Met de beste prijs-kwaliteitverhouding garanderen ze een uitstekende natuurlijke thermische isolatie en vereisen ze geen onderhoud." :
              "Menuiseries en PVC blanc haute isolation avec double vitrage thermique renforcé. Offrant le meilleur rapport performance/prix, elles garantissent une excellente isolation thermique naturelle et ne nécessitent aucun entretien.",
            modalImage: "/api/media/file/menuiseries-pvc.webp",
            thumbnail: "/api/media/file/menuiseries-pvc.webp",
            attributes: [
              { name: locale === "en" ? "Color" : locale === "de" ? "Farbe" : locale === "nl" ? "Kleur" : "Couleur extérieure", value: locale === "en" ? "White (RAL 9016)" : locale === "de" ? "Weiß (RAL 9016)" : locale === "nl" ? "Wit (RAL 9016)" : "Blanc (RAL 9016)" },
              { name: locale === "en" ? "Glazing type" : locale === "de" ? "Verglasungstyp" : locale === "nl" ? "Beglazingstype" : "Type de vitrage", value: locale === "en" ? "Double 4/16/4 Low-E Argon" : locale === "de" ? "Doppelverglasung 4/16/4 Low-E Argon" : locale === "nl" ? "Dubbel glas 4/16/4 Low-E Argon" : "Double 4/16/4 Low-E Argon" },
              { name: locale === "en" ? "Thermal transmittance" : locale === "de" ? "U-Wert" : locale === "nl" ? "U-waarde" : "Performance thermique (Uw)", value: "Uw ≤ 1.2 W/m².K" },
              { name: locale === "en" ? "Maintenance" : locale === "de" ? "Wartung" : locale === "nl" ? "Onderhoud" : "Entretien", value: locale === "en" ? "Very easy (soapy water)" : locale === "de" ? "Sehr einfach (Seifenwasser)" : locale === "nl" ? "Zeer eenvoudig (zeepwater)" : "Très facile (eau savonneuse)" },
              { name: locale === "en" ? "Structure" : locale === "de" ? "Struktur" : locale === "nl" ? "Structuur" : "Structure", value: locale === "en" ? "Multi-chamber PVC profile (5-6)" : locale === "de" ? "Mehrkammer-PVC-Profil (5-6)" : locale === "nl" ? "Meerkamer PVC profiel (5-6)" : "Profilé PVC multi-chambres (5-6)" }
            ]
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
