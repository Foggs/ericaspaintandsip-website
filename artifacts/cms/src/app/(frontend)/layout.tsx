import React from 'react'
import { Fraunces, Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: "Erica's Paint & Sip",
  description: 'Paint-and-sip events, private bookings, and more.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(fraunces.variable, inter.variable)}>
      <body className="bg-cream text-ink font-sans antialiased">{children}</body>
    </html>
  )
}
