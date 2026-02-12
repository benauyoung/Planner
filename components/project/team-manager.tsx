'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Users, Trash2 } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { AssigneeAvatar } from '@/components/ui/assignee-picker'
import { Button } from '@/components/ui/button'
import { generateId } from '@/lib/id'
import type { TeamMember } from '@/types/project'

const MEMBER_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
]

interface TeamManagerProps {
  open: boolean
  onClose: () => void
}

export function TeamManager({ open, onClose }: TeamManagerProps) {
  const team = useProjectStore((s) => s.currentProject?.team || [])
  const addTeamMember = useProjectStore((s) => s.addTeamMember)
  const removeTeamMember = useProjectStore((s) => s.removeTeamMember)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleAdd = () => {
    if (!name.trim()) return
    const member: TeamMember = {
      id: generateId(),
      name: name.trim(),
      email: email.trim(),
      color: MEMBER_COLORS[team.length % MEMBER_COLORS.length],
    }
    addTeamMember(member)
    setName('')
    setEmail('')
  }

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
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-md z-[101]"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-background border rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">Team Members</h2>
                  <span className="text-xs text-muted-foreground">({team.length})</span>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Add member form */}
              <div className="px-5 py-3 border-b space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="flex-1 h-8 px-3 text-sm bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="flex-1 h-8 px-3 text-sm bg-muted rounded border-0 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                  />
                  <Button size="sm" className="h-8 gap-1" onClick={handleAdd} disabled={!name.trim()}>
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Member list */}
              <div className="max-h-60 overflow-y-auto">
                {team.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No team members yet. Add someone above.
                  </div>
                )}
                {team.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/50 transition-colors">
                    <AssigneeAvatar member={member} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      {member.email && (
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeTeamMember(member.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
