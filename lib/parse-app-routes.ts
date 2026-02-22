/**
 * Parses the App.tsx file content to extract route paths defined via React Router v6.
 * Looks for <Route path="..." patterns and returns an ordered list of routes.
 */
export interface AppRoute {
  path: string
  label: string
}

const ROUTE_PATTERN = /<Route\s+[^>]*path\s*=\s*["']([^"']+)["']/g

export function parseAppRoutes(appFiles: { path: string; content: string }[]): AppRoute[] {
  const appTsx = appFiles.find((f) => f.path === 'src/App.tsx')
  if (!appTsx) return []

  const routes: AppRoute[] = []
  const seen = new Set<string>()

  let match: RegExpExecArray | null
  while ((match = ROUTE_PATTERN.exec(appTsx.content)) !== null) {
    const path = match[1]
    if (seen.has(path)) continue
    seen.add(path)
    routes.push({ path, label: pathToLabel(path) })
  }

  // Ensure "/" is first if present
  routes.sort((a, b) => {
    if (a.path === '/') return -1
    if (b.path === '/') return 1
    return a.path.localeCompare(b.path)
  })

  return routes
}

function pathToLabel(path: string): string {
  if (path === '/' || path === '*') return 'Home'
  // "/about" → "About", "/pricing-plans" → "Pricing Plans"
  return path
    .replace(/^\//, '')
    .split('/')
    .map((seg) =>
      seg
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    )
    .join(' / ')
}
