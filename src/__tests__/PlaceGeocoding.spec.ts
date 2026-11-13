import { afterEach, describe, expect, it, vi } from 'vitest'
import { lookupPlaces, readGeocodedPlace } from '@/pages/Places/PlaceMapPicker/geocoding'

function result(street: string | null, house: string | null, coordinates = [37.61, 55.75]) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates },
    properties: {
      feature_type: street ? 'address' : 'place',
      name: 'Название места',
      context: {
        address: { street_name: street, address_number: house },
        place: { name: 'Москва' },
        country: { name: 'Россия' },
      },
    },
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('Mapbox address formatting', () => {
  it('reads longitude first and keeps street and house separate from city and country', () => {
    expect(readGeocodedPlace(result(' Тверская улица ', ' 7, корпус 1 '))).toEqual({
      latitude: 55.75,
      longitude: 37.61,
      address: 'Тверская улица, 7, корпус 1',
      name: 'Название места',
      locality: 'Москва, Россия',
      hasHouse: true,
    })
  })

  it('does not turn a place name into a street or invent a missing house number', () => {
    expect(readGeocodedPlace(result(null, null))).toMatchObject({ address: '', hasHouse: false })
    expect(readGeocodedPlace(result('Тверская улица', null))).toMatchObject({
      address: 'Тверская улица',
      hasHouse: false,
    })
  })

  it('reads the identity of a Mapbox result', () => {
    const feature = { ...result('Тверская улица', '7'), id: 'selected-mapbox-id' }
    expect(readGeocodedPlace(feature)?.mapboxId).toBe('selected-mapbox-id')
  })

  it('uses the street context or a street feature name when no address is returned', () => {
    const feature = result(null, null)
    feature.properties.feature_type = 'street'
    feature.properties.name = 'Тверская улица'
    expect(readGeocodedPlace(feature)?.address).toBe('Тверская улица')
  })

  it('rejects malformed coordinates and payloads before they can reach the form', () => {
    expect(readGeocodedPlace(result('Тверская улица', '7', [37, NaN]))).toBeUndefined()
    expect(readGeocodedPlace(result('Тверская улица', '7', [190, 55]))).toBeUndefined()
    expect(readGeocodedPlace(null)).toBeUndefined()
    expect(
      readGeocodedPlace({ geometry: { type: 'Polygon', coordinates: [[0, 0]] } }),
    ).toBeUndefined()
  })
})

describe('Mapbox Geocoding v6 requests', () => {
  it('previews addresses without permanent storage or autocomplete', async () => {
    vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'pk.test')
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ features: [result('Тверская улица', '7')] })),
      )
    vi.stubGlobal('fetch', fetch)
    const signal = new AbortController().signal
    const places = await lookupPlaces(' Москва Тверская 7 ', signal, {
      proximity: { latitude: 55.75, longitude: 37.61 },
    })
    const url = new URL(String(fetch.mock.calls[0]![0]))
    expect(url.pathname).toBe('/search/geocode/v6/forward')
    expect(url.searchParams.get('q')).toBe('Москва Тверская 7')
    expect(url.searchParams.get('proximity')).toBe('37.61,55.75')
    expect(url.searchParams.get('permanent')).toBe('false')
    expect(url.searchParams.get('autocomplete')).toBe('false')
    expect(fetch.mock.calls[0]![1]).toEqual({ signal })
    expect(places[0]?.address).toBe('Тверская улица, 7')
  })

  it('sends latitude and longitude explicitly and permits address or street fallback', async () => {
    vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'pk.test')
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ features: [] })))
    vi.stubGlobal('fetch', fetch)
    await lookupPlaces({ latitude: 55.75, longitude: 37.61 }, new AbortController().signal)
    const url = new URL(String(fetch.mock.calls[0]![0]))
    expect(url.pathname).toBe('/search/geocode/v6/reverse')
    expect(url.searchParams.get('latitude')).toBe('55.75')
    expect(url.searchParams.get('longitude')).toBe('37.61')
    expect(url.searchParams.get('types')).toBe('address,street')
    expect(url.searchParams.has('limit')).toBe(false)
    expect(url.searchParams.get('permanent')).toBe('false')
  })

  it('reports rejected credentials and invalid API responses instead of empty results', async () => {
    vi.stubEnv('VITE_MAPBOX_ACCESS_TOKEN', 'pk.test')
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Error' })))
    vi.stubGlobal('fetch', fetch)
    await expect(lookupPlaces('Москва', new AbortController().signal)).rejects.toMatchObject({
      status: 401,
      message: expect.stringContaining('токен'),
    })
    await expect(lookupPlaces('Москва', new AbortController().signal)).rejects.toThrow(
      'Invalid Mapbox',
    )
  })
})
