'use client'

import { useState } from 'react'
import { Mail, Check, Loader2 } from 'lucide-react'
import { addEmailToWaitlist } from '@/services/firestore'
import { cn } from '@/lib/utils'
import { track } from '@vercel/analytics'

interface WaitlistCaptureProps {
  source: 'landing' | 'login'
  className?: string
}

export function WaitlistCapture({ source, className }: WaitlistCaptureProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      await addEmailToWaitlist(email.trim(), source)
      track('waitlist_signup', { source })
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={cn('mt-4 flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400', className)}>
        <Check className="h-4 w-4" />
        <span>Thanks! We&apos;ll keep you in the loop.</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('mt-4', className)}>
      <p className="text-xs text-muted-foreground mb-2">
        Want to hear more? Drop your email below.
      </p>
      <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
        <div className="relative flex-1">
          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
            className={cn(
              'w-full pl-8 pr-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors',
              status === 'error' && 'border-red-400 focus:ring-red-400'
            )}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Notify Me'
          )}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-500 mt-1.5">Please enter a valid email address.</p>
      )}
    </form>
  )
}
