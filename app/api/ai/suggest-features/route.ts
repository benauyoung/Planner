import { NextResponse } from 'next/server'
import { getGeminiClient } from '@/services/gemini'
import { featureSuggestionsSchema } from '@/lib/feature-suggestions'

const SYSTEM_PROMPT = `You are a product planning assistant. Given a project description and type:

1. Suggest 8-12 specific features that would be essential or highly valuable for this project. Each feature should be concise (2-5 words) and actionable. Focus on features specific to this project idea, not generic ones like "responsive design" or "error handling". Order them from most critical to nice-to-have.

2. Generate 2-4 tailored follow-up questions that would help plan this project better. Only ask about audience, timeline, team size, or priorities if they genuinely matter for this specific project type. You may ask domain-specific questions instead (e.g., "Which platforms?" for mobile, "Which cloud provider?" for backend, "Auth requirements?" for apps with user accounts). Each question should have 3-5 answer options with appropriate Lucide icon names.

Valid Lucide icon names you can use: User, Users, UsersRound, Building2, Globe, Smartphone, Server, Monitor, Zap, Calendar, CalendarRange, CalendarClock, Infinity, Rocket, Briefcase, GraduationCap, GitBranch, ShieldCheck, BookOpen, Heart, TrendingUp, Shapes, BarChart3, Shield, Lock, Cloud, Database, Code, Palette, Layout, MessageSquare, Bell, Settings, Target, Award, Layers, Package, Plug, Cpu, Wifi, Map`

export async function POST(req: Request) {
  try {
    const { description, projectType } = await req.json()

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: featureSuggestionsSchema,
      },
    })

    const result = await model.generateContent(
      `Project description: ${description}\nProject type: ${projectType}\n\nSuggest 8-12 specific features and 2-4 tailored planning questions for this project.`
    )
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Feature suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to get feature suggestions' },
      { status: 500 }
    )
  }
}
