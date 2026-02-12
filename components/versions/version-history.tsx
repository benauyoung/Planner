'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, History, Trash2, RotateCcw, Check, GitBranch } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ProjectVersion } from '@/types/project'

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface VersionHistoryProps {
  open: boolean
  onClose: () => void
}

export function VersionHistory({ open, onClose }: VersionHistoryProps) {
  const versions = useProjectStore((s) => s.currentProject?.versions || [])
  const currentVersionId = useProjectStore((s) => s.currentProject?.currentVersionId)
  const nodeCount = useProjectStore((s) => s.currentProject?.nodes.length || 0)
  const saveVersion = useProjectStore((s) => s.saveVersion)
  const restoreVersion = useProjectStore((s) => s.restoreVersion)
  const deleteVersion = useProjectStore((s) => s.deleteVersion)

  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null)

  const handleSave = () => {
    if (!name.trim()) return
    saveVersion(name.trim())
    setName('')
    setCreating(false)
  }

  const handleRestore = (versionId: string) => {
    restoreVersion(versionId)
    setConfirmRestore(null)
  }

  const sorted = [...versions].sort((a, b) => b.createdAt - a.createdAt)

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101]"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-background border rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">Version History</h2>
                  <span className="text-xs text-muted-foreground">({versions.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  {!creating && (
                    <Button size="sm" variant="outline" className="gap-1 h-7" onClick={() => setCreating(true)}>
                      <Plus className="h-3 w-3" />
                      Save Version
                    </Button>
                  )}
                  <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Save form */}
              {creating && (
                <div className="px-5 py-3 border-b flex gap-2">
                  <input
                    type="text"
                    placeholder="Version name (e.g. v1.0, Before refactor)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="flex-1 h-8 px-3 text-sm bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                    autoFocus
                  />
                  <Button size="sm" className="h-8" onClick={handleSave} disabled={!name.trim()}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setCreating(false)}>Cancel</Button>
                </div>
              )}

              {/* Version list */}
              <div className="max-h-80 overflow-y-auto">
                {sorted.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No saved versions yet. Save a version to create a snapshot of your current plan.
                  </div>
                )}
                {sorted.map((version) => {
                  const isCurrent = version.id === currentVersionId
                  const isConfirming = confirmRestore === version.id

                  return (
                    <div
                      key={version.id}
                      className={cn(
                        'flex items-center gap-3 px-5 py-3 border-b hover:bg-muted/30 transition-colors',
                        isCurrent && 'bg-primary/5'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                        isCurrent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      )}>
                        {isCurrent ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <GitBranch className="h-3.5 w-3.5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{version.name}</p>
                          {isCurrent && (
                            <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {version.snapshot.nodes.length} nodes · {timeAgo(version.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!isCurrent && (
                          <>
                            {isConfirming ? (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-amber-500 mr-1">Restore?</span>
                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => handleRestore(version.id)}>
                                  Yes
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => setConfirmRestore(null)}>
                                  No
                                </Button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmRestore(version.id)}
                                className="text-muted-foreground hover:text-primary transition-colors p-1"
                                title="Restore this version"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => deleteVersion(version.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                          title="Delete version"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="px-5 py-2.5 border-t bg-muted/20">
                <p className="text-[10px] text-muted-foreground">
                  Current plan: {nodeCount} nodes · Versions save a full snapshot that can be restored later.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
