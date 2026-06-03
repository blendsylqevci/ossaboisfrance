import type { HouseFileMappingEntry } from "@/lib/house-import";

function mat(
  field: string,
  alt: string,
  mediaType = "material_layer"
): HouseFileMappingEntry {
  return { field, mediaType, alt };
}

/** Standard combles aménageables layer stack (France / Elegance pattern + variants). */
export function buildCombleFileMapping(
  label: string,
  heroFiles: Record<string, HouseFileMappingEntry>
): Record<string, HouseFileMappingEntry> {
  const L = label;
  return {
    "1. prapavija.png": {
      field: "backgroundLayer",
      mediaType: "hero",
      alt: `Arrière-plan ${L}`,
    },
    "1. prapavijs.png": {
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
    "3. izolimi kulmit.png": mat("roof_polystyrene", `Isolation de toiture ${L}`),
    "4. lesh druri.png": mat("iso_inter_bois", `Isolation laine de bois ${L}`),
    "5. lesh xhami.png": mat("iso_inter_verre", `Isolation laine de verre ${L}`),
    "6. lesh guri ne kulm.png": mat("roof_roche", `Isolation laine de roche toiture ${L}`),
    "6. stiropori.png": mat("iso_ext_polystyrene", `Isolation extérieure polystyrène ${L}`),
    "7. lesh druri ne kulm.png": mat("roof_bois", `Isolation laine de bois toiture ${L}`),
    "7. lesh druri.png": mat("iso_inter_bois", `Isolation laine de bois ${L}`),
    "7.  lesh druri.png": mat("roof_bois", `Isolation laine de bois toiture ${L}`),
    "8. lesh xhami ne kulm.png": mat("roof_verre", `Isolation laine de verre toiture ${L}`),
    "8. lesh xhami.png": mat("roof_verre", `Isolation laine de verre toiture ${L}`),
    "9. stiropori.png": mat("iso_ext_polystyrene", `Isolation extérieure polystyrène ${L}`),
    "10. lesh guri jashte.png": mat(
      "iso_ext_roche_comprimee",
      `Isolation extérieure laine de roche ${L}`
    ),
    "11. fibra.png": mat("iso_ext_fibre", `Isolation extérieure fibre de bois ${L}`),
    "12. folia dhe listelat.png": mat(
      "couverture_pare_pluie_lattage",
      `Pare-pluie et lattage ${L}`
    ),
    "12. folja dhe listelat.png": mat(
      "couverture_pare_pluie_lattage",
      `Pare-pluie et lattage ${L}`
    ),
    "13. fasada e bardhe.png": mat("facade_blanche", `Façade blanche enduit ${L}`),
    "14. fasada arish.png": mat("facade_bardage", `Façade bardage mélèze ${L}`),
    "15. dritaret alumin.png": mat(
      "windows_aluminium",
      `Menuiseries aluminium ${L}`
    ),
    "16. dritaret pvc.png": mat("windows_pvc", `Menuiseries PVC ${L}`),
    "17. qeremidet.png": mat(
      "couverture_tuiles_gouttieres",
      `Couverture tuiles ${L}`
    ),
    "17. llamarina.png": mat(
      "couverture_bac_acier_gouttieres",
      `Couverture bac acier ${L}`
    ),
    "18. llamarina.png": mat(
      "couverture_bac_acier_gouttieres",
      `Couverture bac acier ${L}`
    ),
    "18 llamarina.png": mat(
      "couverture_bac_acier_gouttieres",
      `Couverture bac acier ${L}`
    ),
    "19. lesh guri ne pllake.png": mat(
      "faux_plafond_roche",
      `Faux plafond laine de roche ${L}`
    ),
    "19. LESH GURI NE PLLOQE.png": mat(
      "faux_plafond_roche",
      `Faux plafond laine de roche ${L}`
    ),
    "20. lesh druri ne pllake.png": mat(
      "faux_plafond_bois",
      `Faux plafond laine de bois ${L}`
    ),
    "20. LESH DRURI NE PLLOQE.png": mat(
      "faux_plafond_bois",
      `Faux plafond laine de bois ${L}`
    ),
    "21. lesh xhami ne pllake.png": mat(
      "faux_plafond_verre",
      `Faux plafond laine de verre ${L}`
    ),
    "21.LESH XHAMI NE PLLOQE.png": mat(
      "faux_plafond_verre",
      `Faux plafond laine de verre ${L}`
    ),
    ...heroFiles,
  };
}

export const COMBLE_ENABLE_FLAGS = {
  enableRoofOption: true,
  enableEtancheiteOption: false,
  enableEtancheiteTerrasse: false,
  enableCouvertureOption: true,
  enableFauxPlafondOption: true,
} as const;

export const COMBLE_REQUIRED_LAYERS = [
  "backgroundLayer",
  "constructionLayer",
  "couverture_pare_pluie_lattage",
] as const;
