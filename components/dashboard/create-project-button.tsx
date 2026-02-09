'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CreateProjectButton() {
  return (
    <Link href="/project/new">
      <Button>
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </Link>
  )
}
