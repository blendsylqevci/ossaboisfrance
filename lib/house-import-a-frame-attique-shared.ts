import type { HouseFileMappingEntry } from "@/lib/house-import";

export function buildAFrameAttiqueMapping(
  label: string,
  defaultImageFile: string,
  finalImageFile: string
): Record<string, HouseFileMappingEntry> {
  const L = label;
  return {
    "1. Prapavija.png": {
      field: "backgroundLayer",
      mediaType: "hero",
      alt: `Arrière-plan ${L}`,
    },
    "2. Konstruksioni.png": {
      field: "constructionLayer",
      mediaType: "construction_layer",
      alt: `Structure bois ${L}`,
    },
    "3. Lesh guri.png": {
      field: "iso_inter_roche",
      mediaType: "material_layer",
      alt: `Isolation laine de roche ${L}`,
    },
    "4. Lesh xhami.png": {
      field: "iso_inter_verre",
      mediaType: "material_layer",
      alt: `Isolation laine de verre ${L}`,
    },
    "5. Lesh druri.png": {
      field: "iso_inter_bois",
      mediaType: "material_layer",
      alt: `Isolation laine de bois ${L}`,
    },
    "6. stiropori.png": {
      field: "iso_ext_polystyrene",
      mediaType: "material_layer",
      alt: `Isolation extérieure polystyrène ${L}`,
    },
    "7. Fibra.png": {
      field: "iso_ext_fibre",
      mediaType: "material_layer",
      alt: `Isolation extérieure fibre de bois ${L}`,
    },
    "8. Lesh guri.png": {
      field: "iso_ext_roche_comprimee",
      mediaType: "material_layer",
      alt: `Isolation extérieure laine de roche ${L}`,
    },
    "9. stiropori ne atike.png": {
      field: "terrace_etancheite_epdm",
      mediaType: "material_layer",
      alt: `Polystyrène d'attique ${L}`,
    },
    "10. EPDM.png": {
      field: "etancheite_epdm",
      mediaType: "material_layer",
      alt: `Étanchéité EPDM ${L}`,
    },
    "10. FASADA E BARDHE.png": {
      field: "facade_blanche",
      mediaType: "material_layer",
      alt: `Façade blanche enduit ${L}`,
    },
    "12. ARISH.png": {
      field: "facade_bardage",
      mediaType: "material_layer",
      alt: `Façade bardage mélèze ${L}`,
    },
    "13. DRITARET ALUMIN.png": {
      field: "windows_aluminium",
      mediaType: "material_layer",
      alt: `Menuiseries aluminium ${L}`,
    },
    "14. DRITARET PVC.png": {
      field: "windows_pvc",
      mediaType: "material_layer",
      alt: `Menuiseries PVC ${L}`,
    },
    [defaultImageFile]: {
      field: "defaultImage",
      mediaType: "hero",
      alt: `${L} — 60×160`,
    },
    [finalImageFile]: {
      field: "finalImage",
      mediaType: "final_render",
      alt: `${L} — 60×200`,
    },
  };
}
