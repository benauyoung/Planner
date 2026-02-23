import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'TinyBaguette — Vibe Code Your Personal Website with AI',
  description: 'The first in-browser coding and planning assistant built for personal websites. Describe your idea and ship it with AI.',
  metadataBase: new URL('https://tinybaguette.com'),
  icons: {
    icon: '/Logo.png',
  },
  openGraph: {
    title: 'TinyBaguette — Vibe Code Your Personal Website with AI',
    description: 'The first in-browser coding and planning assistant built for personal websites. Describe your idea and ship it with AI.',
    url: 'https://tinybaguette.com',
    siteName: 'TinyBaguette',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'TinyBaguette — Vibe Code Your Personal Website with AI',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TinyBaguette — Vibe Code Your Personal Website with AI',
    description: 'The first in-browser coding and planning assistant built for personal websites. Describe your idea and ship it with AI.',
    images: ['/api/og'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
