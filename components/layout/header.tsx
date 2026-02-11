'use client'

import Link from 'next/link'
import { Compass } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

export function Header() {
  return (
    <header className="h-14 border-b bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Compass className="h-6 w-6 text-primary" />
        <span className="font-semibold text-lg">VisionPath</span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
