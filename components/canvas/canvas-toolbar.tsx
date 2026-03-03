'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useReactFlow } from '@xyflow/react'
import { Maximize2, LayoutGrid, Undo2, Redo2, Download, FileJson, FileText, FileCode, ClipboardCopy, Package, ListChecks, FolderSync, Map, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { exportProjectAsJSON, downloadFile } from '@/lib/export-import'
import { exportFullPlanAsMarkdown } from '@/lib/export-markdown'
import { generateCursorRules, generateClaudeMD, generatePlanMD, generateTasksMD } from '@/lib/export-project-files'
import { downloadRalphyZip, downloadFlatPrdMd } from '@/lib/export-ralphy'
import { getProjectPrdSummary } from '@/lib/prd-status'


interface CanvasToolbarProps {
  onReLayout: () => void
  onToggleTerritorySync?: () => void
  territorySyncOpen?: boolean
}

export function CanvasToolbar({ onReLayout, onToggleTerritorySync, territorySyncOpen }: CanvasToolbarProps) {
  const { fitView } = useReactFlow()
  const currentProject = useProjectStore((s) => s.currentProject)

  const undo = useProjectStore((s) => s.undo)
  const redo = useProjectStore((s) => s.redo)
  const canUndo = useProjectStore((s) => s.canUndo)
  const canRedo = useProjectStore((s) => s.canRedo)
  const minimapOpen = useUIStore((s) => s.minimapOpen)
  const setMinimapOpen = useUIStore((s) => s.setMinimapOpen)
  const quickQuestionsPanelOpen = useUIStore((s) => s.quickQuestionsPanelOpen)
  const setQuickQuestionsPanelOpen = useUIStore((s) => s.setQuickQuestionsPanelOpen)

  const unansweredCount = useMemo(() => {
    if (!currentProject) return 0
    return currentProject.nodes.reduce((count, node) => {
      return count + node.questions.filter((q) => !(q.answer ?? '').trim()).length
    }, 0)
  }, [currentProject])





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
        downloadFile(exportProjectAsJSON(currentProject), `${safeName}.tinybaguette.json`)
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
    { label: '---', icon: null, action: () => { } },
    {
      label: 'Ralphy Package (ZIP)',
      icon: <Package className="h-3.5 w-3.5" />,
      action: () => {
        if (!currentProject) return
        downloadRalphyZip(currentProject)
      },
    },
    {
      label: 'PRD Manifest (.md)',
      icon: <FileText className="h-3.5 w-3.5" />,
      action: () => {
        if (!currentProject) return
        downloadFlatPrdMd(currentProject)
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
        aria-label="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        aria-label="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => fitView({ padding: 0.2 })}
        title="Fit view"
        aria-label="Fit view"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onReLayout}
        title="Re-layout (tree)"
        aria-label="Re-layout (tree)"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={minimapOpen ? 'default' : 'outline'}
        size="icon"
        onClick={() => setMinimapOpen(!minimapOpen)}
        title={minimapOpen ? 'Hide minimap' : 'Show minimap'}
        aria-label={minimapOpen ? 'Hide minimap' : 'Show minimap'}
      >
        <Map className="h-4 w-4" />
      </Button>
      <div className="relative">
        <Button
          variant={quickQuestionsPanelOpen ? 'default' : 'outline'}
          size="icon"
          onClick={() => setQuickQuestionsPanelOpen(!quickQuestionsPanelOpen)}
          title="Quick questions"
          aria-label="Quick questions"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
        {unansweredCount > 0 && !quickQuestionsPanelOpen && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold pointer-events-none">
            {unansweredCount > 99 ? '99+' : unansweredCount}
          </span>
        )}
      </div>
      <div className="h-px bg-border my-1" />
      <div className="relative" ref={exportRef}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setExportOpen(!exportOpen)}
          disabled={!currentProject}
          title="Export project"
          aria-label="Export project"
        >
          <Download className="h-4 w-4" />
        </Button>
        {exportOpen && (
          <div className="absolute right-full mr-2 top-0 w-52 py-1 bg-background border rounded-lg shadow-lg" role="menu" aria-label="Export options">
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Export
            </div>
            {exportActions.map((item) =>
              item.label === '---' ? (
                <div key="sep-ralphy" className="h-px bg-border mx-2 my-1" role="separator" />
              ) : (
                <button
                  key={item.label}
                  role="menuitem"
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                  onClick={() => {
                    item.action()
                    setExportOpen(false)
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
