'use client'

import { memo } from 'react'
import { ScrollText } from 'lucide-react'
import { BasePlanNode } from './base-plan-node'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'

export const SpecNode = memo(function SpecNode({ id, data }: NodeProps) {
  return (
    <BasePlanNode
      id={id}
      data={data as unknown as PlanNodeData}
      icon={<ScrollText className="h-3 w-3" />}
    />
  )
})
