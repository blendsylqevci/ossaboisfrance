import type { HouseFileMappingEntry } from "@/lib/house-import";

function mat(
  field: string,
  alt: string,
  mediaType = "material_layer"
): HouseFileMappingEntry {
  return { field, mediaType, alt };
}

/** Standard sans-faitage attique stack (layers 1–8 + attic + EPDM + façades + windows). */
export function standardAttiqueLayerEntries(
  label: string
): Record<string, HouseFileMappingEntry> {
  const L = label;
  return {
    "1. prapavija.png": {
      field: "backgroundLayer",
      mediaType: "hero",
      alt: `Arrière-plan ${L}`,
    },
    "1. Parahyrja.png": {
      field: "backgroundLayer",
      mediaType: "hero",
      alt: `Arrière-plan ${L}`,
    },
    "1.Prapavija.png": {
      field: "backgroundLayer",
      mediaType: "hero",
      alt: `Arrière-plan ${L}`,
    },
    "2. kons.png": {
      field: "constructionLayer",
      mediaType: "construction_layer",
      alt: `Structure bois ${L}`,
    },
    "2. konstruksioni.png": {
      field: "constructionLayer",
      mediaType: "construction_layer",
      alt: `Structure bois ${L}`,
    },
    "2. konss.png": {
      field: "constructionLayer",
      mediaType: "construction_layer",
      alt: `Structure bois ${L}`,
    },
    "3. leshguri.png": mat("iso_inter_roche", `Isolation laine de roche ${L}`),
    "3. lesh guri.png": mat("iso_inter_roche", `Isolation laine de roche ${L}`),
    "3. izolimii.png": mat("iso_inter_roche", `Isolation laine de roche ${L}`),
    "4. lesh druri.png": mat("iso_inter_bois", `Isolation laine de bois ${L}`),
    "4. lesh drurii.png": mat("iso_inter_bois", `Isolation laine de bois ${L}`),
    "5. lesh drurii.png": mat("iso_inter_bois", `Isolation laine de bois ${L}`),
    "5. lesh xhami.png": mat("iso_inter_verre", `Isolation laine de verre ${L}`),
    "5. lesh xhAMI.png": mat("iso_inter_verre", `Isolation laine de verre ${L}`),
    "4. lesh xhamii.png": mat("iso_inter_verre", `Isolation laine de verre ${L}`),
    "6. stiropori.png": mat(
      "iso_ext_polystyrene",
      `Isolation extérieure polystyrène ${L}`
    ),
    "6. STIROPORI.png": mat(
      "iso_ext_polystyrene",
      `Isolation extérieure polystyrène ${L}`
    ),
    "7. lesh guri jashte.png": mat(
      "iso_ext_roche_comprimee",
      `Isolation extérieure laine de roche ${L}`
    ),
    "7. lesh guri i jashtem.png": mat(
      "iso_ext_roche_comprimee",
      `Isolation extérieure laine de roche ${L}`
    ),
    "8. leshi gurit jashte.png": mat(
      "iso_ext_roche_comprimee",
      `Isolation extérieure laine de roche ${L}`
    ),
    "7. fibra.png": mat("iso_ext_fibre", `Isolation extérieure fibre de bois ${L}`),
    "7. fibraa.png": mat("iso_ext_fibre", `Isolation extérieure fibre de bois ${L}`),
    "8. fibra.png": mat("iso_ext_fibre", `Isolation extérieure fibre de bois ${L}`),
    "8. fibvra.png": mat("iso_ext_fibre", `Isolation extérieure fibre de bois ${L}`),
    "9. stiropori atikes.png": mat(
      "terrace_etancheite_epdm",
      `Polystyrène d'attique ${L}`
    ),
    "9. stiropori i atikes.png": mat(
      "terrace_etancheite_epdm",
      `Polystyrène d'attique ${L}`
    ),
    "9. stiropori.png": mat(
      "terrace_etancheite_epdm",
      `Polystyrène d'attique ${L}`
    ),
    "10. epdm.png": mat("etancheite_epdm", `Étanchéité EPDM ${L}`),
    "10.epdm.png": mat("etancheite_epdm", `Étanchéité EPDM ${L}`),
    "10. Epdm png.png": mat("etancheite_epdm", `Étanchéité EPDM ${L}`),
    "10 epdm.png": mat("etancheite_epdm", `Étanchéité EPDM ${L}`),
    "10 pedm.png": mat("etancheite_epdm", `Étanchéité EPDM ${L}`),
    "11. fasada e bardhe.png": mat("facade_blanche", `Façade blanche enduit ${L}`),
    "11. fasada bardhe.png": mat("facade_blanche", `Façade blanche enduit ${L}`),
    "11. fasada e bardhe png.png": mat("facade_blanche", `Façade blanche enduit ${L}`),
    "11. FASADA E BARDHE.png": mat("facade_blanche", `Façade blanche enduit ${L}`),
    "12. fasada arish.png": mat("facade_bardage", `Façade bardage mélèze ${L}`),
    "12. fasada arish png.png": mat("facade_bardage", `Façade bardage mélèze ${L}`),
    "12. FASADA ARISH.png": mat("facade_bardage", `Façade bardage mélèze ${L}`),
    "13. Dritaret alumin.png": mat(
      "windows_aluminium",
      `Menuiseries aluminium ${L}`
    ),
    "13. dritaret antracid.png": mat(
      "windows_aluminium",
      `Menuiseries aluminium ${L}`
    ),
    "13. dritaret alumin png.png": mat(
      "windows_aluminium",
      `Menuiseries aluminium ${L}`
    ),
    "13. dritaert antracid.png": mat(
      "windows_aluminium",
      `Menuiseries aluminium ${L}`
    ),
    "13. dritaret alumin.png": mat(
      "windows_aluminium",
      `Menuiseries aluminium ${L}`
    ),
    "13. dritare alumin.png": mat(
      "windows_aluminium",
      `Menuiseries aluminium ${L}`
    ),
    "14. dritaret pvc.png": mat("windows_pvc", `Menuiseries PVC ${L}`),
    "14. dritaret pvc png.png": mat("windows_pvc", `Menuiseries PVC ${L}`),
    "14 dritaret pvc.png": mat("windows_pvc", `Menuiseries PVC ${L}`),
    "14. dritare pvc.png": mat("windows_pvc", `Menuiseries PVC ${L}`),
  };
}

export function mergeAttiqueMapping(
  label: string,
  heroFiles: Record<string, HouseFileMappingEntry>
): Record<string, HouseFileMappingEntry> {
  return {
    ...standardAttiqueLayerEntries(label),
    ...heroFiles,
  };
}

/** Forest Side Cabin — no attic polystyrene layer; EPDM on layer 13. */
export function forestSideCabinAttiqueMapping(
  label: string,
  defaultImageFile: string,
  finalImageFile: string
): Record<string, HouseFileMappingEntry> {
  const L = label;
  return {
    "1. prapavija.png": {
      field: "backgroundLayer",
      mediaType: "hero",
      alt: `Arrière-plan ${L}`,
    },
    "2. kons.png": {
      field: "constructionLayer",
      mediaType: "construction_layer",
      alt: `Structure bois ${L}`,
    },
    "3. lesh guri.png": mat("iso_inter_roche", `Isolation laine de roche ${L}`),
    "4. lesh druri.png": mat("iso_inter_bois", `Isolation laine de bois ${L}`),
    "5. lesh xhami.png": mat("iso_inter_verre", `Isolation laine de verre ${L}`),
    "6. stiropori.png": mat(
      "iso_ext_polystyrene",
      `Isolation extérieure polystyrène ${L}`
    ),
    "7. lesh guri.png": mat(
      "iso_ext_roche_comprimee",
      `Isolation extérieure laine de roche ${L}`
    ),
    "8. fibra.png": mat("iso_ext_fibre", `Isolation extérieure fibre de bois ${L}`),
    "9. fasada e bardhe.png": mat("facade_blanche", `Façade blanche enduit ${L}`),
    "10. fasada arish.png": mat("facade_bardage", `Façade bardage mélèze ${L}`),
    "11. dritaret alumin.png": mat(
      "windows_aluminium",
      `Menuiseries aluminium ${L}`
    ),
    "12. dritaret pvc.png": mat("windows_pvc", `Menuiseries PVC ${L}`),
    "13. kulmi.png": mat("etancheite_epdm", `Étanchéité EPDM ${L}`),
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
