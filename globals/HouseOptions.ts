import { GlobalConfig, Field } from 'payload'
import { revalidateHousePaths } from '@/lib/revalidate-house'
import { isAuthenticatedAccess } from '@/lib/access'

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
    min: 0,
  },
  {
    name: 'option_price_200',
    type: 'number',
    min: 0,
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
  hooks: {
    afterChange: [
      () => {
        // Structure prices now come from the category + Bruto rules in
        // lib/house-pricing.ts. Saving material options must not rewrite every
        // house with the retired Neto × 350/370 formula.
        revalidateHousePaths();
      }
    ]
  },
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
      // Confidential cost basis: never expose via the public REST/GraphQL API.
      // Server-side rendering uses the Local API (overrideAccess) so the public
      // site/configurator is unaffected. Prevents reverse-engineering of the
      // "protected" Houses base prices from the margin + per-m² rates.
      access: { read: isAuthenticatedAccess },
      admin: {
        description: 'Champ historique — non appliqué par la nouvelle tarification publique.',
      },
    },
    {
      name: 'priceRate60x160',
      type: 'number',
      label: 'Prix par m² pour 60x160 (€) / Rate per m² for 60x160 (€)',
      defaultValue: 350,
      required: true,
      access: { read: isAuthenticatedAccess },
      admin: {
        description: 'Champ historique — remplacé par les tarifs par catégorie basés sur la surface Bruto.',
      },
    },
    {
      name: 'priceRate60x200',
      type: 'number',
      label: 'Prix par m² pour 60x200 (€) / Rate per m² for 60x200 (€)',
      defaultValue: 370,
      required: true,
      access: { read: isAuthenticatedAccess },
      admin: {
        description: 'Champ historique — remplacé par les tarifs par catégorie basés sur la surface Bruto.',
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
      label: 'Étanchéité',
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
    // Custom UI component that renders dynamic options sections (like the hardcoded ones)
    {
      name: 'dynamicOptionsSectionsUI',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/DynamicOptionsSections#DynamicOptionsSections',
        },
      },
    },
    // Hidden native array - data storage only, managed by the DynamicOptionsSections component
    {
      name: 'dynamic_options',
      label: 'Dynamic Options & Prices',
      type: 'array',
      admin: {
        condition: () => false,
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
          fields: optionFields,
        },
      ],
    },
  ],
}
