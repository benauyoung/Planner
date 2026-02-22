import { useStore } from '@xyflow/react'

export type LodTier = 'full' | 'compact' | 'dot'

/**
 * Returns the current level-of-detail tier based on the ReactFlow viewport zoom.
 * - full:    zoom >= 0.6  — full node rendering
 * - compact: 0.3 <= zoom < 0.6 — title + status only
 * - dot:     zoom < 0.3  — colored pill with icon
 */
export function useZoomLevel(): LodTier {
  const zoom = useStore((s) => s.transform[2])
  if (zoom >= 0.6) return 'full'
  if (zoom >= 0.3) return 'compact'
  return 'dot'
}
