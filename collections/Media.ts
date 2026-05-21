import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  lockDocuments: false,
  admin: {
    defaultColumns: ['filename', 'alt', 'house', 'mediaType', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'house',
      type: 'relationship',
      relationTo: 'houses',
      admin: {
        description: 'Optional. Use this to group media by house without changing the file URL or storage path.',
        position: 'sidebar',
      },
    },
    {
      name: 'mediaType',
      type: 'select',
      label: 'Media Type',
      admin: {
        description: 'Optional CMS-only classification for filtering and organization.',
        position: 'sidebar',
      },
      options: [
        {
          label: 'Hero / Main',
          value: 'hero',
        },
        {
          label: 'Construction Layer',
          value: 'construction_layer',
        },
        {
          label: 'Material Layer',
          value: 'material_layer',
        },
        {
          label: 'Final Render',
          value: 'final_render',
        },
        {
          label: 'Gallery',
          value: 'gallery',
        },
        {
          label: 'Plan',
          value: 'plan',
        },
        {
          label: 'Icon / Logo',
          value: 'icon_logo',
        },
        {
          label: 'Global / Shared',
          value: 'global_shared',
        },
      ],
    },
    {
      name: 'layerKey',
      type: 'text',
      label: 'Layer Key',
      admin: {
        description: 'Optional helper key for layer images. Leave empty unless this media is used as a configurator layer.',
        position: 'sidebar',
      },
    },
  ],
}
