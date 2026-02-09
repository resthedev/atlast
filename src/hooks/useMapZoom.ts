import { useEffect, useState, useRef, type RefObject } from 'react'
import * as d3 from 'd3'
import type { ZoomState } from '@/types'

const INITIAL_ZOOM: ZoomState = { k: 1, x: 0, y: 0 }
const SCALE_EXTENT: [number, number] = [1, 12]

export function useMapZoom(
  svgRef: RefObject<SVGSVGElement | null>,
  gRef: RefObject<SVGGElement | null>,
  dimensions: { width: number; height: number },
  enabled: boolean = true
) {
  const [zoomState, setZoomState] = useState<ZoomState>(INITIAL_ZOOM)
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(null)

  useEffect(() => {
    if (!enabled || !svgRef.current || !gRef.current) return

    const svg = d3.select(svgRef.current)
    const g = d3.select(gRef.current)

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent(SCALE_EXTENT)
      .translateExtent([
        [0, 0],
        [dimensions.width, dimensions.height],
      ])
      .clickDistance(4) // Allow slight finger movement during taps on mobile
      .filter((event) => {
        // Allow all touch events and wheel events, prevent zoom on right-click
        return !event.button
      })
      .on('zoom', (event) => {
        const { k, x, y } = event.transform
        // Apply transform imperatively for smooth 60fps performance
        g.attr('transform', event.transform.toString())
        // Update React state for label calculations
        setZoomState({ k, x, y })
      })

    svg.call(zoom)
    svg.on('dblclick.zoom', null) // Disable double-click to zoom
    zoomBehaviorRef.current = zoom

    return () => {
      svg.on('.zoom', null)
    }
  }, [svgRef, gRef, dimensions, enabled])

  return { zoomState }
}
