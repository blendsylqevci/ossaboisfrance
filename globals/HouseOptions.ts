import { GlobalConfig, Field } from 'payload'

const optionFields: Field[] = [
  {
    name: 'option_name',
    type: 'text',
    localized: true,
    validate: (val: string | null | undefined, { req }: { req: any }) => {
      if (req?.locale === 'fr' && !val) {
        return 'Le nom de l\'option est requis en français.'
      }
      return true
    },
  },
  {
    name: 'option_image',
    type: 'relationship',
    relationTo: 'media',
  },
  {
    name: 'option_mini_image',
    type: 'relationship',
    relationTo: 'media',
  },
  {
    name: 'option_price',
    type: 'number',
    required: true,
  },
  {
    name: 'option_price_200',
    type: 'number',
    admin: {
      description: 'Optional price override for 60x200 (defaults to option_price if empty/undefined).',
    },
  },
  {
    name: 'option_description',
    type: 'textarea',
    localized: true,
  },
  {
    name: 'layer_key',
    type: 'text',
    required: true,
    admin: {
      description: 'Must match a current house layers key (e.g. iso_inter_verre).',
    },
  },
]

export const HouseOptions: GlobalConfig = {
  slug: 'house-options',
  lockDocuments: false,
  access: {
    read: () => true,
  },
  admin: {
    group: 'Admin',
  },

  fields: [
    {
      name: 'marginPercent',
      type: 'number',
      label: 'Marge globale (%) / Global Margin (%)',
      defaultValue: 40,
      required: true,
      admin: {
        description: 'Marge globale appliquée au prix de toutes les maisons (si non surchargée individuellement).',
      },
    },
    {
      name: 'global_isolation_options',
      label: 'Isolation intermédiaire',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/ArrayRowLabel#ArrayRowLabel',
        },
      },
      fields: optionFields,
    },
    {
      name: 'global_outer_isolation_options',
      label: 'Isolation extérieure',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/ArrayRowLabel#ArrayRowLabel',
        },
      },
      fields: optionFields,
    },
    {
      name: 'global_terrace_etancheite_options',
      label: 'Isolation Attic (Polystyrène)',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/ArrayRowLabel#ArrayRowLabel',
        },
      },
      fields: optionFields,
    },
    {
      name: 'global_roof_options',
      label: 'Étanchéité EPDM',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/ArrayRowLabel#ArrayRowLabel',
        },
      },
      fields: optionFields,
    },
    {
      name: 'global_facade_options',
      label: 'Finition de la façade',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/ArrayRowLabel#ArrayRowLabel',
        },
      },
      fields: optionFields,
    },
    {
      name: 'global_roof_isolation_options',
      label: 'Isolation de la toiture',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/ArrayRowLabel#ArrayRowLabel',
        },
      },
      fields: optionFields,
    },
    {
      name: 'global_couverture_options',
      label: 'Revêtement de toiture',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/ArrayRowLabel#ArrayRowLabel',
        },
      },
      fields: optionFields,
    },
    {
      name: 'global_faux_plafond_options',
      label: 'Isolation de faux plafond',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/ArrayRowLabel#ArrayRowLabel',
        },
      },
      fields: optionFields,
    },
    {
      name: 'global_menuiseries_options',
      label: 'Menuiseries extérieures (Metadata)',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/ArrayRowLabel#ArrayRowLabel',
        },
      },
      fields: optionFields,
    },
    {
      name: 'dynamic_options',
      label: 'Dynamic Options & Prices',
      type: 'array',
      admin: {
        description: 'Configure pricing, metadata, and choices for custom checkbox or select fields here.',
        components: {
          RowLabel: '/components/DynamicOptionsRowLabel#DynamicOptionsRowLabel',
        },
      },
      fields: [
        {
          name: 'field_definition',
          type: 'relationship',
          relationTo: 'field-definitions',
          required: true,
          label: 'Linked Custom Field',
        },
        {
          name: 'options',
          type: 'array',
          label: 'Options / Choices',
          admin: {
            components: {
              RowLabel: '/components/ArrayRowLabel#ArrayRowLabel',
            },
          },
          fields: [
            {
              name: 'option_name',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                description: 'The name of this option choice (e.g. "Oui" or "Isolation Laine de Roche").',
              },
            },
            {
              name: 'option_price',
              type: 'number',
              required: true,
              admin: {
                description: 'Base price in Euros for 60x160 size (before margin).',
              },
            },
            {
              name: 'option_price_200',
              type: 'number',
              admin: {
                description: 'Optional price in Euros override for 60x200 size (before margin). Defaults to option_price if empty.',
              },
            },
            {
              name: 'layer_key',
              type: 'text',
              admin: {
                description: 'Optional graphic layer key matching a key in the Visual Graphic Layers config (e.g. iso_inter_verre) to render graphic overlays.',
              },
            },
            {
              name: 'option_description',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'option_image',
              type: 'relationship',
              relationTo: 'media',
            },
            {
              name: 'option_mini_image',
              type: 'relationship',
              relationTo: 'media',
            },
            {
              name: 'checkbox',
              type: 'checkbox',
              label: 'Selected by default?',
            },
          ],
        },
      ],
    },
  ],
}
