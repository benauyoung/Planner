'use client'

import { useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { cn } from '@/lib/utils'
import type { NodeComment } from '@/types/project'

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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface CommentThreadProps {
  nodeId: string
  comments: NodeComment[]
}

export function CommentThread({ nodeId, comments }: CommentThreadProps) {
  const addNodeComment = useProjectStore((s) => s.addNodeComment)
  const deleteNodeComment = useProjectStore((s) => s.deleteNodeComment)
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    const content = input.trim()
    if (!content) return
    addNodeComment(nodeId, 'You', '#3b82f6', content)
    setInput('')
  }

  return (
    <div className="space-y-3">
      {/* Comment list */}
      {comments.length > 0 && (
        <div className="space-y-2.5 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="group flex gap-2">
              {/* Avatar */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium text-white shrink-0 mt-0.5"
                style={{ backgroundColor: comment.authorColor }}
              >
                {getInitials(comment.authorName)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium">{comment.authorName}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo(comment.createdAt)}
                  </span>
                  <button
                    onClick={() => deleteNodeComment(nodeId, comment.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {comments.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">No comments yet</p>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Add a comment..."
          className="flex-1 h-8 px-3 text-xs bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className={cn(
            'h-8 w-8 rounded flex items-center justify-center transition-colors',
            input.trim()
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
