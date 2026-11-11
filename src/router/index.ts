import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import TripLayout from '@/components/trip/TripLayout.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Auth/Login/LoginPage.vue'),
      meta: { title: 'Вход' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/Auth/Register/RegisterPage.vue'),
      meta: { title: 'Регистрация' },
    },
    {
      path: '/join/:tripId',
      name: 'join',
      component: () => import('@/pages/Trips/Join/JoinPage.vue'),
      meta: { title: 'Приглашение' },
    },
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/pages/Trips/List/TripsPage.vue'),
          meta: { section: 'Главная', title: 'Мои поездки' },
        },
        {
          path: 'trips',
          name: 'trips',
          component: () => import('@/pages/Trips/List/TripsPage.vue'),
          meta: { section: 'Поездки', title: 'Мои поездки' },
        },
        {
          path: 'trips/new',
          name: 'trip-create',
          component: () => import('@/pages/Trips/Create/CreateTripPage.vue'),
          meta: { section: 'Поездки', title: 'Новая поездка' },
        },
        {
          path: 'trips/:tripId/edit',
          name: 'trip-edit',
          component: () => import('@/pages/Trips/Edit/EditTripPage.vue'),
          meta: { section: 'Поездки', title: 'Редактирование' },
        },
        {
          path: 'trips/:tripId',
          component: TripLayout,
          meta: { section: 'Поездки' },
          children: [
            { path: '', redirect: (to) => `/trips/${to.params.tripId}/plan` },
            { path: 'overview', redirect: (to) => `/trips/${to.params.tripId}/plan` },
            {
              path: 'today',
              name: 'trip-today',
              component: () => import('@/pages/Trips/Today/TodayPage.vue'),
              meta: { title: 'Сегодня' },
            },
            {
              path: 'plan',
              name: 'trip-plan',
              component: () => import('@/pages/Trips/Plan/PlanPage.vue'),
              meta: { title: 'План поездки' },
            },
            {
              path: 'places',
              name: 'trip-places',
              redirect: '/places',
            },
            {
              path: 'checklists',
              name: 'trip-checklists',
              component: () => import('@/pages/Checklists/ChecklistsPage.vue'),
              meta: { title: 'Чек-листы поездки' },
            },
            {
              path: 'expenses',
              name: 'trip-expenses',
              component: () => import('@/pages/Expenses/ExpensesPage.vue'),
              meta: { title: 'Расходы поездки' },
            },
            {
              path: 'participants',
              name: 'trip-participants',
              component: () => import('@/pages/Trips/Participants/ParticipantsPage.vue'),
              meta: { title: 'Участники' },
            },
            { path: 'information', redirect: (to) => `/trips/${to.params.tripId}/plan` },
            {
              path: 'events/new',
              name: 'event-create',
              component: () => import('@/pages/Trips/Event/EventPage.vue'),
              meta: { title: 'Новое событие' },
            },
            {
              path: 'events/:eventId',
              name: 'event-detail',
              component: () => import('@/pages/Trips/Event/EventPage.vue'),
              meta: { title: 'Событие' },
            },
            {
              path: 'events/:eventId/edit',
              name: 'event-edit',
              component: () => import('@/pages/Trips/Event/EventPage.vue'),
              meta: { title: 'Редактирование события' },
            },
          ],
        },
        {
          path: 'places',
          name: 'places',
          component: () => import('@/pages/Places/PlacesPage.vue'),
          meta: { section: 'Места', title: 'Сохранённые места' },
        },
        {
          path: 'checklists',
          name: 'checklists',
          component: () => import('@/pages/Checklists/ChecklistsPage.vue'),
          meta: { section: 'Чек-листы', title: 'Чек-листы' },
        },
        {
          path: 'expenses',
          name: 'expenses',
          component: () => import('@/pages/Expenses/ExpensesPage.vue'),
          meta: { section: 'Расходы', title: 'Расходы' },
        },
        {
          path: 'archive',
          name: 'archive',
          component: () => import('@/pages/Trips/Archive/ArchivePage.vue'),
          meta: { section: 'Архив', title: 'Архив' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/pages/Settings/SettingsPage.vue'),
          meta: { section: 'Настройки', title: 'Настройки профиля' },
        },
        {
          path: 'ui-kit',
          name: 'ui-kit',
          component: () => import('@/pages/UiKit/UiKitPage.vue'),
          meta: { section: 'UI Kit', title: 'Библиотека компонентов' },
        },
        {
          path: ':pathMatch(.*)*',
          name: 'not-found',
          component: () => import('@/pages/NotFound/NotFoundPage.vue'),
          meta: { title: 'Страница не найдена' },
        },
      ],
    },
  ],
})
router.afterEach((to) => {
  document.title = `${to.meta.title || 'Путешествия'} — Tripper`
})
export default router
