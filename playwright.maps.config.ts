import { defineConfig } from '@playwright/test'
import base from './playwright.config'

// Run the actual Mapbox GL SDK against local map and geocoding fixtures.
export default defineConfig({
  ...base,
  testMatch: '**/place-map*.spec.ts',
  testIgnore: [],
  use: { ...base.use, baseURL: 'http://localhost:5176' },
  webServer: {
    command: 'npm run dev -- --port 5176 --strictPort',
    port: 5176,
    reuseExistingServer: false,
    env: { VITE_MAPBOX_ACCESS_TOKEN: 'pk.eyJ1IjoidHJpcHBlci1lMmUiLCJhIjoiY2xvY2FsIn0.fixture' },
  },
})
