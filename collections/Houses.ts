import { CollectionConfig } from 'payload'

export const Houses: CollectionConfig = {
  slug: 'houses',
  lockDocuments: false,
  access: {
    read: () => true,
  },
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
      admin: {
        description: 'Surcharge optionnelle de la marge commerciale (%) (laisse vide pour utiliser la marge globale dans House Options).',
      },
    },
    {
      name: 'perdhesa',
      type: 'group',
      label: 'Surfaces and Dimensions',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'bruto', type: 'number', label: 'Surface Brute (m²)', admin: { width: '9%' } },
            { name: 'neto', type: 'number', label: 'Surface Nette (m²)', admin: { width: '9%' } },
            { name: 'mure_te_jashtme', type: 'number', label: 'Murs Extérieurs (m²)', admin: { width: '9%' } },
            { name: 'mure_mbajtese', type: 'number', label: 'Murs Porteurs (m²)', admin: { width: '9%' } },
            { name: 'mure_ndarese', type: 'number', label: 'Murs Séparateurs (m²)', admin: { width: '9%' } },
            { name: 'pllaka_e_kulmit', type: 'number', label: 'Dalle de Toit (m²)', admin: { width: '9%' } },
            { name: 'pllaka_e_katit_0', type: 'number', label: 'Dalle d’Étage 0 (m²)', admin: { width: '9%' } },
            { name: 'pllaka_e_katit_1', type: 'number', label: 'Dalle d’Étage 1 (m²)', admin: { width: '9%' } },
            { name: 'pllaka_e_katit_2', type: 'number', label: 'Dalle d’Étage 2 (m²)', admin: { width: '9%' } },
            { name: 'pllaka_e_katit', type: 'number', label: 'Dalle d’Étage (m²)', admin: { width: '9%' } },
            { name: 'kulmi', type: 'number', label: 'Toiture (m²)', admin: { width: '9%' } },
          ],
        },
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
      defaultValue: 'Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l’ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle type fermette. Le prix inclut le transport et le montage sur site sous garantie décennale.',
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
    {
      name: 'customFields',
      label: 'Custom Fields Values',
      type: 'blocks',
      blocks: [
        {
          slug: 'booleanValue',
          labels: {
            singular: 'Checkbox Field Value',
            plural: 'Checkbox Field Values',
          },
          fields: [
            {
              name: 'definition',
              type: 'relationship',
              relationTo: 'field-definitions',
              required: true,
              label: 'Field Definition',
            },
            {
              name: 'value',
              type: 'checkbox',
              required: true,
              label: 'Enabled / Yes',
            },
          ],
        },
        {
          slug: 'numberValue',
          labels: {
            singular: 'Number Field Value',
            plural: 'Number Field Values',
          },
          fields: [
            {
              name: 'definition',
              type: 'relationship',
              relationTo: 'field-definitions',
              required: true,
              label: 'Field Definition',
            },
            {
              name: 'value',
              type: 'number',
              required: true,
              label: 'Value',
            },
          ],
        },
        {
          slug: 'textValue',
          labels: {
            singular: 'Text Field Value',
            plural: 'Text Field Values',
          },
          fields: [
            {
              name: 'definition',
              type: 'relationship',
              relationTo: 'field-definitions',
              required: true,
              label: 'Field Definition',
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              label: 'Value',
            },
          ],
        },
        {
          slug: 'selectValue',
          labels: {
            singular: 'Select Field Value',
            plural: 'Select Field Values',
          },
          fields: [
            {
              name: 'definition',
              type: 'relationship',
              relationTo: 'field-definitions',
              required: true,
              label: 'Field Definition',
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              label: 'Selected Option Value',
              admin: {
                description: 'Specify the exact option name configured in global House Options for this custom field.',
              },
            },
          ],
        },
        {
          slug: 'textareaValue',
          labels: {
            singular: 'Textarea Field Value',
            plural: 'Textarea Field Values',
          },
          fields: [
            {
              name: 'definition',
              type: 'relationship',
              relationTo: 'field-definitions',
              required: true,
              label: 'Field Definition',
            },
            {
              name: 'value',
              type: 'textarea',
              required: true,
              localized: true,
              label: 'Value',
            },
          ],
        },
        {
          slug: 'imageValue',
          labels: {
            singular: 'Image Field Value',
            plural: 'Image Field Values',
          },
          fields: [
            {
              name: 'definition',
              type: 'relationship',
              relationTo: 'field-definitions',
              required: true,
              label: 'Field Definition',
            },
            {
              name: 'value',
              type: 'relationship',
              relationTo: 'media',
              required: true,
              label: 'Value',
            },
          ],
        },
        {
          slug: 'repeaterValue',
          labels: {
            singular: 'Repeater Field Value',
            plural: 'Repeater Field Values',
          },
          fields: [
            {
              name: 'definition',
              type: 'relationship',
              relationTo: 'field-definitions',
              required: true,
              label: 'Field Definition',
            },
            {
              name: 'rows',
              type: 'array',
              required: true,
              label: 'Rows / Choices',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: 'Title',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  localized: true,
                  label: 'Description',
                },
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                  label: 'Price (60x160)',
                },
                {
                  name: 'price_200',
                  type: 'number',
                  label: 'Price Override (60x200)',
                  admin: {
                    description: 'Optional override for 60x200 size (defaults to Price if empty).',
                  },
                },
                {
                  name: 'image',
                  type: 'relationship',
                  relationTo: 'media',
                  label: 'Image',
                },
                {
                  name: 'layer_key',
                  type: 'text',
                  label: 'Graphic Layer Key',
                  admin: {
                    description: 'Optional associated graphic layer key.',
                  },
                },
                {
                  name: 'checkbox',
                  type: 'checkbox',
                  label: 'Selected by default?',
                },
                {
                  name: 'attributes',
                  type: 'array',
                  label: 'Custom Attributes / Details',
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: 'Attribute Name (e.g. Thickness, Warranty)',
                    },
                    {
                      name: 'value',
                      type: 'text',
                      required: true,
                      localized: true,
                      label: 'Value (e.g. 10cm, 5 years)',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'dynamicFieldsConfig',
      type: 'json',
      label: 'Dynamic Custom Fields Settings',
      admin: {
        components: {
          Field: '/components/HouseDynamicFieldsConfig#HouseDynamicFieldsConfig',
        },
      },
    },
  ],
}
