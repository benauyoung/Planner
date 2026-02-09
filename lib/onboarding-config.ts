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
    subtitle: 'AI-suggested features based on your project — select all that apply',
    type: 'features',
  },
  {
    id: 'audience',
    question: 'Who is this for?',
    subtitle: 'Helps us understand the scope and constraints',
    type: 'single',
    options: [
      { label: 'Personal', icon: 'User' },
      { label: 'Startup / Business', icon: 'Rocket' },
      { label: 'Client work', icon: 'Briefcase' },
      { label: 'School / Academic', icon: 'GraduationCap' },
      { label: 'Open source', icon: 'GitBranch' },
      { label: 'Other', icon: 'Shapes' },
    ],
  },
  {
    id: 'timeline',
    question: "What's your timeline?",
    subtitle: 'We\'ll adjust the plan scope accordingly',
    type: 'single',
    options: [
      { label: '1–2 weeks', icon: 'Zap' },
      { label: '1–3 months', icon: 'Calendar' },
      { label: '3–6 months', icon: 'CalendarRange' },
      { label: '6+ months', icon: 'CalendarClock' },
      { label: 'No deadline', icon: 'Infinity' },
    ],
  },
  {
    id: 'teamSize',
    question: 'How big is your team?',
    subtitle: 'Affects how we break down work and assign tasks',
    type: 'single',
    options: [
      { label: 'Just me', icon: 'User' },
      { label: '2–5 people', icon: 'Users' },
      { label: '6–15 people', icon: 'UsersRound' },
      { label: '15+ people', icon: 'Building2' },
    ],
  },
  {
    id: 'priorities',
    question: 'What matters most?',
    subtitle: 'Select all that apply — this shapes the plan priorities',
    type: 'multi',
    options: [
      { label: 'Speed to market', icon: 'Rocket' },
      { label: 'Code quality', icon: 'ShieldCheck' },
      { label: 'Learning / Growth', icon: 'BookOpen' },
      { label: 'User experience', icon: 'Heart' },
      { label: 'Scalability', icon: 'TrendingUp' },
    ],
  },
]
