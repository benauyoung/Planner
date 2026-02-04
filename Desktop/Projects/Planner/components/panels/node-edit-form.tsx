'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useProjectStore } from '@/stores/project-store'

interface NodeEditFormProps {
  nodeId: string
  title: string
  description: string
}

export function NodeEditForm({ nodeId, title, description }: NodeEditFormProps) {
  const updateNodeContent = useProjectStore((s) => s.updateNodeContent)
  const [editTitle, setEditTitle] = useState(title)
  const [editDescription, setEditDescription] = useState(description)

  useEffect(() => {
    setEditTitle(title)
    setEditDescription(description)
  }, [title, description])

  const handleBlur = () => {
    if (editTitle !== title || editDescription !== description) {
      updateNodeContent(nodeId, editTitle, editDescription)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Title
        </label>
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleBlur}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Description
        </label>
        <Textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          onBlur={handleBlur}
          rows={3}
        />
      </div>
    </div>
  )
}
