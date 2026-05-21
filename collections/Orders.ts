import { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  lockDocuments: false,
  admin: {
    useAsTitle: 'orderRef',
    defaultColumns: ['orderRef', 'customerName', 'customerEmail', 'stateRegion', 'status', 'totalPrice', 'createdAt'],
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation }) => {
        if (operation === 'update' && originalDoc) {
          // Permet de ne modifier QUE la propriété 'status' et 'cancellationReason'
          const allowedFields = ['status', 'cancellationReason']
          Object.keys(originalDoc).forEach((key) => {
            if (!allowedFields.includes(key)) {
              data[key] = originalDoc[key]
            }
          })
        }
        return data
      }
    ]
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Client & Pricing',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'orderRef',
                  type: 'text',
                  required: true,
                  unique: true,
                  label: 'Order Reference',
                  access: {
                    update: () => false,
                  },
                  admin: {
                    readOnly: true,
                    width: '50%',
                  },
                },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'pending',
                  options: [
                    { label: 'Pending', value: 'pending' },
                    { label: 'Processing', value: 'processing' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ],
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'cancellationReason',
              type: 'textarea',
              label: 'Cancellation Reason',
              validate: (val: string | null | undefined, { data }: any) => {
                if (data?.status === 'cancelled' && (!val || val.trim() === '')) {
                  return "Veuillez indiquer le motif de l'annulation."
                }
                return true
              },
              admin: {
                condition: (data) => data?.status === 'cancelled',
                description: 'Reason why this order was cancelled.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'customerName',
                  type: 'text',
                  required: true,
                  label: 'Customer Name',
                  access: {
                    update: () => false,
                  },
                  admin: {
                    readOnly: true,
                    width: '33%',
                  },
                },
                {
                  name: 'customerEmail',
                  type: 'email',
                  required: true,
                  label: 'Customer Email',
                  access: {
                    update: () => false,
                  },
                  admin: {
                    readOnly: true,
                    width: '33%',
                  },
                },
                {
                  name: 'customerPhone',
                  type: 'text',
                  label: 'Customer Phone',
                  access: {
                    update: () => false,
                  },
                  admin: {
                    readOnly: true,
                    width: '34%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'house',
                  type: 'relationship',
                  relationTo: 'houses',
                  required: true,
                  label: 'Selected House Model',
                  access: {
                    update: () => false,
                  },
                  admin: {
                    readOnly: true,
                    width: '50%',
                    allowCreate: false,
                    allowEdit: false,
                  },
                },
                {
                  name: 'totalPrice',
                  type: 'number',
                  required: true,
                  label: 'Total Price (€)',
                  access: {
                    update: () => false,
                  },
                  admin: {
                    readOnly: true,
                    width: '25%',
                  },
                },
                {
                  name: 'transportCost',
                  type: 'number',
                  label: 'Transport Cost (€)',
                  access: {
                    update: () => false,
                  },
                  admin: {
                    readOnly: true,
                    width: '25%',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Delivery & Terrain',
          fields: [
            {
              name: 'streetAddress',
              type: 'text',
              label: 'Street Address / Plot Location',
              access: {
                update: () => false,
              },
              admin: {
                readOnly: true,
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'city',
                  type: 'text',
                  label: 'City',
                  access: {
                    update: () => false,
                  },
                  admin: {
                    readOnly: true,
                    width: '40%',
                  },
                },
                {
                  name: 'zipCode',
                  type: 'text',
                  label: 'Zip / Postal Code',
                  access: {
                    update: () => false,
                  },
                  admin: {
                    readOnly: true,
                    width: '30%',
                  },
                },
                {
                  name: 'stateRegion',
                  type: 'text',
                  label: 'State / Region',
                  access: {
                    update: () => false,
                  },
                  admin: {
                    readOnly: true,
                    width: '30%',
                  },
                },
              ],
            },
            {
              name: 'country',
              type: 'text',
              defaultValue: 'France',
              label: 'Country',
              access: {
                update: () => false,
              },
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'clientNotes',
              type: 'textarea',
              label: 'Client Special Notes & Requirements',
              access: {
                update: () => false,
              },
              admin: {
                readOnly: true,
              },
            },
          ],
        },
        {
          label: 'House Configuration',
          fields: [
            {
              name: 'selections',
              type: 'json',
              required: true,
              access: {
                update: () => false,
              },
              admin: {
                readOnly: true,
                description: 'Detailed option choices and structural selection details.',
                components: {
                  Field: '/components/OrderSummaryView#OrderSummaryView',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
