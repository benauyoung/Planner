'use client'

import { useState } from 'react'
import { Globe, FileText, Zap, TrendingDown, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface TokenUsage {
  prompt: number
  response: number
  total: number
}

interface FormatResult {
  answer: string
  truncated: boolean
  contentLength: number
  tokens: TokenUsage
}

interface CompareResult {
  url: string
  prompt: string
  html: FormatResult
  markdown: FormatResult
}

function ResultCard({
  label,
  icon,
  result,
  borderColor,
  iconBg,
}: {
  label: string
  icon: React.ReactNode
  result: FormatResult
  borderColor: string
  iconBg: string
}) {
  return (
    <div className={`flex flex-col rounded-xl border bg-card p-5 gap-4 ${borderColor}`}>
      <div className="flex items-center gap-2">
        <span className={`flex items-center justify-center h-6 w-6 rounded-md ${iconBg}`}>
          {icon}
        </span>
        <span className="font-semibold text-sm">{label}</span>
        {result.truncated && (
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            truncated
          </span>
        )}
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
        {result.answer}
      </p>

      <div className="mt-auto border-t pt-3 space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Raw size</span>
          <span className="font-mono">{(result.contentLength / 1000).toFixed(1)}k chars</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Input tokens</span>
          <span className="font-mono">{result.tokens.prompt.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Output tokens</span>
          <span className="font-mono">{result.tokens.response.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs font-semibold border-t pt-1.5 mt-1">
          <span>Total tokens</span>
          <span className="font-mono">{result.tokens.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

export function WebFetchDemo() {
  const [url, setUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CompareResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCompare = async () => {
    if (!url || !prompt) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/ai/web-fetch-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, prompt }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setResult(data)
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  const tokenSaved = result ? result.html.tokens.total - result.markdown.tokens.total : 0
  const tokenSavedPct =
    result && result.html.tokens.total > 0
      ? Math.round((tokenSaved / result.html.tokens.total) * 100)
      : 0

  const geminiCost = (tokens: number) => ((tokens / 1_000_000) * 0.075).toFixed(5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Web Fetch Token Demo</h2>
        <p className="text-sm text-muted-foreground mt-1">
          See how much token overhead raw HTML adds compared to a clean markdown version of the
          same page. The AI answers the same question using each format.
        </p>
      </div>

      {/* Input section */}
      <div className="flex flex-col gap-3 p-4 rounded-xl border bg-card">
        <div className="flex gap-3">
          <Input
            placeholder="https://en.wikipedia.org/wiki/Artificial_intelligence"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
            className="flex-1"
          />
          <Button onClick={handleCompare} disabled={!url || !prompt || loading} className="shrink-0">
            {loading ? 'Fetching…' : 'Compare'}
          </Button>
        </div>
        <Input
          placeholder="What is the main topic of this page?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
        />
        <p className="text-xs text-muted-foreground">
          The AI visits the URL as raw HTML and again via{' '}
          <a
            href="https://r.jina.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            r.jina.ai
          </a>{' '}
          (clean markdown), then answers your question using each format independently.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-md" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
                <Skeleton className="h-3 w-3/6" />
                <div className="border-t pt-3 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Fetching both versions and running two AI calls in parallel…
          </p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Raw HTML"
              icon={<Globe className="h-3.5 w-3.5 text-orange-500" />}
              result={result.html}
              borderColor="border-orange-200/60 dark:border-orange-900/40"
              iconBg="bg-orange-500/10"
            />
            <ResultCard
              label="Markdown (r.jina.ai)"
              icon={<FileText className="h-3.5 w-3.5 text-emerald-500" />}
              result={result.markdown}
              borderColor="border-emerald-200/60 dark:border-emerald-900/40"
              iconBg="bg-emerald-500/10"
            />
          </div>

          {/* Savings summary */}
          <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              {tokenSaved > 0 ? (
                <>
                  <p className="font-semibold text-sm">
                    Markdown used{' '}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {tokenSaved.toLocaleString()} fewer tokens
                    </span>{' '}
                    ({tokenSavedPct}% less)
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    HTML: ${geminiCost(result.html.tokens.total)} · Markdown: $
                    {geminiCost(result.markdown.tokens.total)} per call at Gemini 2.0 Flash
                    pricing
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-sm">HTML used fewer tokens this time</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This page may already have minimal markup — markdown conversion doesn&apos;t
                    always win.
                  </p>
                </>
              )}
            </div>

            {/* Token bar chart */}
            <div className="shrink-0 w-40 space-y-1.5">
              <div className="space-y-0.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>HTML</span>
                  <span>{result.html.tokens.total.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-orange-400" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Markdown</span>
                  <span>{result.markdown.tokens.total.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{
                      width:
                        result.html.tokens.total > 0
                          ? `${Math.round(
                              (result.markdown.tokens.total / result.html.tokens.total) * 100
                            )}%`
                          : '100%',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
            <Zap className="h-6 w-6 opacity-50" />
          </div>
          <p className="text-sm font-medium">Enter a URL and a question to compare</p>
          <p className="text-xs opacity-60 max-w-xs">
            Try a Wikipedia article — the difference in token count between raw HTML and markdown
            is usually dramatic
          </p>
        </div>
      )}
    </div>
  )
}
