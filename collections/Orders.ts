import { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'customerEmail', 'house', 'totalPrice', 'createdAt'],
  },
  fields: [
    {
      name: 'house',
      type: 'relationship',
      relationTo: 'houses',
      required: true,
    },
    {
      name: 'customerName',
      type: 'text',
      required: true,
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'customerPhone',
      type: 'text',
    },
    {
      name: 'totalPrice',
      type: 'number',
      required: true,
    },
    {
      name: 'selections',
      type: 'json',
      required: true,
      admin: {
        description: 'Selected variant, sizes, options, and calculated breakdown.',
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
    },
  ],
}
