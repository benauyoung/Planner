import type { OnboardingAnswers } from '@/types/chat'

export interface OnboardingOption {
  label: string
  icon: string
}

export interface OnboardingStep {
  id: keyof OnboardingAnswers
  question: string
  subtitle: string
  type: 'textarea' | 'single' | 'multi' | 'features'
  options?: OnboardingOption[]
}

export interface DynamicOnboardingQuestion {
  id: string
  question: string
  subtitle: string
  type: 'single' | 'multi'
  options: { label: string; icon: string }[]
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'description',
    question: 'What are you building?',
    subtitle: 'Describe your project idea in a few sentences',
    type: 'textarea',
  },
  {
    id: 'projectType',
    question: 'What type of project?',
    subtitle: 'This helps us tailor the plan structure',
    type: 'single',
    options: [
      { label: 'Web App', icon: 'Globe' },
      { label: 'Mobile App', icon: 'Smartphone' },
      { label: 'API / Backend', icon: 'Server' },
      { label: 'Desktop App', icon: 'Monitor' },
      { label: 'Data / ML', icon: 'BarChart3' },
      { label: 'Other', icon: 'Shapes' },
    ],
  },
  {
    id: 'features',
    question: 'Which features do you need?',
    subtitle: 'AI-suggested features based on your project -- select all that apply',
    type: 'features',
  },
]
