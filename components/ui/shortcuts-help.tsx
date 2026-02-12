'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const SHORTCUT_GROUPS = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['⌘', 'K'], desc: 'Command palette' },
      { keys: ['?'], desc: 'Show this help' },
      { keys: ['⌘', 'Z'], desc: 'Undo' },
      { keys: ['⌘', '⇧', 'Z'], desc: 'Redo' },
      { keys: ['Esc'], desc: 'Close panel / deselect' },
    ],
  },
  {
    title: 'Canvas',
    shortcuts: [
      { keys: ['⌘', 'L'], desc: 'Re-layout' },
      { keys: ['⌘', '0'], desc: 'Zoom to fit' },
      { keys: ['⌘', 'B'], desc: 'Toggle blast radius' },
      { keys: ['⌘', 'E'], desc: 'Toggle detail panel' },
      { keys: ['⌘', 'J'], desc: 'Toggle chat panel' },
    ],
  },
  {
    title: 'Node (when selected)',
    shortcuts: [
      { keys: ['Del'], desc: 'Delete node' },
      { keys: ['⌘', 'D'], desc: 'Duplicate node' },
      { keys: ['1'], desc: 'Status: Not Started' },
      { keys: ['2'], desc: 'Status: In Progress' },
      { keys: ['3'], desc: 'Status: Completed' },
      { keys: ['4'], desc: 'Status: Blocked' },
    ],
  },
]

interface ShortcutsHelpProps {
  open: boolean
  onClose: () => void
}

export function ShortcutsHelp({ open, onClose }: ShortcutsHelpProps) {
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
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-md z-[101]"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-background border rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b">
                <h2 className="text-sm font-semibold">Keyboard Shortcuts</h2>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-5">
                {SHORTCUT_GROUPS.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      {group.title}
                    </h3>
                    <div className="space-y-1.5">
                      {group.shortcuts.map((s) => (
                        <div
                          key={s.desc}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">{s.desc}</span>
                          <div className="flex items-center gap-0.5">
                            {s.keys.map((key, i) => (
                              <kbd
                                key={i}
                                className="min-w-[22px] px-1.5 py-0.5 bg-muted text-center rounded text-[11px] font-mono"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
