'use client'

import { memo } from 'react'
import { Flag } from 'lucide-react'
import { BasePlanNode } from './base-plan-node'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'

export const SubgoalNode = memo(function SubgoalNode({ id, data }: NodeProps) {
  return (
    <BasePlanNode
      id={id}
      data={data as unknown as PlanNodeData}
      icon={<Flag className="h-3 w-3" />}
    />
  )
})
