'use client'

import { useState, useRef, type KeyboardEvent } from 'react'
import { Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/stores/ui-store'
import { useProjectStore } from '@/stores/project-store'
import { NODE_CONFIG } from '@/lib/constants'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = 'Describe your project idea...' }: ChatInputProps) {
  const [value, setValue] = useState('')
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

  return (
    <div className="border-t bg-background">
      {focusedNode && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <span className="text-xs text-muted-foreground">Focused on:</span>
          <Badge variant="secondary" className={NODE_CONFIG[focusedNode.type].badgeClass + ' text-xs gap-1'}>
            {focusedNode.title}
            <button
              onClick={closeDetailPanel}
              className="ml-0.5 hover:opacity-70"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
      <div className="flex items-end gap-2 p-4">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={activePlaceholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border bg-background px-3 py-2.5 text-sm
            placeholder:text-muted-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
            disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
