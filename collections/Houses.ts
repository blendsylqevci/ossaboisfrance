import { CollectionConfig } from 'payload'

export const Houses: CollectionConfig = {
  slug: 'houses',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Used in the URL path. Must be unique.',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'house-categories',
      required: true,
    },
    {
      name: 'subheading',
      type: 'text',
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'specification',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'defaultImage',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'finalImage',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'price60x160',
      type: 'number',
      admin: {
        description: 'Base structure price for 60x160 size (before 40% margin).',
      },
    },
    {
      name: 'price60x200',
      type: 'number',
      admin: {
        description: 'Base structure price for 60x200 size (before 40% margin).',
      },
    },
    {
      name: 'marginPercent',
      type: 'number',
      defaultValue: 40,
      required: true,
    },
    {
      name: 'perdhesa',
      type: 'group',
      label: 'Surfaces and Dimensions',
      fields: [
        { name: 'bruto', type: 'number', label: 'Surface Brute (m²)' },
        { name: 'neto', type: 'number', label: 'Surface Nette (m²)' },
        { name: 'mure_te_jashtme', type: 'number', label: 'Murs Extérieurs (m²)' },
        { name: 'mure_mbajtese', type: 'number', label: 'Murs Porteurs (m²)' },
        { name: 'mure_ndarese', type: 'number', label: 'Murs Séparateurs (m²)' },
        { name: 'pllaka_e_kulmit', type: 'number', label: 'Dalle de Toit (m²)' },
        { name: 'kulmi', type: 'number', label: 'Toiture (m²)' },
        { name: 'pllaka_e_katit', type: 'number', label: 'Dalle d’Étage (m²)' },
      ],
    },
    {
      name: 'windows',
      type: 'group',
      label: 'Menuiseries Prices',
      fields: [
        {
          name: 'aluminiumPrice',
          type: 'number',
          label: 'Aluminium Price (€)',
          admin: { description: 'Base price for Aluminium windows.' },
        },
        {
          name: 'pvcPrice',
          type: 'number',
          label: 'PVC Price (€)',
          admin: { description: 'Base price for PVC windows.' },
        },
      ],
    },
    {
      name: 'enableFlags',
      type: 'group',
      label: 'Configurator Steps/Flags',
      fields: [
        { name: 'enableRoofOption', type: 'checkbox', label: 'Enable Roof Option', defaultValue: false },
        { name: 'enableEtancheiteOption', type: 'checkbox', label: 'Enable EPDM Option', defaultValue: true },
        { name: 'enableEtancheiteTerrasse', type: 'checkbox', label: 'Enable Attic Polystyrene Option', defaultValue: false },
        { name: 'enableCouvertureOption', type: 'checkbox', label: 'Enable Roof Cover (tiles/metal)', defaultValue: false },
        { name: 'enableFauxPlafondOption', type: 'checkbox', label: 'Enable False Ceiling Option', defaultValue: false },
      ],
    },
    {
      name: 'structureInfo',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Informational text displayed beside the structure price.',
      },
    },
    {
      name: 'layers',
      type: 'group',
      label: 'Visual Graphic Layers',
      fields: [
        { name: 'backgroundLayer', type: 'relationship', relationTo: 'media', required: true },
        { name: 'constructionLayer', type: 'relationship', relationTo: 'media', required: true },
        { name: 'iso_inter_verre', type: 'relationship', relationTo: 'media' },
        { name: 'iso_inter_roche', type: 'relationship', relationTo: 'media' },
        { name: 'iso_inter_bois', type: 'relationship', relationTo: 'media' },
        { name: 'iso_ext_roche_comprimee', type: 'relationship', relationTo: 'media' },
        { name: 'iso_ext_polystyrene', type: 'relationship', relationTo: 'media' },
        { name: 'iso_ext_fibre', type: 'relationship', relationTo: 'media' },
        { name: 'terrace_etancheite_epdm', type: 'relationship', relationTo: 'media', label: 'Attic Polystyrene Layer' },
        { name: 'etancheite_epdm', type: 'relationship', relationTo: 'media', label: 'EPDM Waterproofing Layer' },
        { name: 'facade_blanche', type: 'relationship', relationTo: 'media' },
        { name: 'facade_bardage', type: 'relationship', relationTo: 'media' },
        { name: 'windows_aluminium', type: 'relationship', relationTo: 'media' },
        { name: 'windows_pvc', type: 'relationship', relationTo: 'media' },
        { name: 'roof_polystyrene', type: 'relationship', relationTo: 'media' },
        { name: 'roof_roche', type: 'relationship', relationTo: 'media' },
        { name: 'roof_verre', type: 'relationship', relationTo: 'media' },
        { name: 'couverture_pare_pluie_lattage', type: 'relationship', relationTo: 'media' },
        { name: 'couverture_tuiles_gouttieres', type: 'relationship', relationTo: 'media' },
        { name: 'couverture_bac_acier_gouttieres', type: 'relationship', relationTo: 'media' },
        { name: 'faux_plafond_verre', type: 'relationship', relationTo: 'media' },
        { name: 'faux_plafond_roche', type: 'relationship', relationTo: 'media' },
        { name: 'faux_plafond_bois', type: 'relationship', relationTo: 'media' },
      ],
    },
  ],
}
