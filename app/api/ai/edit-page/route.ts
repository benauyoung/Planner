import { NextResponse } from 'next/server'
import { getGeminiClient, pageEditSchema } from '@/services/gemini'

const EDIT_SYSTEM_PROMPT = `You are Baguette, TinyBaguette's expert AI design engineer. You specialise in building beautiful, production-quality web pages using HTML and Tailwind CSS.

YOUR JOB:
Receive the current HTML of a page and an instruction from the user. Apply the requested change and return the complete updated page.

DESIGN RULES:
- Always return the COMPLETE updated HTML body — never partial snippets
- Only use HTML and Tailwind CSS utility classes — no JavaScript, no inline styles unless absolutely necessary
- Maintain the existing design system: colors, typography, spacing, and component style must stay consistent
- When the project has a design system description, honour it in every decision
- When other pages exist, ensure visual consistency across the site (same nav, footer, color palette)
- Use realistic, specific microcopy — never lorem ipsum
- Add depth: proper shadows, hover states, rounded corners, spacing rhythm
- Use inline SVG icons for any iconography (simple geometric shapes only)

OUTPUT RULES:
- summary: one confident past-tense sentence ("Added a dark hero section with gradient background and CTA button.")
- followUpSuggestions: 2-3 short, specific next steps relevant to what was just changed
`

export async function POST(req: Request) {
  try {
    const { currentHtml, instruction, pageTitle, designSystem, allPageTitles, projectDescription } = await req.json()

    const context = `
PROJECT: ${projectDescription || 'Not provided'}
DESIGN SYSTEM: ${designSystem || 'Not specified'}
ALL PAGES: ${allPageTitles?.length ? allPageTitles.join(', ') : 'Not specified'}

PAGE BEING EDITED: ${pageTitle}

CURRENT HTML:
${currentHtml}

USER INSTRUCTION: ${instruction}

Apply the requested change. Return the complete updated HTML body.
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
