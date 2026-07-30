import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages project-site base path — this app is hosted at
// github.com/creightonnn/Tethered, which Pages serves from
// creightonnn.github.io/Tethered/, not the domain root.
const BASE = '/Tethered/'

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'Tethered: stay with your group',
        short_name: 'Tethered',
        description: 'Keeps a tour group together, on and off the bus.',
        theme_color: '#1c2340',
        background_color: '#1c2340',
        display: 'standalone',
        start_url: `${BASE}app`,
        scope: BASE,
        icons: [
          { src: `${BASE}icon.svg`, sizes: 'any', type: 'image/svg+xml' },
          { src: `${BASE}icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The whole point of the product is that the core loop survives with
        // no network — precache the full app shell so /app never needs a
        // live request once it has loaded once.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: `${BASE}index.html`,
        navigateFallbackDenylist: [new RegExp(`^${BASE}$`)],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      ignored: ['**/.vs/**', '**/.remember/**', '**/.claude/**'],
    },
  },
})
