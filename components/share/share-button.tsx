'use client'

import { useState } from 'react'
import { Share2, Link2, Check, Globe, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/stores/project-store'

export function ShareButton() {
  const currentProject = useProjectStore((s) => s.currentProject)
  const toggleShareProject = useProjectStore((s) => s.toggleShareProject)
  const [copied, setCopied] = useState(false)
  const [showPopover, setShowPopover] = useState(false)

  if (!currentProject) return null

  const isPublic = currentProject.isPublic ?? false
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${currentProject.shareId || currentProject.id}`
    : ''

  const handleToggle = () => {
    toggleShareProject()
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPopover(!showPopover)}
        className="gap-1.5"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </Button>

      {showPopover && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPopover(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-background border rounded-lg shadow-lg z-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Share this plan</span>
              <button
                onClick={() => setShowPopover(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            {/* Toggle */}
            <button
              onClick={handleToggle}
              className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent transition-colors mb-2"
            >
              {isPublic ? (
                <Globe className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <div className="text-left flex-1">
                <div className="text-sm font-medium">
                  {isPublic ? 'Public' : 'Private'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isPublic
                    ? 'Anyone with the link can view'
                    : 'Only you can access'}
                </div>
              </div>
              <div
                className={`w-9 h-5 rounded-full transition-colors ${
                  isPublic ? 'bg-green-500' : 'bg-muted'
                } relative`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </button>

            {/* Copy Link */}
            {isPublic && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-xs px-2 py-1.5 border rounded bg-muted/50 truncate"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="shrink-0 gap-1"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Link2 className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
