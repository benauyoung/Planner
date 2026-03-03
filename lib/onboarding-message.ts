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
  if (answers.audience) {
    lines.push(`**Audience:** ${answers.audience}`)
  }
  if (answers.timeline) {
    lines.push(`**Timeline:** ${answers.timeline}`)
  }
  if (answers.teamSize) {
    lines.push(`**Team size:** ${answers.teamSize}`)
  }
  if (answers.priorities && answers.priorities.length > 0) {
    lines.push(`**Priorities:** ${answers.priorities.join(', ')}`)
  }

  // Dynamic answers from AI-generated questions
  if (answers.dynamicAnswers) {
    for (const [question, answer] of Object.entries(answers.dynamicAnswers)) {
      if (!answer || (Array.isArray(answer) && answer.length === 0)) continue
      const display = Array.isArray(answer) ? answer.join(', ') : answer
      lines.push(`**${question}:** ${display}`)
    }
  }

  return lines.join('\n')
}
