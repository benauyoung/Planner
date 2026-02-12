'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReactFlowProvider } from '@xyflow/react'
import { ArrowRight, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useProjectStore } from '@/stores/project-store'
import { useChatStore } from '@/stores/chat-store'
import { useEffectiveUserId } from '@/contexts/auth-context'
import { useProject } from '@/hooks/use-project'
import { PlanningChat } from '@/components/chat/planning-chat'
import { GraphCanvas } from '@/components/canvas/graph-canvas'
import { NodeDetailPanel } from '@/components/panels/node-detail-panel'
import { ProjectOnboarding } from '@/components/onboarding/project-onboarding'
import { NewProjectChooser } from '@/components/onboarding/new-project-chooser'
import { TemplateGallery } from '@/components/onboarding/template-gallery'
import { ImportMarkdownModal } from '@/components/dashboard/import-markdown-modal'
import { Button } from '@/components/ui/button'
import type { OnboardingAnswers } from '@/types/chat'

type NewProjectMode = 'chooser' | 'ai' | 'template' | 'import'

function NewProjectContent() {
  const router = useRouter()
  const initDraftProject = useProjectStore((s) => s.initDraftProject)
  const currentProject = useProjectStore((s) => s.currentProject)
  const flowNodes = useProjectStore((s) => s.flowNodes)
  const phase = useChatStore((s) => s.phase)
  const setOnboardingAnswers = useChatStore((s) => s.setOnboardingAnswers)
  const setPhase = useChatStore((s) => s.setPhase)
  const userId = useEffectiveUserId()
  const initRef = useRef(false)
  const [mode, setMode] = useState<NewProjectMode>('chooser')
  const [saving, setSaving] = useState(false)
  const { saveProject } = useProject()

  const handleSaveAndOpen = async () => {
    if (!currentProject || saving) return
    setSaving(true)
    const activatedProject = {
      ...currentProject,
      phase: 'active' as const,
      updatedAt: Date.now(),
    }
    useProjectStore.getState().setCurrentProject(activatedProject)
    useProjectStore.getState().addProject(activatedProject)
    await saveProject(activatedProject)
    router.push(`/project/${activatedProject.id}`)
  }

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true
      useChatStore.getState().reset()
      initDraftProject(userId)
    }
  }, [initDraftProject, userId])

  const handleOnboardingComplete = (answers: OnboardingAnswers) => {
    setOnboardingAnswers(answers)
    setPhase('greeting')
  }

  const handleChooseAI = () => {
    setMode('ai')
  }

  // Chooser screen
  if (mode === 'chooser') {
    return (
      <NewProjectChooser
        onChooseAI={handleChooseAI}
        onChooseTemplate={() => setMode('template')}
        onChooseImport={() => setMode('import')}
      />
    )
  }

  // Template gallery
  if (mode === 'template') {
    return <TemplateGallery onBack={() => setMode('chooser')} />
  }

  // Import modal (rendered over chooser)
  if (mode === 'import') {
    return (
      <>
        <NewProjectChooser
          onChooseAI={handleChooseAI}
          onChooseTemplate={() => setMode('template')}
          onChooseImport={() => setMode('import')}
        />
        <ImportMarkdownModal open onClose={() => setMode('chooser')} />
      </>
    )
  }

  // AI onboarding flow
  if (phase === 'onboarding') {
    return <ProjectOnboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header bar */}
      <div className="h-10 border-b bg-background/90 backdrop-blur-sm flex items-center px-3 gap-2 shrink-0">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Back to dashboard">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        </Link>
        <span className="text-sm font-semibold truncate">
          {currentProject?.title || 'New Project'}
        </span>
        <div className="flex-1" />
        {flowNodes.length > 0 && (
          <Button
            onClick={handleSaveAndOpen}
            disabled={saving}
            size="sm"
            className="gap-1.5 h-7"
          >
            {saving ? (
              <>
                <Save className="h-3.5 w-3.5 animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <ArrowRight className="h-3.5 w-3.5" />
                Save &amp; Open Workspace
              </>
            )}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex min-h-0">
        <div className="w-96 shrink-0 border-r">
          <PlanningChat />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
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
