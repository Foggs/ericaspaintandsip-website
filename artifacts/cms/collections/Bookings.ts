import type { CollectionConfig } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    group: 'Events',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'event', 'seats', 'status', 'createdAt'],
  },
  access: {
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'event', type: 'relationship', relationTo: 'events', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'seats', type: 'number', required: true, min: 1 },
    {
      name: 'amountPaid',
      type: 'number',
      required: true,
      admin: { description: 'USD captured from PayPal.' },
    },
    {
      name: 'paypalOrderId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'paid',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
  ],
  timestamps: true,
}
