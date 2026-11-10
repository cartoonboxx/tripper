<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import { PhMapPin } from '@phosphor-icons/vue'
import { Button, Card } from '@/components/ui'
import type { TodayForecast, WeatherResponse } from './TodayWeather.types'
import { weatherCondition } from './TodayWeather.data'
import style from './TodayWeather.module.scss'

export default defineComponent({
  name: 'TodayWeather',
  components: { Button, Card, PhMapPin },
  data() {
    return {
      style,
      forecast: null as TodayForecast | null,
      loading: false,
      error: '',
      disposed: false,
      controller: null as AbortController | null,
    }
  },
  computed: {
    condition() {
      return weatherCondition(this.forecast?.code ?? 0)
    },
  },
  mounted() {
    this.loadWeather()
  },
  beforeUnmount() {
    this.disposed = true
    this.controller?.abort()
  },
  methods: {
    async loadWeather() {
      if (this.loading) return
      if (!navigator.geolocation) {
        this.error = 'Геолокация недоступна в этом браузере.'
        return
      }
      this.loading = true
      this.error = ''
      this.forecast = null
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 300000,
          })
        })
        if (this.disposed) return
        const query = new URLSearchParams({
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
          current: 'temperature_2m,weather_code',
          daily: 'temperature_2m_min,temperature_2m_max,precipitation_probability_max',
          timezone: 'auto',
          forecast_days: '1',
        })
        this.controller = markRaw(new AbortController())
        const timeout = setTimeout(() => this.controller?.abort(), 10000)
        try {
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`, {
            signal: this.controller.signal,
          })
          if (!response.ok) throw new Error('Weather request failed')
          const data: WeatherResponse = await response.json()
          const values = [
            data.current?.temperature_2m,
            data.current?.weather_code,
            data.daily?.temperature_2m_min?.[0],
            data.daily?.temperature_2m_max?.[0],
            data.daily?.precipitation_probability_max?.[0],
          ]
          if (!values.every((value) => typeof value === 'number' && Number.isFinite(value)))
            throw new Error('Invalid forecast')
          if (this.disposed) return
          this.forecast = {
            temperature: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
            low: Math.round(data.daily.temperature_2m_min[0]!),
            high: Math.round(data.daily.temperature_2m_max[0]!),
            precipitation: data.daily.precipitation_probability_max[0]!,
          }
        } finally {
          clearTimeout(timeout)
        }
      } catch (error) {
        if (this.disposed) return
        this.error =
          typeof error === 'object' && error !== null && 'code' in error && error.code === 1
            ? 'Разрешите доступ к геолокации в настройках браузера, чтобы увидеть погоду рядом с вами.'
            : 'Не удалось получить погоду. Проверьте геолокацию и подключение к интернету.'
      } finally {
        this.loading = false
      }
    },
  },
})
</script>
<template>
  <Card :class="style.weather">
    <div :class="style.heading">
      <div>
        <h2>Погода сегодня</h2>
        <p>
          <PhMapPin :size="15" />
          По вашему местоположению
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        :disabled="loading"
        @click="loadWeather">
        {{ loading ? 'Загрузка…' : 'Обновить погоду' }}
      </Button>
    </div>
    <div
      v-if="forecast"
      :class="style.forecast">
      <component
        :is="condition.icon"
        :size="36" />
      <strong>{{ forecast.temperature }}°C</strong>
      <div>
        <p>{{ condition.label }}</p>
        <span>
          Сегодня от {{ forecast.low }}° до {{ forecast.high }}° · Осадки
          {{ forecast.precipitation }}%
        </span>
      </div>
    </div>
    <p
      v-else
      :class="style.message">
      {{ loading ? 'Определяем местоположение и загружаем прогноз…' : error }}
    </p>
    <a
      href="https://open-meteo.com/"
      target="_blank"
      rel="noopener noreferrer"
      :class="style.source">
      Данные Open-Meteo
    </a>
  </Card>
</template>
