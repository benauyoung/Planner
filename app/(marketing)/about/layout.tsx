import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'TinyBaguette is the AI-powered plan-to-product platform. Learn how we help builders skip the meetings and go straight to shipping.',
  alternates: { canonical: '/about' },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
