<template>
  <section :class="style.placeMap">
    <SectionHeader
      header="Место на карте"
      :paragraph="place.address || place.name"
      level="h3" />
    <div :class="style.viewport">
      <div
        ref="map"
        :class="style.map" />
      <div
        v-if="ready"
        :class="style.controls">
        <Button
          variant="ghost"
          size="sm"
          icon-only
          :class="style.zoomButton"
          @click="changeZoom(1)">
          +
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon-only
          :class="style.zoomButton"
          @click="changeZoom(-1)">
          −
        </Button>
      </div>
      <div
        v-if="loading || error"
        :class="style.status">
        <PhMapPin :size="28" />
        <p>{{ loading ? 'Загружаем карту…' : error }}</p>
        <Button
          v-if="error && canRetry"
          variant="secondary"
          size="sm"
          @click="initializeMap">
          Попробовать ещё раз
        </Button>
      </div>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent, markRaw, type PropType, type Raw } from 'vue'
import type { Map as MapboxMap, Marker } from 'mapbox-gl'
import { PhMapPin } from '@phosphor-icons/vue'
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import { Button } from '@/components/ui'
import type { Place } from '@/types/trip.types'
import { getMapboxToken, mapboxStyle } from '@/pages/Places/PlaceMapPicker/mapbox'
import { lookupPlaces } from '@/pages/Places/PlaceMapPicker/geocoding'
import style from './PlaceMap.module.scss'

export default defineComponent({
  name: 'PlaceMap',
  components: { SectionHeader, Button, PhMapPin },
  props: {
    place: { type: Object as PropType<Place>, required: true },
  },
  data() {
    return {
      style,
      map: null as Raw<MapboxMap> | null,
      marker: null as Raw<Marker> | null,
      observer: null as ResizeObserver | null,
      controller: null as AbortController | null,
      loadTimer: undefined as ReturnType<typeof setTimeout> | undefined,
      loading: true,
      ready: false,
      error: '',
      canRetry: true,
    }
  },
  computed: {
    locationKey(): string {
      return JSON.stringify([this.place.id, this.place.address, this.place.coordinates])
    },
  },
  watch: {
    locationKey() {
      this.initializeMap()
    },
  },
  mounted() {
    this.initializeMap()
  },
  beforeUnmount() {
    this.disposeMap()
  },
  methods: {
    disposeMap() {
      this.controller?.abort()
      clearTimeout(this.loadTimer)
      this.observer?.disconnect()
      this.marker?.remove()
      this.map?.remove()
      this.marker = null
      this.map = null
    },
    async initializeMap() {
      this.disposeMap()
      const controller = markRaw(new AbortController())
      this.controller = controller
      this.loading = true
      this.ready = false
      this.error = ''
      this.canRetry = Boolean(getMapboxToken())
      if (!this.canRetry) {
        this.loading = false
        this.error = 'Карта сейчас недоступна.'
        return
      }
      try {
        let coordinates = this.place.coordinates
        if (!coordinates && this.place.address.trim()) {
          const results = await lookupPlaces(
            this.place.address,
            AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
          )
          coordinates = results[0]
        }
        if (controller.signal.aborted) return
        if (
          !coordinates ||
          !Number.isFinite(coordinates.latitude) ||
          !Number.isFinite(coordinates.longitude) ||
          Math.abs(coordinates.latitude) > 90 ||
          Math.abs(coordinates.longitude) > 180
        ) {
          this.loading = false
          this.error = 'Не удалось найти место на карте. Уточните адрес в карточке места.'
          this.canRetry = false
          return
        }
        const { default: mapbox } = await import('mapbox-gl')
        if (controller.signal.aborted) return
        const point: [number, number] = [coordinates.longitude, coordinates.latitude]
        const map = markRaw(
          new mapbox.Map({
            container: this.$refs.map as HTMLElement,
            accessToken: getMapboxToken(),
            style: mapboxStyle,
            center: point,
            zoom: 15,
            minZoom: 2,
            maxZoom: 19,
            language: 'ru',
            scrollZoom: false,
            dragRotate: false,
            pitchWithRotate: false,
            touchPitch: false,
            attributionControl: false,
          }),
        )
        this.map = map
        map.addControl(new mapbox.AttributionControl({ compact: true }), 'bottom-right')
        map.touchZoomRotate.disableRotation()
        this.marker = markRaw(
          new mapbox.Marker({
            color: getComputedStyle(this.$el).getPropertyValue('--primary').trim(),
          })
            .setLngLat(point)
            .addTo(map),
        )
        map.on('load', () => {
          if (controller.signal.aborted) return
          clearTimeout(this.loadTimer)
          this.loading = false
          this.ready = true
        })
        map.on('error', () => {
          if (!controller.signal.aborted && !this.ready) this.failLoading()
        })
        this.loadTimer = setTimeout(() => this.failLoading(), 15000)
        this.observer = markRaw(new ResizeObserver(() => map.resize()))
        this.observer.observe(this.$refs.map as HTMLElement)
      } catch {
        if (!controller.signal.aborted) this.failLoading()
      }
    },
    failLoading() {
      this.disposeMap()
      this.loading = false
      this.ready = false
      this.error = 'Не удалось загрузить карту. Попробуйте ещё раз.'
    },
    changeZoom(delta: number) {
      if (!this.ready || !this.map) return
      this.map.setZoom(Math.max(2, Math.min(19, this.map.getZoom() + delta)))
    },
  },
})
</script>
