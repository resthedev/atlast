import type { GeoPermissibleObjects } from 'd3-geo'

export interface CountryFeature {
  type: 'Feature'
  id: string // ISO 3166-1 numeric code (string from TopoJSON)
  properties: { name: string }
  geometry: GeoPermissibleObjects
}

export interface CountryMeta {
  numericCode: string // "840"
  alpha2: string // "us"
  alpha3: string // "USA"
  name: string // "United States of America"
}

export interface VisitedCountry {
  countryCode: string // ISO 3166-1 alpha-3
  visitedAt: string // ISO timestamp
}

export interface ZoomState {
  k: number // scale
  x: number // translateX
  y: number // translateY
}

export interface LabelData {
  id: string
  name: string
  centroid: [number, number] // projected screen coordinates
  area: number // screen-space area at current zoom
  visible: boolean
}
