'use client'

import { useCallback, useEffect, useState } from 'react'

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: 'no-store' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export async function apiSend<T>(path: string, method: 'POST' | 'PATCH' | 'PUT' | 'DELETE', body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error((payload as { error?: string }).error ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

/**
 * Minimal data-fetching hook with refresh support.
 * `loading` is derived from a loaded-key so no setState is called synchronously
 * inside the effect (React Compiler lint rule: set-state-in-effect).
 */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const [loadedKey, setLoadedKey] = useState<string | null>(null)

  const key = path ? `${path}#${tick}` : null

  useEffect(() => {
    if (!path) return
    let cancelled = false
    apiGet<T>(path)
      .then((d) => {
        if (!cancelled) {
          setData(d)
          setError(null)
          setLoadedKey(`${path}#${tick}`)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message)
          setLoadedKey(`${path}#${tick}`)
        }
      })
    return () => { cancelled = true }
  }, [path, tick])

  const loading = key !== null && key !== loadedKey
  const refresh = useCallback(() => setTick((t) => t + 1), [])
  return { data, error, loading, refresh }
}

/** Fetch a static GeoJSON asset from /public/geo. */
export function useGeoJson(path: string | null) {
  return useApi<GeoJSON.FeatureCollection>(path)
}
