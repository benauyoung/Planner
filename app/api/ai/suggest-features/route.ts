import { NextResponse } from 'next/server'
import { getAnthropicClient, CLAUDE_MODEL } from '@/services/anthropic'

const SYSTEM_PROMPT = `You are a product planning assistant. Given a project description and type:

1. Suggest 8-12 specific features that would be essential or highly valuable for this project. Each feature should be concise (2-5 words) and actionable. Focus on features specific to this project idea, not generic ones like "responsive design" or "error handling". Order them from most critical to nice-to-have.

2. Generate 2-4 tailored follow-up questions that would help plan this project better. Only ask about audience, timeline, team size, or priorities if they genuinely matter for this specific project type. You may ask domain-specific questions instead (e.g., "Which platforms?" for mobile, "Which cloud provider?" for backend, "Auth requirements?" for apps with user accounts). Each question should have 3-5 answer options with appropriate Lucide icon names.

Valid Lucide icon names you can use: User, Users, UsersRound, Building2, Globe, Smartphone, Server, Monitor, Zap, Calendar, CalendarRange, CalendarClock, Infinity, Rocket, Briefcase, GraduationCap, GitBranch, ShieldCheck, BookOpen, Heart, TrendingUp, Shapes, BarChart3, Shield, Lock, Cloud, Database, Code, Palette, Layout, MessageSquare, Bell, Settings, Target, Award, Layers, Package, Plug, Cpu, Wifi, Map

You MUST respond with valid JSON matching this exact schema:
{
  "features": ["Feature Name 1", "Feature Name 2", ...],
  "tailoredQuestions": [
    {
      "id": "q1",
      "question": "Short question text",
      "subtitle": "Brief context for why this matters",
      "type": "single" | "multi",
      "options": [
        { "label": "Option text (2-4 words)", "icon": "LucideIconName" },
        ...
      ]
    },
    ...
  ]
}

Respond ONLY with the JSON object, no markdown or explanation.`

export async function POST(req: Request) {
  try {
    const { description, projectType } = await req.json()

    const client = getAnthropicClient()
    const result = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Project description: ${description}\nProject type: ${projectType}\n\nSuggest 8-12 specific features and 2-4 tailored planning questions for this project.`,
        },
      ],
    })

    // Extract text from Claude's response
    const textBlock = result.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    const parsed = JSON.parse(textBlock.text)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Feature suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to get feature suggestions' },
      { status: 500 }
    )
  }
}
