<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      :class="[style.dialog, fullscreen && style.dialogFullscreen]"
      @cancel.prevent="$emit('close')"
      @click="closeOnBackdrop">
      <div :class="style.panel">
        <SectionHeader
          header="Место на карте"
          paragraph="Укажите адрес места на карте.">
          <template #actions>
            <Button
              variant="ghost"
              size="md"
              @click="fullscreen = !fullscreen">
              <PhCornersIn
                v-if="fullscreen"
                :size="18" />
              <PhCornersOut
                v-else
                :size="18" />
              {{ fullscreen ? 'Свернуть' : 'На весь экран' }}
            </Button>
            <Button
              variant="ghost"
              size="md"
              iconOnly
              @click="$emit('close')">
              <PhX :size="18" />
            </Button>
          </template>
        </SectionHeader>
        <div :class="style.workspace">
          <aside :class="style.sidebar">
            <form
              :class="style.search"
              @submit.prevent="searchPlaces">
              <Input
                v-model="query"
                label="Поиск адреса"
                placeholder="Город, улица, дом"
                autocomplete="off">
                <template #prefix><PhMagnifyingGlass :size="18" /></template>
              </Input>
              <Button
                type="submit"
                :disabled="!mapReady || searching || !query.trim()">
                {{ searching ? 'Ищем…' : 'Найти' }}
              </Button>
            </form>
            <p
              v-if="searchError"
              :class="style.error">
              {{ searchError }}
            </p>
            <ul
              v-if="results.length"
              :class="style.results">
              <li
                v-for="(result, index) in results"
                :key="index">
                <button
                  type="button"
                  @click="chooseResult(result)">
                  <PhMapPin :size="20" />
                  <span>
                    <strong>{{ result.address || result.name || 'Место на карте' }}</strong>
                    <small>{{ result.locality }}</small>
                  </span>
                </button>
              </li>
            </ul>
            <div :class="style.addressCard">
              <div :class="style.addressHeading">
                <PhMapPin :size="20" />
                <span>{{ resolving ? 'Определяем адрес…' : 'Выбранное место' }}</span>
              </div>
              <Input
                v-model="selectedAddress"
                label="Улица и дом"
                :disabled="resolving"
                placeholder="Выберите дом на карте" />
              <p
                v-if="locality"
                :class="style.locality">
                {{ locality }}
              </p>
              <p
                v-if="addressError"
                :class="style.help">
                {{ addressError }}
              </p>
              <p
                v-else
                :class="style.help">
                Этот адрес будет сохранён в карточке места. При необходимости его можно исправить.
              </p>
            </div>
            <p
              v-if="locationError"
              :class="style.help">
              {{ locationError }}
            </p>
          </aside>
          <div
            :class="style.viewport"
            @pointerdown.stop="cancelLocation"
            @touchstart.stop="cancelLocation"
            @wheel.stop="cancelLocation">
            <div
              ref="map"
              :class="style.map" />
            <div :class="style.hint">Нажмите на нужный дом</div>

            <div :class="style.zoom">
              <button
                type="button"
                :disabled="!mapReady || zoom >= 19"
                @click="changeZoom(0.5)">
                <PhPlus :size="20" />
                <span :class="style.controlLabel">Приблизить</span>
              </button>
              <button
                type="button"
                :disabled="!mapReady || zoom <= 2"
                @click="changeZoom(-0.5)">
                <PhMinus :size="20" />
                <span :class="style.controlLabel">Отдалить</span>
              </button>
            </div>
            <button
              type="button"
              :class="style.locate"
              :disabled="locating || !mapReady"
              @click="locate">
              <PhNavigationArrow :size="18" />
              {{ locating ? 'Определяем…' : 'Моё местоположение' }}
            </button>
            <div
              v-if="loadingMap || mapError"
              :class="style.failure">
              <PhMapPin :size="32" />
              <p>{{ loadingMap ? 'Загружаем карту…' : mapError }}</p>
              <Button
                v-if="mapError && !missingKey"
                variant="secondary"
                size="sm"
                @click="initializeMap">
                Попробовать ещё раз
              </Button>
            </div>
          </div>
        </div>
        <footer :class="style.footer">
          <p
            v-if="hasPoint"
            :class="style.coordinates">
            Выбранная точка: {{ latitude.toFixed(6) }}, {{ longitude.toFixed(6) }}
          </p>
          <div :class="style.actions">
            <Button
              variant="secondary"
              @click="$emit('close')">
              Отмена
            </Button>
            <Button
              :disabled="!mapReady || !hasPoint || resolving || searching || draggingPoint"
              @click="confirmSelection">
              Сохранить адрес
            </Button>
          </div>
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>
<script lang="ts">
import type { Map as MapboxMap, Marker, MapMouseEvent } from 'mapbox-gl'
import { defineComponent, markRaw, type Raw, type PropType } from 'vue'
import {
  PhCornersIn,
  PhCornersOut,
  PhMapPin,
  PhNavigationArrow,
  PhMagnifyingGlass,
  PhPlus,
  PhMinus,
  PhX,
} from '@phosphor-icons/vue'
import { Button, Input } from '@/components/ui'
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import { createOverlayController } from '@/utils/overlay'
import type { OverlayController } from '@/utils/overlay.types'
import type { PlaceCoordinates } from '@/types/trip.types'
import { geocodingErrorMessage, lookupPlaces } from './geocoding'
import { getMapboxToken, mapboxStyle } from './mapbox'
import type { GeocodedPlace, PlaceMapSelection } from './PlaceMapPicker.types'
import style from './PlaceMapPicker.module.scss'

export default defineComponent({
  name: 'PlaceMapPicker',
  components: {
    Button,
    Input,
    SectionHeader,
    PhCornersIn,
    PhCornersOut,
    PhMapPin,
    PhNavigationArrow,
    PhMagnifyingGlass,
    PhPlus,
    PhMinus,
    PhX,
  },
  props: {
    address: { type: String, default: '' },
    coordinates: { type: Object as PropType<PlaceCoordinates>, default: undefined },
  },
  emits: {
    close: () => true,
    select: (selection: PlaceMapSelection) =>
      Number.isFinite(selection.latitude) && Number.isFinite(selection.longitude),
  },
  data() {
    return {
      style,
      fullscreen: false,
      overlay: null as OverlayController | null,
      mapbox: null as typeof import('mapbox-gl').default | null,
      map: null as Raw<MapboxMap> | null,
      marker: null as Raw<Marker> | null,
      draggingPoint: false,
      mapReady: false,
      mapLoadTimer: undefined as ReturnType<typeof setTimeout> | undefined,
      observer: null as ResizeObserver | null,
      disposed: false,
      loadingMap: false,
      mapError: '',
      missingKey: !getMapboxToken(),
      latitude: this.coordinates?.latitude ?? 55.7558,
      longitude: this.coordinates?.longitude ?? 37.6173,
      hasPoint: Boolean(this.coordinates),
      zoom: this.coordinates ? 17 : 12,
      zoomTarget: this.coordinates ? 17 : 12,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      locating: false,
      locationError: '',
      locationRequest: 0,
      query: this.address,
      results: [] as GeocodedPlace[],
      searching: false,
      searchError: '',
      resolving: false,
      selectedAddress: this.coordinates ? this.address : '',
      locality: '',
      addressError: '',
      lookupController: null as AbortController | null,
    }
  },
  mounted() {
    this.overlay = markRaw(
      createOverlayController(
        () => this.$refs.dialog as HTMLElement,
        () => this.$emit('close'),
        true,
      ),
    )
    this.overlay.open()
    ;(this.$refs.dialog as HTMLDialogElement).showModal()
    this.initializeMap()
  },
  beforeUnmount() {
    this.disposed = true
    this.cancelLocation()
    this.cancelLookup()
    this.observer?.disconnect()
    clearTimeout(this.mapLoadTimer)
    this.marker?.remove()
    this.map?.remove()
    this.map = null
    ;(this.$refs.dialog as HTMLDialogElement)?.close()
    this.overlay?.close()
  },
  watch: {
    query() {
      this.results = []
      this.searchError = ''
      if (this.searching) this.cancelLookup()
    },
  },
  methods: {
    closeOnBackdrop(event: MouseEvent) {
      if (event.target === event.currentTarget) this.$emit('close')
    },
    async initializeMap() {
      if (this.loadingMap || this.mapReady) return
      this.mapError = ''
      if (this.missingKey) {
        this.mapError = 'Карта ещё не подключена. Пока можно указать адрес в форме места.'
        return
      }
      this.observer?.disconnect()
      this.marker?.remove()
      this.marker = null
      this.map?.remove()
      this.map = null
      clearTimeout(this.mapLoadTimer)
      this.loadingMap = true
      try {
        const { default: mapbox } = await import('mapbox-gl')
        if (this.disposed) return
        if (!mapbox.supported()) throw new Error('WebGL is unavailable')
        this.mapbox = markRaw(mapbox)
        const host = this.$refs.map as HTMLElement
        this.map = markRaw(
          new mapbox.Map({
            container: host,
            accessToken: getMapboxToken(),
            style: mapboxStyle,
            center: [this.longitude, this.latitude],
            zoom: this.zoom,
            minZoom: 2,
            maxZoom: 19,
            language: 'ru',
            dragRotate: false,
            pitchWithRotate: false,
            touchPitch: false,
            attributionControl: false,
          }),
        )
        this.map.addControl(new mapbox.AttributionControl({ compact: true }), 'bottom-right')
        this.map.touchZoomRotate.disableRotation()
        this.map.scrollZoom.setWheelZoomRate(1 / 900)
        this.map.scrollZoom.setZoomRate(1 / 180)
        this.map.on('zoom', () => {
          this.zoom = this.map?.getZoom() ?? this.zoom
        })
        this.map.on('zoomend', () => {
          this.zoomTarget = this.map?.getZoom() ?? this.zoomTarget
        })
        this.map.on('click', (event: MapMouseEvent) => {
          this.cancelLocation()
          this.selectCoordinates({ latitude: event.lngLat.lat, longitude: event.lngLat.lng })
        })
        this.map.on('load', () => {
          if (this.disposed) return
          clearTimeout(this.mapLoadTimer)
          this.loadingMap = false
          this.mapReady = true
          this.mapError = ''
          if (this.hasPoint) this.showMarker()
          if (this.hasPoint && !this.selectedAddress) this.resolveAddress()
        })
        this.map.on('error', () => {
          if (!this.mapReady && !this.disposed) this.failMapLoading()
        })
        this.mapLoadTimer = setTimeout(() => this.failMapLoading(), 15000)
        this.observer = markRaw(new ResizeObserver(() => this.map?.resize()))
        this.observer.observe(host)
      } catch {
        if (!this.disposed) this.failMapLoading()
      }
    },
    failMapLoading() {
      clearTimeout(this.mapLoadTimer)
      this.loadingMap = false
      this.mapError = 'Не удалось загрузить карту. Проверьте подключение и попробуйте ещё раз.'
    },
    showMarker() {
      if (!this.mapbox || !this.map || !this.hasPoint) return
      const point: [number, number] = [this.longitude, this.latitude]
      if (this.marker) {
        this.marker.setLngLat(point)
        return
      }
      this.marker = markRaw(
        new this.mapbox.Marker({ color: 'var(--primary)', draggable: true })
          .setLngLat(point)
          .addTo(this.map),
      )
      this.marker.on('dragstart', () => {
        this.draggingPoint = true
        this.cancelLocation()
        this.cancelLookup()
      })
      this.marker.on('dragend', () => {
        this.draggingPoint = false
        const point = this.marker?.getLngLat()
        if (point) this.selectCoordinates({ latitude: point.lat, longitude: point.lng })
      })
    },
    selectCoordinates(coordinates: PlaceCoordinates) {
      const { latitude, longitude } = coordinates
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90)
        return
      this.cancelLookup()
      this.latitude = latitude
      // Mapbox can return wrapped world copies beyond ±180 degrees.
      this.longitude = ((((longitude + 180) % 360) + 360) % 360) - 180
      this.hasPoint = true
      this.selectedAddress = ''
      this.locality = ''
      this.addressError = ''
      this.showMarker()
      this.resolveAddress()
    },
    changeZoom(delta: number) {
      if (!this.map || !this.mapReady) return
      const zoom = Math.min(19, Math.max(2, this.zoomTarget + delta))
      this.map.easeTo({ zoom, duration: this.reducedMotion ? 0 : 350 })
      this.zoomTarget = zoom
    },
    cancelLookup() {
      this.lookupController?.abort()
      this.lookupController = null
      this.resolving = false
      this.searching = false
    },
    async resolveAddress() {
      this.cancelLookup()
      this.resolving = true
      const controller = markRaw(new AbortController())
      this.lookupController = controller
      try {
        const results = await lookupPlaces(
          { latitude: this.latitude, longitude: this.longitude },
          AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
        )
        if (controller.signal.aborted) return
        const result =
          results.find((place) => place.hasHouse) ||
          results.find((place) => place.address) ||
          results[0]
        this.selectedAddress = result?.address || ''
        this.locality = result?.locality || ''
        this.addressError = this.selectedAddress
          ? ''
          : 'У этой точки нет улицы и номера дома. Укажите адрес вручную.'
      } catch (error) {
        if (controller.signal.aborted) return
        this.addressError = geocodingErrorMessage(
          error,
          'Не удалось определить адрес. Повторите попытку или укажите улицу и дом вручную.',
        )
      } finally {
        if (this.lookupController === controller) {
          this.resolving = false
          this.lookupController = null
        }
      }
    },
    async searchPlaces() {
      if (!this.mapReady || !this.query.trim()) return
      this.cancelLocation()
      this.cancelLookup()
      this.results = []
      this.searchError = ''
      this.searching = true
      const controller = markRaw(new AbortController())
      this.lookupController = controller
      try {
        const center = this.map?.getCenter()
        const results = await lookupPlaces(
          this.query.trim(),
          AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
          { proximity: center ? { latitude: center.lat, longitude: center.lng } : undefined },
        )
        if (controller.signal.aborted) return
        this.results = results
        if (!results.length)
          this.searchError = 'Адрес не найден. Добавьте город или выберите дом на карте.'
      } catch (error) {
        if (controller.signal.aborted) return
        this.searchError = geocodingErrorMessage(error, 'Поиск недоступен. Попробуйте ещё раз.')
      } finally {
        if (this.lookupController === controller) {
          this.searching = false
          this.lookupController = null
        }
      }
    },
    chooseResult(result: GeocodedPlace) {
      this.cancelLocation()
      this.cancelLookup()
      this.latitude = result.latitude
      this.longitude = result.longitude
      this.hasPoint = true
      this.selectedAddress = result.address
      this.locality = result.locality
      this.addressError = result.address ? '' : 'Уточните улицу и номер дома.'
      this.results = []
      this.showMarker()
      this.map?.easeTo({
        center: [result.longitude, result.latitude],
        zoom: result.hasHouse ? 17 : 15,
        duration: this.reducedMotion ? 0 : 600,
      })
    },
    confirmSelection() {
      if (
        !this.mapReady ||
        !this.hasPoint ||
        this.resolving ||
        this.searching ||
        this.draggingPoint
      )
        return
      this.$emit('select', {
        latitude: this.latitude,
        longitude: this.longitude,
        address: this.selectedAddress.trim(),
      })
    },
    cancelLocation() {
      this.locationRequest += 1
      this.locating = false
    },
    locate() {
      this.locationError = ''
      if (!navigator.geolocation) {
        this.locationError = 'Геолокация недоступна. Найдите адрес или выберите дом на карте.'
        return
      }
      const request = ++this.locationRequest
      this.locating = true
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (request !== this.locationRequest || !this.map) return
          this.locating = false
          this.selectCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          this.map.easeTo({
            center: [this.longitude, this.latitude],
            zoom: 16,
            duration: this.reducedMotion ? 0 : 600,
          })
        },
        () => {
          if (request !== this.locationRequest || !this.map) return
          this.locating = false
          this.locationError =
            'Не удалось определить местоположение. Найдите адрес или выберите дом на карте.'
        },
        { timeout: 10000, maximumAge: 300000, enableHighAccuracy: true },
      )
    },
  },
})
</script>
