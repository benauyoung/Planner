'use client'

import { memo, useMemo, useEffect, useCallback, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
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
import { Globe, ExternalLink, Maximize2 } from 'lucide-react'
import type { AppRoute } from '@/lib/parse-app-routes'

// ─── Types ───────────────────────────────────────────────────

interface PageNodeData {
  route: AppRoute
  serverUrl: string
  onFocusPage: (path: string) => void
  [key: string]: unknown
}

// ─── Page Frame Node ─────────────────────────────────────────

const PAGE_FRAME_WIDTH = 420
const PAGE_FRAME_HEIGHT = 320

const PageFrameNode = memo(function PageFrameNode({ data }: NodeProps) {
  const { route, serverUrl, onFocusPage } = data as unknown as PageNodeData
  const iframeSrc = `${serverUrl}${route.path === '/' ? '' : route.path}`

  return (
    <div
      className="group"
      style={{ width: PAGE_FRAME_WIDTH, height: PAGE_FRAME_HEIGHT + 36 }}
    >
      {/* Source handle (outgoing links) */}
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-primary/50 !border-primary/30" />
      {/* Target handle (incoming links) */}
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-primary/50 !border-primary/30" />

      {/* Frame header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-b-0 rounded-t-lg">
        <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-xs font-medium truncate flex-1">{route.label}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{route.path}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFocusPage(route.path)
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
          title="Focus this page"
        >
          <Maximize2 className="h-3 w-3 text-muted-foreground" />
        </button>
        <a
          href={iframeSrc}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
          title="Open in new tab"
        >
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </a>
      </div>

      {/* Iframe preview */}
      <div
        className="border rounded-b-lg overflow-hidden bg-white"
        style={{ width: PAGE_FRAME_WIDTH, height: PAGE_FRAME_HEIGHT }}
      >
        <iframe
          src={iframeSrc}
          title={`Preview: ${route.label}`}
          className="border-0 origin-top-left"
          style={{
            width: 1280,
            height: 800,
            transform: `scale(${PAGE_FRAME_WIDTH / 1280})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
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

// ─── Link Parsing ────────────────────────────────────────────

/**
 * Parse <Link to="..."> references from app files to build edges between pages.
 */
function parsePageLinks(
  appFiles: { path: string; content: string }[],
  routes: AppRoute[]
): { source: string; target: string }[] {
  const routePaths = new Set(routes.map((r) => r.path))
  const links: { source: string; target: string }[] = []
  const seen = new Set<string>()

  // Map file paths to route paths
  const fileToRoute = new Map<string, string>()
  for (const route of routes) {
    // Convention: /about → src/pages/About.tsx or similar
    const slug = route.path === '/' ? 'Home' : route.path.replace(/^\//, '').split('/').map(
      s => s.charAt(0).toUpperCase() + s.slice(1)
    ).join('')
    // Try to find the file that defines this page
    for (const f of appFiles) {
      if (f.path.toLowerCase().includes(slug.toLowerCase()) && f.path.endsWith('.tsx')) {
        fileToRoute.set(f.path, route.path)
      }
    }
  }
  // Also map App.tsx to "/" for links in the layout
  const appFile = appFiles.find(f => f.path === 'src/App.tsx')
  if (appFile) fileToRoute.set(appFile.path, '/')

  // Find <Link to="..."> patterns in each file
  const linkPattern = /<Link\s+[^>]*to\s*=\s*["']([^"']+)["']/g
  const navLinkPattern = /<NavLink\s+[^>]*to\s*=\s*["']([^"']+)["']/g

  for (const file of appFiles) {
    const sourceRoute = fileToRoute.get(file.path)
    if (!sourceRoute) continue

    for (const pattern of [linkPattern, navLinkPattern]) {
      pattern.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = pattern.exec(file.content)) !== null) {
        const targetPath = match[1]
        if (routePaths.has(targetPath) && targetPath !== sourceRoute) {
          const key = `${sourceRoute}->${targetPath}`
          if (!seen.has(key)) {
            seen.add(key)
            links.push({ source: sourceRoute, target: targetPath })
          }
        }
      }
    }
  }

  return links
}

// ─── Layout Helper ───────────────────────────────────────────

const GRID_COLS = 3
const GAP_X = 80
const GAP_Y = 80

function layoutPageNodes(
  routes: AppRoute[],
  serverUrl: string,
  onFocusPage: (path: string) => void
): Node[] {
  return routes.map((route, i) => {
    const col = i % GRID_COLS
    const row = Math.floor(i / GRID_COLS)
    return {
      id: `page-${route.path}`,
      type: 'pageFrame',
      position: {
        x: col * (PAGE_FRAME_WIDTH + GAP_X),
        y: row * (PAGE_FRAME_HEIGHT + 36 + GAP_Y),
      },
      data: { route, serverUrl, onFocusPage } as PageNodeData,
      draggable: true,
      selectable: true,
    }
  })
}

function buildPageEdges(
  links: { source: string; target: string }[]
): Edge[] {
  return links.map((link, i) => ({
    id: `link-${i}`,
    source: `page-${link.source}`,
    target: `page-${link.target}`,
    type: 'default',
    animated: true,
    style: { stroke: 'hsl(var(--primary) / 0.3)', strokeWidth: 1.5 },
  }))
}

// ─── Canvas Inner ────────────────────────────────────────────

function DesignCanvasInner({
  routes,
  serverUrl,
  appFiles,
  onFocusPage,
}: {
  routes: AppRoute[]
  serverUrl: string
  appFiles: { path: string; content: string }[]
  onFocusPage: (path: string) => void
}) {
  const { fitView } = useReactFlow()

  const nodes = useMemo(
    () => layoutPageNodes(routes, serverUrl, onFocusPage),
    [routes, serverUrl, onFocusPage]
  )

  const links = useMemo(() => parsePageLinks(appFiles, routes), [appFiles, routes])
  const edges = useMemo(() => buildPageEdges(links), [links])

  const [flowNodes, setFlowNodes] = useState<Node[]>(nodes)

  // Update nodes when routes change
  useEffect(() => {
    setFlowNodes(nodes)
  }, [nodes])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setFlowNodes((nds) => applyNodeChanges(changes, nds))
    },
    []
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
  routes,
  serverUrl,
  appFiles,
  onFocusPage,
}: {
  routes: AppRoute[]
  serverUrl: string
  appFiles: { path: string; content: string }[]
  onFocusPage: (path: string) => void
}) {
  if (routes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p className="text-sm">No pages detected. Generate an app first.</p>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <DesignCanvasInner
        routes={routes}
        serverUrl={serverUrl}
        appFiles={appFiles}
        onFocusPage={onFocusPage}
      />
    </ReactFlowProvider>
  )
}
