import type { CollectionConfig } from 'payload'

export const PrivateInquiries: CollectionConfig = {
  slug: 'private-inquiries',
  admin: {
    group: 'Events',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'preferredDate', 'createdAt'],
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'preferredDate', type: 'date' },
    {
      name: 'guestCount',
      type: 'text',
      admin: {
        description: 'A number, or the literal string "Not sure yet".',
      },
    },
    { name: 'message', type: 'textarea', required: true },
  ],
  timestamps: true,
}
