import * as d3 from 'd3'

export function createProjection(width: number, height: number) {
  return d3
    .geoNaturalEarth1()
    .scale(width / 5.5)
    .translate([width / 2, height / 2])
    .precision(0.1)
}

export function createPathGenerator(projection: d3.GeoProjection) {
  return d3.geoPath().projection(projection)
}
