import type { CollectionConfig } from 'payload'

export const GalleryPhotos: CollectionConfig = {
  slug: 'gallery-photos',
  admin: {
    useAsTitle: 'caption',
    defaultColumns: ['caption', 'category', 'sortOrder'],
    group: 'Gallery',
  },
  access: {
    read: () => true,
  },
  timestamps: true,
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'Other',
      options: [
        { label: 'Events', value: 'Events' },
        { label: 'Behind the Scenes', value: 'Behind the Scenes' },
        { label: 'Paintings', value: 'Paintings' },
        { label: 'Other', value: 'Other' },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first.',
      },
    },
  ],
}
