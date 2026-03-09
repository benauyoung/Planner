import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'TinyBaguette - Your Perfect Planning Tool',
    template: '%s | TinyBaguette',
  },
  description: 'Plan your website or app in minutes with an AI-powered visual canvas. Generate PRDs, design live pages, embed AI agents, and export to Cursor, Claude Code, or Windsurf.',
  keywords: ['project planning', 'AI planning tool', 'PRD generator', 'developer workflow', 'visual planning canvas', 'TinyBaguette', 'AI agent builder', 'website builder'],
  authors: [{ name: 'TinyBaguette' }],
  creator: 'TinyBaguette',
  metadataBase: new URL('https://tinybaguette.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'TinyBaguette - Your Perfect Planning Tool',
    description: 'Plan your website or app in minutes with an AI-powered visual canvas. Generate PRDs, design live pages, embed AI agents, and export to Cursor, Claude Code, or Windsurf.',
    url: 'https://tinybaguette.com',
    siteName: 'TinyBaguette',
    locale: 'en_US',
    images: [
      {
        url: '/og/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Big Ideas. TinyBaguette. Plan your project in minutes.',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TinyBaguette - Your Perfect Planning Tool',
    description: 'Plan your website or app in minutes with an AI-powered visual canvas. Generate PRDs, design live pages, embed AI agents, and export to Cursor, Claude Code, or Windsurf.',
    images: ['/og/og-image.png'],
    creator: '@tinybaguette',
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
