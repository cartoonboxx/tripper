import type { Categories, CategoryDomain } from '@/types/category.types'

export const defaultCategories: Categories = {
  expenses: ['Проживание', 'Транспорт', 'Питание', 'Развлечения', 'Прочее'],
  places: [
    'Достопримечательность',
    'Парк',
    'Музей',
    'Кафе',
    'Ресторан',
    'Рынок',
    'Смотровая площадка',
  ],
  events: ['Прогулка', 'Музей', 'Еда', 'Достопримечательность', 'Транспорт', 'Прочее'],
}

export const categoryDomains = [
  { label: 'Категории расходов', value: 'expenses' },
  { label: 'Категории мест', value: 'places' },
  { label: 'Категории событий', value: 'events' },
] satisfies { label: string; value: CategoryDomain }[]
