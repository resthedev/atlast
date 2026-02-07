import { useRef, useEffect, useState, useMemo, useCallback, useLayoutEffect } from 'react'
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
  // Track countries currently animating their flag reveal
  const [animatingCountries, setAnimatingCountries] = useState<Set<string>>(new Set())
  const prevVisitedRef = useRef<Set<string> | null>(null) // null = first render

  const { visitedSet, toggleVisit } = useTravelLog()

  // Detect newly visited countries and trigger animation
  useLayoutEffect(() => {
    const prevVisited = prevVisitedRef.current

    // Skip first render (initial load from database)
    if (prevVisited === null) {
      prevVisitedRef.current = new Set(visitedSet)
      return
    }

    const newlyVisited = new Set<string>()

    visitedSet.forEach((id) => {
      if (!prevVisited.has(id)) {
        newlyVisited.add(id)
      }
    })

    if (newlyVisited.size > 0) {
      setAnimatingCountries((prev) => new Set([...prev, ...newlyVisited]))

      // Clear animation state after animation completes
      setTimeout(() => {
        setAnimatingCountries((prev) => {
          const next = new Set(prev)
          newlyVisited.forEach((id) => next.delete(id))
          return next
        })
      }, 550) // Match animation duration
    }

    prevVisitedRef.current = new Set(visitedSet)
  }, [visitedSet])

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
          const isAnimating = animatingCountries.has(country.id)
          const d = pathGenerator(country.geometry) || ''

          return (
            <g key={country.id}>
              {/* Base country path */}
              <path
                d={d}
                fill={isVisited ? `url(#flag-${country.id})` : 'var(--color-land)'}
                stroke="var(--color-border)"
                strokeWidth={0.5}
                className={`cursor-pointer hover:brightness-110 ${
                  isAnimating ? 'animate-flag-snap' : ''
                }`}
                onClick={(e) => handleCountryClick(e, country)}
                style={{ willChange: 'fill, transform' }}
              />
            </g>
          )
        })}

        {/* Labels layer */}
        <CountryLabels labels={visibleLabels} zoomK={zoomState.k} />
      </g>
    </svg>
  )
}
