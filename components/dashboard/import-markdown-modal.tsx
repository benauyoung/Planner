'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Upload, FileText, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/stores/project-store'
import { useEffectiveUserId } from '@/contexts/auth-context'
import { parseMarkdownToNodes, parseFrontmatterNodes } from '@/lib/import-markdown'
import { importProjectFromJSON, readFileAsText } from '@/lib/export-import'
import * as persistence from '@/services/persistence'

interface ImportMarkdownModalProps {
  open: boolean
  onClose: () => void
}

export function ImportMarkdownModal({ open, onClose }: ImportMarkdownModalProps) {
  const router = useRouter()
  const userId = useEffectiveUserId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [markdownText, setMarkdownText] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ goals: number; subgoals: number; features: number; tasks: number } | null>(null)

  const handleTextChange = useCallback((text: string) => {
    setMarkdownText(text)
    setError(null)

    if (text.trim().length === 0) {
      setPreview(null)
      return
    }

    // Try to parse and show preview
    try {
      const nodes = parseFrontmatterNodes(text) || parseMarkdownToNodes(text)
      setPreview({
        goals: nodes.filter((n) => n.type === 'goal').length,
        subgoals: nodes.filter((n) => n.type === 'subgoal').length,
        features: nodes.filter((n) => n.type === 'feature').length,
        tasks: nodes.filter((n) => n.type === 'task').length,
      })
    } catch {
      setPreview(null)
    }
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await readFileAsText(file)

      // Check if it's a JSON file (VisionPath export)
      if (file.name.endsWith('.json')) {
        setImporting(true)
        const project = importProjectFromJSON(text, userId)
        await persistence.createProject(project)
        useProjectStore.getState().addProject(project)
        router.push(`/project/${project.id}`)
        onClose()
        return
      }

      // Markdown file
      setMarkdownText(text)
      handleTextChange(text)

      // Auto-set title from filename
      if (!projectTitle) {
        const name = file.name.replace(/\.(md|markdown|txt)$/i, '').replace(/[-_]/g, ' ')
        setProjectTitle(name.charAt(0).toUpperCase() + name.slice(1))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleImport = async () => {
    if (!markdownText.trim()) {
      setError('Please paste or upload markdown content')
      return
    }

    setImporting(true)
    setError(null)

    try {
      const nodes = parseFrontmatterNodes(markdownText) || parseMarkdownToNodes(markdownText)

      if (nodes.length === 0) {
        setError('No nodes could be parsed from this markdown. Try a file with headings (# ## ###) or checklists (- [ ] items).')
        setImporting(false)
        return
      }

      const title = projectTitle.trim() || 'Imported Plan'
      const project = useProjectStore.getState().ingestPlan(
        { title, description: `Imported from markdown (${nodes.length} nodes)`, nodes },
        userId
      )

      await persistence.createProject(project)
      useProjectStore.getState().addProject(project)
      router.push(`/project/${project.id}`)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import')
    } finally {
      setImporting(false)
    }
  }

  const totalNodes = preview ? preview.goals + preview.subgoals + preview.features + preview.tasks : 0

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-background border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-lg font-semibold">Import from Markdown</h2>
                <p className="text-sm text-muted-foreground">
                  Paste a plan.md, requirements.md, or any structured markdown
                </p>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-accent rounded-md">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Project Title */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Project Title</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="My Imported Plan"
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* File Upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown,.txt,.json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload .md or .json file
                </Button>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex-1 h-px bg-border" />
                <span>or paste markdown below</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Markdown Textarea */}
              <textarea
                value={markdownText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={`# My Project\n\n## Authentication\n\n### User Login\n- [ ] Email/password login\n- [ ] OAuth with Google\n- [ ] JWT token management\n\n### User Registration\n- [ ] Registration form\n- [ ] Email verification\n- [ ] Profile creation`}
                className="w-full h-64 px-3 py-2 text-sm font-mono border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />

              {/* Preview */}
              {preview && totalNodes > 0 && (
                <div className="flex items-center gap-3 px-3 py-2 bg-accent/50 rounded-lg text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>
                    Detected <strong>{totalNodes} nodes</strong>:
                    {preview.goals > 0 && ` ${preview.goals} goals,`}
                    {preview.subgoals > 0 && ` ${preview.subgoals} subgoals,`}
                    {preview.features > 0 && ` ${preview.features} features,`}
                    {preview.tasks > 0 && ` ${preview.tasks} tasks`}
                  </span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/30 rounded-lg text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={importing || !markdownText.trim()}
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Import {totalNodes > 0 ? `(${totalNodes} nodes)` : ''}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
