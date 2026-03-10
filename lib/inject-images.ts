/**
 * Post-processing utility that scans generated HTML for <img data-generate="...">
 * tags, generates images via the Gemini API, and replaces placeholders with
 * base64 data URLs.
 *
 * Used server-side in generate-pages and client-side in design-view.
 */

const MAX_CONCURRENT = 3
const MAX_IMAGES_PER_PAGE = 5
const TIMEOUT_MS = 60_000

export interface ImagePlaceholder {
  fullMatch: string
  prompt: string
  index: number
}

/**
 * Extract all <img data-generate="..."> placeholders from HTML.
 */
export function extractImagePlaceholders(html: string): ImagePlaceholder[] {
  const regex = /<img\s[^>]*data-generate="([^"]+)"[^>]*>/gi
  const results: ImagePlaceholder[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(html)) !== null) {
    results.push({
      fullMatch: match[0],
      prompt: match[1],
      index: match.index,
    })
  }

  return results.slice(0, MAX_IMAGES_PER_PAGE)
}

/**
 * Generate a single image by calling the generate-image API route.
 * Works both server-side (absolute URL) and client-side (relative URL).
 */
type FetchFn = (url: string, options?: RequestInit) => Promise<Response>

async function generateSingleImage(
  prompt: string,
  fetchFn: FetchFn,
  baseUrl?: string,
): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const url = baseUrl
      ? `${baseUrl}/api/ai/generate-image`
      : '/api/ai/generate-image'

    const res = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.imageDataUrl ?? null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Process HTML: find all image placeholders, generate images concurrently
 * (with concurrency limit), and replace placeholders with base64 data URLs.
 *
 * @param html - The generated HTML body string
 * @param fetchFn - fetch function to use (supports authFetch on client)
 * @param baseUrl - absolute base URL for server-side calls (e.g. http://localhost:3000)
 * @param onProgress - optional callback for progressive updates
 * @returns The HTML with image placeholders replaced by base64 data URLs
 */
export async function injectGeneratedImages(
  html: string,
  fetchFn: FetchFn,
  baseUrl?: string,
  onProgress?: (completed: number, total: number) => void,
): Promise<string> {
  const placeholders = extractImagePlaceholders(html)
  if (placeholders.length === 0) return html

  let result = html
  let completed = 0
  const total = placeholders.length

  // Process in batches respecting concurrency limit
  for (let i = 0; i < placeholders.length; i += MAX_CONCURRENT) {
    const batch = placeholders.slice(i, i + MAX_CONCURRENT)

    const results = await Promise.allSettled(
      batch.map((p) => generateSingleImage(p.prompt, fetchFn, baseUrl))
    )

    for (let j = 0; j < batch.length; j++) {
      const status = results[j]
      const dataUrl = status.status === 'fulfilled' ? status.value : null

      if (dataUrl) {
        // Replace the placeholder src with the generated data URL
        // and remove the data-generate attribute (image is now resolved)
        const original = batch[j].fullMatch
        const updated = original
          .replace(/src="[^"]*"/, `src="${dataUrl}"`)
          .replace(/\s*data-generate="[^"]*"/, '')
        result = result.replace(original, updated)
      }

      completed++
      onProgress?.(completed, total)
    }
  }

  return result
}

/**
 * Sanitize HTML: replace external/broken image URLs with data-generate placeholders.
 * Catches cases where the AI ignores instructions and uses real filenames or URLs.
 */
export function sanitizeImageSrcs(html: string): string {
  return html.replace(
    /<img\s([^>]*?)src="(?!\/api\/placeholder|data:)([^"]*)"([^>]*?)>/gi,
    (_match, before: string, src: string, after: string) => {
      const attrs = before + after
      if (/data-generate=/i.test(attrs)) {
        return `<img ${before}src="/api/placeholder"${after}>`
      }
      const altMatch = attrs.match(/alt="([^"]*)"/)
      const alt = altMatch?.[1] || src.replace(/.*\//, '').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      const description = `kawaii illustration of ${alt}, soft pastel colors, rounded shapes, warm cozy mood`
      return `<img ${before}src="/api/placeholder" data-generate="${description}"${after}>`
    }
  )
}

/**
 * CSS for the Pokopia-style shimmer placeholder on images still loading.
 * Inject this into the iframe <head> for progressive image loading.
 */
export const POKOPIA_IMAGE_PLACEHOLDER_CSS = `
img[data-generate] {
  background: linear-gradient(135deg, #f0e6ff, #ffe6f0, #e6fff0);
  background-size: 200% 200%;
  animation: pokopia-shimmer 2s ease infinite;
  border-radius: 1rem;
  min-height: 200px;
  object-fit: cover;
}
@keyframes pokopia-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
`.trim()
