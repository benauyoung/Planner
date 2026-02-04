'use client'

import { useEffect, useRef } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useProjectStore } from '@/stores/project-store'
import { PlanningChat } from '@/components/chat/planning-chat'
import { GraphCanvas } from '@/components/canvas/graph-canvas'

function NewProjectContent() {
  const initDraftProject = useProjectStore((s) => s.initDraftProject)
  const flowNodes = useProjectStore((s) => s.flowNodes)
  const initRef = useRef(false)

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true
      initDraftProject()
    }
  }, [initDraftProject])

  return (
    <div className="h-full flex">
      <div className="w-96 shrink-0 border-r">
        <PlanningChat />
      </div>
      <div className="flex-1 relative">
        {flowNodes.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">Your plan will appear here</p>
              <p className="text-sm mt-1">
                Describe your project idea in the chat to get started
              </p>
            </div>
          </div>
        ) : (
          <GraphCanvas />
        )}
      </div>
    </div>
  )
}

export default function NewProjectPage() {
  return (
    <ReactFlowProvider>
      <NewProjectContent />
    </ReactFlowProvider>
  )
}
