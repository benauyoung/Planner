'use client'

import { memo } from 'react'
import { ImagePlus } from 'lucide-react'
import { BasePlanNode } from './base-plan-node'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'

export const MoodboardNode = memo(function MoodboardNode({ id, data }: NodeProps) {
  return (
    <BasePlanNode
      id={id}
      data={data as unknown as PlanNodeData}
      icon={<ImagePlus className="h-3 w-3" />}
    />
  )
})
