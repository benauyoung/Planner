'use client'

import { memo } from 'react'
import { Terminal } from 'lucide-react'
import { BasePlanNode } from './base-plan-node'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'

export const PromptNode = memo(function PromptNode({ id, data }: NodeProps) {
  return (
    <BasePlanNode
      id={id}
      data={data as unknown as PlanNodeData}
      icon={<Terminal className="h-3 w-3" />}
    />
  )
})
