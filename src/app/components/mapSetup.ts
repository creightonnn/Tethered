import * as maplibregl from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

// Vite doesn't resolve maplibre-gl's worker entry on its own (dev server
// 404s on it) — point the library at the bundled worker URL explicitly.
// See https://maplibre.org/maplibre-gl-js/docs/guides/vite/
maplibregl.setWorkerUrl(maplibreWorkerUrl)

// Free, keyless vector tiles — no API key needed, matches the app's
// muted paper/navy palette better than a saturated default style.
export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron'
