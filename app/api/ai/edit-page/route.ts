import { NextResponse } from 'next/server'
import { getGeminiClient, pageEditSchema } from '@/services/gemini'

const EDIT_SYSTEM_PROMPT = `You are a senior UI/UX designer. You receive the current HTML of a page (using Tailwind CSS classes) and an instruction from the user on what to change. Return the COMPLETE updated HTML with the requested changes applied. Maintain the existing design system and style. Only use HTML and Tailwind CSS classes, no JavaScript.`

export async function POST(req: Request) {
  try {
    const { currentHtml, instruction, pageTitle } = await req.json()

    const context = `
PAGE: ${pageTitle}

CURRENT HTML:
${currentHtml}

USER INSTRUCTION: ${instruction}

Apply the requested changes to the HTML. Return the complete updated HTML.
`

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: EDIT_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: pageEditSchema,
      },
    })

    const result = await model.generateContent(context)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Page edit error:', error)
    return NextResponse.json(
      { error: 'Failed to edit page' },
      { status: 500 }
    )
  }
}
