import OpenAI from 'openai'

let client: OpenAI | null = null

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!apiKey) throw new Error('NEXT_PUBLIC_OPENAI_API_KEY is not set')
    client = new OpenAI({ apiKey })
  }
  return client
}

export async function POST(req: Request) {
  try {
    const { prompt, size } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const openai = getClient()

    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: size || '1536x1024',
      quality: 'low',
    })

    const imageData = response.data?.[0]

    if (imageData?.b64_json) {
      const dataUrl = `data:image/png;base64,${imageData.b64_json}`
      return new Response(JSON.stringify({ imageDataUrl: dataUrl }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (imageData?.url) {
      // Fetch the image and convert to base64
      const imgRes = await fetch(imageData.url)
      const buffer = await imgRes.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const dataUrl = `data:image/png;base64,${base64}`
      return new Response(JSON.stringify({ imageDataUrl: dataUrl }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'No image generated' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
