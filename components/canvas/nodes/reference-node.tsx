'use client'

import { memo } from 'react'
import { ExternalLink } from 'lucide-react'
import { BasePlanNode } from './base-plan-node'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'

export const ReferenceNode = memo(function ReferenceNode({ id, data }: NodeProps) {
  return (
    <BasePlanNode
      id={id}
      data={data as unknown as PlanNodeData}
      icon={<ExternalLink className="h-3 w-3" />}
    />
  )
})
