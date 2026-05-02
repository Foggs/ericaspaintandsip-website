import React from 'react'

export const metadata = {
  title: "Erica's Paint & Sip",
  description: 'Paint-and-sip events, private bookings, and more.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
