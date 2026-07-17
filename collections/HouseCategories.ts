import { CollectionConfig } from 'payload'
import { revalidateHousePaths } from '@/lib/revalidate-house'

export const HouseCategories: CollectionConfig = {
  slug: 'house-categories',
  lockDocuments: false,
  hooks: {
    afterChange: [
      () => {
        revalidateHousePaths()
      },
    ],
    afterDelete: [
      () => {
        revalidateHousePaths()
      },
    ],
  },
  access: {
    read: () => true,
  },
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
