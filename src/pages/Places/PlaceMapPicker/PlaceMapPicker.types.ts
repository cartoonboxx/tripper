import type { PlaceCoordinates } from '@/types/trip.types'

export interface PlaceMapSelection extends PlaceCoordinates {
  address?: string
}

export interface GeocodedPlace extends PlaceCoordinates {
  mapboxId?: string
  address: string
  name: string
  locality: string
  hasHouse: boolean
}

export interface GeocodingOptions {
  proximity?: PlaceCoordinates
}
