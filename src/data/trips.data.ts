import type {
  Trip,
  PlanEvent,
  Place,
  TripPlace,
  Checklist,
  Participant,
  Expense,
} from '@/types/trip.types'
import florence from '@/assets/images/florence.jpg'
import altai from '@/assets/images/altai.jpg'
import petersburg from '@/assets/images/petersburg.jpg'
import garden from '@/assets/images/garden.jpg'
import gallery from '@/assets/images/gallery.jpg'
import food from '@/assets/images/food.jpg'
import coast from '@/assets/images/coast.jpg'
export const imageAssets = { florence, altai, petersburg, garden, gallery, food, coast }
export const covers = [florence, altai, petersburg, coast]
export const initialTrips: Trip[] = [
  {
    id: 'florence',
    name: 'Флоренция',
    country: 'Италия',
    start: '2026-11-10',
    end: '2026-11-15',
    image: florence,
    status: 'upcoming',
    archived: false,
    notes:
      'Билеты в Уффици куплены. Проверить режим работы музеев на праздничные дни. И обязательно встретить закат на площади Микеланджело.',
    role: 'organizer',
  },
  {
    id: 'altai',
    name: 'Большое путешествие на Алтай',
    country: 'Россия',
    start: '2026-12-05',
    end: '2026-12-12',
    image: altai,
    status: 'upcoming',
    archived: false,
    notes: 'Взять тёплые вещи и удобную обувь для прогулок.',
    role: 'organizer',
  },
  {
    id: 'petersburg',
    name: 'Выходные в Петербурге',
    country: 'Россия',
    start: '2026-10-01',
    end: '2026-10-04',
    image: petersburg,
    status: 'completed',
    archived: false,
    notes: 'Город, в который хочется вернуться.',
    role: 'organizer',
  },
]
export const initialEvents: PlanEvent[] = [
  {
    id: 'e1',
    tripId: 'florence',
    day: '2026-11-11',
    title: 'Галерея Уффици',
    start: '10:00',
    end: '12:00',
    place: 'Piazzale degli Uffizi, 6',
    description: 'Билеты онлайн, вход с 9:45. Не забудьте взять документ.',
    image: gallery,
    category: 'Музей',
  },
  {
    id: 'e2',
    tripId: 'florence',
    day: '2026-11-11',
    title: 'Обед в Trattoria Za Za',
    start: '13:00',
    end: '14:00',
    place: 'Via dei Servi, 26',
    description: 'Попробовать флорентийский стейк и домашнюю пасту.',
    image: food,
    category: 'Еда',
  },
  {
    id: 'e3',
    tripId: 'florence',
    day: '2026-11-11',
    title: 'Собор Санта-Мария-дель-Фьоре',
    start: '15:00',
    end: '16:30',
    place: 'Piazza del Duomo',
    description: 'Подняться на купол и посмотреть на город с высоты.',
    image: florence,
    category: 'Достопримечательность',
  },
  {
    id: 'e4',
    tripId: 'florence',
    day: '2026-11-10',
    title: 'Заселение и первая прогулка',
    start: '14:00',
    end: '17:00',
    place: 'Исторический центр',
    description: 'Оставить вещи и познакомиться с городом.',
    image: florence,
    category: 'Прогулка',
  },
]
export const initialPlaces: Place[] = [
  {
    id: 'p1',
    name: 'Сады Боболи',
    category: 'Парк',
    address: 'Piazza de’ Pitti, 1',
    image: garden,
    description: 'Зелёные аллеи, скульптуры и прекрасный вид на Флоренцию.',
  },
  {
    id: 'p2',
    name: 'Площадь Микеланджело',
    category: 'Смотровая площадка',
    address: 'Piazzale Michelangelo',
    image: florence,
    description: 'Лучшее место, чтобы проводить закат над городом.',
  },
  {
    id: 'p3',
    name: 'Рынок Сан-Лоренцо',
    category: 'Рынок',
    address: 'Piazza del Mercato Centrale',
    image: food,
    description: 'Свежие продукты и маленькие гастрономические открытия.',
  },
]
export const initialTripPlaces: TripPlace[] = [
  { tripId: 'florence', placeId: 'p1' },
  { tripId: 'florence', placeId: 'p2' },
  { tripId: 'florence', placeId: 'p3' },
]
export const initialChecklists: Checklist[] = [
  {
    id: 'c1',
    tripId: 'florence',
    title: 'Сборы',
    items: [
      { id: 'i1', title: 'Паспорт', checked: true },
      { id: 'i2', title: 'Зарядные устройства', checked: true },
      { id: 'i3', title: 'Удобная обувь', checked: true },
      { id: 'i4', title: 'Аптечка', checked: false },
      { id: 'i5', title: 'Дождевик или зонт', checked: false },
      { id: 'i6', title: 'Наушники', checked: false },
      { id: 'i7', title: 'Билеты и бронирования', checked: true },
    ],
  },
  {
    id: 'c2',
    tripId: 'florence',
    title: 'Документы',
    items: [
      { id: 'i8', title: 'Загранпаспорт', checked: true },
      { id: 'i9', title: 'Страховка', checked: true },
      { id: 'i10', title: 'Копии документов', checked: true },
    ],
  },
  {
    id: 'c3',
    tripId: 'florence',
    title: 'Перед поездкой',
    items: [
      { id: 'i11', title: 'Скачать офлайн-карты', checked: true },
      { id: 'i12', title: 'Полить растения', checked: false },
      { id: 'i13', title: 'Проверить погоду', checked: false },
    ],
  },
]
export const initialParticipants: Participant[] = [
  {
    id: 'u1',
    tripId: 'florence',
    name: 'Александр',
    email: 'alex@example.com',
    role: 'organizer',
    color: '#e5ece6',
  },
  {
    id: 'u2',
    tripId: 'florence',
    name: 'Мария',
    email: 'maria@example.com',
    role: 'viewer',
    color: '#f6e8dd',
  },
  {
    id: 'u3',
    tripId: 'florence',
    name: 'Дмитрий',
    email: 'dmitry@example.com',
    role: 'viewer',
    color: '#e2e9f1',
  },
]
export const initialExpenses: Expense[] = [
  {
    id: 'x1',
    tripId: 'florence',
    title: 'Апартаменты в центре',
    category: 'Проживание',
    amount: 20000,
  },
  { id: 'x2', tripId: 'florence', title: 'Билеты и трансфер', category: 'Транспорт', amount: 9600 },
  { id: 'x3', tripId: 'florence', title: 'Кафе и рестораны', category: 'Питание', amount: 8700 },
  {
    id: 'x4',
    tripId: 'florence',
    title: 'Музеи и экскурсии',
    category: 'Развлечения',
    amount: 6000,
  },
  { id: 'x5', tripId: 'florence', title: 'Сувениры', category: 'Прочее', amount: 4000 },
]
