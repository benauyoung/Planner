'use client'

import { useState, useRef, useEffect } from 'react'
import { useReactFlow } from '@xyflow/react'
import { Maximize2, LayoutGrid, ChevronsDownUp, ChevronsUpDown, Undo2, Redo2, Download, FileJson, FileText, FileCode, ClipboardCopy, Radar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { exportProjectAsJSON, downloadFile } from '@/lib/export-import'
import { exportFullPlanAsMarkdown } from '@/lib/export-markdown'
import { generateCursorRules, generateClaudeMD, generatePlanMD, generateTasksMD } from '@/lib/export-project-files'

interface CanvasToolbarProps {
  onReLayout: () => void
}

export function CanvasToolbar({ onReLayout }: CanvasToolbarProps) {
  const { fitView } = useReactFlow()
  const currentProject = useProjectStore((s) => s.currentProject)
  const toggleNodeCollapse = useProjectStore((s) => s.toggleNodeCollapse)
  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const canUndo = useProjectStore((s) => s.canUndo)
  const canRedo = useProjectStore((s) => s.canRedo)
  const blastRadiusMode = useUIStore((s) => s.blastRadiusMode)
  const setBlastRadiusMode = useUIStore((s) => s.setBlastRadiusMode)

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

  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!exportOpen) return
    const handleClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [exportOpen])

  const safeName = currentProject?.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'project'

  const exportActions = [
    {
      label: 'Project JSON',
      icon: <FileJson className="h-3.5 w-3.5" />,
      action: () => {
        if (!currentProject) return
        downloadFile(exportProjectAsJSON(currentProject), `${safeName}.visionpath.json`)
      },
    },
    {
      label: 'Full Plan (.md)',
      icon: <FileText className="h-3.5 w-3.5" />,
      action: () => {
        if (!currentProject) return
        downloadFile(exportFullPlanAsMarkdown(currentProject), `${safeName}-plan.md`, 'text/markdown')
      },
    },
    {
      label: 'Tasks Checklist',
      icon: <FileText className="h-3.5 w-3.5" />,
      action: () => {
        if (!currentProject) return
        downloadFile(generateTasksMD(currentProject), `${safeName}-tasks.md`, 'text/markdown')
      },
    },
    {
      label: '.cursorrules',
      icon: <FileCode className="h-3.5 w-3.5" />,
      action: () => {
        if (!currentProject) return
        downloadFile(generateCursorRules(currentProject), '.cursorrules', 'text/plain')
      },
    },
    {
      label: 'CLAUDE.md',
      icon: <FileCode className="h-3.5 w-3.5" />,
      action: () => {
        if (!currentProject) return
        downloadFile(generateClaudeMD(currentProject), 'CLAUDE.md', 'text/markdown')
      },
    },
    {
      label: 'plan.md (Spec Kit)',
      icon: <FileText className="h-3.5 w-3.5" />,
      action: () => {
        if (!currentProject) return
        downloadFile(generatePlanMD(currentProject), 'plan.md', 'text/markdown')
      },
    },
    {
      label: 'Copy Plan to Clipboard',
      icon: <ClipboardCopy className="h-3.5 w-3.5" />,
      action: () => {
        if (!currentProject) return
        navigator.clipboard.writeText(exportFullPlanAsMarkdown(currentProject))
      },
    },
  ]

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
      <Button
        variant="outline"
        size="icon"
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
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
      <Button
        variant={blastRadiusMode ? 'default' : 'outline'}
        size="icon"
        onClick={() => setBlastRadiusMode(!blastRadiusMode)}
        title={blastRadiusMode ? 'Hide blast radius' : 'Show blast radius'}
      >
        <Radar className="h-4 w-4" />
      </Button>
      <div className="h-px bg-border my-1" />
      <div className="relative" ref={exportRef}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setExportOpen(!exportOpen)}
          disabled={!currentProject}
          title="Export project"
        >
          <Download className="h-4 w-4" />
        </Button>
        {exportOpen && (
          <div className="absolute right-full mr-2 top-0 w-52 py-1 bg-background border rounded-lg shadow-lg">
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Export
            </div>
            {exportActions.map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                onClick={() => {
                  item.action()
                  setExportOpen(false)
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
