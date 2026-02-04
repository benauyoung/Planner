'use client'

import { useReactFlow } from '@xyflow/react'
import { Maximize2, LayoutGrid, ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/stores/project-store'

interface CanvasToolbarProps {
  onReLayout: () => void
}

export function CanvasToolbar({ onReLayout }: CanvasToolbarProps) {
  const { fitView } = useReactFlow()
  const currentProject = useProjectStore((s) => s.currentProject)
  const toggleNodeCollapse = useProjectStore((s) => s.toggleNodeCollapse)

  const handleExpandAll = () => {
    if (!currentProject) return
    currentProject.nodes
      .filter((n) => n.collapsed)
      .forEach((n) => toggleNodeCollapse(n.id))
    setTimeout(onReLayout, 50)
  }

  const handleCollapseAll = () => {
    if (!currentProject) return
    currentProject.nodes
      .filter((n) => !n.collapsed && currentProject.nodes.some((c) => c.parentId === n.id))
      .forEach((n) => toggleNodeCollapse(n.id))
    setTimeout(onReLayout, 50)
  }

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
      <Button
        variant="outline"
        size="icon"
        onClick={() => fitView({ padding: 0.2 })}
        title="Fit view"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onReLayout}
        title="Re-layout"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleExpandAll}
        title="Expand all"
      >
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleCollapseAll}
        title="Collapse all"
      >
        <ChevronsDownUp className="h-4 w-4" />
      </Button>
    </div>
  )
}
