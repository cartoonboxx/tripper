export function getMapboxToken(): string {
  return import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() || ''
}

export const mapboxStyle = 'mapbox://styles/mapbox/streets-v12'
