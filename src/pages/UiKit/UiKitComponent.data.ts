import {
  PhCalendarDots,
  PhCompass,
  PhMagnifyingGlass,
  PhMapPin,
  PhPlus,
  PhSuitcaseRolling,
  PhUsers,
  PhWallet,
} from '@phosphor-icons/vue'
export const catalog = [
  {
    id: 'buttons',
    name: 'Button',
    description: 'Четыре варианта, три размера, иконки и переходы.',
  },
  { id: 'fields', name: 'Input', description: 'Текст, поиск, даты, ошибки и недоступные поля.' },
  {
    id: 'selects',
    name: 'Select',
    description: 'Список вариантов с подписью и состоянием disabled.',
  },
  { id: 'tabs', name: 'Tab', description: 'Pill, line и vertical с переключением состояния.' },
  { id: 'badges', name: 'Badge', description: 'Метки статуса: green, neutral и orange.' },
  { id: 'avatars', name: 'Avatar', description: 'Инициалы, цвет и три размера.' },
  { id: 'cards', name: 'Card', description: 'Обычная карточка и интерактивный вариант.' },
  { id: 'checkboxes', name: 'Checkbox', description: 'Выбор с подписью и состоянием disabled.' },
  { id: 'switches', name: 'Switch', description: 'Нативный переключатель настроек.' },
  { id: 'empty', name: 'EmptyState', description: 'Пустой список с иконкой, текстом и действием.' },
  { id: 'modals', name: 'Modal', description: 'Обычное и широкое окно с сохранением фокуса.' },
  { id: 'drawers', name: 'Drawer', description: 'Боковая панель для подробностей.' },
]
export const destinations = [
  { label: 'Италия', value: 'italy' },
  { label: 'Россия', value: 'russia' },
  { label: 'Португалия', value: 'portugal' },
]
export const tabLabels = ['Все поездки', 'Предстоящие', 'Завершённые']
export const lineLabels = ['План', 'Места', 'Участники']
export const colors = [
  { name: 'Основной', token: '--primary', value: '#376B59' },
  { name: 'Фон', token: '--background', value: '#F7F8F5' },
  { name: 'Поверхность', token: '--surface', value: '#FFFFFF' },
  { name: 'Текст', token: '--text', value: '#202925' },
  { name: 'Мягкий фон', token: '--primary-soft', value: '#E5ECE6' },
]
export const spaces = [1, 2, 3, 4, 5, 6, 8, 10, 12]
export const radii = [1, 2, 3, 4, 5, 6]
export const iconSamples = [
  PhCompass,
  PhCalendarDots,
  PhMapPin,
  PhSuitcaseRolling,
  PhUsers,
  PhWallet,
  PhMagnifyingGlass,
  PhPlus,
]
