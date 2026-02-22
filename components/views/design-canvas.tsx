'use client'

import { memo, useMemo, useEffect, useCallback, useState, useRef } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type NodeTypes,
  type NodeProps,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Globe, Maximize2, Trash2, Send, Loader2, MessageSquare } from 'lucide-react'
import type { ProjectPage, PageEdge } from '@/types/project'

// ─── Types ───────────────────────────────────────────────────

interface PageNodeData {
  page: ProjectPage
  onFocusPage: (pageId: string) => void
  onDeletePage: (pageId: string) => void
  onEditPage: (pageId: string, instruction: string) => Promise<void>
  [key: string]: unknown
}

// ─── Wrap HTML for srcdoc ────────────────────────────────────

function wrapHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }</style>
</head>
<body>${bodyHtml}</body>
</html>`
}

// ─── Page Frame Node ─────────────────────────────────────────

const PAGE_FRAME_WIDTH = 420
const PAGE_FRAME_HEIGHT = 320

const PageFrameNode = memo(function PageFrameNode({ data }: NodeProps) {
  const { page, onFocusPage, onDeletePage, onEditPage } = data as unknown as PageNodeData
  const [editInput, setEditInput] = useState('')
  const [editing, setEditing] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showEdit) inputRef.current?.focus()
  }, [showEdit])

  const handleSubmitEdit = async () => {
    const instruction = editInput.trim()
    if (!instruction || editing) return
    setEditing(true)
    try {
      await onEditPage(page.id, instruction)
      setEditInput('')
      setShowEdit(false)
    } finally {
      setEditing(false)
    }
  }

  return (
    <div
      className="group"
      style={{ width: PAGE_FRAME_WIDTH }}
    >
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-primary/50 !border-primary/30" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-primary/50 !border-primary/30" />

      {/* Frame header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-b-0 rounded-t-lg">
        <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-xs font-medium truncate flex-1">{page.title}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{page.route}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowEdit(!showEdit)
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
          title="Edit with AI"
        >
          <MessageSquare className="h-3 w-3 text-muted-foreground" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFocusPage(page.id)
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
          title="Focus this page"
        >
          <Maximize2 className="h-3 w-3 text-muted-foreground" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDeletePage(page.id)
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10 hover:text-destructive"
          title="Delete page"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Inline edit bar */}
      {showEdit && (
        <div className="flex items-center gap-1 px-2 py-1.5 bg-background border border-t-0 border-b-0">
          <input
            ref={inputRef}
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') handleSubmitEdit()
              if (e.key === 'Escape') { setShowEdit(false); setEditInput('') }
            }}
            placeholder="e.g. Make header blue, add pricing..."
            className="flex-1 h-7 px-2 text-[11px] bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary nodrag"
            disabled={editing}
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleSubmitEdit()
            }}
            disabled={!editInput.trim() || editing}
            className="h-7 w-7 flex items-center justify-center rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shrink-0 nodrag"
            title="Apply edit"
          >
            {editing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          </button>
        </div>
      )}

      {/* Iframe preview via srcdoc */}
      <div
        className="border rounded-b-lg overflow-hidden bg-white"
        style={{ width: PAGE_FRAME_WIDTH, height: PAGE_FRAME_HEIGHT }}
      >
        <iframe
          srcDoc={wrapHtml(page.html)}
          title={`Preview: ${page.title}`}
          className="border-0 origin-top-left"
          style={{
            width: 1280,
            height: 800,
            transform: `scale(${PAGE_FRAME_WIDTH / 1280})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
          }}
          sandbox="allow-scripts"
          loading="lazy"
        />
      </div>
    </div>
  )
})

// ─── Node Types ──────────────────────────────────────────────

const designNodeTypes: NodeTypes = {
  pageFrame: PageFrameNode,
}

// ─── Layout + Edges ──────────────────────────────────────────

function buildNodes(
  pages: ProjectPage[],
  onFocusPage: (pageId: string) => void,
  onDeletePage: (pageId: string) => void,
  onEditPage: (pageId: string, instruction: string) => Promise<void>
): Node[] {
  return pages.map((page, i) => ({
    id: page.id,
    type: 'pageFrame',
    position: page.position || {
      x: (i % 3) * (PAGE_FRAME_WIDTH + 80),
      y: Math.floor(i / 3) * (PAGE_FRAME_HEIGHT + 36 + 80),
    },
    data: { page, onFocusPage, onDeletePage, onEditPage } as PageNodeData,
    draggable: true,
    selectable: true,
  }))
}

function buildEdges(pageEdges: PageEdge[]): Edge[] {
  return pageEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: 'default',
    animated: true,
    style: { stroke: 'hsl(var(--primary) / 0.3)', strokeWidth: 1.5 },
  }))
}

// ─── Canvas Inner ────────────────────────────────────────────

function DesignCanvasInner({
  pages,
  pageEdges,
  onFocusPage,
  onDeletePage,
  onEditPage,
  onPagePositionChange,
}: {
  pages: ProjectPage[]
  pageEdges: PageEdge[]
  onFocusPage: (pageId: string) => void
  onDeletePage: (pageId: string) => void
  onEditPage: (pageId: string, instruction: string) => Promise<void>
  onPagePositionChange: (pageId: string, position: { x: number; y: number }) => void
}) {
  const initialNodes = useMemo(
    () => buildNodes(pages, onFocusPage, onDeletePage, onEditPage),
    [pages, onFocusPage, onDeletePage, onEditPage]
  )
  const edges = useMemo(() => buildEdges(pageEdges), [pageEdges])

  const [flowNodes, setFlowNodes] = useState<Node[]>(initialNodes)

  useEffect(() => {
    setFlowNodes(buildNodes(pages, onFocusPage, onDeletePage, onEditPage))
  }, [pages, onFocusPage, onDeletePage, onEditPage])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setFlowNodes((nds) => {
        const updated = applyNodeChanges(changes, nds)
        // Persist position changes
        for (const change of changes) {
          if (change.type === 'position' && change.position && change.id) {
            onPagePositionChange(change.id, change.position)
          }
        }
        return updated
      })
    },
    [onPagePositionChange]
  )

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        nodeTypes={designNodeTypes}
        onNodesChange={onNodesChange}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-canvas"
      >
        <Background gap={24} size={1} color="hsl(var(--muted-foreground) / 0.15)" />
        <Controls
          showInteractive={false}
          className="!bg-background !border !shadow-md !rounded-lg"
        />
        <MiniMap
          nodeColor="hsl(var(--primary) / 0.2)"
          maskColor="hsl(var(--background) / 0.8)"
          className="!bg-background !border !shadow-md !rounded-lg"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}

// ─── Exported Component ──────────────────────────────────────

export function DesignCanvas({
  pages,
  pageEdges,
  onFocusPage,
  onDeletePage,
  onEditPage,
  onPagePositionChange,
}: {
  pages: ProjectPage[]
  pageEdges: PageEdge[]
  onFocusPage: (pageId: string) => void
  onDeletePage: (pageId: string) => void
  onEditPage: (pageId: string, instruction: string) => Promise<void>
  onPagePositionChange: (pageId: string, position: { x: number; y: number }) => void
}) {
  if (pages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p className="text-sm">No pages detected. Generate pages first.</p>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <DesignCanvasInner
        pages={pages}
        pageEdges={pageEdges}
        onFocusPage={onFocusPage}
        onDeletePage={onDeletePage}
        onEditPage={onEditPage}
        onPagePositionChange={onPagePositionChange}
      />
    </ReactFlowProvider>
  )
}
