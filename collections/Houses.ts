import { CollectionConfig } from 'payload'
import { revalidateHousePaths } from '@/lib/revalidate-house'

export const Houses: CollectionConfig = {
  slug: 'houses',
  lockDocuments: false,
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        const nextSlug = typeof doc?.slug === 'string' ? doc.slug : undefined;
        const previousSlug =
          typeof previousDoc?.slug === 'string' ? previousDoc.slug : undefined;

        revalidateHousePaths(nextSlug);
        if (previousSlug && previousSlug !== nextSlug) {
          revalidateHousePaths(previousSlug);
        }
      },
    ],
    afterDelete: [
      async ({ req, id, doc }) => {
        try {
          const mediaDocs = await req.payload.find({
            collection: 'media',
            where: {
              house: {
                equals: id,
              },
            },
            limit: 1000,
            depth: 0,
          })

          const previousSkipRevalidation = req.context.skipPublicRevalidation
          req.context.skipPublicRevalidation = true
          try {
            for (const mediaDoc of mediaDocs.docs) {
              try {
                req.payload.logger.info(
                  `[Houses Hook] Deleting associated media ID ${mediaDoc.id} (${mediaDoc.filename}) for house ID ${id}...`
                )
                await req.payload.delete({
                  collection: 'media',
                  id: mediaDoc.id,
                  req,
                })
              } catch (mediaErr) {
                req.payload.logger.error(
                  `[Houses Hook] Failed to delete associated media ID ${mediaDoc.id}: ${mediaErr}`
                )
              }
            }
          } finally {
            if (previousSkipRevalidation === undefined) {
              delete req.context.skipPublicRevalidation
            } else {
              req.context.skipPublicRevalidation = previousSkipRevalidation
            }
          }
        } catch (err) {
          req.payload.logger.error(
            `[Houses Hook] Failed to query associated media for house ID ${id}: ${err}`
          )
        }
        revalidateHousePaths(typeof doc?.slug === 'string' ? doc.slug : undefined);
      },
    ],
  },
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
      localized: false,
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
      name: 'planimetry',
      type: 'relationship',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Plan complet (archive / admin). Peut inclure cotes et tableau.',
      },
    },
    {
      name: 'planimetryVisual',
      type: 'relationship',
      relationTo: 'media',
      required: false,
      admin: {
        description:
          'Plan visuel pour le popup (sans cotes ni tableau). Si vide, recadrage automatique pour certains modèles.',
      },
    },
    {
      name: 'planimetryDetails',
      type: 'json',
      label: 'Planimetry room labels',
      admin: {
        description:
          'Liste JSON des pièces visibles sur le plan: [{ "label": "Salon", "area": 19.97 }, ...]. Affichée dans le popup planimétrie.',
      },
    },
    {
      name: 'price60x160',
      type: 'number',
      // Cost data: never expose via the public REST/GraphQL API. Server-side
      // rendering uses the Local API (overrideAccess) so the site is unaffected.
      access: { read: ({ req }) => Boolean(req.user) },
      admin: {
        description: 'Legacy field — ignored by public pricing. Structure pricing is calculated from Bruto, category, and wall thickness.',
      },
    },
    {
      name: 'price60x200',
      type: 'number',
      access: { read: ({ req }) => Boolean(req.user) },
      admin: {
        description: 'Legacy field — ignored by public pricing. Structure pricing is calculated from Bruto, category, and wall thickness.',
      },
    },
    {
      name: 'marginPercent',
      type: 'number',
      access: { read: ({ req }) => Boolean(req.user) },
      admin: {
        description: 'Champ historique — non appliqué par la nouvelle tarification publique.',
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
            {
              name: 'bruto',
              type: 'number',
              min: 0,
              label: 'Bruto (m²)',
              admin: {
                width: '9%',
                description:
                  'Enregistrez la surface Bruto réelle (> 1 m²) : les prix 60×160/60×200, le transport et le montage seront recalculés automatiquement selon la catégorie.',
              },
            },
            { name: 'neto', type: 'number', min: 0, label: 'Neto (m²)', admin: { width: '9%' } },
            { name: 'mure_te_jashtme', type: 'number', min: 0, label: 'Murs Extérieurs (m²)', admin: { width: '9%' } },
            { name: 'mure_mbajtese', type: 'number', min: 0, label: 'Murs Porteurs (m²)', admin: { width: '9%' } },
            { name: 'mure_ndarese', type: 'number', min: 0, label: 'Murs Séparateurs (m²)', admin: { width: '9%' } },
            { name: 'pllaka_e_kulmit', type: 'number', min: 0, label: 'Dalle de Toit (m²)', admin: { width: '9%' } },
            { name: 'pllaka_e_katit_0', type: 'number', min: 0, label: 'Dalle d’Étage 0 (m²)', admin: { width: '9%' } },
            { name: 'pllaka_e_katit_1', type: 'number', min: 0, label: 'Dalle d’Étage 1 (m²)', admin: { width: '9%' } },
            { name: 'pllaka_e_katit_2', type: 'number', min: 0, label: 'Dalle d’Étage 2 (m²)', admin: { width: '9%' } },
            { name: 'pllaka_e_katit', type: 'number', min: 0, label: 'Dalle d’Étage (m²)', admin: { width: '9%' } },
            { name: 'kulmi', type: 'number', min: 0, label: 'Toiture (m²)', admin: { width: '9%' } },
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
          access: { read: ({ req }) => Boolean(req.user) },
          admin: { description: 'Base price for Aluminium windows.' },
        },
        {
          name: 'pvcPrice',
          type: 'number',
          label: 'PVC Price (€)',
          access: { read: ({ req }) => Boolean(req.user) },
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
      defaultValue: 'Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l’ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle type fermette. Le transport et le montage sont en supplément et sont calculés séparément lors de la validation du projet.',
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
        { name: 'roof_bois', type: 'relationship', relationTo: 'media' },
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
