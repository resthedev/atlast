import { useMemo } from 'react'
import type { GeoPath, GeoPermissibleObjects } from 'd3-geo'
import type { CountryFeature, ZoomState, LabelData } from '@/types'
import { COUNTRY_MAP } from '@/lib/countries'

const MIN_AREA_THRESHOLD = 2000 // minimum screen-space area (px^2) to show label
const LABEL_PADDING = 4

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  )
}

export function useLabelVisibility(
  countries: CountryFeature[],
  pathGenerator: GeoPath<unknown, GeoPermissibleObjects>,
  zoomState: ZoomState
): LabelData[] {
  // Precompute centroids and base areas
  const countryData = useMemo(() => {
    return countries
      .map((feature) => {
        const centroid = pathGenerator.centroid(feature.geometry)
        const bounds = pathGenerator.bounds(feature.geometry)
        const [[x0, y0], [x1, y1]] = bounds
        const baseArea = (x1 - x0) * (y1 - y0)
        const name = COUNTRY_MAP[feature.id]?.name || ''
        return {
          id: feature.id,
          name,
          centroid,
          baseArea,
        }
      })
      .filter((c) => c.name && !isNaN(c.centroid[0]) && !isNaN(c.centroid[1]))
  }, [countries, pathGenerator])

  // Compute visible labels based on current zoom
  const labels = useMemo(() => {
    const k = zoomState.k

    // Scale area by zoom squared (area scales quadratically with zoom)
    const scaled = countryData
      .map((c) => ({
        ...c,
        screenArea: c.baseArea * k * k,
        screenCentroid: [
          c.centroid[0] * k + zoomState.x,
          c.centroid[1] * k + zoomState.y,
        ] as [number, number],
      }))
      .filter((c) => c.screenArea > MIN_AREA_THRESHOLD)
      .sort((a, b) => b.screenArea - a.screenArea)

    // Greedy collision detection
    const placedRects: Rect[] = []
    const fontSize = Math.max(9, Math.min(14, 12 / Math.sqrt(k)))
    const charWidth = fontSize * 0.55

    return scaled.map((c) => {
      const labelWidth = c.name.length * charWidth + LABEL_PADDING * 2
      const labelHeight = fontSize + LABEL_PADDING * 2

      const rect: Rect = {
        x: c.screenCentroid[0] - labelWidth / 2,
        y: c.screenCentroid[1] - labelHeight / 2,
        width: labelWidth,
        height: labelHeight,
      }

      const hasCollision = placedRects.some((placed) => rectsOverlap(rect, placed))

      if (!hasCollision) {
        placedRects.push(rect)
      }

      return {
        id: c.id,
        name: c.name,
        centroid: c.centroid, // original (pre-zoom) coordinates
        area: c.screenArea,
        visible: !hasCollision,
      } satisfies LabelData
    })
  }, [countryData, zoomState])

  return labels
}
