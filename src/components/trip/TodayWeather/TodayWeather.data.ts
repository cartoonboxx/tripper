import {
  PhSun,
  PhCloud,
  PhCloudFog,
  PhCloudRain,
  PhSnowflake,
  PhCloudLightning,
} from '@phosphor-icons/vue'

export function weatherCondition(code: number) {
  if (code === 0) return { label: 'Ясно', icon: PhSun }
  if (code <= 2) return { label: 'Переменная облачность', icon: PhCloud }
  if (code === 3) return { label: 'Пасмурно', icon: PhCloud }
  if (code === 45 || code === 48) return { label: 'Туман', icon: PhCloudFog }
  if (code >= 51 && code <= 57) return { label: 'Морось', icon: PhCloudRain }
  if (code >= 61 && code <= 67) return { label: 'Дождь', icon: PhCloudRain }
  if (code >= 71 && code <= 77) return { label: 'Снег', icon: PhSnowflake }
  if (code >= 80 && code <= 82) return { label: 'Ливень', icon: PhCloudRain }
  if (code === 85 || code === 86) return { label: 'Снегопад', icon: PhSnowflake }
  if (code >= 95) return { label: 'Гроза', icon: PhCloudLightning }
  return { label: 'Погодные условия', icon: PhCloud }
}
