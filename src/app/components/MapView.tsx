import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import type { Feature, LineString } from 'geojson'
import type { LatLng } from '../../lib/geo'

// Vite doesn't resolve maplibre-gl's worker entry on its own (dev server
// 404s on it) — point the library at the bundled worker URL explicitly.
// See https://maplibre.org/maplibre-gl-js/docs/guides/vite/
maplibregl.setWorkerUrl(maplibreWorkerUrl)

// Free, keyless vector tiles — no API key needed, matches the app's
// muted paper/navy palette better than a saturated default style.
const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/positron'

const EMPTY_LINE: Feature<LineString> = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: [] },
}

function lineTo(a: LatLng, b: LatLng): Feature<LineString> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [
        [a.lng, a.lat],
        [b.lng, b.lat],
      ],
    },
  }
}

export function MapView({
  busPin,
  position,
  height = 240,
}: {
  busPin: LatLng
  position: LatLng | null
  height?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const meMarkerRef = useRef<maplibregl.Marker | null>(null)
  const readyRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OPENFREEMAP_STYLE,
      center: [busPin.lng, busPin.lat],
      zoom: 15,
      interactive: false,
    })
    mapRef.current = map

    const busEl = document.createElement('div')
    busEl.className = 'map-marker map-marker--bus'
    new maplibregl.Marker({ element: busEl })
      .setLngLat([busPin.lng, busPin.lat])
      .addTo(map)

    map.on('load', () => {
      map.addSource('route-line', { type: 'geojson', data: EMPTY_LINE })
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-line',
        paint: {
          'line-color': '#c9822a',
          'line-width': 3,
          'line-dasharray': [1, 1.4],
        },
      })
      readyRef.current = true
    })

    return () => {
      readyRef.current = false
      map.remove()
      mapRef.current = null
      meMarkerRef.current = null
    }
    // Intentionally scoped to busPin so the map only re-inits when the bus
    // location changes, not on every render.
  }, [busPin.lat, busPin.lng])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !position || !readyRef.current) return

    if (!meMarkerRef.current) {
      const meEl = document.createElement('div')
      meEl.className = 'map-marker map-marker--me'
      meMarkerRef.current = new maplibregl.Marker({ element: meEl })
        .setLngLat([position.lng, position.lat])
        .addTo(map)
    } else {
      meMarkerRef.current.setLngLat([position.lng, position.lat])
    }

    const source = map.getSource('route-line') as maplibregl.GeoJSONSource
    source.setData(lineTo(position, busPin))

    const bounds = new maplibregl.LngLatBounds()
    bounds.extend([position.lng, position.lat])
    bounds.extend([busPin.lng, busPin.lat])
    map.fitBounds(bounds, { padding: 48, maxZoom: 17, duration: 400 })
  }, [position, busPin])

  return <div ref={containerRef} className="map-view" style={{ height }} />
}
