import { HouseConfiguratorData, ConfigCategory, SizeOption } from "@/data/house-configurator";
import { Locale } from "@/lib/i18n";
import { translateText, translateHouseDescription } from "./translation-helper";
import { isMeKulmHouseSlug } from "./house-import-shared";
import { publicMediaUrl } from "./media-url";

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
      } else if (
        cmsOpt.layer_key === "couverture_pare_pluie_lattage" &&
        isMeKulmHouseSlug(houseDoc.slug)
      ) {
        price160 = 0;
        price200 = 0;
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
      if (
        cmsOpt.layer_key === "couverture_pare_pluie_lattage" &&
        isMeKulmHouseSlug(houseDoc.slug)
      ) {
        optionLabel = translateText("Film pare-pluie avec tas", locale);
      }

      finalOptions.push({
        id,
        label: optionLabel,
        price160,
        price200,
        layerKey: cmsOpt.layer_key,
        layer: layerUrl,
        materialDescription: defaultOpt?.materialDescription || translateText(cmsOpt.option_description || '', locale),
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
    let price160 = defOpt.price160;
    let price200 = defOpt.price200;
    if (
      defOpt.layerKey === "couverture_pare_pluie_lattage" &&
      isMeKulmHouseSlug(houseDoc.slug)
    ) {
      optionLabel = translateText("Film pare-pluie avec tas", locale);
      price160 = 0;
      price200 = 0;
    }
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
      price160,
      price200,
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
              locale === "en" ? "Glass wool is an ACERMI-certified high-performance insulation made from recycled glass. Its fibrous structure traps still air to offer excellent thermal resistance and optimal acoustic insulation against external noise. Incombustible (Class A1), healthy and stable over time, it fits perfectly into the timber frame without sagging, effectively regulating thermal exchanges in both winter and summer." :
              locale === "de" ? "Glaswolle ist ein ACERMI-zertifizierter Hochleistungsdämmstoff aus Recyclingglas. Ihre faserige Struktur schließt ruhende Luft ein und bietet so einen hervorragenden Wärmewiderstand sowie eine optimale Schalldämmung gegen Außenlärm. Nicht brennbar (Klasse A1), wohngesund und dauerhaft formstabil, fügt sie sich perfekt und setzungssicher in das Holzständerwerk ein." :
              locale === "nl" ? "Glaswol is een ACERMI-gecertificeerd hoogwaardig isolatiemateriaal gemaakt van gerecycled glas. De vezelstructuur sluit stilstaande lucht in voor een uitstekende thermische weerstand en optimale geluidsisolatie tegen omgevingslawaai. Onbrandbaar (klasse A1), gezond en vormvast, sluit het perfect aan op het houtskelet zonder te verzakken." :
              "La laine de verre est un isolant haute performance certifié ACERMI, composé de verre recyclé. Sa structure fibreuse emprisonne l'air immobile pour offrir une excellente résistance thermique et une isolation acoustique optimale contre les bruits extérieurs. Incombustible (classée A1), saine et stable dans le temps, elle s'insère parfaitement dans l'ossature bois sans tassement, régulant efficacement les échanges thermiques en hiver comme en été.",
            modalImage: publicMediaUrl("laine-de-verre.webp"),
            thumbnail: publicMediaUrl("laine-de-verre.webp"),
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
              locale === "en" ? "Rock wool is manufactured by melting volcanic rock (basalt). Renowned for its high density and extreme heat resistance, it offers remarkable passive fire protection (melting point > 1000°C). It is a premium thermal insulator and an excellent sound absorber for airborne and impact noise. Hydrophobic and rot-proof, it guarantees the structural durability of the walls." :
              locale === "de" ? "Steinwolle wird durch Schmelzen von vulkanischem Gestein (Basalt) hergestellt. Sie ist bekannt für ihre hohe Dichte und extreme Hitzebeständigkeit und bietet hervorragenden passiven Brandschutz (Schmelzpunkt > 1000°C). Sie ist ein erstklassiger Wärmedämmstoff und exzellenter Schallabsorber. Hydrophob und verrottungsbeständig sichert sie die Langlebigkeit der Bauteile." :
              locale === "nl" ? "Steenwol wordt geproduceerd door het smelten van vulkanisch gesteente (bazalt). Bekend om zijn hoge dichtheid en extreme hittebestendigheid, biedt het een uitstekende passieve brandbeveiliging (smeltpunt > 1000°C). Het is een premium thermische isolator en een uitstekende geluidsabsorbeerder. Hydrofoob en rotvrij garandeert het de duurzaamheid van de wanden." :
              "La laine de roche est fabriquée par fusion de roche volcanique (basalte). Reconnue pour sa densité supérieure et sa résistance extrême à la chaleur, elle offre une protection passive contre le feu remarquable (point de fusion > 1000°C). C'est un isolant thermique haut de gamme et un excellent absorbant phonique contre les bruits aériens et d'impact. Hydrophobe et imputrescible, elle garantit la durabilité structurelle des parois.",
            modalImage: publicMediaUrl("laine-de-roche.webp"),
            thumbnail: publicMediaUrl("laine-de-roche.webp"),
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
              locale === "en" ? "Wood wool is an ecological bio-sourced insulation material from sustainably managed forests. Thanks to its high density, it features exceptional thermal storage capacity, providing a thermal lag of over 10 hours. It retains warmth in winter and blocks heatwaves in summer for unmatched summer comfort. Naturally breathable, it regulates indoor humidity and permanently stores CO2." :
              locale === "de" ? "Holzwolle ist ein ökologischer, biobasierter Dämmstoff aus nachhaltig bewirtschafteten Wäldern. Dank ihrer hohen Dichte verfügt sie über eine hervorragende Wärmespeicherkapazität mit einer Phasenverschiebung von über 10 Stunden. Sie hält im Winter warm und blockiert Sommerhitze für optimalen Wohnkomfort. Sie ist atmungsaktiv, reguliert die Feuchtigkeit und speichert CO2." :
              locale === "nl" ? "Houtwol is een ecologisch bio-based isolatiemateriaal afkomstig uit duurzaam beheerde bossen. Dankzij de hoge dichtheid heeft het een uitzonderlijke warmteopslagcapaciteit met een faseverschuiving van meer dan 10 uur. Het houdt de warmte vast in de winter en weert de hitte in de zomer. Het is ademend, reguleert de vochtigheid en slaat CO2 op." :
              "La laine de bois est un isolant biosourcé écologique issu de forêts gérées durablement. Grâce à sa forte densité, elle possède une capacité de stockage thermique exceptionnelle, offrant un déphasage thermique de plus de 10 heures. Elle retient la chaleur en hiver et bloque les vagues de chaleur en été pour un confort estival inégalé. Naturellement perspirante, elle régule l'humidité ambiante et stocke durablement le CO2.",
            modalImage: publicMediaUrl("laine-de-bois.webp"),
            thumbnail: publicMediaUrl("laine-de-bois.webp"),
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
              locale === "en" ? "Rigid double-density rock wool boards for External Thermal Insulation Composite Systems (ETICS). Specifically designed for direct render application, they wrap the timber frame in a continuous insulating coat, effectively eliminating all thermal bridges. They offer excellent dimensional stability, high mechanical strength, and a non-combustible (A1) fire barrier." :
              locale === "de" ? "Formstabile Steinwolle-Dämmplatten mit doppelter Dichte für die Außendämmung (WDVS). Sie wurden speziell for die direkte Putzbeschichtung entwickelt und umhüllen das Holzhaus mit einem lückenlosen Dämmmantel, der Kältebrücken eliminiert. Sie bieten hervorragende Dimensionsstabilität, hohe mechanische Festigkeit und besten Brandschutz (A1)." :
              locale === "nl" ? "Harde steenwolplaten met dubbele dichtheid voor buitenmuurisolatie (buitengevelisolatie). Speciaal ontworpen voor directe pleisterafwerking, omhullen ze het houtskelet met een doorlopende isolatiemantel om koudebruggen te elimineren. Ze bieden uitstekende dimensionale stabiliteit, mechanische sterkte en een onbrandbare (A1) barrière." :
              "Panneaux rigides de laine de roche double densité pour isolation thermique par l'extérieur (ITE). Conçus spécifiquement pour servir de support direct d'enduit, ils enveloppent la structure en bois d'un manteau isolant continu, éliminant efficacement tous les ponts thermiques. Ils offrent une excellente stabilité dimensionnelle, une haute résistance mécanique et une barrière acoustique et feu ininflammable (A1).",
            modalImage: publicMediaUrl("laine-de-roche.webp"),
            thumbnail: publicMediaUrl("laine-de-roche.webp"),
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
              locale === "en" ? "Grey expanded polystyrene (EPS) with graphite offers excellent thermal conductivity for minimal thickness in exterior insulation. Lightweight, water-repellent, and airtight, it forms a high-performance and cost-effective thermal shield. It permanently protects the structure from external thermal shocks and ensures weatherproofing under the render finish." :
              locale === "de" ? "Graues expandiertes Polystyrol (EPS) mit Graphit bietet eine hervorragende Wärmeleitfähigkeit bei minimaler Dicke für die Außendämmung. Leicht, wasserabweisend und luftdicht bildet es einen leistungsstarken und wirtschaftlichen Thermoschutz. Es schützt die Tragkonstruktion vor Temperaturschwankungen und sichert die Fassade ab." :
              locale === "nl" ? "Geëxpandeerd polystyreen (EPS) met grafiet biedt een uitstekende thermische geleidbaarheid met minimale dikte voor buitenisolatie. Lichtgewicht, waterafstotend en luchtdicht vormt het een efficiënt en voordelig termisch schild. Het beschermt de houten structuur tegen temperatuurschommelingen en zorgt voor een waterdichte gevel." :
              "Le polystyrène expansé (PSE) graphité offre une excellente conductivité thermique pour un encombrement minimal en isolation extérieure. Léger, hydrofuge et parfaitement étanche à l'air, il constitue un bouclier thermique performant et économique. Il protège durablement la structure des chocs thermiques extérieurs et garantit une étanchéité parfaite de la façade sous l'enduit de finition.",
            modalImage: publicMediaUrl("polystyrene.webp"),
            thumbnail: publicMediaUrl("polystyrene.webp"),
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
              locale === "en" ? "Rigid high-density wood fiber boards for render-carrying exterior insulation. This ecological, bio-sourced material provides exceptional vapor permeability, allowing walls to breathe naturally while preventing condensation. Its high thermal capacity offers optimal thermal lag to keep your home cool in summer and warm in winter." :
              locale === "de" ? "Putzträgerplatten aus hochdichter Holzfaser für die ökologische Außendämmung. Dieses biobasiertes Material sichert eine hervorragende Dampfdurchlässigkeit, sodass Wände natürlich atmen können und Kondensation vermieden wird. Seine hohe Speicherkapazität bietet optimale Phasenverschiebung für Kühle im Sommer und Wärme im Winter." :
              locale === "nl" ? "Harde houtvezelplaten met hoge dichtheid voor pleisterbare buitenisolatie. Dit ecologische, bio-based materiaal biedt een uitstekende dampopenheid, waardoor muren natuurlijk ademen en condensatie wordt voorkomen. De hoge warmtecapaciteit zorgt voor een optimale faseverschuiving om koelte in de zomer en warmte in de winter te behouden." :
              "La fibre de bois rigide pour ITE est un matériau biosourcé 100% naturel. Elle assure une excellente respirabilité des murs tout en offrant un déphasage thermique exceptionnel, idéal pour préserver la fraîcheur intérieure en période estivale.",
            modalImage: publicMediaUrl("fibre-de-bois.webp"),
            thumbnail: publicMediaUrl("fibre-de-bois.webp"),
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
      label: translateText("Isolation toiture terrasse", locale),
      description: translateText("Isolation pour toiture terrasse.", locale),
      priceMode: "roof_m2",
      selectionMode: "checkbox",
      options: buildCategoryOptions(
        [
          {
            id: "terrace-epdm",
            label: locale === "en" ? "Sloped polystyrene" : locale === "de" ? "Gefälledämmung Polystyrol" : locale === "nl" ? "Afschotpolystyreen" : "Polystyrène en pente",
            price160: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 14.0,
            price200: houseDoc.slug === 'escape-villa-me-atike' ? 1.0 : 14.0,
            layerKey: "terrace_etancheite_epdm",
            materialDescription: 
              locale === "en" ? "High-compressive-strength expanded polystyrene insulation boards, specially designed for flat roof insulation under waterproofing. They support weather and maintenance loads without deformation. Laid continuously, they eliminate thermal bridges on flat roofs and provide a stable, long-lasting support for the EPDM membrane." :
              locale === "de" ? "Hochdruckfeste Dämmplatten aus expandiertem Polystyrol, speziell für die Flachdachdämmung unter Abdichtungen entwickelt. Sie halten Witterungs- und Wartungslasten verformungsfrei stand. Durchgehend verlegt eliminieren sie Kältebrücken auf Flachdächern und bieten einen stabilen Untergrund für die EPDM-Bahn." :
              locale === "nl" ? "Drukvaste geëxpandeerde polystyreen isolatieplaten, speciaal ontworpen voor platte daken onder de dakafdichting. Ze zijn bestand tegen wind- en onderhoudsbelastingen zonder te vervormen. Doorlopend gelegd elimineren ze koudebruggen op platte daken en vormen ze een stabiele basis voor het EPDM-membraan." :
              "Plaques isolantes de polystyrène expansé à haute résistance à la compression, spécialement adaptées à l'isolation des toits plats sous étanchéité. Elles supportent les charges climatiques et d'entretien sans déformation. Posées de manière continue, elles éliminent les ponts thermiques en toiture terrasse et offrent un support stable et durable pour la membrane EPDM.",
            modalImage: publicMediaUrl("polystyrene.webp"),
            thumbnail: publicMediaUrl("polystyrene.webp"),
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
      label: translateText("Étanchéité toiture terrasse avec couverture", locale),
      description: translateText("Étanchéité charpente", locale),
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
              ? (locale === "en" ? "The EPDM elastomeric membrane is the reference solution for flat roof waterproofing. Its chemical formula gives it unmatched resistance to aging, UV rays, and extreme temperatures (-45°C to +130°C). With an elasticity exceeding 300% and a proven lifespan of over 50 years, it guarantees absolute water tightness with zero maintenance." :
                 locale === "de" ? "Die elastische EPDM-Dichtungsbahn ist die Premium-Lösung für die Flachdachabdichtung. Ihre chemische Zusammensetzung verleiht ihr unübertroffene Beständigkeit gegen Alterung, UV-Strahlen und extreme Temperaturen (-45°C bis +130°C). Mit einer Dehnfähigkeit von über 300% und über 50 Jahren Lebensdauer garantiert sie absolute Dichtheit." :
                 locale === "nl" ? "Het EPDM-elastomeermembraan is de referentieoplossing voor het waterdicht maken van platte daken. De chemische formule geeft het een ongeëvenaarde weerstand tegen veroudering, UV-straling en extreme temperaturen (-45°C tot +130°C). Met een elasticiteit van meer dan 300% en een levensduur van 50 jaar garandeert het absolute waterdichtheid." :
                 "La membrane élastomère EPDM est la référence absolue pour l'étanchéité des toitures plates. Sa formule chimique lui confère une résistance inégalée au vieillissement, aux rayons UV et aux températures extrêmes (-45°C à +130°C). Avec une élasticité supérieure à 300% et une durée de vie prouvée de plus de 50 ans, elle garantit une étanchéité totale sans aucun entretien.")
              : (locale === "en" ? "Highly vapor-permeable (HPV) under-roof rain screen. Installed under the battens, it actively protects the timber frame and insulation against rain, wind-blown snow, and dust, while allowing internal moisture to escape freely to prevent any condensation inside the roof structure." :
                 locale === "de" ? "Hochdampfdurchlässige (HPV) Unterspannbahn. Unter den Dachlatten verlegt schützt sie den Dachstuhl und die Dämmung aktiv vor dem Eindringen von Regen, Flugschnee und Staub, während Feuchtigkeit aus dem Innenraum ungehindert nach außen entweichen kann, um Kondensatbildung zu verhindern." :
                 locale === "nl" ? "Zeer dampopen (HPV) onderdakfolie. Geïnstalleerd onder de panlatten beschermt het de dakconstructie en isolatie actief tegen infiltratie van regen, stuifsneeuw en stof, terwijl vocht van binnenuit vrij kan ontsnappen om condensatie in het dak te voorkomen." :
                 "Écran de sous-toiture pare-pluie hautement perméable à la vapeur d'eau (HPV) posé sous les liteaux. Il protège durablement la charpente et l'isolation contre les infiltrations accidentelles d'eau, de neige et de vent, tout en évacuant la vapeur intérieure."),
            modalImage: isTerraceOrTerraceEtage ? publicMediaUrl("membrane-epdm.webp") : "/media/folia-dhe-listelat.webp",
            thumbnail: isTerraceOrTerraceEtage ? publicMediaUrl("membrane-epdm.webp") : "/media/folia-dhe-listelat.webp",
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
              locale === "en" ? "Continuous thermal and acoustic insulation for pitched roofs. Composed of 220 mm thick glass wool with an excellent thermal conductivity coefficient, it is installed between or under the roof rafters. It drastically reduces heat loss through the roof (the primary source of energy loss in a house) and dampens external airborne noise." :
              locale === "de" ? "Lückenlose Wärme- und Schalldämmung für geneigte Dächer. Bestehend aus 220 mm dicker Glaswolle mit hervorragendem Wärmeleitkoeffizienten, wird sie zwischen oder unter den Sparren installiert. Sie senkt den Wärmeverlust über das Dach (Hauptursache für Energieverluste im Haus) drastisch und dämpft Außenlärm effektiv." :
              locale === "nl" ? "Continue thermische en akoestische isolatie voor hellende daken. Bestaande uit 220 mm dikke glaswol met een uitstekende geleidingscoëfficiënt, geïnstalleerd tussen of onder de dakspanten. Het vermindert warmteverlies via het dak (de belangrijkste bron van warmteverlies in een huis) drastisch et dempt omgevingslawaai." :
              "Isolation thermo-acoustique continue pour toitures inclinées. Composée de laine de verre de 220 mm d'épaisseur avec un excellent coefficient de conductivité, elle s'installe entre ou sous les chevrons de la charpente. Elle réduit drastiquement les déperditions thermiques par le toit (première source de perte de chaleur d'une maison) et atténue les bruits aériens extérieurs.",
            modalImage: publicMediaUrl("laine-de-verre.webp"),
            thumbnail: publicMediaUrl("laine-de-verre.webp"),
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
              locale === "en" ? "High-performance roof insulation in 220 mm thick rock wool. Thanks to its dense fibrous structure and inertia, it offers exceptional acoustic insulation against impact noise (rain, hail) and a non-combustible fire barrier. Stable over time, it does not sag and maintains its insulating properties for decades." :
              locale === "de" ? "Hochleistungs-Dachdämmung aus 220 mm dicker Steinwolle. Dank ihrer dichten Faserstruktur und Trägheit bietet sie eine hervorragende Schalldämmung gegen Schlaggeräusche (Regen, Hagel) und eine nicht brennbare Brandschutzbarriere. Sie ist absolut formstabil, sackt nicht ab und behält ihre Dämmleistung über Jahrzehnte." :
              locale === "nl" ? "Hoogwaardige dakisolatie in 220 mm dikke steenwol. Dankzij de dichtvezelige structuur en thermische traagheid biedt het een uitzonderlijke geluidsisolatie tegen contactgeluid (regen, hagel) en een onbrandbare brandbarrière. Vormvast in de loop der tijd, verzakt niet en behoudt zijn isolerende prestaties decennialang." :
              "Isolation de toiture haute performance en laine de roche de 220 mm d'épaisseur. Grâce à sa structure fibreuse dense et son inertie, elle offre une isolation acoustique exceptionnelle contre les bruits d'impact (pluie, grêle) et une barrière coupe-feu incombustible. Stable dans le temps, elle ne s'affaisse pas et maintient ses performances isolantes durant des décennies.",
            modalImage: publicMediaUrl("laine-de-roche.webp"),
            thumbnail: publicMediaUrl("laine-de-roche.webp"),
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
              locale === "en" ? "Ecological bio-sourced roof insulation in 220 mm thick wood fiber. Its very high density (55 kg/m³) provides superior thermal capacity, offering an exceptional thermal lag of around 12 hours. It is the ideal insulation for converted lofts, guaranteeing cool rooms in summer and healthy, gentle warmth in winter." :
              locale === "de" ? "Ökologische, biobasierte Dachdämmung aus 220 mm dicker Holzfaser. Ihre sehr hohe Dichte (55 kg/m³) verleiht ihr eine überragende Wärmekapazität mit einer außergewöhnlichen Phasenverschiebung von ca. 12 Stunden. Die ideale Dämmung für ausgebauten Wohnraum unter dem Dach für angenehme Kühle im Sommer und gesunde Wärme im Winter." :
              locale === "nl" ? "Ecologische bio-based dakisolatie in 220 mm dikke houtvezel. De zeer hoge dichtheid (55 kg/m³) geeft het een superieure warmtecapaciteit met een uitzonderlijke faseverschuiving van ongeveer 12 uur. Het is de ideale isolatie voor bewoonbare zolders, wat zorgt voor koele kamers in de zomer en behaaglijke warmte in de winter." :
              "Isolant de toiture biosourcé en fibre de bois de 220mm. Sa forte densité offre la meilleure protection contre la chaleur estivale sous les combles grâce à un temps de déphasage thermique exceptionnel d'environ 12 heures.",
            modalImage: publicMediaUrl("laine-de-bois.webp"),
            thumbnail: publicMediaUrl("laine-de-bois.webp"),
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
            label: translateText("Film pare-pluie avec tas", locale),
            price160: 0,
            price200: 0,
            layerKey: "couverture_pare_pluie_lattage",
            materialDescription: 
              locale === "en" ? "The highly vapor-permeable (HPV) under-roof screen is installed on the roof frame before the roofing material. Combined with 20x40 mm counter-battens, it creates a continuous ventilation channel under the tiles or steel sheets. It actively protects the rafters and insulation from wind-blown snow, dust, and accidental water leaks." :
              locale === "de" ? "Die hochdampfdurchlässige (HPV) Unterspannbahn wird vor der Eindeckung auf der Dachkonstruktion montiert. Zusammen mit 20x40 mm Konterlatten schafft sie einen kontinuierlichen Belüftungskanal unter den Ziegeln oder Blechen. Sie schützt das Tragwerk und die Dämmung zuverlässig vor Flugschnee, Staub und eindringendem Wasser." :
              locale === "nl" ? "De zeer dampopen (HPV) onderdakfolie wordt op de dakconstructie gemonteerd voor de dakbedekking. Samen met tegenlatten van 20x40 mm creëert het een ventilatiekanaal onder de dakpannen of stalen platen. Het beschermt de constructie en isolatie tegen stuifsneeuw, stof en eventuele lekkages." :
              "L'écran de sous-toiture hautement perméable à la vapeur (HPV) est installé sur la charpente avant la pose de la couverture. Associé à des contre-lattes de 20x40 mm, il crée un canal de ventilation continue sous les tuiles ou bac acier. Il protège activement la charpente et les isolants contre la neige poudreuse, la poussière et les infiltrations d'eau accidentelles.",
            modalImage: "/media/folia-dhe-listelat.webp",
            thumbnail: "/media/folia-dhe-listelat.webp",
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
              locale === "en" ? "Traditional roofing composed of high-strength concrete or clay tiles, fixed on wooden battens. It includes the complete installation of the rainwater drainage system with gutters and downpipes in zinc or lacquered aluminum. This system guarantees perfect roof water tightness and exceptional resistance to strong winds and frost." :
              locale === "de" ? "Klassische Eindeckung aus hochfesten Beton- oder Tonziegeln, montiert auf Holzlattung. Umfasst das komplette Entwässerungssystem mit Dachrinnen und Fallrohren aus Zink oder lackiertem Aluminium. Diese Eindeckung garantiert absolute Dichtheit und eine hervorragende Beständigkeit gegen starke Winde und Frost." :
              locale === "nl" ? "Traditionele dakbedekking bestaande uit betonnen of gebakken dakpannen van hoge sterkte, gemonteerd op houten latten. Inclusief de volledige installatie van het hemelwaterafvoersysteem met goten en regenpijpen in zink of gelakt aluminium. Dit systeem garandeert een perfecte waterdichtheid en weerstand tegen wind en vorst." :
              "Couverture traditionnelle composée de tuiles de béton ou terre cuite haute résistance, fixées sur liteaux bois. Elle comprend l'installation complète du système d'évacuation des eaux pluviales avec gouttières et descentes en zinc ou alu laqué. Ce système garantit une étanchéité parfaite de la toiture et une résistance exceptionnelle face aux vents forts et au gel.",
            modalImage: publicMediaUrl("tuiles.webp"),
            thumbnail: publicMediaUrl("tuiles.webp"),
            attributes: [
              { name: locale === "en" ? "Material" : locale === "de" ? "Material" : locale === "nl" ? "Materiaal" : "Matériau", value: locale === "en" ? "Clay or high-strength concrete" : locale === "de" ? "Ton or hochfester Beton" : locale === "nl" ? "Klei of betonnen dakpannen" : "Terre cuite ou Béton haute résistance" },
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
              locale === "en" ? "Contemporary roofing made of high-strength ribbed steel sheets. The sheets feature an integrated anti-condensation felt backing on the underside to regulate moisture. Lightweight and highly robust, this solution ensures absolute long-term water tightness, resists hail and storms, and provides a modern, clean architectural finish." :
              locale === "de" ? "Moderne Eindeckung aus hochfesten Trapezblech-Stahlplatten. Die Bleche sind auf der Unterseite mit einem Vlies-Kondensationsschutz zur Feuchtigkeitsregulierung kaschiert. Leicht und robust bietet diese Lösung absolute Langzeitdichtheit, hält Hagel und Stürmen stand und verleiht dem Haus ein klares, zeitgemäßes Aussehen." :
              locale === "nl" ? "Moderne dakbedekking in geprofileerde stalen platen (damwandplaten) met hoge mechanische weerstand. De platen zijn voorzien van een geïntegreerde anti-condenslaag aan de onderzijde. Lichtgewicht en robuust zorgt deze oplossing voor absolute waterdichtheid, is bestand tegen storm en geeft een strakke afwerking." :
              "Couverture contemporaine en plaques d'acier nervuré (bac acier) à haute résistance mécanique. Les plaques intègrent un revêtement feutre anti-condensation en sous-face pour réguler l'humidité. Légère et robuste, cette solution assure une étanchéité absolue à long terme, résiste parfaitement à la grêle et aux tempêtes, et apporte une finition moderne et graphique.",
            modalImage: publicMediaUrl("bac-acier.webp"),
            thumbnail: publicMediaUrl("bac-acier.webp"),
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
              locale === "en" ? "White sprayed mineral render provides a clean, bright, and modern look for your timber home. Applied in multiple layers with fiberglass mesh reinforcement, it forms a protective skin that is completely rainproof yet highly vapor-permeable (low Sd-value). It ensures long-term weather protection while keeping the walls fully breathable." :
              locale === "de" ? "Weißer Spritz-Mineralputz verleiht Ihrem Haus eine moderne und helle Ästhetik. In mehreren Schichten mit Glasfasergewebe-Armierung aufgetragen, bildet er eine schützende Haut, die absolut regendicht und gleichzeitig hochdampfdurchlässig ist (niedriger Sd-Wert). So schützt er das Tragwerk dauerhaft vor Witterungseinflüssen." :
              locale === "nl" ? "Witte minerale spuitpleister geeft uw woning een moderne en lichte uitstraling. In meerdere lagen aangebracht met glasvezelwapening vormt het een beschermende huid die volledig regenbestendig en tegelijkertijd zeer dampopen is (lage Sd-waarde). Dit zorgt voor langdurige bescherming en ademende muren." :
              "L'enduit minéral projeté blanc apporte une esthétique moderne et lumineuse à votre maison individuelle. Appliqué en plusieurs passes avec armature en fibre de verre, il forme une peau protectrice imperméable à l'eau de pluie mais hautement perméable à la vapeur d'eau (Sd faible). Il protège ainsi durablement le support contre les intempéries tout en laissant respirer les murs.",
            modalImage: publicMediaUrl("facade-blanche-enduit.webp"),
            thumbnail: publicMediaUrl("facade-blanche-enduit.webp"),
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
              locale === "en" ? "Premium exterior siding made of natural Larch wood. Larch is a dense softwood, naturally rated Class 3 (rot-proof without any chemical treatment). Installed on a ventilated batten system with rodent guards, it provides excellent thermal and mechanical protection. Over time, it develops a beautiful silver-grey patina that blends into the landscape." :
              locale === "de" ? "Premium-Außenverkleidung aus natürlichem Lärchenholz. Lärche ist ein dichtes Nadelholz, das von Natur aus der Dauerhaftigkeitsklasse 3 entspricht (verrottungsbeständig ohne chemische Behandlung). Auf einer hinterlüfteten Lattung mit Insektenschutz montiert, bietet es besten Schutz und bildet im Lauf der Zeit eine edle silbergraue Patina." :
              locale === "nl" ? "Premium buitenbekleding van natuurlijk larix. Larix is een dicht naaldhout, van nature geclassificeerd in duurzaamheidsklasse 3 (rotbestendig zonder chemische behandeling). Gemonteerd op geventileerd latwerk met knaagdierroosters biedt het uitstekende bescherming en ontwikkelt het na verloop van tijd een zilvergrijze patina." :
              "Revêtement extérieur haut de gamme en clin de Mélèze naturel. Le Mélèze est un bois résineux dense, naturellement de classe 3 (imputrescible sans aucun traitement chimique). Posé sur tasseaux ventilés avec grille anti-rongeurs, il assure une excellente protection thermique et mécanique. Avec le temps, il développe une superbe patine gris argenté qui s'intègre harmonieusement dans le paysage.",
            modalImage: publicMediaUrl("bardage-meleze.webp"),
            thumbnail: publicMediaUrl("bardage-meleze.webp"),
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
              locale === "en" ? "Lightweight thermal and acoustic insulation installed in the false ceiling plenum. Composed of 100 mm glass wool, it limits thermal transfers between floor levels and absorbs internal airborne noise to provide pleasant acoustic comfort between living areas." :
              locale === "de" ? "Leichte Wärme- und Schalldämmung für den Einbau in die Deckenkonstruktion der Zwischendecke. Die 100 mm dicke Glaswolle reduziert den Wärmedurchgang zwischen den Etagen und absorbiert Luftschall für einen spürbar besseren Schallschutz zwischen den Wohnräumen." :
              locale === "nl" ? "Lichte thermische en akoestische isolatie geplaatst in de spouw van het verlaagde plafond. Bestaande uit 100 mm dikke glaswol, beperkt het warmteoverdracht tussen verdiepingen en absorbeert het luchtgeluid voor een aangenaam akoestisch comfort." :
              "Isolant thermique et acoustique léger inséré dans le plénum du faux plafond. Composé de laine de verre de 100 mm, il limite les transferts thermiques entre les niveaux et absorbe les bruits aériens intérieurs pour un confort acoustique appréciable entre les différentes pièces de vie.",
            modalImage: publicMediaUrl("laine-de-verre.webp"),
            thumbnail: publicMediaUrl("laine-de-verre.webp"),
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
              locale === "en" ? "Thermal and acoustic insulation in 100 mm dense rock wool for false ceilings. Thanks to its three-dimensional fibrous structure, it offers superior acoustic dampening performance to block voices and impact noises. It also provides excellent fire protection between building levels." :
              locale === "de" ? "Wärme- und Schalldämmung aus dichter 100 mm Steinwolle für Zwischendecken. Dank ihrer dreidimensionalen Faserstruktur bietet sie hervorragende Schalldämpfung, um Stimmen- und Trittschall wirksam zu blockieren. Zudem bietet sie einen exzellenten Brandschutz zwischen den Etagen." :
              locale === "nl" ? "Thermische en akoestische isolatie in 100 mm dichte steenwol voor verlaagde plafonds. Dankzij de driedimensionale vezelstructuur biedt het superieure geluidsdempende prestaties om stemmen en contactgeluid te blokkeren. Het zorgt ook voor een uitstekende brandwerendheid." :
              "Isolation thermo-acoustique en laine de roche dense de 100 mm pour faux plafonds. Grâce à sa structure fibreuse tridimensionnelle, elle offre des performances d'affaiblissement acoustique supérieures pour bloquer les bruits de voix et d'impacts. Elle assure également une excellente protection coupe-feu entre les niveaux.",
            modalImage: publicMediaUrl("laine-de-roche.webp"),
            thumbnail: publicMediaUrl("laine-de-roche.webp"),
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
              locale === "en" ? "Ecological insulation in 100 mm wood fiber for false ceilings. This bio-sourced and healthy insulation board offers excellent acoustic absorption. Its natural ability to absorb and release moisture regulates indoor humidity, contributing to a healthy and pleasant indoor climate." :
              locale === "de" ? "Ökologische Dämmung aus 100 mm Holzfaser für Zwischendecken. Diese biobasierte, wohngesunde Dämmplatte bietet eine hervorragende Schallabsorption. Ihre natürliche Fähigkeit, Wasserdampf aufzunehmen und wieder abzugeben, reguliert das Raumklima für ein gesundes Wohngefühl." :
              locale === "nl" ? "Ecologische isolatie in 100 mm houtvezel voor verlaagde plafonds. Deze bio-based en gezonde isolatieplaat biedt een uitstekende geluidsabsorptie. Het natuurlijke vermogen om vocht op te nemen en af te geven reguleert de luchtvochtigheid voor een gezond binnenklimaat." :
              "Isolation écologique en fibre de bois de 100 mm pour faux plafonds. Ce panneau isolant biosourcé et sain offre une excellente absorption acoustique. Sa capacité naturelle à absorber et restituer la vapeur d'eau régule l'humidité de l'air intérieur, contribuant à un climat intérieur sain et agréable.",
            modalImage: publicMediaUrl("laine-de-bois.webp"),
            thumbnail: publicMediaUrl("laine-de-bois.webp"),
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
              locale === "en" ? "Premium aluminum frames in anthracite grey (RAL 7016) equipped with reinforced thermal double glazing (Argon gas). The ultra-slim profiles with thermal breaks maximize the glass area to flood rooms with natural light, while ensuring excellent air, water, and wind tightness (AEV rating) and high insulation." :
              locale === "de" ? "Hochwertige Aluminiumprofile in Anthrazitgrau (RAL 7016) mit Wärmeschutz-Doppelverglasung (Argongas). Die superschmalen, thermisch getrennten Profile maximieren den Lichteinfall, um Räume mit Tageslicht zu fluten, und garantieren gleichzeitig hervorragende Dichtigkeitswerte (AEV-Klasse) und Wärmedämmung." :
              locale === "nl" ? "Hoogwaardige aluminium profielen in antracietgrijs (RAL 7016) voorzien van HR++ dubbel glas (argongas). De ultraslanke, thermisch onderbroken profielen maximaliseren het glasoppervlak om kamers te vullen met natuurlijk licht, en garanderen uitstekende isolatiewaarden en AEV-wind- en waterdichtheidsklassen." :
              "Châssis haut de gamme en aluminium gris anthracite (RAL 7016) équipés de double vitrage thermique renforcé (gaz Argon). Les profilés ultra-fins à rupture de pont thermique maximisent le clair de vitrage pour inonder les pièces de lumière naturelle, tout en garantissant d'excellentes performances d'étanchéité AEV et d'isolation.",
            modalImage: publicMediaUrl("menuiseries-aluminium.webp"),
            thumbnail: publicMediaUrl("menuiseries-aluminium.webp"),
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
              locale === "en" ? "Reinforced white PVC frames offering an excellent insulation-to-price ratio. The multi-chamber profiles integrate high-efficiency gaskets and thermal double glazing with Argon gas. This joinery guarantees perfect air and water tightness, high natural thermal insulation, and requires zero maintenance." :
              locale === "de" ? "Verstärkte weiße PVC-Profile mit einem hervorragenden Preis-Leistungs-Verhältnis. Die Mehrkammerprofile verfügen über hocheffiziente Dichtungen und eine Wärmeschutz-Doppelverglasung mit Argongas. Diese Fenster garantieren hervorragende Wind- und Wasserdichtigkeit, hohe Wärmedämmung und sind komplett wartungsfrei." :
              locale === "nl" ? "Versterkte witte PVC profielen met een uitstekende prijs-isolatieverhouding. De meerkamerprofielen zijn voorzien van hoogwaardige dichtingen en HR++ dubbel glas met argongas. Dit buitenschrijnwerk garandeert een perfecte wind- en waterdichtheid, hoge natuurlijke isolatiewaarden en vereist geen onderhoud." :
              "Châssis en PVC blanc renforcé offrant un excellent rapport isolation/prix. Les profilés multi-chambres intègrent des joints à haute efficacité et un double vitrage thermique renforcé à gaz Argon. Cette menuiserie garantit une étanchéité parfaite à l'air et à l'eau, une isolation thermique naturelle élevée, et ne nécessite aucun entretien.",
            modalImage: publicMediaUrl("menuiseries-pvc.webp"),
            thumbnail: publicMediaUrl("menuiseries-pvc.webp"),
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
    "terrace_etancheite_epdm",
    "etancheite_epdm",
    "couverture_pare_pluie_lattage",
    "couverture_tuiles_gouttieres",
    "couverture_bac_acier_gouttieres",
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

  const isMeKulm = isMeKulmHouseSlug(houseDoc.slug);
  const hasCouvertureParePluieLayer = Boolean(layers.couverture_pare_pluie_lattage);
  const enableCouverture = houseDoc.enableFlags?.enableCouvertureOption ?? false;
  const enableEtancheite = houseDoc.enableFlags?.enableEtancheiteOption ?? true;
  const usesFranceCouverturePattern =
    isComble ||
    (isMeKulm && hasCouvertureParePluieLayer && enableCouverture) ||
    (hasCouvertureParePluieLayer && enableCouverture && !enableEtancheite);

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
      ...dynamicDefaultSelections,
      ...(usesFranceCouverturePattern ? { couverture: "pare-pluie" } : {}),
    },
    includedCouvertureLayerKey: usesFranceCouverturePattern
      ? "couverture_pare_pluie_lattage"
      : undefined,
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
    sliderConfig: houseDoc.sliderConfig || (usesFranceCouverturePattern ? {
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
