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

  // Calculate centroid and bounds for proper flag placement
  const { centroid, patternSize } = useMemo(() => {
    const bounds = pathGenerator.bounds(geometry)
    const [[x0, y0], [x1, y1]] = bounds
    const width = x1 - x0
    const height = y1 - y0

    // Use centroid for centering the flag
    const center = pathGenerator.centroid(geometry)

    // For countries with overseas territories (huge bounds), cap the pattern size
    // Use the larger dimension to ensure full coverage, with a reasonable max
    const maxDim = Math.min(Math.max(width, height), 800)

    // Pattern size maintains 3:2 flag aspect ratio
    const patternWidth = maxDim * 1.5
    const patternHeight = maxDim

    return {
      centroid: center,
      patternSize: { width: patternWidth, height: patternHeight },
    }
  }, [geometry, pathGenerator])

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
