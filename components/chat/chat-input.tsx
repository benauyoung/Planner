'use client'

import { useState, useRef, type KeyboardEvent } from 'react'
import { ArrowUp, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { NODE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = 'Describe your project idea...' }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedNodeId = useUIStore((s) => s.selectedNodeId)
  const closeDetailPanel = useUIStore((s) => s.closeDetailPanel)
  const currentProject = useProjectStore((s) => s.currentProject)

  const focusedNode = selectedNodeId
    ? currentProject?.nodes.find((n) => n.id === selectedNodeId)
    : null

  const activePlaceholder = focusedNode
    ? `Ask about "${focusedNode.title}"...`
    : placeholder

  const handleSend = () => {
    if (!value.trim() || disabled) return
    onSend(value.trim())
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
    }
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div className="border-t bg-background/80 backdrop-blur-sm">
      <AnimatePresence>
        {focusedNode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
              <span className="text-xs text-muted-foreground">Focused on:</span>
              <Badge variant="secondary" className={NODE_CONFIG[focusedNode.type].badgeClass + ' text-xs gap-1'}>
                {focusedNode.title}
                <button
                  onClick={closeDetailPanel}
                  className="ml-0.5 hover:opacity-70"
                  aria-label="Clear focus"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="p-4">
        <div
          className={cn(
            'relative flex items-end gap-2 rounded-xl border bg-background p-1 transition-all duration-200',
            isFocused
              ? 'border-violet-500/50 ring-2 ring-violet-500/20 shadow-[0_0_15px_-3px_rgba(139,92,246,0.15)]'
              : 'border-border hover:border-border/80'
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={activePlaceholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-foreground px-3 py-2 text-sm
              placeholder:text-muted-foreground
              focus-visible:outline-none
              disabled:cursor-not-allowed disabled:opacity-50"
          />
          <motion.button
            onClick={handleSend}
            disabled={!canSend}
            whileTap={canSend ? { scale: 0.9 } : undefined}
            className={cn(
              'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
              canSend
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:brightness-110 cursor-pointer'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </motion.button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
          Shift + Enter for new line
        </p>
      </div>
    </div>
  )
}
