import { CollectionConfig } from 'payload'

export const HouseCategories: CollectionConfig = {
  slug: 'house-categories',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
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
        description: 'Used in dynamic routing and identification. Do not modify after creation.',
      },
    },
  ],
}
