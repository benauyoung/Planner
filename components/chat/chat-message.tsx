'use client'

import { motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

interface ChatMessageProps {
  message: ChatMessageType
  isLatest?: boolean
}

export function ChatMessage({ message, isLatest }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {!isUser && (
          <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 blur-[6px] opacity-40" />
        )}
        <div
          className={cn(
            'relative w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-background transition-shadow',
            isUser
              ? 'bg-foreground text-background ring-foreground/20'
              : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white ring-violet-500/30'
          )}
        >
          {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
        </div>
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-foreground text-background rounded-tr-md'
            : 'bg-gradient-to-br from-secondary/80 to-secondary border border-border/50 text-foreground rounded-tl-md'
        )}
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            code: ({ children }) => (
              <code className="px-1.5 py-0.5 rounded-md bg-muted text-xs font-mono">{children}</code>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </motion.div>
  )
}
