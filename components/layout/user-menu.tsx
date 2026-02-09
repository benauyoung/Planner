'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const displayName = user.displayName || user.email || 'User'
  const photoURL = user.photoURL

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full hover:bg-muted/50 p-1 transition-colors"
      >
        {photoURL ? (
          <img src={photoURL} alt="" className="h-7 w-7 rounded-full" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-md border bg-popover p-1 shadow-md z-50">
          <div className="px-3 py-2 border-b mb-1">
            <p className="text-sm font-medium truncate">{displayName}</p>
            {user.email && user.displayName && (
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
          <button
            onClick={() => { setOpen(false); signOut() }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-sm hover:bg-muted/50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
