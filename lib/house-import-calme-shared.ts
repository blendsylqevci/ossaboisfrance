import type { HouseFileMappingEntry } from "@/lib/house-import";

/** calme-atike folder uses hyphenated PNG names instead of `1. prapavija.png`. */
export function buildCalmeHyphenAttiqueMapping(
  label: string
): Record<string, HouseFileMappingEntry> {
  const L = label;
  return {
    "1-prapavija.png": {
      field: "backgroundLayer",
      mediaType: "hero",
      alt: `Arrière-plan ${L}`,
    },
    "2-kons.png": {
      field: "constructionLayer",
      mediaType: "construction_layer",
      alt: `Structure bois ${L}`,
    },
    "3-lesh-guri.png": {
      field: "iso_inter_roche",
      mediaType: "material_layer",
      alt: `Isolation laine de roche ${L}`,
    },
    "4-lesh-druri.png": {
      field: "iso_inter_bois",
      mediaType: "material_layer",
      alt: `Isolation laine de bois ${L}`,
    },
    "5-lesh-xhami.png": {
      field: "iso_inter_verre",
      mediaType: "material_layer",
      alt: `Isolation laine de verre ${L}`,
    },
    "6-stiropori.png": {
      field: "iso_ext_polystyrene",
      mediaType: "material_layer",
      alt: `Isolation extérieure polystyrène ${L}`,
    },
    "7-lesh-guri-jashte.png": {
      field: "iso_ext_roche_comprimee",
      mediaType: "material_layer",
      alt: `Isolation extérieure laine de roche ${L}`,
    },
    "8-fibra.png": {
      field: "iso_ext_fibre",
      mediaType: "material_layer",
      alt: `Isolation extérieure fibre de bois ${L}`,
    },
    "9-stiropori-atikes.png": {
      field: "terrace_etancheite_epdm",
      mediaType: "material_layer",
      alt: `Polystyrène d'attique ${L}`,
    },
    "10-epdm.png": {
      field: "etancheite_epdm",
      mediaType: "material_layer",
      alt: `Étanchéité EPDM ${L}`,
    },
    "11-fasada-e-bardhe.png": {
      field: "facade_blanche",
      mediaType: "material_layer",
      alt: `Façade blanche enduit ${L}`,
    },
    "12-fasada-arish.png": {
      field: "facade_bardage",
      mediaType: "material_layer",
      alt: `Façade bardage mélèze ${L}`,
    },
    "13-dritare-alumin.png": {
      field: "windows_aluminium",
      mediaType: "material_layer",
      alt: `Menuiseries aluminium ${L}`,
    },
    "14-dritare-pvc.png": {
      field: "windows_pvc",
      mediaType: "material_layer",
      alt: `Menuiseries PVC ${L}`,
    },
  };
}
