import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
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
        start_url: '/app',
        scope: '/',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The whole point of the product is that the core loop survives with
        // no network — precache the full app shell so /app never needs a
        // live request once it has loaded once.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/$/],
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
