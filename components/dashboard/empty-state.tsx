'use client'

import { Compass } from 'lucide-react'
import { CreateProjectButton } from './create-project-button'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Compass className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Describe your project idea and the AI will help you break it down into a
        visual, actionable plan.
      </p>
      <CreateProjectButton />
    </div>
  )
}
