import { useMemo } from 'react'
import type { GeoPath, GeoPermissibleObjects } from 'd3-geo'
import { getAlpha2, getFlagUrl } from '@/lib/countries'

// Manual centroid overrides for countries with overseas territories
// Format: [longitude, latitude] in geographic coordinates
const CENTROID_OVERRIDES: Record<string, [number, number]> = {
  '250': [2.5, 46.5], // France - mainland France center
  '840': [-98, 39], // USA - continental US center
  '643': [100, 60], // Russia - European Russia / Urals area
  '578': [10, 62], // Norway - mainland Norway
  '528': [5.5, 52.5], // Netherlands - mainland Netherlands
  '826': [-2, 54], // United Kingdom - Great Britain center
}

// Approximate mainland extent corners for countries with overseas territories
// Format: [[lon1, lat1], [lon2, lat2]] - southwest and northeast corners
const MAINLAND_EXTENTS: Record<string, [[number, number], [number, number]]> = {
  '250': [[-5, 42], [10, 51]], // France mainland
  '840': [[-125, 24], [-66, 50]], // Continental USA
  '643': [[20, 45], [180, 75]], // Russia main landmass
  '578': [[4, 58], [31, 71]], // Norway mainland
  '528': [[3, 50], [8, 54]], // Netherlands mainland
  '826': [[-8, 49], [2, 61]], // Great Britain
}

interface FlagPatternProps {
  countryId: string
  pathGenerator: GeoPath<unknown, GeoPermissibleObjects>
  geometry: GeoPermissibleObjects
}

export default function FlagPattern({ countryId, pathGenerator, geometry }: FlagPatternProps) {
  const alpha2 = getAlpha2(countryId)
  const projection = pathGenerator.projection()

  // Calculate centroid and bounds for proper flag placement
  const { centroid, patternSize } = useMemo(() => {
    // Check for mainland extent override (for countries with overseas territories)
    const extentOverride = MAINLAND_EXTENTS[countryId]
    const centroidOverride = CENTROID_OVERRIDES[countryId]

    let width: number
    let height: number
    let center: [number, number]

    if (extentOverride && projection && typeof projection === 'function') {
      // Project the mainland extent corners to get proper screen-space bounds
      const proj = projection as (point: [number, number]) => [number, number] | null
      const sw = proj(extentOverride[0])
      const ne = proj(extentOverride[1])

      if (sw && ne) {
        width = Math.abs(ne[0] - sw[0])
        height = Math.abs(ne[1] - sw[1])
      } else {
        // Fallback to geometry bounds
        const bounds = pathGenerator.bounds(geometry)
        width = bounds[1][0] - bounds[0][0]
        height = bounds[1][1] - bounds[0][1]
      }

      // Use centroid override for positioning
      if (centroidOverride) {
        const projected = proj(centroidOverride)
        center = projected || pathGenerator.centroid(geometry)
      } else {
        center = pathGenerator.centroid(geometry)
      }
    } else {
      // No override - use geometry bounds and centroid
      const bounds = pathGenerator.bounds(geometry)
      const [[x0, y0], [x1, y1]] = bounds
      width = x1 - x0
      height = y1 - y0
      center = pathGenerator.centroid(geometry)
    }

    // Maintain 3:2 flag aspect ratio based on the larger dimension
    // Add 20% padding to ensure full coverage
    const maxDim = Math.max(width, height) * 1.2
    const patternWidth = maxDim * 1.5
    const patternHeight = maxDim

    return {
      centroid: center,
      patternSize: { width: patternWidth, height: patternHeight },
    }
  }, [geometry, pathGenerator, countryId, projection])

  if (!alpha2) return null
  if (!isFinite(centroid[0]) || !isFinite(centroid[1])) return null

  // Position pattern centered on the country's centroid
  const patternX = centroid[0] - patternSize.width / 2
  const patternY = centroid[1] - patternSize.height / 2

  return (
    <pattern
      id={`flag-${countryId}`}
      patternUnits="userSpaceOnUse"
      x={patternX}
      y={patternY}
      width={patternSize.width}
      height={patternSize.height}
    >
      <image
        href={getFlagUrl(alpha2)}
        x={0}
        y={0}
        width={patternSize.width}
        height={patternSize.height}
        preserveAspectRatio="xMidYMid slice"
      />
    </pattern>
  )
}
