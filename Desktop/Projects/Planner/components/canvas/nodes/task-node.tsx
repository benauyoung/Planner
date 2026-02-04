'use client'

import { memo } from 'react'
import { CheckSquare } from 'lucide-react'
import { BasePlanNode } from './base-plan-node'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'

export const TaskNode = memo(function TaskNode({ id, data }: NodeProps) {
  return (
    <BasePlanNode
      id={id}
      data={data as unknown as PlanNodeData}
      icon={<CheckSquare className="h-3 w-3" />}
    />
  )
})
