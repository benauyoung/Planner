'use client'

import { memo } from 'react'
import { Braces } from 'lucide-react'
import { BasePlanNode } from './base-plan-node'
import type { NodeProps } from '@xyflow/react'
import type { PlanNodeData } from '@/types/canvas'

export const SchemaNode = memo(function SchemaNode({ id, data }: NodeProps) {
  return (
    <BasePlanNode
      id={id}
      data={data as unknown as PlanNodeData}
      icon={<Braces className="h-3 w-3" />}
    />
  )
})
