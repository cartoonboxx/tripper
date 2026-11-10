export interface TodayForecast {
  temperature: number
  code: number
  low: number
  high: number
  precipitation: number
}
export interface WeatherResponse {
  current: { temperature_2m: number; weather_code: number }
  daily: {
    temperature_2m_min: number[]
    temperature_2m_max: number[]
    precipitation_probability_max: number[]
  }
}
