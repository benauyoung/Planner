'use client'

import { MessageSquare, Layout, FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface NewProjectChooserProps {
  onChooseAI: () => void
  onChooseTemplate: () => void
  onChooseImport: () => void
}

export function NewProjectChooser({ onChooseAI, onChooseTemplate, onChooseImport }: NewProjectChooserProps) {
  const options = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'AI Planning Chat',
      description: 'Describe your project and the AI will help you build a structured plan step by step.',
      onClick: onChooseAI,
    },
    {
      icon: <Layout className="h-6 w-6" />,
      title: 'Start from Template',
      description: 'Choose from pre-built project plans for common patterns like auth systems, APIs, and landing pages.',
      onClick: onChooseTemplate,
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Import Markdown',
      description: 'Paste or upload an existing plan.md, requirements.md, or any structured markdown to visualize as a DAG.',
      onClick: onChooseImport,
    },
  ]

  return (
    <div className="h-full flex items-center justify-center">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Create a New Project</h1>
          <p className="text-muted-foreground">
            How would you like to get started?
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map((option) => (
            <Card
              key={option.title}
              className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
              onClick={option.onClick}
            >
              <CardHeader className="text-center pt-8 pb-6">
                <div className="mx-auto p-3 rounded-xl bg-primary/10 text-primary mb-3 w-fit group-hover:bg-primary/20 transition-colors">
                  {option.icon}
                </div>
                <CardTitle className="text-base">{option.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed mt-1">
                  {option.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
