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
import { Globe, Maximize2, Trash2, Send, Loader2, MessageSquare, Bot, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProjectPage, PageEdge } from '@/types/project'
import type { Agent } from '@/types/agent'

// ─── Types ───────────────────────────────────────────────────

interface PageNodeData {
  page: ProjectPage
  selected: boolean
  onSelectPage: (pageId: string) => void
  onFocusPage: (pageId: string) => void
  onDeletePage: (pageId: string) => void
  onEditPage: (pageId: string, instruction: string) => Promise<void>
  onDropAgent: (pageId: string, agentId: string) => void
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
  const { page, selected, onSelectPage, onFocusPage, onDeletePage, onEditPage, onDropAgent } = data as unknown as PageNodeData
  const [editInput, setEditInput] = useState('')
  const [editing, setEditing] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [dragOver, setDragOver] = useState(false)
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
      className={`group ${selected ? 'ring-2 ring-primary rounded-lg' : ''} ${dragOver ? 'ring-2 ring-green-500 rounded-lg' : ''}`}
      style={{ width: PAGE_FRAME_WIDTH }}
      onClick={() => onSelectPage(page.id)}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('application/agent-id')) {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
          setDragOver(true)
        }
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const agentId = e.dataTransfer.getData('application/agent-id')
        if (agentId) onDropAgent(page.id, agentId)
      }}
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
  selectedPageId: string | null,
  onSelectPage: (pageId: string) => void,
  onFocusPage: (pageId: string) => void,
  onDeletePage: (pageId: string) => void,
  onEditPage: (pageId: string, instruction: string) => Promise<void>,
  onDropAgent: (pageId: string, agentId: string) => void
): Node[] {
  return pages.map((page, i) => ({
    id: page.id,
    type: 'pageFrame',
    position: page.position || {
      x: (i % 3) * (PAGE_FRAME_WIDTH + 80),
      y: Math.floor(i / 3) * (PAGE_FRAME_HEIGHT + 36 + 80),
    },
    data: { page, selected: page.id === selectedPageId, onSelectPage, onFocusPage, onDeletePage, onEditPage, onDropAgent } as PageNodeData,
    draggable: true,
    selectable: true,
  }))
}

// ─── Agents Panel ────────────────────────────────────────────

function AgentsPanel({ agents }: { agents: Agent[] }) {
  const [collapsed, setCollapsed] = useState(false)

  if (agents.length === 0) return null

  return (
    <div className="absolute top-3 left-3 z-10 flex">
      <div
        className={`bg-background border rounded-lg shadow-lg transition-all overflow-hidden ${
          collapsed ? 'w-0 border-0 p-0' : 'w-52'
        }`}
      >
        <div className="px-3 py-2 border-b flex items-center gap-2">
          <Bot className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold flex-1">Agents</span>
          <span className="text-[10px] text-muted-foreground">{agents.length}</span>
        </div>
        <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
          <p className="text-[10px] text-muted-foreground px-1 mb-1.5">Drag onto a page to insert widget</p>
          {agents.map((agent) => (
            <div
              key={agent.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/agent-id', agent.id)
                e.dataTransfer.effectAllowed = 'copy'
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md border bg-muted/30 cursor-grab active:cursor-grabbing hover:bg-muted/60 transition-colors"
            >
              <GripVertical className="h-3 w-3 text-muted-foreground/50 shrink-0" />
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: agent.theme.primaryColor + '20', color: agent.theme.primaryColor }}
              >
                <Bot className="h-2.5 w-2.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium truncate">{agent.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-8 w-5 flex items-center justify-center bg-background border rounded-r-md shadow-sm hover:bg-muted transition-colors -ml-px"
        title={collapsed ? 'Show agents' : 'Hide agents'}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </div>
  )
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
  agents,
  selectedPageId,
  onSelectPage,
  onFocusPage,
  onDeletePage,
  onEditPage,
  onDropAgent,
  onPagePositionChange,
}: {
  pages: ProjectPage[]
  pageEdges: PageEdge[]
  agents: Agent[]
  selectedPageId: string | null
  onSelectPage: (pageId: string) => void
  onFocusPage: (pageId: string) => void
  onDeletePage: (pageId: string) => void
  onEditPage: (pageId: string, instruction: string) => Promise<void>
  onDropAgent: (pageId: string, agentId: string) => void
  onPagePositionChange: (pageId: string, position: { x: number; y: number }) => void
}) {
  const initialNodes = useMemo(
    () => buildNodes(pages, selectedPageId, onSelectPage, onFocusPage, onDeletePage, onEditPage, onDropAgent),
    [pages, selectedPageId, onSelectPage, onFocusPage, onDeletePage, onEditPage, onDropAgent]
  )
  const edges = useMemo(() => buildEdges(pageEdges), [pageEdges])

  const [flowNodes, setFlowNodes] = useState<Node[]>(initialNodes)

  useEffect(() => {
    setFlowNodes(buildNodes(pages, selectedPageId, onSelectPage, onFocusPage, onDeletePage, onEditPage, onDropAgent))
  }, [pages, selectedPageId, onSelectPage, onFocusPage, onDeletePage, onEditPage, onDropAgent])

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
    <div className="h-full w-full relative">
      <AgentsPanel agents={agents} />
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
  agents,
  selectedPageId,
  onSelectPage,
  onFocusPage,
  onDeletePage,
  onEditPage,
  onDropAgent,
  onPagePositionChange,
}: {
  pages: ProjectPage[]
  pageEdges: PageEdge[]
  agents: Agent[]
  selectedPageId: string | null
  onSelectPage: (pageId: string) => void
  onFocusPage: (pageId: string) => void
  onDeletePage: (pageId: string) => void
  onEditPage: (pageId: string, instruction: string) => Promise<void>
  onDropAgent: (pageId: string, agentId: string) => void
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
        agents={agents}
        selectedPageId={selectedPageId}
        onSelectPage={onSelectPage}
        onFocusPage={onFocusPage}
        onDeletePage={onDeletePage}
        onEditPage={onEditPage}
        onDropAgent={onDropAgent}
        onPagePositionChange={onPagePositionChange}
      />
    </ReactFlowProvider>
  )
}
