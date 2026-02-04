'use client'

import { memo } from 'react'
import { Puzzle } from 'lucide-react'
import { BasePlanNode } from './base-plan-node'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'

export const FeatureNode = memo(function FeatureNode({ id, data }: NodeProps) {
  return (
    <BasePlanNode
      id={id}
      data={data as unknown as PlanNodeData}
      icon={<Puzzle className="h-3 w-3" />}
    />
  )
})
