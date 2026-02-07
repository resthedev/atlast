import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import * as topojson from 'topojson-client'
import type { Topology } from 'topojson-specification'
import { createProjection, createPathGenerator } from '@/lib/mapProjection'
import { useMapZoom } from '@/hooks/useMapZoom'
import { useLabelVisibility } from '@/hooks/useLabelVisibility'
import { useTravelLog } from '@/context/TravelLogContext'
import CountryLabels from './CountryLabels'
import FlagPattern from './FlagPattern'
import type { CountryFeature } from '@/types'

export default function WorldMap() {
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement>(null)
  const [topology, setTopology] = useState<Topology | null>(null)
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const { visitedSet, toggleVisit } = useTravelLog()

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load TopoJSON on mount
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((res) => res.json())
      .then(setTopology)
      .catch((err) => console.error('Failed to load map data:', err))
  }, [])

  // Convert to GeoJSON features
  const countries = useMemo(() => {
    if (!topology) return []
    const geojson = topojson.feature(topology, topology.objects.countries)
    // Type assertion through unknown to handle GeoJSON types
    return (geojson as unknown as { features: CountryFeature[] }).features
  }, [topology])

  // Projection and path generator
  const projection = useMemo(
    () => createProjection(dimensions.width, dimensions.height),
    [dimensions]
  )
  const pathGenerator = useMemo(() => createPathGenerator(projection), [projection])

  // D3 zoom - only enable after topology loads so the effect runs when SVG is ready
  const { zoomState } = useMapZoom(svgRef, gRef, dimensions, !!topology)

  // Label visibility
  const visibleLabels = useLabelVisibility(countries, pathGenerator, zoomState)

  // Handle country click/tap
  const handleCountryClick = useCallback(
    (e: React.MouseEvent<SVGPathElement>, feature: CountryFeature) => {
      // Prevent the click from being captured by the zoom behavior
      e.stopPropagation()

      // Brief scale pulse animation
      const target = e.currentTarget
      target.style.transformOrigin = 'center'
      target.style.transform = 'scale(1.02)'
      target.style.transition = 'transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1)'

      setTimeout(() => {
        target.style.transform = 'scale(1)'
        target.style.transition = 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)'
      }, 150)

      toggleVisit(feature.id)
    },
    [toggleVisit]
  )

  if (!topology) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-ocean)]">
        <div className="text-[var(--color-text-secondary)] text-sm font-ui animate-fade-in">
          Loading map...
        </div>
      </div>
    )
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      className="bg-[var(--color-ocean)] touch-none select-none"
      style={{ cursor: 'grab' }}
    >
      {/* Flag pattern definitions */}
      <defs>
        {countries
          .filter((c) => visitedSet.has(c.id))
          .map((country) => (
            <FlagPattern
              key={country.id}
              countryId={country.id}
              pathGenerator={pathGenerator}
              geometry={country.geometry}
            />
          ))}
      </defs>

      {/* Transformable group (D3 zoom applies transform here) */}
      <g ref={gRef}>
        {/* Country paths */}
        {countries.map((country) => {
          const isVisited = visitedSet.has(country.id)
          const d = pathGenerator(country.geometry) || ''

          return (
            <path
              key={country.id}
              d={d}
              fill={isVisited ? `url(#flag-${country.id})` : 'var(--color-land)'}
              stroke="var(--color-border)"
              strokeWidth={0.5}
              className="cursor-pointer transition-[fill] duration-500 hover:brightness-110"
              onClick={(e) => handleCountryClick(e, country)}
              style={{ willChange: 'fill, transform' }}
            />
          )
        })}

        {/* Labels layer */}
        <CountryLabels labels={visibleLabels} zoomK={zoomState.k} />
      </g>
    </svg>
  )
}
