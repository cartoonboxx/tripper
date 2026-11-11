import { PhGearSix } from '@phosphor-icons/vue'
import {
  PhHouse,
  PhSuitcaseRolling,
  PhMapPin,
  PhListChecks,
  PhWallet,
  PhArchive,
} from '@phosphor-icons/vue'
import type { NavItem } from '@/types/trip.types'
export const navigation: NavItem[] = [
  { label: 'Главная', to: '/', icon: PhHouse },
  { label: 'Поездки', to: '/trips', icon: PhSuitcaseRolling },
  { label: 'Места', to: '/places', icon: PhMapPin },
  { label: 'Чек-листы', to: '/checklists', icon: PhListChecks },
  { label: 'Расходы', to: '/expenses', icon: PhWallet },
  { label: 'Архив', to: '/archive', icon: PhArchive },
]
export const tripNavigation = [
  { label: 'Сегодня', path: 'today' },
  { label: 'План поездки', path: 'plan' },
  { label: 'Чек-листы', path: 'checklists' },
  { label: 'Расходы', path: 'expenses' },
  { label: 'Участники', path: 'participants' },
]
export const mobileNavigation = navigation.slice(0, 4)
export const moreNavigation: NavItem[] = [
  ...navigation.slice(4),
  { label: 'Настройки', to: '/settings', icon: PhGearSix },
]
