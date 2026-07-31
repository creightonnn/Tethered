import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { LatLng } from '../../lib/geo'
import { MAP_STYLE } from './mapSetup'

/** Interactive pin placement: tap the map or drag the marker to set an
 * exact location, instead of being limited to wherever the device's own
 * geolocation currently reports. `value` is only the map's starting
 * center — the map does not re-center itself as `value` changes later,
 * so it doesn't fight the guide mid-drag. */
export function LocationPicker({
  value,
  onChange,
  height = 240,
}: {
  value: LatLng
  onChange: (pos: LatLng) => void
  height?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [value.lng, value.lat],
      zoom: 15,
    })

    const markerEl = document.createElement('div')
    markerEl.className = 'map-marker map-marker--pick'
    const marker = new maplibregl.Marker({ element: markerEl, draggable: true })
      .setLngLat([value.lng, value.lat])
      .addTo(map)

    marker.on('dragend', () => {
      const pos = marker.getLngLat()
      onChangeRef.current({ lat: pos.lat, lng: pos.lng })
    })

    map.on('click', (e) => {
      marker.setLngLat(e.lngLat)
      onChangeRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng })
    })

    return () => {
      map.remove()
    }
    // Deliberately runs once on mount only — see the doc comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="map-view map-view--pick" ref={containerRef} style={{ height }} />
  )
}
