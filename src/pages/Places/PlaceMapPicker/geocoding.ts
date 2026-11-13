import type { PlaceCoordinates } from '@/types/trip.types'
import type { GeocodedPlace, GeocodingOptions } from './PlaceMapPicker.types'
import { getMapboxToken } from './mapbox'

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function readGeocodedPlace(feature: unknown): GeocodedPlace | undefined {
  const geometry = record(record(feature).geometry)
  const coordinates = geometry.coordinates
  if (geometry.type !== 'Point' || !Array.isArray(coordinates)) return
  const [longitude, latitude] = coordinates
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180
  )
    return
  const properties = record(record(feature).properties)
  const context = record(properties.context)
  const address = record(context.address)
  const street =
    text(address.street_name) ||
    text(record(context.street).name) ||
    (properties.feature_type === 'street' ? text(properties.name) : '')
  const house = text(address.address_number)
  const city = text(record(context.place).name) || text(record(context.locality).name)
  const mapboxId = text(properties.mapbox_id) || text(record(feature).id)
  return {
    ...(mapboxId ? { mapboxId } : {}),
    latitude,
    longitude,
    address: street ? [street, house].filter(Boolean).join(', ') : '',
    name: text(properties.name),
    locality: [...new Set([city, text(record(context.country).name)].filter(Boolean))].join(', '),
    hasHouse: Boolean(street && house),
  }
}

export class MapboxGeocodingError extends Error {
  readonly status: number

  constructor(status: number) {
    let message = 'Сервис адресов Mapbox временно недоступен. Попробуйте позже.'
    if (status === 401)
      message = 'Mapbox отклонил токен доступа. Проверьте токен в настройках приложения.'
    else if (status === 429) message = 'Превышен лимит запросов Mapbox. Повторите попытку позже.'
    else if (status === 403)
      message =
        'Mapbox запретил поиск адресов. Проверьте права токена и разрешённые URL приложения.'
    else if (status === 400 || status === 422)
      message = 'Mapbox не принял запрос. Уточните улицу, дом и город.'
    super(message)
    this.name = 'MapboxGeocodingError'
    this.status = status
  }
}

export function geocodingErrorMessage(error: unknown, fallback: string): string {
  return error instanceof MapboxGeocodingError ? error.message : fallback
}

export async function lookupPlaces(
  query: string | PlaceCoordinates,
  signal: AbortSignal,
  options: GeocodingOptions = {},
): Promise<GeocodedPlace[]> {
  const token = getMapboxToken()
  if (!token) throw new Error('Mapbox access token is missing')
  const forward = typeof query === 'string'
  const parameters = new URLSearchParams({
    access_token: token,
    language: 'ru',
    permanent: 'false',
  })
  if (forward) {
    parameters.set('q', query.trim())
    parameters.set('autocomplete', 'false')
    parameters.set('limit', '5')
    parameters.set('types', 'address,street,place,locality')
    if (options.proximity) {
      parameters.set('proximity', `${options.proximity.longitude},${options.proximity.latitude}`)
    }
  } else {
    parameters.set('latitude', String(query.latitude))
    parameters.set('longitude', String(query.longitude))
    parameters.set('types', 'address,street')
    // Reverse geocoding allows limit only when requesting a single feature type.
  }
  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/${forward ? 'forward' : 'reverse'}?${parameters}`,
    { signal },
  )
  if (!response.ok) {
    throw new MapboxGeocodingError(response.status)
  }
  const data: unknown = await response.json()
  const features = record(data).features
  if (!Array.isArray(features)) throw new Error('Invalid Mapbox geocoding response')
  return features.map(readGeocodedPlace).filter((place) => place !== undefined)
}
