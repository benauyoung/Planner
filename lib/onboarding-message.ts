import type { OnboardingAnswers } from '@/types/chat'

export function formatOnboardingMessage(answers: OnboardingAnswers): string {
  const lines: string[] = []

  lines.push(`I want to plan a new project. Here's what I have in mind:`)
  lines.push('')
  lines.push(`**Project idea:** ${answers.description}`)
  lines.push(`**Type:** ${answers.projectType}`)
  if (answers.features.length > 0) {
    lines.push(`**Requested features:** ${answers.features.join(', ')}`)
  }
  lines.push(`**Audience:** ${answers.audience}`)
  lines.push(`**Timeline:** ${answers.timeline}`)
  lines.push(`**Team size:** ${answers.teamSize}`)
  lines.push(`**Priorities:** ${answers.priorities.join(', ')}`)

  return lines.join('\n')
}
