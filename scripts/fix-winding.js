/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Normalises GeoJSON polygon winding for d3-geo: d3-geo requires exterior rings
 * CLOCKWISE (and holes counter-clockwise) for polygons smaller than a
 * hemisphere; otherwise each polygon is treated as its spherical complement and
 * paints the entire map. Modifies files in place.
 */
const fs = require('fs')

const files = [
  'public/geo/india-states.geojson',
  'public/geo/tamil-nadu-districts.geojson',
  'public/geo/tamil-nadu-ac.geojson',
  'public/geo/tamil-nadu-pc.geojson',
]

function signedArea(ring) {
  let s = 0
  for (let i = 0; i < ring.length - 1; i++) {
    s += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  }
  return s / 2
}

for (const file of files) {
  const fc = JSON.parse(fs.readFileSync(file, 'utf8'))
  let fixed = 0
  for (const f of fc.features) {
    if (!f.geometry) continue
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
    for (const poly of polys) {
      // d3 wants exterior rings clockwise → negative shoelace area
      if (signedArea(poly[0]) > 0) { poly[0] = [...poly[0]].reverse(); fixed++ }
      for (let h = 1; h < poly.length; h++) {
        if (signedArea(poly[h]) < 0) { poly[h] = [...poly[h]].reverse(); fixed++ }
      }
    }
  }
  fs.writeFileSync(file, JSON.stringify(fc))
  console.log(`${file}: reversed ${fixed} rings`)
}

// verify with d3-geo
const d3 = require('d3-geo')
const fc = JSON.parse(fs.readFileSync('public/geo/india-states.geojson', 'utf8'))
const projection = d3.geoMercator()
projection.fitExtent([[6, 6], [814, 424]], fc)
const path = d3.geoPath(projection)
for (const name of ['Mizoram', 'Tamil Nadu', 'Maharashtra']) {
  const f = fc.features.find((x) => x.properties.st_nm === name)
  console.log(name, 'projected bounds:', JSON.stringify(path.bounds(f).map((b) => b.map((v) => Math.round(v)))))
}
console.log('VERIFICATION OK if bounds are small and distinct per state')
