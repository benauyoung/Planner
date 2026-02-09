'use client'

import { useEffect, useRef } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useProjectStore } from '@/stores/project-store'
import { useChatStore } from '@/stores/chat-store'
import { useAuth } from '@/contexts/auth-context'
import { PlanningChat } from '@/components/chat/planning-chat'
import { GraphCanvas } from '@/components/canvas/graph-canvas'
import { NodeDetailPanel } from '@/components/panels/node-detail-panel'
import { ProjectOnboarding } from '@/components/onboarding/project-onboarding'
import { TimelineBar } from '@/components/canvas/timeline-bar'
import type { OnboardingAnswers } from '@/types/chat'

function NewProjectContent() {
  const initDraftProject = useProjectStore((s) => s.initDraftProject)
  const flowNodes = useProjectStore((s) => s.flowNodes)
  const phase = useChatStore((s) => s.phase)
  const setOnboardingAnswers = useChatStore((s) => s.setOnboardingAnswers)
  const setPhase = useChatStore((s) => s.setPhase)
  const { user } = useAuth()
  const initRef = useRef(false)

  useEffect(() => {
    if (!initRef.current && user) {
      initRef.current = true
      initDraftProject(user.uid)
    }
  }, [initDraftProject, user])

  const handleOnboardingComplete = (answers: OnboardingAnswers) => {
    setOnboardingAnswers(answers)
    setPhase('greeting')
  }

  if (phase === 'onboarding') {
    return <ProjectOnboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="h-full flex">
      <div className="w-96 shrink-0 border-r">
        <PlanningChat />
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {flowNodes.length > 0 && <TimelineBar />}
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
      <NodeDetailPanel />
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
