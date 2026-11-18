import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PlaceMap from '@/components/PlaceMap/PlaceMap.vue'
import type { Place } from '@/types/trip.types'

const mocks = vi.hoisted(() => ({
  token: vi.fn<() => string>(() => 'test-token'),
  lookup: vi.fn<(address: string, signal: AbortSignal) => Promise<unknown>>(),
  mapOptions: vi.fn<(options: unknown) => void>(),
  remove: vi.fn<() => void>(),
  markerPoint: vi.fn<(point: unknown) => void>(),
}))

vi.mock('@/pages/Places/PlaceMapPicker/mapbox', () => ({
  getMapboxToken: mocks.token,
  mapboxStyle: 'test-style',
}))
vi.mock('@/pages/Places/PlaceMapPicker/geocoding', () => ({ lookupPlaces: mocks.lookup }))
vi.mock('mapbox-gl', () => ({
  default: {
    Map: class {
      touchZoomRotate = { disableRotation: vi.fn<() => void>() }
      constructor(options: unknown) {
        mocks.mapOptions(options)
      }
      addControl() {}
      on(event: string, callback: () => void) {
        if (event === 'load') queueMicrotask(callback)
      }
      remove = mocks.remove
      resize() {}
    },
    Marker: class {
      setLngLat(point: unknown) {
        mocks.markerPoint(point)
        return this
      }
      addTo() {
        return this
      }
      remove() {}
    },
    AttributionControl: class {},
  },
}))

const place: Place = {
  id: 'place',
  name: 'Место',
  address: 'Тверская улица, 7',
  coordinates: { latitude: 55.757, longitude: 37.615 },
  category: '',
  description: '',
  image: '',
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.token.mockReturnValue('test-token')
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
})
afterEach(() => vi.unstubAllGlobals())

describe('attached place map', () => {
  it('centers a fixed marker on saved coordinates without looking up the address', async () => {
    const wrapper = mount(PlaceMap, { props: { place } })
    await flushPromises()
    expect(mocks.mapOptions).toHaveBeenCalledWith(
      expect.objectContaining({ center: [37.615, 55.757] }),
    )
    expect(mocks.markerPoint).toHaveBeenCalledWith([37.615, 55.757])
    expect(mocks.lookup).not.toHaveBeenCalled()
    expect(wrapper.vm.ready).toBe(true)
    wrapper.unmount()
    expect(mocks.remove).toHaveBeenCalledOnce()
  })

  it('looks up the saved address when coordinates are absent', async () => {
    mocks.lookup.mockResolvedValue([{ latitude: 55.757, longitude: 37.615 }])
    const wrapper = mount(PlaceMap, { props: { place: { ...place, coordinates: undefined } } })
    await flushPromises()
    expect(mocks.lookup).toHaveBeenCalledWith(place.address, expect.any(AbortSignal))
    expect(mocks.markerPoint).toHaveBeenCalledWith([37.615, 55.757])
    wrapper.unmount()
  })

  it('does not initialize a map after the event details have been closed', async () => {
    let resolveLookup!: (value: unknown) => void
    mocks.lookup.mockReturnValue(
      new Promise((resolve) => {
        resolveLookup = resolve
      }),
    )
    const wrapper = mount(PlaceMap, { props: { place: { ...place, coordinates: undefined } } })
    wrapper.unmount()
    resolveLookup([{ latitude: 55.757, longitude: 37.615 }])
    await flushPromises()
    expect(mocks.mapOptions).not.toHaveBeenCalled()
  })

  it('shows an explanation without a misleading marker when the address is not found', async () => {
    mocks.lookup.mockResolvedValue([])
    const wrapper = mount(PlaceMap, { props: { place: { ...place, coordinates: undefined } } })
    await flushPromises()
    expect(wrapper.text()).toContain('Не удалось найти место на карте.')
    expect(mocks.mapOptions).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('shows a fallback when the map service is unavailable', async () => {
    mocks.token.mockReturnValue('')
    const wrapper = mount(PlaceMap, { props: { place } })
    await flushPromises()
    expect(wrapper.text()).toContain('Карта сейчас недоступна.')
    expect(mocks.mapOptions).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
