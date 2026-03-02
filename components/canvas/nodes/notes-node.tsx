'use client'

import { memo } from 'react'
import { FileText } from 'lucide-react'
import { BasePlanNode } from './base-plan-node'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'

export const NotesNode = memo(function NotesNode({ id, data }: NodeProps) {
  return (
    <BasePlanNode
      id={id}
      data={data as unknown as PlanNodeData}
      icon={<FileText className="h-3 w-3" />}
    />
  )
})
