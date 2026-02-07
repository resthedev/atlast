import { useMemo } from 'react'
import type { GeoPath, GeoPermissibleObjects } from 'd3-geo'
import { getAlpha2, getFlagUrl } from '@/lib/countries'

interface FlagPatternProps {
  countryId: string
  pathGenerator: GeoPath<unknown, GeoPermissibleObjects>
  geometry: GeoPermissibleObjects
}

export default function FlagPattern({ countryId, pathGenerator, geometry }: FlagPatternProps) {
  const alpha2 = getAlpha2(countryId)

  // Calculate bounding box of the country path for pattern sizing
  const bounds = useMemo(() => pathGenerator.bounds(geometry), [geometry, pathGenerator])

  if (!alpha2) return null

  const [[x0, y0], [x1, y1]] = bounds
  const width = x1 - x0
  const height = y1 - y0

  // Skip if dimensions are invalid
  if (width <= 0 || height <= 0 || !isFinite(width) || !isFinite(height)) {
    return null
  }

  return (
    <pattern
      id={`flag-${countryId}`}
      patternUnits="userSpaceOnUse"
      x={x0}
      y={y0}
      width={width}
      height={height}
    >
      <image
        href={getFlagUrl(alpha2)}
        x={0}
        y={0}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid slice"
      />
    </pattern>
  )
}
