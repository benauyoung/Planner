import { NextResponse } from 'next/server'
import { getGeminiClient } from '@/services/gemini'

const MAX_CONTENT_LENGTH = 30_000

const SYSTEM_INSTRUCTION =
  "You are a helpful web research assistant. Analyze the provided webpage content and answer the user's question clearly and concisely. Focus on the substance of the content, not the formatting."

export async function POST(req: Request) {
  try {
    const { url, prompt } = await req.json()

    if (!url || !prompt) {
      return NextResponse.json({ error: 'url and prompt are required' }, { status: 400 })
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Fetch raw HTML and Jina markdown in parallel
    const [htmlResult, markdownResult] = await Promise.allSettled([
      fetch(parsedUrl.toString(), {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TinyBaguetteBot/1.0)' },
        signal: AbortSignal.timeout(10_000),
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.text()
      }),
      fetch(`https://r.jina.ai/${parsedUrl.toString()}`, {
        headers: { Accept: 'text/plain', 'X-No-Cache': 'true' },
        signal: AbortSignal.timeout(20_000),
      }).then((r) => {
        if (!r.ok) throw new Error(`Jina HTTP ${r.status}`)
        return r.text()
      }),
    ])

    if (htmlResult.status === 'rejected') {
      return NextResponse.json(
        { error: `Could not fetch URL: ${htmlResult.reason?.message ?? 'Unknown error'}` },
        { status: 400 }
      )
    }

    if (markdownResult.status === 'rejected') {
      return NextResponse.json(
        { error: `Could not fetch markdown version: ${markdownResult.reason?.message ?? 'Unknown error'}` },
        { status: 400 }
      )
    }

    const rawHtml = htmlResult.value
    const rawMarkdown = markdownResult.value

    const htmlTruncated = rawHtml.length > MAX_CONTENT_LENGTH
    const markdownTruncated = rawMarkdown.length > MAX_CONTENT_LENGTH

    const htmlContent = htmlTruncated
      ? rawHtml.slice(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated at 30,000 characters]'
      : rawHtml

    const markdownContent = markdownTruncated
      ? rawMarkdown.slice(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated at 30,000 characters]'
      : rawMarkdown

    const client = getGeminiClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    })

    // Run both Gemini calls in parallel
    const [htmlGemini, markdownGemini] = await Promise.all([
      model.generateContent(
        `The following is the raw HTML source of a webpage.\n\nUser question: ${prompt}\n\nHTML content:\n${htmlContent}`
      ),
      model.generateContent(
        `The following is the markdown version of a webpage (converted by r.jina.ai).\n\nUser question: ${prompt}\n\nMarkdown content:\n${markdownContent}`
      ),
    ])

    const htmlUsage = htmlGemini.response.usageMetadata
    const markdownUsage = markdownGemini.response.usageMetadata

    return NextResponse.json({
      url,
      prompt,
      html: {
        answer: htmlGemini.response.text(),
        truncated: htmlTruncated,
        contentLength: rawHtml.length,
        tokens: {
          prompt: htmlUsage?.promptTokenCount ?? 0,
          response: htmlUsage?.candidatesTokenCount ?? 0,
          total: htmlUsage?.totalTokenCount ?? 0,
        },
      },
      markdown: {
        answer: markdownGemini.response.text(),
        truncated: markdownTruncated,
        contentLength: rawMarkdown.length,
        tokens: {
          prompt: markdownUsage?.promptTokenCount ?? 0,
          response: markdownUsage?.candidatesTokenCount ?? 0,
          total: markdownUsage?.totalTokenCount ?? 0,
        },
      },
    })
  } catch (error) {
    console.error('web-fetch-compare error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
