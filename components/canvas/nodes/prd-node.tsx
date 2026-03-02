'use client'

import { memo } from 'react'
import { ClipboardList } from 'lucide-react'
import { BasePlanNode } from './base-plan-node'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'

export const PrdNode = memo(function PrdNode({ id, data }: NodeProps) {
  return (
    <BasePlanNode
      id={id}
      data={data as unknown as PlanNodeData}
      icon={<ClipboardList className="h-3 w-3" />}
    />
  )
})
