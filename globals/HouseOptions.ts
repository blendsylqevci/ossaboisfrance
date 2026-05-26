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
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        try {
          const rate160 = doc.priceRate60x160 || 350;
          const rate200 = doc.priceRate60x200 || 370;

          req.payload.logger.info(
            `[HouseOptions Global Hook] Re-calculating all house prices based on new rates: 60x160=${rate160}€, 60x200=${rate200}€...`
          );

          const houses = await req.payload.find({
            collection: 'houses',
            limit: 1000,
            depth: 0,
            req
          });

          for (const house of houses.docs) {
            const neto = house.perdhesa?.neto || 0;
            if (neto > 0) {
              const newPrice160 = neto >= 131 ? (neto * rate160) + 3500 : neto * rate160;
              const newPrice200 = neto >= 131 ? (neto * rate200) + 3500 : neto * rate200;

              if (house.price60x160 !== newPrice160 || house.price60x200 !== newPrice200) {
                req.payload.logger.info(
                  `[HouseOptions Global Hook] Updating prices for ${house.slug}: 60x160=${newPrice160}€, 60x200=${newPrice200}€`
                );
                await req.payload.update({
                  collection: 'houses',
                  id: house.id,
                  data: {
                    price60x160: newPrice160,
                    price60x200: newPrice200
                  },
                  req
                });
              }
            }
          }
        } catch (err) {
          req.payload.logger.error(`[HouseOptions Global Hook] Failed to propagate pricing updates: ${err}`);
        }
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
      admin: {
        description: 'Marge globale appliquée au prix de toutes les maisons (si non surchargée individuellement).',
      },
    },
    {
      name: 'priceRate60x160',
      type: 'number',
      label: 'Prix par m² pour 60x160 (€) / Rate per m² for 60x160 (€)',
      defaultValue: 350,
      required: true,
      admin: {
        description: 'Tarif par m² utilisé pour le calcul de la taille 60x160.',
      },
    },
    {
      name: 'priceRate60x200',
      type: 'number',
      label: 'Prix par m² pour 60x200 (€) / Rate per m² for 60x200 (€)',
      defaultValue: 370,
      required: true,
      admin: {
        description: 'Tarif par m² utilisé pour le calcul de la taille 60x200.',
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
