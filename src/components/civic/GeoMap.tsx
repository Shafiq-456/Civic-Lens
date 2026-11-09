'use client'

import { useMemo, useState, useRef, useCallback } from 'react'
import { geoMercator, geoPath, type GeoProjection } from 'd3-geo'

export interface GeoMapProps {
  /** FeatureCollection loaded from /geo/*.geojson (real boundary datasets). */
  geojson: GeoJSON.FeatureCollection | null
  /** Property key that holds the region name (from public/geo/meta.json). */
  nameKey: string
  /** Names that are interactive/data-backed; other features render as context. */
  dataNames?: string[]
  selectedName?: string | null
  onSelect?: (name: string) => void
  /** Optional numeric value per name for a choropleth tint (0..1 expected; auto-normalised otherwise). */
  valueByName?: Record<string, number>
  choroplethLabel?: string
  /** Static palette override for data features. */
  dataFill?: string
  contextFill?: string
  height?: number
  width?: number
  showLabels?: boolean
  caption?: string
}

function normalizeName(s: string) {
  return s.toLowerCase().replace(/[^a-z]/g, '')
}

/**
 * Renders REAL geographic boundaries (GeoJSON) projected with d3-geo.
 * Used for India states/UTs and Tamil Nadu districts / constituencies.
 */
export default function GeoMap({
  geojson,
  nameKey,
  dataNames,
  selectedName,
  onSelect,
  valueByName,
  choroplethLabel,
  dataFill = '#0f766e',
  contextFill = '#e2e8f0',
  height = 520,
  width = 820,
  showLabels = false,
  caption,
}: GeoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null)

  const normData = useMemo(
    () => new Set((dataNames ?? []).map((n) => normalizeName(n))),
    [dataNames],
  )

  const { paths, error } = useMemo(() => {
    if (!geojson || !Array.isArray(geojson.features) || geojson.features.length === 0) {
      return { paths: [], error: 'No boundary data loaded.' }
    }
    try {
      const fc: GeoJSON.FeatureCollection = geojson
      const projection: GeoProjection = geoMercator()
      projection.fitExtent(
        [
          [6, 6],
          [width - 6, height - 6],
        ],
        fc as unknown as Parameters<GeoProjection['fitExtent']>[1],
      )
      const pathGen = geoPath(projection)

      // optional choropleth normalisation
      let maxVal = 0
      if (valueByName) {
        for (const v of Object.values(valueByName)) maxVal = Math.max(maxVal, v)
      }

      const rendered = fc.features.map((f, i) => {
        const props = (f.properties ?? {}) as Record<string, unknown>
        const rawName = String(props[nameKey] ?? props.st_nm ?? props.district ?? props.AC_NAME ?? props.pc_name ?? `region-${i}`)
        const norm = normalizeName(rawName)
        const isData = normData.size === 0 || normData.has(norm)
        const d = pathGen(f as never) ?? ''
        let fill = isData ? dataFill : contextFill
        let opacity = isData ? 0.92 : 0.55
        if (isData && valueByName) {
          const matchedKey = Object.keys(valueByName).find((k) => normalizeName(k) === norm)
          const v = (matchedKey !== undefined ? valueByName[matchedKey] : undefined) ?? 0
          const t = maxVal > 0 ? v / maxVal : 0
          fill = mixColor('#99f6e4', dataFill, 0.25 + 0.65 * t)
        }
        if (selectedName && normalizeName(selectedName) === norm) {
          fill = '#d97706'
          opacity = 1
        }
        return { key: `${rawName}-${i}`, name: rawName, d, fill, opacity, isData }
      })
      return { paths: rendered, error: null }
    } catch (e) {
      return { paths: [], error: 'Failed to project boundary data: ' + (e as Error).message }
    }
  }, [geojson, nameKey, normData, selectedName, valueByName, dataFill, contextFill, width, height])

  const onMove = useCallback((e: React.MouseEvent<SVGPathElement>, name: string) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setHover({ name, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        {error}
      </div>
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full select-none"
        role="img"
        aria-label={caption ?? 'Map rendered from real administrative boundary datasets'}
      >
        {paths.map((p) => (
          <path
            key={p.key}
            d={p.d}
            fill={p.fill}
            fillOpacity={p.opacity}
            stroke="#ffffff"
            strokeWidth={0.6}
            className={
              onSelect
                ? 'cursor-pointer transition-[fill-opacity] duration-150 hover:fill-opacity-100 hover:stroke-amber-500 hover:stroke-[1.1]'
                : 'transition-[fill-opacity] duration-150'
            }
            onMouseMove={(e) => onMove(e, p.name)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onSelect?.(p.name)}
            tabIndex={p.isData && onSelect ? 0 : -1}
            role={p.isData && onSelect ? 'button' : undefined}
            aria-label={p.name}
            onKeyDown={(e) => {
              if (p.isData && onSelect && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                onSelect(p.name)
              }
            }}
          />
        ))}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md bg-slate-900/90 px-2.5 py-1 text-xs font-medium text-white shadow-lg"
          style={{ left: hover.x, top: hover.y }}
        >
          {hover.name}
        </div>
      )}

      {choroplethLabel && valueByName && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
          <span>{choroplethLabel}</span>
          <span className="inline-block h-2.5 w-28 rounded-full" style={{ background: 'linear-gradient(90deg,#99f6e4,#0f766e)' }} />
          <span>high</span>
        </div>
      )}

      {caption && <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{caption}</p>}
    </div>
  )
}

function mixColor(a: string, b: string, t: number): string {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)]
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)]
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t))
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}
