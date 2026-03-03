import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'TinyBaguette - Your Developer Planning Tool',
  description: 'Plan your project in minutes. Visual planning canvas with AI-powered node graphs, PRD generation, and seamless developer workflows.',
  metadataBase: new URL('https://tinybaguette.com'),
  icons: {
    icon: '/Logo.png',
  },
  openGraph: {
    title: 'TinyBaguette - Your Developer Planning Tool',
    description: 'Plan your project in minutes. Visual planning canvas with AI-powered node graphs, PRD generation, and seamless developer workflows.',
    url: 'https://tinybaguette.com',
    siteName: 'TinyBaguette',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'TinyBaguette - Your Developer Planning Tool',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TinyBaguette - Your Developer Planning Tool',
    description: 'Plan your project in minutes. Visual planning canvas with AI-powered node graphs, PRD generation, and seamless developer workflows.',
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
