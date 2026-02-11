'use client'

import { useRouter } from 'next/navigation'
import { Layout, Shield, Server, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useProjectStore } from '@/stores/project-store'
import { useEffectiveUserId } from '@/contexts/auth-context'
import { TEMPLATES } from '@/lib/templates'
import type { PlanTemplate } from '@/lib/templates'
import * as persistence from '@/services/persistence'

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  'SaaS Authentication System': <Shield className="h-5 w-5" />,
  'REST API with CRUD Operations': <Server className="h-5 w-5" />,
  'Marketing Landing Page': <Layout className="h-5 w-5" />,
}

interface TemplateGalleryProps {
  onBack: () => void
}

export function TemplateGallery({ onBack }: TemplateGalleryProps) {
  const router = useRouter()
  const userId = useEffectiveUserId()

  const handleUseTemplate = async (template: PlanTemplate) => {
    const project = useProjectStore.getState().ingestPlan(
      {
        title: template.title,
        description: template.description,
        nodes: template.nodes,
      },
      userId
    )
    await persistence.createProject(project)
    useProjectStore.getState().addProject(project)
    router.push(`/project/${project.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Start from a Template</h1>
        <p className="text-muted-foreground mt-1">
          Choose a pre-built plan and customize it for your project.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <Card
            key={template.title}
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => handleUseTemplate(template)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  {TEMPLATE_ICONS[template.title] || <Layout className="h-5 w-5" />}
                </div>
                <CardTitle className="text-base">{template.title}</CardTitle>
              </div>
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {template.nodeCount} nodes
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
