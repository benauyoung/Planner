'use client'

import { useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { NODE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { NodeType, NodePRD } from '@/types/project'

interface FlatPrd {
  nodeId: string
  nodeTitle: string
  nodeType: NodeType
  prd: NodePRD
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function PrdBottomStrip() {
  const currentProject = useProjectStore((s) => s.currentProject)
  const selectNode = useUIStore((s) => s.selectNode)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Flatten all PRDs across all nodes, sorted by updatedAt (newest last = right side)
  const flatPrds = useMemo<FlatPrd[]>(() => {
    if (!currentProject) return []
    const all: FlatPrd[] = []
    for (const node of currentProject.nodes) {
      if (!node.prds || node.prds.length === 0) continue
      for (const prd of node.prds) {
        all.push({
          nodeId: node.id,
          nodeTitle: node.title,
          nodeType: node.type,
          prd,
        })
      }
    }
    return all.sort((a, b) => a.prd.updatedAt - b.prd.updatedAt)
  }, [currentProject])

  // Auto-scroll to the right when new PRDs arrive
  const prevCountRef = useRef(flatPrds.length)
  useEffect(() => {
    if (flatPrds.length > prevCountRef.current && scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: 'smooth',
      })
    }
    prevCountRef.current = flatPrds.length
  }, [flatPrds.length])

  if (flatPrds.length === 0) return null

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      {/* Fade gradient at top edge */}
      <div className="h-4 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
      <div className="bg-background/80 backdrop-blur-sm border-t px-3 py-2">
        <div className="flex items-center gap-2 mb-1.5">
          <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            PRDs ({flatPrds.length})
          </span>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
        >
          <AnimatePresence initial={false}>
            {flatPrds.map((item) => {
              const config = NODE_CONFIG[item.nodeType]
              return (
                <motion.button
                  key={`${item.nodeId}:${item.prd.id}`}
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  onClick={() => selectNode(item.nodeId)}
                  className={cn(
                    'group flex items-center gap-2 shrink-0 rounded-lg border px-3 py-2',
                    'bg-background hover:bg-accent/50 transition-colors cursor-pointer',
                    'text-left min-w-0 max-w-[220px]',
                  )}
                  title={`${item.prd.title} — ${item.nodeTitle}`}
                >
                  {/* Type color bar */}
                  <div
                    className="w-1 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium truncate">
                        {item.prd.title}
                      </span>
                      {item.prd.isStale && (
                        <AlertTriangle className="h-3 w-3 text-orange-400 shrink-0" />
                      )}
                      {!item.prd.isStale && (
                        <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={cn('text-[9px] font-medium', config.textClass)}>
                        {config.label}
                      </span>
                      <span className="text-[9px] text-muted-foreground/60">
                        {timeAgo(item.prd.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
