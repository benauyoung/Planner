import { NextResponse } from 'next/server'
import { getGeminiClient, appEditSchema } from '@/services/gemini'
import { APP_EDIT_SYSTEM_PROMPT } from '@/prompts/app-edit'

export async function POST(req: Request) {
  try {
    const { files, instruction } = await req.json()

    if (!files || !Array.isArray(files) || !instruction) {
      return NextResponse.json(
        { error: 'Missing files or instruction' },
        { status: 400 }
      )
    }

    // Build context: current file tree + user instruction
    const fileContext = files
      .map((f: { path: string; content: string }) => `--- ${f.path} ---\n${f.content}`)
      .join('\n\n')

    const context = `CURRENT APP FILES:\n\n${fileContext}\n\n---\n\nUSER INSTRUCTION: ${instruction}\n\nApply the requested changes. Return only modified or newly created files.`

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: APP_EDIT_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: appEditSchema,
      },
    })

    const result = await model.generateContent(context)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('App edit error:', error)
    return NextResponse.json(
      { error: 'Failed to edit app' },
      { status: 500 }
    )
  }
}
