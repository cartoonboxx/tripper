import type { ApiEndpoint, OrmTable } from './ApiDocs.types'

export const endpoints: ApiEndpoint[] = [
  {
    id: 'operation1',
    group: 'Авторизация',
    method: 'GET',
    path: '/auth/csrf',
    summary: 'Получить CSRF-токен',
    description:
      'Выдаёт токен и CSRF-cookie до входа. Передавайте токен в X-CSRF-Token при изменяющих запросах.',
    access: 'Публичный',
    status: 200,
    public: true,
    responseSchema: 'CsrfResponse',
    response: {
      data: {
        token: '<csrf-token>',
      },
    },
  },
  {
    id: 'operation2',
    group: 'Авторизация',
    method: 'POST',
    path: '/auth/registration',
    summary: 'Создать аккаунт',
    description:
      'Создаёт пользователя и серверную сессию; Set-Cookie устанавливает tripper_session. accepted должен быть true.',
    access: 'Публичный',
    status: 201,
    public: true,
    requestSchema: 'RegistrationRequest',
    responseSchema: 'UserResponse',
    request: {
      name: 'Анна',
      email: 'anna@example.com',
      password: '<password>',
      accepted: true,
    },
    response: {
      data: {
        id: '10000000-0000-4000-8000-000000000001',
        name: 'Анна',
        email: 'anna@example.com',
        notifications: true,
      },
    },
  },
  {
    id: 'operation3',
    group: 'Авторизация',
    method: 'POST',
    path: '/auth/login',
    summary: 'Войти',
    description:
      'Проверяет пароль на сервере, обновляет сессию и CSRF-токен. Неверные учётные данные возвращают 401.',
    access: 'Публичный',
    status: 200,
    public: true,
    requestSchema: 'LoginRequest',
    responseSchema: 'UserResponse',
    request: {
      email: 'anna@example.com',
      password: '<password>',
    },
    response: {
      data: {
        id: '10000000-0000-4000-8000-000000000001',
        name: 'Анна',
        email: 'anna@example.com',
        notifications: true,
      },
    },
  },
  {
    id: 'operation4',
    group: 'Авторизация',
    method: 'POST',
    path: '/auth/logout',
    summary: 'Завершить сессию',
    description: 'Отзывает текущую сессию и очищает cookie.',
    access: 'Авторизованный пользователь',
    status: 204,
  },
  {
    id: 'operation5',
    group: 'Профиль',
    method: 'GET',
    path: '/users/me',
    summary: 'Текущий пользователь',
    description: 'Профиль и настройка уведомлений. Хеши паролей и токенов не возвращаются.',
    access: 'Авторизованный пользователь',
    status: 200,
    responseSchema: 'UserResponse',
    response: {
      data: {
        id: '10000000-0000-4000-8000-000000000001',
        name: 'Анна',
        email: 'anna@example.com',
        notifications: true,
      },
    },
  },
  {
    id: 'operation6',
    group: 'Профиль',
    method: 'PATCH',
    path: '/users/me',
    summary: 'Обновить профиль',
    description:
      'Имя, почта и уведомления. Уникальность нормализованного email проверяется сервером.',
    access: 'Авторизованный пользователь',
    status: 200,
    requestSchema: 'ProfilePatch',
    responseSchema: 'UserResponse',
    request: {
      name: 'Анна',
      notifications: false,
    },
    response: {
      data: {
        id: '10000000-0000-4000-8000-000000000001',
        name: 'Анна',
        email: 'anna@example.com',
        notifications: false,
      },
    },
  },
  {
    id: 'operation7',
    group: 'Профиль',
    method: 'PATCH',
    path: '/users/me/password',
    summary: 'Изменить пароль',
    description:
      'Проверяет текущий пароль, сохраняет новый хеш и отзывает остальные сессии. Пароли не хранятся в localStorage серверной версии.',
    access: 'Авторизованный пользователь',
    status: 204,
    requestSchema: 'PasswordPatch',
    request: {
      currentPassword: '<current-password>',
      newPassword: '<new-password>',
    },
  },
  {
    id: 'operation8',
    group: 'Поездки',
    method: 'GET',
    path: '/trips',
    summary: 'Список поездок',
    description:
      'Только поездки текущего участника; по умолчанию archived=false. Сортировка start ASC, id ASC; cursor учитывает оба поля. Поле role вычисляется из trip_members.',
    access: 'Авторизованный пользователь',
    status: 200,
    responseSchema: 'TripList',
    query: [
      {
        name: 'archived',
        in: 'query',
        description: 'Включить только архивные поездки',
        schema: {
          type: 'boolean',
        },
      },
      {
        name: 'status',
        in: 'query',
        description: 'Статус',
        schema: {
          type: 'string',
          enum: ['upcoming', 'active'],
        },
      },
      {
        name: 'search',
        in: 'query',
        description: 'Поиск по названию',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'limit',
        in: 'query',
        description: 'Размер страницы, по умолчанию 50',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 50,
        },
      },
      {
        name: 'cursor',
        in: 'query',
        description: 'Непрозрачный курсор из meta.nextCursor',
        schema: {
          type: 'string',
        },
      },
    ],
    response: {
      data: [
        {
          id: '20000000-0000-4000-8000-000000000001',
          name: 'Флоренция',
          country: 'Италия',
          start: '2026-11-10',
          end: '2026-11-15',
          timeZone: 'Europe/Rome',
          status: 'upcoming',
          archived: false,
          notes: 'Билеты в Уффици куплены',
          coverMediaId: null,
          imageUrl: null,
          role: 'organizer',
        },
      ],
      meta: {
        nextCursor: null,
      },
    },
  },
  {
    id: 'operation9',
    group: 'Поездки',
    method: 'POST',
    path: '/trips',
    summary: 'Создать поездку',
    description:
      'В одной транзакции создаёт поездку и членство организатора. Длительность — не более 366 календарных дней.',
    access: 'Авторизованный пользователь',
    status: 201,
    requestSchema: 'TripCreate',
    responseSchema: 'TripResponse',
    request: {
      name: 'Флоренция',
      country: 'Италия',
      start: '2026-11-10',
      end: '2026-11-15',
      timeZone: 'Europe/Rome',
    },
    response: {
      data: {
        id: '20000000-0000-4000-8000-000000000001',
        name: 'Флоренция',
        country: 'Италия',
        start: '2026-11-10',
        end: '2026-11-15',
        timeZone: 'Europe/Rome',
        status: 'upcoming',
        archived: false,
        notes: 'Билеты в Уффици куплены',
        coverMediaId: null,
        imageUrl: null,
        role: 'organizer',
      },
    },
  },
  {
    id: 'operation10',
    group: 'Поездки',
    method: 'GET',
    path: '/trips/{tripId}',
    summary: 'Получить поездку',
    description: 'Доступ проверяется по членству, включая архивные поездки.',
    access: 'Участник поездки',
    status: 200,
    responseSchema: 'TripResponse',
    response: {
      data: {
        id: '20000000-0000-4000-8000-000000000001',
        name: 'Флоренция',
        country: 'Италия',
        start: '2026-11-10',
        end: '2026-11-15',
        timeZone: 'Europe/Rome',
        status: 'upcoming',
        archived: false,
        notes: 'Билеты в Уффици куплены',
        coverMediaId: null,
        imageUrl: null,
        role: 'organizer',
      },
    },
  },
  {
    id: 'operation11',
    group: 'Поездки',
    method: 'PATCH',
    path: '/trips/{tripId}',
    summary: 'Изменить или архивировать',
    description:
      'archived=true отправляет в архив, false восстанавливает. При сужении диапазона дат с событиями снаружи или смене timeZone при существующих событиях сервер возвращает 409; события не переносятся и не удаляются молча.',
    access: 'Организатор',
    status: 200,
    requestSchema: 'TripPatch',
    responseSchema: 'TripResponse',
    request: {
      archived: true,
    },
    response: {
      data: {
        id: '20000000-0000-4000-8000-000000000001',
        name: 'Флоренция',
        country: 'Италия',
        start: '2026-11-10',
        end: '2026-11-15',
        timeZone: 'Europe/Rome',
        status: 'upcoming',
        archived: true,
        notes: 'Билеты в Уффици куплены',
        coverMediaId: null,
        imageUrl: null,
        role: 'organizer',
      },
    },
  },
  {
    id: 'operation12',
    group: 'Поездки',
    method: 'DELETE',
    path: '/trips/{tripId}',
    summary: 'Удалить поездку',
    description:
      'Удаляет её события, расходы, участников, приглашения и trip_places. Личные места и чек-листы сохраняются, у чек-листов trip_id становится NULL.',
    access: 'Организатор',
    status: 204,
  },
  {
    id: 'operation13',
    group: 'Места',
    method: 'GET',
    path: '/places',
    summary: 'Библиотека мест',
    description:
      'Только собственные сохранённые места. Для мест чужой поездки используйте /trips/{tripId}/places.',
    access: 'Авторизованный пользователь',
    status: 200,
    responseSchema: 'PlaceList',
    query: [
      {
        name: 'search',
        in: 'query',
        description: 'Поиск по имени и адресу',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'categoryId',
        in: 'query',
        description: 'ID категории',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'limit',
        in: 'query',
        description: 'Размер страницы, по умолчанию 50',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 50,
        },
      },
      {
        name: 'cursor',
        in: 'query',
        description: 'Непрозрачный курсор из meta.nextCursor',
        schema: {
          type: 'string',
        },
      },
    ],
    response: {
      data: [
        {
          id: '30000000-0000-4000-8000-000000000001',
          name: 'Сады Боболи',
          categoryId: '60000000-0000-4000-8000-000000000001',
          categoryName: 'Парк',
          address: 'Piazza de’ Pitti, 1',
          coordinates: {
            latitude: 43.7629,
            longitude: 11.2489,
          },
          photoMediaId: '50000000-0000-4000-8000-000000000001',
          imageUrl: '/api/v1/media/50000000-0000-4000-8000-000000000001/content',
          description: 'Зелёные аллеи и вид на город',
        },
      ],
      meta: {
        nextCursor: null,
      },
    },
  },
  {
    id: 'operation14',
    group: 'Места',
    method: 'POST',
    path: '/places',
    summary: 'Сохранить место',
    description:
      'Создаёт личное место, без автоматического добавления в поездку. Координаты передаются парой или null. Категория должна иметь domain=places.',
    access: 'Авторизованный пользователь',
    status: 201,
    requestSchema: 'PlaceCreate',
    responseSchema: 'PlaceResponse',
    request: {
      name: 'Сады Боболи',
      categoryId: '60000000-0000-4000-8000-000000000001',
      address: 'Piazza de’ Pitti, 1',
      coordinates: {
        latitude: 43.7629,
        longitude: 11.2489,
      },
      photoMediaId: '50000000-0000-4000-8000-000000000001',
      description: 'Зелёные аллеи и вид на город',
    },
    response: {
      data: {
        id: '30000000-0000-4000-8000-000000000001',
        name: 'Сады Боболи',
        categoryId: '60000000-0000-4000-8000-000000000001',
        categoryName: 'Парк',
        address: 'Piazza de’ Pitti, 1',
        coordinates: {
          latitude: 43.7629,
          longitude: 11.2489,
        },
        photoMediaId: '50000000-0000-4000-8000-000000000001',
        imageUrl: '/api/v1/media/50000000-0000-4000-8000-000000000001/content',
        description: 'Зелёные аллеи и вид на город',
      },
    },
  },
  {
    id: 'operation15',
    group: 'Места',
    method: 'GET',
    path: '/places/{placeId}',
    summary: 'Получить место',
    description:
      'Владелец или участник поездки, в которую место добавлено. Личные места других пользователей не раскрываются.',
    access: 'Авторизованный пользователь',
    status: 200,
    responseSchema: 'PlaceResponse',
    response: {
      data: {
        id: '30000000-0000-4000-8000-000000000001',
        name: 'Сады Боболи',
        categoryId: '60000000-0000-4000-8000-000000000001',
        categoryName: 'Парк',
        address: 'Piazza de’ Pitti, 1',
        coordinates: {
          latitude: 43.7629,
          longitude: 11.2489,
        },
        photoMediaId: '50000000-0000-4000-8000-000000000001',
        imageUrl: '/api/v1/media/50000000-0000-4000-8000-000000000001/content',
        description: 'Зелёные аллеи и вид на город',
      },
    },
  },
  {
    id: 'operation16',
    group: 'Места',
    method: 'PATCH',
    path: '/places/{placeId}',
    summary: 'Изменить место',
    description:
      'Редактирует только владелец. Изменение фото и категории сразу отражается во всех связанных событиях.',
    access: 'Владелец места',
    status: 200,
    requestSchema: 'PlacePatch',
    responseSchema: 'PlaceResponse',
    request: {
      description: 'Купить билеты заранее',
    },
    response: {
      data: {
        id: '30000000-0000-4000-8000-000000000001',
        name: 'Сады Боболи',
        categoryId: '60000000-0000-4000-8000-000000000001',
        categoryName: 'Парк',
        address: 'Piazza de’ Pitti, 1',
        coordinates: {
          latitude: 43.7629,
          longitude: 11.2489,
        },
        photoMediaId: '50000000-0000-4000-8000-000000000001',
        imageUrl: '/api/v1/media/50000000-0000-4000-8000-000000000001/content',
        description: 'Зелёные аллеи и вид на город',
      },
    },
  },
  {
    id: 'operation17',
    group: 'Места',
    method: 'DELETE',
    path: '/places/{placeId}',
    summary: 'Удалить место',
    description:
      'Удаляет связи trip_places; events.place_id становится NULL. Событие сохраняет текстовую подпись места и собственное фото, если оно было загружено.',
    access: 'Владелец места',
    status: 204,
  },
  {
    id: 'operation18',
    group: 'Места',
    method: 'GET',
    path: '/trips/{tripId}/places',
    summary: 'Места поездки',
    description: 'Связь many-to-many: одно место можно прикрепить к нескольким поездкам.',
    access: 'Участник поездки',
    status: 200,
    responseSchema: 'PlaceList',
    query: [
      {
        name: 'limit',
        in: 'query',
        description: 'Размер страницы, по умолчанию 50',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 50,
        },
      },
      {
        name: 'cursor',
        in: 'query',
        description: 'Непрозрачный курсор из meta.nextCursor',
        schema: {
          type: 'string',
        },
      },
    ],
    response: {
      data: [
        {
          id: '30000000-0000-4000-8000-000000000001',
          name: 'Сады Боболи',
          categoryId: '60000000-0000-4000-8000-000000000001',
          categoryName: 'Парк',
          address: 'Piazza de’ Pitti, 1',
          coordinates: {
            latitude: 43.7629,
            longitude: 11.2489,
          },
          photoMediaId: '50000000-0000-4000-8000-000000000001',
          imageUrl: '/api/v1/media/50000000-0000-4000-8000-000000000001/content',
          description: 'Зелёные аллеи и вид на город',
        },
      ],
      meta: {
        nextCursor: null,
      },
    },
  },
  {
    id: 'operation19',
    group: 'Места',
    method: 'PUT',
    path: '/trips/{tripId}/places/{placeId}',
    summary: 'Прикрепить место',
    description:
      'Организатор добавляет своё место. Повторное добавление безопасно: составной PK исключает дубликат.',
    access: 'Организатор и владелец места',
    status: 204,
  },
  {
    id: 'operation20',
    group: 'Места',
    method: 'DELETE',
    path: '/trips/{tripId}/places/{placeId}',
    summary: 'Отвязать место',
    description:
      'Сохраняет место в библиотеке. Если на место ссылается событие поездки — 409 до удаления этой привязки из события.',
    access: 'Организатор',
    status: 204,
  },
  {
    id: 'operation21',
    group: 'События',
    method: 'GET',
    path: '/trips/{tripId}/events',
    summary: 'План по дням',
    description:
      'Сортировка по starts_at, id. day интерпретируется в timeZone поездки. Категория события отсутствует: placeCategory вычисляется по связанному месту.',
    access: 'Участник поездки',
    status: 200,
    responseSchema: 'EventList',
    query: [
      {
        name: 'day',
        in: 'query',
        description: 'Выбранный день YYYY-MM-DD',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'limit',
        in: 'query',
        description: 'Размер страницы, по умолчанию 50',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 50,
        },
      },
      {
        name: 'cursor',
        in: 'query',
        description: 'Непрозрачный курсор из meta.nextCursor',
        schema: {
          type: 'string',
        },
      },
    ],
    response: {
      data: [
        {
          id: '40000000-0000-4000-8000-000000000001',
          tripId: '20000000-0000-4000-8000-000000000001',
          day: '2026-11-11',
          start: '14:35',
          end: '15:35',
          endDay: '2026-11-11',
          title: 'Прогулка в саду',
          placeId: '30000000-0000-4000-8000-000000000001',
          place: 'Сады Боболи',
          description: 'Встретиться у входа',
          ownPhotoMediaId: null,
          imageUrl: '/api/v1/media/50000000-0000-4000-8000-000000000001/content',
          imageSource: 'place',
          placeCategory: {
            id: '60000000-0000-4000-8000-000000000001',
            name: 'Парк',
          },
        },
      ],
      meta: {
        nextCursor: null,
      },
    },
  },
  {
    id: 'operation22',
    group: 'События',
    method: 'POST',
    path: '/trips/{tripId}/events',
    summary: 'Создать событие',
    description:
      'day берётся из выбранного дня. Если end отсутствует, окончание на час позже start, включая переход через полночь. При placeId сервер в той же транзакции добавляет место в trip_places, если оно принадлежит организатору.',
    access: 'Организатор',
    status: 201,
    requestSchema: 'EventCreate',
    responseSchema: 'EventResponse',
    request: {
      day: '2026-11-11',
      start: '14:35',
      title: 'Прогулка в саду',
      placeId: '30000000-0000-4000-8000-000000000001',
    },
    response: {
      data: {
        id: '40000000-0000-4000-8000-000000000001',
        tripId: '20000000-0000-4000-8000-000000000001',
        day: '2026-11-11',
        start: '14:35',
        end: '15:35',
        endDay: '2026-11-11',
        title: 'Прогулка в саду',
        placeId: '30000000-0000-4000-8000-000000000001',
        place: 'Сады Боболи',
        description: 'Встретиться у входа',
        ownPhotoMediaId: null,
        imageUrl: '/api/v1/media/50000000-0000-4000-8000-000000000001/content',
        imageSource: 'place',
        placeCategory: {
          id: '60000000-0000-4000-8000-000000000001',
          name: 'Парк',
        },
      },
    },
  },
  {
    id: 'operation23',
    group: 'События',
    method: 'GET',
    path: '/trips/{tripId}/events/{eventId}',
    summary: 'Детали события',
    description:
      'imageUrl = фото места, иначе собственное фото события, иначе null. Смена фото места не требует перезаписи события.',
    access: 'Участник поездки',
    status: 200,
    responseSchema: 'EventResponse',
    response: {
      data: {
        id: '40000000-0000-4000-8000-000000000001',
        tripId: '20000000-0000-4000-8000-000000000001',
        day: '2026-11-11',
        start: '14:35',
        end: '15:35',
        endDay: '2026-11-11',
        title: 'Прогулка в саду',
        placeId: '30000000-0000-4000-8000-000000000001',
        place: 'Сады Боболи',
        description: 'Встретиться у входа',
        ownPhotoMediaId: null,
        imageUrl: '/api/v1/media/50000000-0000-4000-8000-000000000001/content',
        imageSource: 'place',
        placeCategory: {
          id: '60000000-0000-4000-8000-000000000001',
          name: 'Парк',
        },
      },
    },
  },
  {
    id: 'operation24',
    group: 'События',
    method: 'PATCH',
    path: '/trips/{tripId}/events/{eventId}',
    summary: 'Изменить событие',
    description:
      'При новом start и отсутствующем end сервер ставит +1 час. Явный end сохраняет ручную длительность. placeId=null отвязывает место; собственное фото не теряется.',
    access: 'Организатор',
    status: 200,
    requestSchema: 'EventPatch',
    responseSchema: 'EventResponse',
    request: {
      start: '16:20',
    },
    response: {
      data: {
        id: '40000000-0000-4000-8000-000000000001',
        tripId: '20000000-0000-4000-8000-000000000001',
        day: '2026-11-11',
        start: '16:20',
        end: '17:20',
        endDay: '2026-11-11',
        title: 'Прогулка в саду',
        placeId: '30000000-0000-4000-8000-000000000001',
        place: 'Сады Боболи',
        description: 'Встретиться у входа',
        ownPhotoMediaId: null,
        imageUrl: '/api/v1/media/50000000-0000-4000-8000-000000000001/content',
        imageSource: 'place',
        placeCategory: {
          id: '60000000-0000-4000-8000-000000000001',
          name: 'Парк',
        },
      },
    },
  },
  {
    id: 'operation25',
    group: 'События',
    method: 'DELETE',
    path: '/trips/{tripId}/events/{eventId}',
    summary: 'Удалить событие',
    description: 'Не удаляет прикреплённое место или фото из библиотеки.',
    access: 'Организатор',
    status: 204,
  },
  {
    id: 'operation26',
    group: 'События',
    method: 'PUT',
    path: '/trips/{tripId}/days/{day}/event-order',
    summary: 'Переставить события',
    description:
      'eventIds содержит все ID выбранного дня без повторов. Как в moveEvent: существующие временные слоты остаются, события занимают их в новом порядке. Операция выполняется целиком в транзакции с блокировкой дня.',
    access: 'Организатор',
    status: 200,
    requestSchema: 'EventReorder',
    responseSchema: 'EventList',
    request: {
      eventIds: ['40000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002'],
    },
    response: {
      data: [
        {
          id: '40000000-0000-4000-8000-000000000001',
          tripId: '20000000-0000-4000-8000-000000000001',
          day: '2026-11-11',
          start: '14:35',
          end: '15:35',
          endDay: '2026-11-11',
          title: 'Прогулка в саду',
          placeId: '30000000-0000-4000-8000-000000000001',
          place: 'Сады Боболи',
          description: 'Встретиться у входа',
          ownPhotoMediaId: null,
          imageUrl: '/api/v1/media/50000000-0000-4000-8000-000000000001/content',
          imageSource: 'place',
          placeCategory: {
            id: '60000000-0000-4000-8000-000000000001',
            name: 'Парк',
          },
        },
      ],
      meta: {
        nextCursor: null,
      },
    },
  },
  {
    id: 'operation27',
    group: 'Чек-листы',
    method: 'GET',
    path: '/checklists',
    summary: 'Личные чек-листы',
    description:
      'Только owner_id текущего пользователя. Без tripId — общая библиотека (trip_id IS NULL); с tripId — свои списки указанной поездки.',
    access: 'Авторизованный пользователь',
    status: 200,
    responseSchema: 'ChecklistList',
    query: [
      {
        name: 'tripId',
        in: 'query',
        description: 'ID поездки',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'limit',
        in: 'query',
        description: 'Размер страницы, по умолчанию 50',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 50,
        },
      },
      {
        name: 'cursor',
        in: 'query',
        description: 'Непрозрачный курсор из meta.nextCursor',
        schema: {
          type: 'string',
        },
      },
    ],
    response: {
      data: [
        {
          id: '60000000-0000-4000-8000-000000000001',
          tripId: null,
          title: 'В дорогу',
          items: [
            {
              id: '40000000-0000-4000-8000-000000000001',
              title: 'Паспорт',
              checked: false,
              position: 0,
            },
          ],
        },
      ],
      meta: {
        nextCursor: null,
      },
    },
  },
  {
    id: 'operation28',
    group: 'Чек-листы',
    method: 'POST',
    path: '/checklists',
    summary: 'Создать чек-лист',
    description:
      'owner_id назначается из сессии. Для tripId требуется членство в поездке; список остаётся личным.',
    access: 'Авторизованный пользователь',
    status: 201,
    requestSchema: 'ChecklistCreate',
    responseSchema: 'ChecklistResponse',
    request: {
      title: 'В дорогу',
    },
    response: {
      data: {
        id: '60000000-0000-4000-8000-000000000001',
        tripId: null,
        title: 'В дорогу',
        items: [
          {
            id: '40000000-0000-4000-8000-000000000001',
            title: 'Паспорт',
            checked: false,
            position: 0,
          },
        ],
      },
    },
  },
  {
    id: 'operation29',
    group: 'Чек-листы',
    method: 'GET',
    path: '/checklists/{checklistId}',
    summary: 'Получить чек-лист',
    description: 'Другие участники поездки не получают доступ к личному списку.',
    access: 'Владелец чек-листа',
    status: 200,
    responseSchema: 'ChecklistResponse',
    response: {
      data: {
        id: '60000000-0000-4000-8000-000000000001',
        tripId: null,
        title: 'В дорогу',
        items: [
          {
            id: '40000000-0000-4000-8000-000000000001',
            title: 'Паспорт',
            checked: false,
            position: 0,
          },
        ],
      },
    },
  },
  {
    id: 'operation30',
    group: 'Чек-листы',
    method: 'PATCH',
    path: '/checklists/{checklistId}',
    summary: 'Переименовать чек-лист',
    description: 'Изменяет заголовок личного списка.',
    access: 'Владелец чек-листа',
    status: 200,
    requestSchema: 'ChecklistPatch',
    responseSchema: 'ChecklistResponse',
    request: {
      title: 'Документы',
    },
    response: {
      data: {
        id: '60000000-0000-4000-8000-000000000001',
        tripId: null,
        title: 'Документы',
        items: [
          {
            id: '40000000-0000-4000-8000-000000000001',
            title: 'Паспорт',
            checked: false,
            position: 0,
          },
        ],
      },
    },
  },
  {
    id: 'operation31',
    group: 'Чек-листы',
    method: 'DELETE',
    path: '/checklists/{checklistId}',
    summary: 'Удалить чек-лист',
    description: 'Пункты удаляются каскадно.',
    access: 'Владелец чек-листа',
    status: 204,
  },
  {
    id: 'operation32',
    group: 'Чек-листы',
    method: 'POST',
    path: '/checklists/{checklistId}/copy',
    summary: 'Скопировать в поездку',
    description:
      'Общий личный список копируется с новыми ID и checked=false. Источник сохраняется. Для копирования в поездку требуется роль организатора, как в текущем интерфейсе.',
    access: 'Владелец списка и организатор поездки',
    status: 201,
    requestSchema: 'ChecklistCopy',
    responseSchema: 'ChecklistResponse',
    request: {
      tripId: '20000000-0000-4000-8000-000000000001',
    },
    response: {
      data: {
        id: '60000000-0000-4000-8000-000000000001',
        tripId: '20000000-0000-4000-8000-000000000001',
        title: 'В дорогу',
        items: [
          {
            id: '40000000-0000-4000-8000-000000000001',
            title: 'Паспорт',
            checked: false,
            position: 0,
          },
        ],
      },
    },
  },
  {
    id: 'operation33',
    group: 'Чек-листы',
    method: 'POST',
    path: '/checklists/{checklistId}/items',
    summary: 'Добавить пункт',
    description: 'Новый пункт получает следующий position и checked=false.',
    access: 'Владелец чек-листа',
    status: 201,
    requestSchema: 'ChecklistItemCreate',
    responseSchema: 'ChecklistItemResponse',
    request: {
      title: 'Паспорт',
    },
    response: {
      data: {
        id: '40000000-0000-4000-8000-000000000001',
        title: 'Паспорт',
        checked: false,
        position: 0,
      },
    },
  },
  {
    id: 'operation34',
    group: 'Чек-листы',
    method: 'PATCH',
    path: '/checklists/{checklistId}/items/{itemId}',
    summary: 'Изменить или отметить пункт',
    description: 'Нельзя изменить пункт из другого списка.',
    access: 'Владелец чек-листа',
    status: 200,
    requestSchema: 'ChecklistItemPatch',
    responseSchema: 'ChecklistItemResponse',
    request: {
      checked: true,
    },
    response: {
      data: {
        id: '40000000-0000-4000-8000-000000000001',
        title: 'Паспорт',
        checked: true,
        position: 0,
      },
    },
  },
  {
    id: 'operation35',
    group: 'Чек-листы',
    method: 'DELETE',
    path: '/checklists/{checklistId}/items/{itemId}',
    summary: 'Удалить пункт',
    description: 'Оставшиеся позиции нормализуются транзакционно.',
    access: 'Владелец чек-листа',
    status: 204,
  },
  {
    id: 'operation36',
    group: 'Чек-листы',
    method: 'PUT',
    path: '/checklists/{checklistId}/item-order',
    summary: 'Изменить порядок пунктов',
    description:
      'itemIds содержит все пункты списка. Обновление position выполняется в транзакции.',
    access: 'Владелец чек-листа',
    status: 200,
    requestSchema: 'ItemReorder',
    responseSchema: 'ChecklistResponse',
    request: {
      itemIds: ['40000000-0000-4000-8000-000000000001'],
    },
    response: {
      data: {
        id: '60000000-0000-4000-8000-000000000001',
        tripId: null,
        title: 'В дорогу',
        items: [
          {
            id: '40000000-0000-4000-8000-000000000001',
            title: 'Паспорт',
            checked: false,
            position: 0,
          },
        ],
      },
    },
  },
  {
    id: 'operation37',
    group: 'Расходы',
    method: 'GET',
    path: '/trips/{tripId}/expenses',
    summary: 'Список расходов',
    description:
      'Доступен участникам поездки. Суммы — decimal-строки, не float. В текущем интерфейсе используется RUB.',
    access: 'Участник поездки',
    status: 200,
    responseSchema: 'ExpenseList',
    query: [
      {
        name: 'categoryId',
        in: 'query',
        description: 'Фильтр категории',
        schema: {
          type: 'string',
        },
      },
      {
        name: 'limit',
        in: 'query',
        description: 'Размер страницы, по умолчанию 50',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 50,
        },
      },
      {
        name: 'cursor',
        in: 'query',
        description: 'Непрозрачный курсор из meta.nextCursor',
        schema: {
          type: 'string',
        },
      },
    ],
    response: {
      data: [
        {
          id: '40000000-0000-4000-8000-000000000001',
          tripId: '20000000-0000-4000-8000-000000000001',
          title: 'Билеты в музей',
          categoryId: '60000000-0000-4000-8000-000000000002',
          categoryName: 'Развлечения',
          amount: '35.50',
          currency: 'RUB',
        },
      ],
      meta: {
        nextCursor: null,
      },
    },
  },
  {
    id: 'operation38',
    group: 'Расходы',
    method: 'POST',
    path: '/trips/{tripId}/expenses',
    summary: 'Добавить расход',
    description:
      'Категория должна иметь domain=expenses, сумма > 0. Пока поддерживается только RUB, валютные итоги не смешиваются.',
    access: 'Организатор',
    status: 201,
    requestSchema: 'ExpenseCreate',
    responseSchema: 'ExpenseResponse',
    request: {
      title: 'Билеты в музей',
      categoryId: '60000000-0000-4000-8000-000000000002',
      amount: '35.50',
      currency: 'RUB',
    },
    response: {
      data: {
        id: '40000000-0000-4000-8000-000000000001',
        tripId: '20000000-0000-4000-8000-000000000001',
        title: 'Билеты в музей',
        categoryId: '60000000-0000-4000-8000-000000000002',
        categoryName: 'Развлечения',
        amount: '35.50',
        currency: 'RUB',
      },
    },
  },
  {
    id: 'operation39',
    group: 'Расходы',
    method: 'GET',
    path: '/trips/{tripId}/expenses/summary',
    summary: 'Итоги по категориям',
    description:
      'Сумма, количество и разбивка; учитывает categoryId и все страницы расходов, а не только текущую страницу.',
    access: 'Участник поездки',
    status: 200,
    responseSchema: 'ExpenseSummaryResponse',
    response: {
      data: {
        total: '35.50',
        count: 1,
        currency: 'RUB',
        byCategory: [
          {
            categoryId: '60000000-0000-4000-8000-000000000002',
            name: 'Развлечения',
            total: '35.50',
          },
        ],
      },
    },
    query: [
      {
        name: 'categoryId',
        in: 'query',
        description: 'Фильтр категории',
        schema: {
          type: 'string',
        },
      },
    ],
  },
  {
    id: 'operation40',
    group: 'Расходы',
    method: 'PATCH',
    path: '/trips/{tripId}/expenses/{expenseId}',
    summary: 'Изменить расход',
    description: 'Проверяет принадлежность записи поездке и домен категории.',
    access: 'Организатор',
    status: 200,
    requestSchema: 'ExpensePatch',
    responseSchema: 'ExpenseResponse',
    request: {
      amount: '40.00',
    },
    response: {
      data: {
        id: '40000000-0000-4000-8000-000000000001',
        tripId: '20000000-0000-4000-8000-000000000001',
        title: 'Билеты в музей',
        categoryId: '60000000-0000-4000-8000-000000000002',
        categoryName: 'Развлечения',
        amount: '40.00',
        currency: 'RUB',
      },
    },
  },
  {
    id: 'operation41',
    group: 'Расходы',
    method: 'DELETE',
    path: '/trips/{tripId}/expenses/{expenseId}',
    summary: 'Удалить расход',
    description: 'Итоги пересчитываются при следующем запросе.',
    access: 'Организатор',
    status: 204,
  },
  {
    id: 'operation42',
    group: 'Категории',
    method: 'GET',
    path: '/categories',
    summary: 'Справочник категорий',
    description:
      'Системные и свои активные категории. Категории удалённых записей не восстанавливаются в списке выбора.',
    access: 'Авторизованный пользователь',
    status: 200,
    responseSchema: 'CategoryList',
    query: [
      {
        name: 'domain',
        in: 'query',
        description: 'Раздел',
        schema: {
          type: 'string',
          enum: ['places', 'expenses'],
        },
      },
      {
        name: 'limit',
        in: 'query',
        description: 'Размер страницы, по умолчанию 50',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 50,
        },
      },
      {
        name: 'cursor',
        in: 'query',
        description: 'Непрозрачный курсор из meta.nextCursor',
        schema: {
          type: 'string',
        },
      },
    ],
    response: {
      data: [
        {
          id: '60000000-0000-4000-8000-000000000001',
          domain: 'places',
          name: 'Парк',
          isSystem: true,
          isActive: true,
        },
      ],
      meta: {
        nextCursor: null,
      },
    },
  },
  {
    id: 'operation43',
    group: 'Категории',
    method: 'POST',
    path: '/categories',
    summary: 'Добавить категорию',
    description:
      'Обрезает края, схлопывает пробелы; сравнение имён без учёта регистра в пределах пользователя и домена. Дубликат с системной категорией тоже запрещён.',
    access: 'Авторизованный пользователь',
    status: 201,
    requestSchema: 'CategoryCreate',
    responseSchema: 'CategoryResponse',
    request: {
      domain: 'places',
      name: 'Галерея',
    },
    response: {
      data: {
        id: '60000000-0000-4000-8000-000000000001',
        domain: 'places',
        name: 'Галерея',
        isSystem: false,
        isActive: true,
      },
    },
  },
  {
    id: 'operation44',
    group: 'Категории',
    method: 'DELETE',
    path: '/categories/{categoryId}',
    summary: 'Скрыть свою категорию',
    description:
      'Soft delete: is_active=false. Уже сохранённые места и расходы сохраняют название категории. Системную категорию удалить нельзя.',
    access: 'Владелец пользовательской категории',
    status: 204,
  },
  {
    id: 'operation45',
    group: 'Участники',
    method: 'GET',
    path: '/trips/{tripId}/members',
    summary: 'Участники поездки',
    description:
      'Роли хранятся в trip_members. organizer редактирует общие данные, viewer читает. Личные чек-листы управляются отдельно.',
    access: 'Участник поездки',
    status: 200,
    responseSchema: 'MemberList',
    query: [
      {
        name: 'limit',
        in: 'query',
        description: 'Размер страницы, по умолчанию 50',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 50,
        },
      },
      {
        name: 'cursor',
        in: 'query',
        description: 'Непрозрачный курсор из meta.nextCursor',
        schema: {
          type: 'string',
        },
      },
    ],
    response: {
      data: [
        {
          userId: '10000000-0000-4000-8000-000000000001',
          name: 'Анна',
          email: 'anna@example.com',
          role: 'organizer',
          color: '#e5ece6',
        },
      ],
      meta: {
        nextCursor: null,
      },
    },
  },
  {
    id: 'operation46',
    group: 'Участники',
    method: 'DELETE',
    path: '/trips/{tripId}/members/{userId}',
    summary: 'Удалить участника',
    description:
      'Нельзя удалить последнего организатора. Удаление членства немедленно прекращает доступ к поездке.',
    access: 'Организатор',
    status: 204,
  },
  {
    id: 'operation47',
    group: 'Приглашения',
    method: 'POST',
    path: '/trips/{tripId}/invitations',
    summary: 'Создать приглашение',
    description:
      'Случайный токен вместо ID поездки. В БД хранится только хеш. Исходная ссылка возвращается при создании; QR строится на клиенте.',
    access: 'Организатор',
    status: 201,
    requestSchema: 'InvitationCreate',
    responseSchema: 'InvitationResponse',
    request: {
      expiresAt: '2026-12-01T12:00:00Z',
      maxUses: 10,
    },
    response: {
      data: {
        id: '40000000-0000-4000-8000-000000000001',
        tripId: '20000000-0000-4000-8000-000000000001',
        role: 'viewer',
        url: 'https://tripper.example/join/<opaque-token>',
        expiresAt: '2026-12-01T12:00:00Z',
        maxUses: 10,
        useCount: 0,
      },
    },
  },
  {
    id: 'operation48',
    group: 'Приглашения',
    method: 'DELETE',
    path: '/trips/{tripId}/invitations/{invitationId}',
    summary: 'Отозвать приглашение',
    description: 'Устанавливает revoked_at; повторное принятие больше невозможно.',
    access: 'Организатор',
    status: 204,
  },
  {
    id: 'operation49',
    group: 'Приглашения',
    method: 'GET',
    path: '/invitations/{token}',
    summary: 'Предпросмотр приглашения',
    description:
      'Публично показывает только название, страну и даты. Не раскрывает события, заметки, расходы и участников. Недействительный токен — 404.',
    access: 'Публичный',
    status: 200,
    public: true,
    responseSchema: 'InvitationPreviewResponse',
    response: {
      data: {
        trip: {
          name: 'Флоренция',
          country: 'Италия',
          start: '2026-11-10',
          end: '2026-11-15',
        },
        role: 'viewer',
        expiresAt: '2026-12-01T12:00:00Z',
      },
    },
  },
  {
    id: 'operation50',
    group: 'Приглашения',
    method: 'POST',
    path: '/invitations/{token}/accept',
    summary: 'Присоединиться к поездке',
    description:
      'Авторизованный пользователь получает viewer. Уникальность trip_id + user_id исключает дубликаты; повторное принятие не расходует лимит. Токен, срок и счётчик проверяются атомарно.',
    access: 'Авторизованный пользователь',
    status: 200,
    responseSchema: 'TripResponse',
    response: {
      data: {
        id: '20000000-0000-4000-8000-000000000001',
        name: 'Флоренция',
        country: 'Италия',
        start: '2026-11-10',
        end: '2026-11-15',
        timeZone: 'Europe/Rome',
        status: 'upcoming',
        archived: false,
        notes: 'Билеты в Уффици куплены',
        coverMediaId: null,
        imageUrl: null,
        role: 'viewer',
      },
    },
  },
  {
    id: 'operation51',
    group: 'Файлы',
    method: 'POST',
    path: '/media',
    summary: 'Загрузить фото',
    description:
      'multipart/form-data, поле file. Сервер проверяет сигнатуру, декодируемость, размер до 1 МБ и MIME JPG/PNG/WebP; хранит объект отдельно от БД. Ошибки 413 и 415.',
    access: 'Авторизованный пользователь',
    status: 201,
    requestSchema: 'MediaUpload',
    responseSchema: 'MediaResponse',
    request: {
      file: '<binary image>',
    },
    response: {
      data: {
        id: '50000000-0000-4000-8000-000000000001',
        mimeType: 'image/jpeg',
        byteSize: 245760,
        width: 1200,
        height: 800,
        url: '/api/v1/media/50000000-0000-4000-8000-000000000001/content',
      },
    },
  },
  {
    id: 'operation52',
    group: 'Файлы',
    method: 'GET',
    path: '/media/{mediaId}/content',
    summary: 'Открыть изображение',
    description:
      'Двоичный ответ. Владелец либо участник поездки, где медиа используется: проверяется ссылка через место, событие или обложку. URL сам по себе не даёт доступа.',
    access: 'Авторизованный пользователь',
    status: 200,
  },
  {
    id: 'operation53',
    group: 'Файлы',
    method: 'DELETE',
    path: '/media/{mediaId}',
    summary: 'Удалить неиспользуемое фото',
    description:
      'Только владелец. Если фото ещё привязано к записи — 409; сначала замените или уберите привязку. Файлы-сироты удаляются фоновой задачей после периода ожидания.',
    access: 'Владелец файла',
    status: 204,
  },
]

export const tables: OrmTable[] = [
  {
    name: 'users',
    model: 'User',
    description: 'Аккаунт и настройки профиля',
    fields: [
      {
        name: 'id',
        type: 'uuid',
        constraint: 'PRIMARY KEY',
        description: 'UUID назначает сервер',
      },
      {
        name: 'name',
        type: 'varchar(160)',
        constraint: 'NOT NULL',
        description: 'Имя профиля',
      },
      {
        name: 'email',
        type: 'varchar(254)',
        constraint: 'NOT NULL',
        description: 'Нормализованная почта',
      },
      {
        name: 'password_hash',
        type: 'text',
        constraint: 'NOT NULL',
        description: 'Только серверный хеш пароля',
      },
      {
        name: 'notifications',
        type: 'boolean',
        constraint: 'NOT NULL DEFAULT true',
        description: 'Настройка уведомлений',
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Время создания',
      },
      {
        name: 'updated_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Обновляется ORM при каждой записи',
      },
    ],
    rules: ['Пароль и его хеш не попадают в DTO. Нормализация email выполняется до записи.'],
    source: 'Profile; LoginPage; RegistrationPage; password.ts',
    constraints: [],
    indexes: ['CREATE UNIQUE INDEX users_email_unique ON users (lower(email));'],
  },
  {
    name: 'sessions',
    model: 'Session',
    description: 'Серверные сессии вместо локального session=true',
    fields: [
      {
        name: 'id',
        type: 'uuid',
        constraint: 'PRIMARY KEY',
        description: 'UUID назначает сервер',
      },
      {
        name: 'user_id',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES users(id) ON DELETE CASCADE',
        description: 'Владелец сессии',
      },
      {
        name: 'token_hash',
        type: 'char(64)',
        constraint: 'NOT NULL UNIQUE',
        description: 'Хеш случайного токена из cookie',
      },
      {
        name: 'expires_at',
        type: 'timestamptz',
        constraint: 'NOT NULL',
        description: 'Срок действия',
      },
      {
        name: 'revoked_at',
        type: 'timestamptz',
        constraint: '',
        description: 'NULL для активной сессии',
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Время создания',
      },
      {
        name: 'updated_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Обновляется ORM при каждой записи',
      },
    ],
    rules: [
      'Cookie: HttpOnly, Secure, SameSite=Lax. Просроченные и отозванные сессии не дают доступ.',
    ],
    source: 'travel.state.ts: session',
    constraints: [],
    indexes: ['CREATE INDEX sessions_user_id_idx ON sessions (user_id);'],
  },
  {
    name: 'media',
    model: 'Media',
    description: 'Метаданные самостоятельно загруженных изображений',
    fields: [
      {
        name: 'id',
        type: 'uuid',
        constraint: 'PRIMARY KEY',
        description: 'UUID назначает сервер',
      },
      {
        name: 'owner_id',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES users(id) ON DELETE CASCADE',
        description: 'Владелец файла',
      },
      {
        name: 'object_key',
        type: 'varchar(512)',
        constraint: 'NOT NULL UNIQUE',
        description: 'Путь в объектном хранилище',
      },
      {
        name: 'mime_type',
        type: 'varchar(32)',
        constraint: "NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp'))",
        description: 'Разрешённый формат',
      },
      {
        name: 'byte_size',
        type: 'integer',
        constraint: 'NOT NULL CHECK (byte_size > 0 AND byte_size <= 1048576)',
        description: 'Размер до 1 МБ',
      },
      {
        name: 'width',
        type: 'integer',
        constraint: 'NOT NULL CHECK (width > 0)',
        description: 'Ширина в пикселях',
      },
      {
        name: 'height',
        type: 'integer',
        constraint: 'NOT NULL CHECK (height > 0)',
        description: 'Высота в пикселях',
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Время создания',
      },
      {
        name: 'updated_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Обновляется ORM при каждой записи',
      },
    ],
    rules: ['Бинарный файл и base64 не хранятся в таблице. URL выдаёт API после проверки доступа.'],
    source: 'PhotoUpload.vue; uploadPhoto',
    constraints: [],
    indexes: ['CREATE INDEX media_owner_id_idx ON media (owner_id);'],
  },
  {
    name: 'categories',
    model: 'Category',
    description: 'Системные и личные категории мест / расходов',
    fields: [
      {
        name: 'id',
        type: 'uuid',
        constraint: 'PRIMARY KEY',
        description: 'UUID назначает сервер',
      },
      {
        name: 'owner_id',
        type: 'uuid',
        constraint: 'REFERENCES users(id) ON DELETE CASCADE',
        description: 'NULL — системная категория',
      },
      {
        name: 'domain',
        type: 'varchar(16)',
        constraint: "NOT NULL CHECK (domain IN ('places', 'expenses'))",
        description: 'У событий собственного домена нет',
      },
      {
        name: 'name',
        type: 'varchar(80)',
        constraint: 'NOT NULL',
        description: 'Нормализованное название',
      },
      {
        name: 'is_active',
        type: 'boolean',
        constraint: 'NOT NULL DEFAULT true',
        description: 'Soft delete для пользовательских категорий',
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Время создания',
      },
      {
        name: 'updated_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Обновляется ORM при каждой записи',
      },
    ],
    rules: [
      'Удаление только логическое; связанные записи продолжают показывать категорию.',
      'Совпадение личного имени с системным проверяется сервисом в транзакции.',
    ],
    source: 'categories.data.ts; category.types.ts',
    constraints: [],
    indexes: [
      'CREATE UNIQUE INDEX categories_system_unique ON categories (domain, lower(name)) WHERE owner_id IS NULL;',
      'CREATE UNIQUE INDEX categories_owner_unique ON categories (owner_id, domain, lower(name)) WHERE owner_id IS NOT NULL;',
    ],
  },
  {
    name: 'trips',
    model: 'Trip',
    description: 'Поездки, даты, архив и общая информация',
    fields: [
      {
        name: 'id',
        type: 'uuid',
        constraint: 'PRIMARY KEY',
        description: 'UUID назначает сервер',
      },
      {
        name: 'created_by',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES users(id) ON DELETE RESTRICT',
        description: 'Создатель поездки',
      },
      {
        name: 'name',
        type: 'varchar(160)',
        constraint: 'NOT NULL',
        description: 'Название',
      },
      {
        name: 'country',
        type: 'varchar(160)',
        constraint: "NOT NULL DEFAULT ''",
        description: 'Страна или регион',
      },
      {
        name: 'start_date',
        type: 'date',
        constraint: 'NOT NULL',
        description: 'Дата начала',
      },
      {
        name: 'end_date',
        type: 'date',
        constraint: 'NOT NULL',
        description: 'Дата окончания включительно',
      },
      {
        name: 'time_zone',
        type: 'varchar(64)',
        constraint: 'NOT NULL',
        description: 'IANA-зона для локальных дат событий',
      },
      {
        name: 'status',
        type: 'varchar(16)',
        constraint: "NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active'))",
        description: 'Статус',
      },
      {
        name: 'archived',
        type: 'boolean',
        constraint: 'NOT NULL DEFAULT false',
        description: 'Архив отдельно от статуса',
      },
      {
        name: 'notes',
        type: 'text',
        constraint: "NOT NULL DEFAULT ''",
        description: 'Заметки поездки',
      },
      {
        name: 'cover_media_id',
        type: 'uuid',
        constraint: 'REFERENCES media(id) ON DELETE SET NULL',
        description: 'Загруженная обложка или NULL',
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Время создания',
      },
      {
        name: 'updated_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Обновляется ORM при каждой записи',
      },
    ],
    rules: [
      'Роль текущего пользователя — из trip_members, а не колонка trips.role.',
      'time_zone — новое серверное поле; валидируется по IANA. Изменение зоны при существующих событиях возвращает 409; перенос между зонами пока не входит в контракт.',
    ],
    source: 'Trip; TripForm.vue',
    constraints: ['CHECK (end_date >= start_date AND end_date - start_date <= 365)'],
    indexes: ['CREATE INDEX trips_dates_idx ON trips (archived, start_date, id);'],
  },
  {
    name: 'trip_members',
    model: 'TripMember',
    description: 'Участники и роли поездок',
    fields: [
      {
        name: 'trip_id',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES trips(id) ON DELETE CASCADE',
        description: 'Поездка',
      },
      {
        name: 'user_id',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES users(id) ON DELETE CASCADE',
        description: 'Пользователь',
      },
      {
        name: 'role',
        type: 'varchar(16)',
        constraint: "NOT NULL CHECK (role IN ('organizer', 'viewer'))",
        description: 'Права участника',
      },
      {
        name: 'color',
        type: 'varchar(7)',
        constraint: '',
        description: 'Цвет аватара, необязателен',
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Время создания',
      },
      {
        name: 'updated_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Обновляется ORM при каждой записи',
      },
    ],
    rules: [
      'Создатель добавляется организатором в транзакции создания поездки.',
      'Сервис запрещает удалять последнего организатора. name/email читаются из users, не дублируются.',
    ],
    source: 'Participant; Trip.role',
    constraints: ['PRIMARY KEY (trip_id, user_id)'],
    indexes: ['CREATE INDEX trip_members_user_idx ON trip_members (user_id, trip_id);'],
  },
  {
    name: 'places',
    model: 'Place',
    description: 'Личная библиотека мест, общая через связи поездок',
    fields: [
      {
        name: 'id',
        type: 'uuid',
        constraint: 'PRIMARY KEY',
        description: 'UUID назначает сервер',
      },
      {
        name: 'owner_id',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES users(id) ON DELETE CASCADE',
        description: 'Владелец места',
      },
      {
        name: 'name',
        type: 'varchar(160)',
        constraint: 'NOT NULL',
        description: 'Название, не уникально',
      },
      {
        name: 'category_id',
        type: 'uuid',
        constraint: 'REFERENCES categories(id) ON DELETE RESTRICT',
        description: 'Только домен places',
      },
      {
        name: 'address',
        type: 'varchar(500)',
        constraint: "NOT NULL DEFAULT ''",
        description: 'Улица и дом; текст может быть введён вручную',
      },
      {
        name: 'latitude',
        type: 'numeric(9,6)',
        constraint: 'CHECK (latitude BETWEEN -90 AND 90)',
        description: 'Широта или NULL',
      },
      {
        name: 'longitude',
        type: 'numeric(10,6)',
        constraint: 'CHECK (longitude BETWEEN -180 AND 180)',
        description: 'Долгота или NULL',
      },
      {
        name: 'photo_media_id',
        type: 'uuid',
        constraint: 'REFERENCES media(id) ON DELETE SET NULL',
        description: 'Самостоятельно загруженное фото',
      },
      {
        name: 'description',
        type: 'text',
        constraint: "NOT NULL DEFAULT ''",
        description: 'Заметки',
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Время создания',
      },
      {
        name: 'updated_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Обновляется ORM при каждой записи',
      },
    ],
    rules: [
      'Координаты либо обе заданы, либо обе NULL.',
      'Только владелец редактирует место; участники связанных поездок могут читать его.',
    ],
    source: 'Place; PlacesPage.vue',
    constraints: ['CHECK ((latitude IS NULL) = (longitude IS NULL))'],
    indexes: ['CREATE INDEX places_owner_category_idx ON places (owner_id, category_id);'],
  },
  {
    name: 'trip_places',
    model: 'TripPlace',
    description: 'Связь поездок и мест many-to-many',
    fields: [
      {
        name: 'trip_id',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES trips(id) ON DELETE CASCADE',
        description: 'Поездка',
      },
      {
        name: 'place_id',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES places(id) ON DELETE CASCADE',
        description: 'Место',
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Время создания',
      },
      {
        name: 'updated_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Обновляется ORM при каждой записи',
      },
    ],
    rules: [
      'Удаление поездки не удаляет место. Повторное прикрепление не создаёт дубль.',
      'Сервис не разрешает отвязать место, пока на него ссылается событие этой поездки.',
    ],
    source: 'TripPlace; addPlaceToTrip',
    constraints: ['PRIMARY KEY (trip_id, place_id)'],
    indexes: ['CREATE INDEX trip_places_place_idx ON trip_places (place_id);'],
  },
  {
    name: 'events',
    model: 'PlanEvent',
    description: 'События расписания без собственной категории',
    fields: [
      {
        name: 'id',
        type: 'uuid',
        constraint: 'PRIMARY KEY',
        description: 'UUID назначает сервер',
      },
      {
        name: 'trip_id',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES trips(id) ON DELETE CASCADE',
        description: 'Поездка',
      },
      {
        name: 'place_id',
        type: 'uuid',
        constraint: 'REFERENCES places(id) ON DELETE SET NULL',
        description: 'Прикреплённое место или NULL',
      },
      {
        name: 'place_label_snapshot',
        type: 'varchar(500)',
        constraint: '',
        description: 'Подпись для старых записей и удалённых мест',
      },
      {
        name: 'title',
        type: 'varchar(160)',
        constraint: 'NOT NULL',
        description: 'Название события',
      },
      {
        name: 'starts_at',
        type: 'timestamptz',
        constraint: 'NOT NULL',
        description: 'Начало, хранится как момент времени',
      },
      {
        name: 'ends_at',
        type: 'timestamptz',
        constraint: 'NOT NULL',
        description: 'Окончание, включая следующий день',
      },
      {
        name: 'description',
        type: 'text',
        constraint: "NOT NULL DEFAULT ''",
        description: 'Описание',
      },
      {
        name: 'own_photo_media_id',
        type: 'uuid',
        constraint: 'REFERENCES media(id) ON DELETE SET NULL',
        description: 'Собственное фото на случай отсутствия фото места',
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Время создания',
      },
      {
        name: 'updated_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Обновляется ORM при каждой записи',
      },
    ],
    rules: [
      'day/start/end/endDay вычисляются в time_zone поездки; ends_at > starts_at.',
      'В DTO imageUrl берётся из места, затем из own_photo_media_id. Категория — только из места.',
      'Сервис гарантирует членство места в trip_places. Перестановка меняет временные слоты транзакционно.',
    ],
    source: 'PlanEvent; EventForm.vue; moveEvent',
    constraints: ['CHECK (ends_at > starts_at)'],
    indexes: [
      'CREATE INDEX events_trip_time_idx ON events (trip_id, starts_at, id);',
      'CREATE INDEX events_place_id_idx ON events (place_id);',
    ],
  },
  {
    name: 'checklists',
    model: 'Checklist',
    description: 'Личные списки и их независимые копии в поездке',
    fields: [
      {
        name: 'id',
        type: 'uuid',
        constraint: 'PRIMARY KEY',
        description: 'UUID назначает сервер',
      },
      {
        name: 'owner_id',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES users(id) ON DELETE CASCADE',
        description: 'Владелец личного списка',
      },
      {
        name: 'trip_id',
        type: 'uuid',
        constraint: 'REFERENCES trips(id) ON DELETE SET NULL',
        description: 'NULL — общая библиотека',
      },
      {
        name: 'title',
        type: 'varchar(160)',
        constraint: 'NOT NULL',
        description: 'Название',
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Время создания',
      },
      {
        name: 'updated_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Обновляется ORM при каждой записи',
      },
    ],
    rules: [
      'Личный список не открывается другим участникам. Копия получает новый ID и сброшенные отметки.',
      'После удаления поездки список остаётся в личной библиотеке.',
    ],
    source: 'Checklist; copyChecklistToTrip',
    constraints: [],
    indexes: ['CREATE INDEX checklists_owner_trip_idx ON checklists (owner_id, trip_id);'],
  },
  {
    name: 'checklist_items',
    model: 'ChecklistItem',
    description: 'Пункты, отметки и порядок внутри списка',
    fields: [
      {
        name: 'id',
        type: 'uuid',
        constraint: 'PRIMARY KEY',
        description: 'UUID назначает сервер',
      },
      {
        name: 'checklist_id',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES checklists(id) ON DELETE CASCADE',
        description: 'Родительский список',
      },
      {
        name: 'title',
        type: 'varchar(160)',
        constraint: 'NOT NULL',
        description: 'Текст пункта',
      },
      {
        name: 'checked',
        type: 'boolean',
        constraint: 'NOT NULL DEFAULT false',
        description: 'Отметка выполнения',
      },
      {
        name: 'position',
        type: 'integer',
        constraint: 'NOT NULL CHECK (position >= 0)',
        description: 'Позиция при перетаскивании',
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Время создания',
      },
      {
        name: 'updated_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Обновляется ORM при каждой записи',
      },
    ],
    rules: ['Уникальность позиции отложена до конца транзакции для атомарной перестановки.'],
    source: 'ChecklistItem; ChecklistsPage.vue',
    constraints: ['UNIQUE (checklist_id, position) DEFERRABLE INITIALLY DEFERRED'],
    indexes: [],
  },
  {
    name: 'expenses',
    model: 'Expense',
    description: 'Общие расходы поездки с точными суммами',
    fields: [
      {
        name: 'id',
        type: 'uuid',
        constraint: 'PRIMARY KEY',
        description: 'UUID назначает сервер',
      },
      {
        name: 'trip_id',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES trips(id) ON DELETE CASCADE',
        description: 'Поездка',
      },
      {
        name: 'category_id',
        type: 'uuid',
        constraint: 'REFERENCES categories(id) ON DELETE RESTRICT',
        description: 'Только домен expenses',
      },
      {
        name: 'title',
        type: 'varchar(160)',
        constraint: 'NOT NULL',
        description: 'Название расхода',
      },
      {
        name: 'amount',
        type: 'numeric(14,2)',
        constraint: 'NOT NULL CHECK (amount > 0)',
        description: 'Точное десятичное значение',
      },
      {
        name: 'currency',
        type: 'char(3)',
        constraint: "NOT NULL DEFAULT 'RUB' CHECK (currency = 'RUB')",
        description: 'Текущий интерфейс работает в рублях',
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Время создания',
      },
      {
        name: 'updated_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Обновляется ORM при каждой записи',
      },
    ],
    rules: [
      'API отдаёт amount строкой. На клиенте нужен адаптер к текущему полю amount:number.',
      'Удаление пользовательской категории скрывает её из выбора, сохраняя связь расхода.',
    ],
    source: 'Expense; ExpensesPage.vue',
    constraints: [],
    indexes: ['CREATE INDEX expenses_trip_category_idx ON expenses (trip_id, category_id);'],
  },
  {
    name: 'invitations',
    model: 'Invitation',
    description: 'Отзываемые приглашения на просмотр',
    fields: [
      {
        name: 'id',
        type: 'uuid',
        constraint: 'PRIMARY KEY',
        description: 'UUID назначает сервер',
      },
      {
        name: 'trip_id',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES trips(id) ON DELETE CASCADE',
        description: 'Поездка',
      },
      {
        name: 'created_by',
        type: 'uuid',
        constraint: 'NOT NULL REFERENCES users(id) ON DELETE CASCADE',
        description: 'Кто пригласил',
      },
      {
        name: 'token_hash',
        type: 'char(64)',
        constraint: 'NOT NULL UNIQUE',
        description: 'Хеш токена; исходный токен выдаётся при создании',
      },
      {
        name: 'expires_at',
        type: 'timestamptz',
        constraint: 'NOT NULL',
        description: 'Срок действия',
      },
      {
        name: 'max_uses',
        type: 'integer',
        constraint: 'NOT NULL CHECK (max_uses > 0)',
        description: 'Лимит новых участников',
      },
      {
        name: 'use_count',
        type: 'integer',
        constraint: 'NOT NULL DEFAULT 0 CHECK (use_count >= 0)',
        description: 'Число принятых приглашений',
      },
      {
        name: 'revoked_at',
        type: 'timestamptz',
        constraint: '',
        description: 'Дата отзыва или NULL',
      },
      {
        name: 'created_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Время создания',
      },
      {
        name: 'updated_at',
        type: 'timestamptz',
        constraint: 'NOT NULL DEFAULT now()',
        description: 'Обновляется ORM при каждой записи',
      },
    ],
    rules: [
      'Принятие выдаёт только viewer; роль не задаётся клиентом.',
      'Проверка лимита, создание членства и увеличение счётчика — одна транзакция. QR-код не хранится.',
    ],
    source: 'InviteForm.vue; JoinPage.vue',
    constraints: ['CHECK (use_count <= max_uses)'],
    indexes: ['CREATE INDEX invitations_trip_idx ON invitations (trip_id);'],
  },
]

export const dtoSchemas: Record<string, Record<string, unknown>> = {
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 254,
      },
      notifications: {
        type: 'boolean',
      },
    },
    required: ['id', 'name', 'email', 'notifications'],
    additionalProperties: false,
  },
  RegistrationRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 254,
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 128,
        writeOnly: true,
      },
      accepted: {
        const: true,
      },
    },
    required: ['name', 'email', 'password', 'accepted'],
    additionalProperties: false,
  },
  LoginRequest: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        maxLength: 254,
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 128,
        writeOnly: true,
      },
    },
    required: ['email', 'password'],
    additionalProperties: false,
  },
  ProfilePatch: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 254,
      },
      notifications: {
        type: 'boolean',
      },
    },
    required: [],
    additionalProperties: false,
  },
  PasswordPatch: {
    type: 'object',
    properties: {
      currentPassword: {
        type: 'string',
        minLength: 8,
        maxLength: 128,
        writeOnly: true,
      },
      newPassword: {
        type: 'string',
        minLength: 8,
        maxLength: 128,
        writeOnly: true,
      },
    },
    required: ['currentPassword', 'newPassword'],
    additionalProperties: false,
  },
  TripCreate: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      country: {
        type: 'string',
        maxLength: 160,
      },
      start: {
        type: 'string',
        format: 'date',
      },
      end: {
        type: 'string',
        format: 'date',
      },
      timeZone: {
        type: 'string',
        description: 'IANA timezone, например Europe/Rome',
      },
      status: {
        type: 'string',
        enum: ['upcoming', 'active'],
      },
      archived: {
        type: 'boolean',
      },
      notes: {
        type: 'string',
        maxLength: 10000,
      },
      coverMediaId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
    },
    required: ['name', 'start', 'end', 'timeZone'],
    additionalProperties: false,
  },
  TripPatch: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      country: {
        type: 'string',
        maxLength: 160,
      },
      start: {
        type: 'string',
        format: 'date',
      },
      end: {
        type: 'string',
        format: 'date',
      },
      timeZone: {
        type: 'string',
        description: 'IANA timezone, например Europe/Rome',
      },
      status: {
        type: 'string',
        enum: ['upcoming', 'active'],
      },
      archived: {
        type: 'boolean',
      },
      notes: {
        type: 'string',
        maxLength: 10000,
      },
      coverMediaId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
    },
    required: [],
    additionalProperties: false,
  },
  Trip: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      country: {
        type: 'string',
        maxLength: 160,
      },
      start: {
        type: 'string',
        format: 'date',
      },
      end: {
        type: 'string',
        format: 'date',
      },
      timeZone: {
        type: 'string',
        description: 'IANA timezone, например Europe/Rome',
      },
      status: {
        type: 'string',
        enum: ['upcoming', 'active'],
      },
      archived: {
        type: 'boolean',
      },
      notes: {
        type: 'string',
        maxLength: 10000,
      },
      coverMediaId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      id: {
        type: 'string',
        format: 'uuid',
      },
      imageUrl: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'null',
          },
        ],
      },
      role: {
        type: 'string',
        enum: ['organizer', 'viewer'],
      },
    },
    required: [
      'name',
      'country',
      'start',
      'end',
      'timeZone',
      'status',
      'archived',
      'notes',
      'coverMediaId',
      'id',
      'imageUrl',
      'role',
    ],
    additionalProperties: false,
  },
  Coordinates: {
    type: 'object',
    properties: {
      latitude: {
        type: 'number',
        minimum: -90,
        maximum: 90,
      },
      longitude: {
        type: 'number',
        minimum: -180,
        maximum: 180,
      },
    },
    required: ['latitude', 'longitude'],
    additionalProperties: false,
  },
  PlaceCreate: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      categoryId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      address: {
        type: 'string',
        maxLength: 500,
      },
      coordinates: {
        anyOf: [
          {
            $ref: '#/components/schemas/Coordinates',
          },
          {
            type: 'null',
          },
        ],
      },
      photoMediaId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      description: {
        type: 'string',
        maxLength: 10000,
      },
    },
    required: ['name'],
    additionalProperties: false,
  },
  PlacePatch: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      categoryId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      address: {
        type: 'string',
        maxLength: 500,
      },
      coordinates: {
        anyOf: [
          {
            $ref: '#/components/schemas/Coordinates',
          },
          {
            type: 'null',
          },
        ],
      },
      photoMediaId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      description: {
        type: 'string',
        maxLength: 10000,
      },
    },
    required: [],
    additionalProperties: false,
  },
  Place: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      categoryId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      address: {
        type: 'string',
        maxLength: 500,
      },
      coordinates: {
        anyOf: [
          {
            $ref: '#/components/schemas/Coordinates',
          },
          {
            type: 'null',
          },
        ],
      },
      photoMediaId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      description: {
        type: 'string',
        maxLength: 10000,
      },
      id: {
        type: 'string',
        format: 'uuid',
      },
      categoryName: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'null',
          },
        ],
      },
      imageUrl: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'null',
          },
        ],
      },
    },
    required: [
      'name',
      'categoryId',
      'address',
      'coordinates',
      'photoMediaId',
      'description',
      'id',
      'categoryName',
      'imageUrl',
    ],
    additionalProperties: false,
  },
  EventCreate: {
    type: 'object',
    properties: {
      day: {
        type: 'string',
        format: 'date',
      },
      start: {
        type: 'string',
        pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$',
      },
      end: {
        type: 'string',
        pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$',
      },
      endDay: {
        type: 'string',
        format: 'date',
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      placeId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      description: {
        type: 'string',
        maxLength: 10000,
      },
      ownPhotoMediaId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
    },
    required: ['day', 'start', 'title'],
    additionalProperties: false,
  },
  EventPatch: {
    type: 'object',
    properties: {
      day: {
        type: 'string',
        format: 'date',
      },
      start: {
        type: 'string',
        pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$',
      },
      end: {
        type: 'string',
        pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$',
      },
      endDay: {
        type: 'string',
        format: 'date',
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      placeId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      description: {
        type: 'string',
        maxLength: 10000,
      },
      ownPhotoMediaId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
    },
    required: [],
    additionalProperties: false,
  },
  Event: {
    type: 'object',
    properties: {
      day: {
        type: 'string',
        format: 'date',
      },
      start: {
        type: 'string',
        pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$',
      },
      end: {
        type: 'string',
        pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$',
      },
      endDay: {
        type: 'string',
        format: 'date',
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      placeId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      description: {
        type: 'string',
        maxLength: 10000,
      },
      ownPhotoMediaId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      id: {
        type: 'string',
        format: 'uuid',
      },
      tripId: {
        type: 'string',
        format: 'uuid',
      },
      place: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'null',
          },
        ],
      },
      imageUrl: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'null',
          },
        ],
      },
      imageSource: {
        type: ['string', 'null'],
        enum: ['place', 'event', null],
      },
      placeCategory: {
        anyOf: [
          {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              name: {
                type: 'string',
              },
            },
            required: ['id', 'name'],
            additionalProperties: false,
          },
          {
            type: 'null',
          },
        ],
      },
    },
    required: [
      'day',
      'start',
      'end',
      'endDay',
      'title',
      'placeId',
      'description',
      'ownPhotoMediaId',
      'id',
      'tripId',
      'place',
      'imageUrl',
      'imageSource',
      'placeCategory',
    ],
    additionalProperties: false,
  },
  EventReorder: {
    type: 'object',
    properties: {
      eventIds: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
        },
        minItems: 2,
        uniqueItems: true,
      },
    },
    required: ['eventIds'],
    additionalProperties: false,
  },
  ChecklistCreate: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      tripId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
    },
    required: ['title'],
    additionalProperties: false,
  },
  ChecklistPatch: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
    },
    required: ['title'],
    additionalProperties: false,
  },
  ChecklistItemCreate: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
    },
    required: ['title'],
    additionalProperties: false,
  },
  ChecklistItemPatch: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      checked: {
        type: 'boolean',
      },
    },
    required: [],
    additionalProperties: false,
  },
  ChecklistItem: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      checked: {
        type: 'boolean',
      },
      position: {
        type: 'integer',
        minimum: 0,
      },
    },
    required: ['id', 'title', 'checked', 'position'],
    additionalProperties: false,
  },
  Checklist: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      tripId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/ChecklistItem',
        },
      },
    },
    required: ['id', 'tripId', 'title', 'items'],
    additionalProperties: false,
  },
  ChecklistCopy: {
    type: 'object',
    properties: {
      tripId: {
        type: 'string',
        format: 'uuid',
      },
    },
    required: ['tripId'],
    additionalProperties: false,
  },
  ItemReorder: {
    type: 'object',
    properties: {
      itemIds: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
        },
        uniqueItems: true,
      },
    },
    required: ['itemIds'],
    additionalProperties: false,
  },
  ExpenseCreate: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      categoryId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      amount: {
        type: 'string',
        pattern: '^[0-9]{1,12}(\\.[0-9]{1,2})?$',
        description: 'Положительная десятичная сумма; сервер отклоняет 0',
      },
      currency: {
        type: 'string',
        enum: ['RUB'],
      },
    },
    required: ['title', 'amount'],
    additionalProperties: false,
  },
  ExpensePatch: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      categoryId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      amount: {
        type: 'string',
        pattern: '^[0-9]{1,12}(\\.[0-9]{1,2})?$',
        description: 'Положительная десятичная сумма; сервер отклоняет 0',
      },
      currency: {
        type: 'string',
        enum: ['RUB'],
      },
    },
    required: [],
    additionalProperties: false,
  },
  Expense: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 160,
      },
      categoryId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
          },
          {
            type: 'null',
          },
        ],
      },
      amount: {
        type: 'string',
        pattern: '^[0-9]{1,12}(\\.[0-9]{1,2})?$',
        description: 'Положительная десятичная сумма; сервер отклоняет 0',
      },
      currency: {
        type: 'string',
        enum: ['RUB'],
      },
      id: {
        type: 'string',
        format: 'uuid',
      },
      tripId: {
        type: 'string',
        format: 'uuid',
      },
      categoryName: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'null',
          },
        ],
      },
    },
    required: ['title', 'categoryId', 'amount', 'currency', 'id', 'tripId', 'categoryName'],
    additionalProperties: false,
  },
  ExpenseSummary: {
    type: 'object',
    properties: {
      total: {
        type: 'string',
      },
      count: {
        type: 'integer',
      },
      currency: {
        type: 'string',
      },
      byCategory: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            categoryId: {
              anyOf: [
                {
                  type: 'string',
                  format: 'uuid',
                },
                {
                  type: 'null',
                },
              ],
            },
            name: {
              type: 'string',
            },
            total: {
              type: 'string',
            },
          },
          required: ['categoryId', 'name', 'total'],
          additionalProperties: false,
        },
      },
    },
    required: ['total', 'count', 'currency', 'byCategory'],
    additionalProperties: false,
  },
  CategoryCreate: {
    type: 'object',
    properties: {
      domain: {
        type: 'string',
        enum: ['places', 'expenses'],
      },
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 80,
      },
    },
    required: ['domain', 'name'],
    additionalProperties: false,
  },
  Category: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      domain: {
        type: 'string',
        enum: ['places', 'expenses'],
      },
      name: {
        type: 'string',
      },
      isSystem: {
        type: 'boolean',
      },
      isActive: {
        type: 'boolean',
      },
    },
    required: ['id', 'domain', 'name', 'isSystem', 'isActive'],
    additionalProperties: false,
  },
  Member: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
      },
      name: {
        type: 'string',
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 254,
      },
      role: {
        type: 'string',
        enum: ['organizer', 'viewer'],
      },
      color: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'null',
          },
        ],
      },
    },
    required: ['userId', 'name', 'email', 'role', 'color'],
    additionalProperties: false,
  },
  InvitationCreate: {
    type: 'object',
    properties: {
      expiresAt: {
        type: 'string',
        format: 'date-time',
      },
      maxUses: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
      },
    },
    required: ['expiresAt', 'maxUses'],
    additionalProperties: false,
  },
  Invitation: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      tripId: {
        type: 'string',
        format: 'uuid',
      },
      role: {
        const: 'viewer',
      },
      url: {
        type: 'string',
      },
      expiresAt: {
        type: 'string',
        format: 'date-time',
      },
      maxUses: {
        type: 'integer',
      },
      useCount: {
        type: 'integer',
      },
    },
    required: ['id', 'tripId', 'role', 'url', 'expiresAt', 'maxUses', 'useCount'],
    additionalProperties: false,
  },
  InvitationPreview: {
    type: 'object',
    properties: {
      trip: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          country: {
            type: 'string',
          },
          start: {
            type: 'string',
            format: 'date',
          },
          end: {
            type: 'string',
            format: 'date',
          },
        },
        required: ['name', 'country', 'start', 'end'],
        additionalProperties: false,
      },
      role: {
        const: 'viewer',
      },
      expiresAt: {
        type: 'string',
        format: 'date-time',
      },
    },
    required: ['trip', 'role', 'expiresAt'],
    additionalProperties: false,
  },
  MediaUpload: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
        description: 'JPG, PNG или WebP; не более 1 048 576 байт',
      },
    },
    required: ['file'],
    additionalProperties: false,
  },
  Media: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      mimeType: {
        type: 'string',
      },
      byteSize: {
        type: 'integer',
      },
      width: {
        type: 'integer',
      },
      height: {
        type: 'integer',
      },
      url: {
        type: 'string',
      },
    },
    required: ['id', 'mimeType', 'byteSize', 'width', 'height', 'url'],
    additionalProperties: false,
  },
  Csrf: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
      },
    },
    required: ['token'],
    additionalProperties: false,
  },
  ApiError: {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
          fields: {
            type: 'object',
            additionalProperties: {
              type: 'string',
            },
          },
          requestId: {
            type: 'string',
          },
        },
        required: ['code', 'message', 'requestId'],
        additionalProperties: false,
      },
    },
    required: ['error'],
    additionalProperties: false,
  },
  UserResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/User',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  TripResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/Trip',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  TripList: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Trip',
        },
      },
      meta: {
        type: 'object',
        properties: {
          nextCursor: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
          },
        },
        required: ['nextCursor'],
        additionalProperties: false,
      },
    },
    required: ['data', 'meta'],
    additionalProperties: false,
  },
  PlaceResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/Place',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  PlaceList: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Place',
        },
      },
      meta: {
        type: 'object',
        properties: {
          nextCursor: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
          },
        },
        required: ['nextCursor'],
        additionalProperties: false,
      },
    },
    required: ['data', 'meta'],
    additionalProperties: false,
  },
  EventResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/Event',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  EventList: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Event',
        },
      },
      meta: {
        type: 'object',
        properties: {
          nextCursor: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
          },
        },
        required: ['nextCursor'],
        additionalProperties: false,
      },
    },
    required: ['data', 'meta'],
    additionalProperties: false,
  },
  ChecklistResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/Checklist',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  ChecklistList: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Checklist',
        },
      },
      meta: {
        type: 'object',
        properties: {
          nextCursor: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
          },
        },
        required: ['nextCursor'],
        additionalProperties: false,
      },
    },
    required: ['data', 'meta'],
    additionalProperties: false,
  },
  ChecklistItemResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/ChecklistItem',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  ExpenseResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/Expense',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  ExpenseList: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Expense',
        },
      },
      meta: {
        type: 'object',
        properties: {
          nextCursor: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
          },
        },
        required: ['nextCursor'],
        additionalProperties: false,
      },
    },
    required: ['data', 'meta'],
    additionalProperties: false,
  },
  ExpenseSummaryResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/ExpenseSummary',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  CategoryResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/Category',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  CategoryList: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Category',
        },
      },
      meta: {
        type: 'object',
        properties: {
          nextCursor: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
          },
        },
        required: ['nextCursor'],
        additionalProperties: false,
      },
    },
    required: ['data', 'meta'],
    additionalProperties: false,
  },
  MemberResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/Member',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  MemberList: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Member',
        },
      },
      meta: {
        type: 'object',
        properties: {
          nextCursor: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'null',
              },
            ],
          },
        },
        required: ['nextCursor'],
        additionalProperties: false,
      },
    },
    required: ['data', 'meta'],
    additionalProperties: false,
  },
  InvitationResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/Invitation',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  InvitationPreviewResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/InvitationPreview',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  MediaResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/Media',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  CsrfResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/Csrf',
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
}

export const relationships = [
  [
    'users → trip_members → trips',
    'N:M',
    'Участник видит поездку через членство; роль относится к конкретной поездке.',
  ],
  ['trips → trip_places → places', 'N:M', 'Удаление связи оставляет место в личной библиотеке.'],
  ['trips → events', '1:N', 'Событие принадлежит одной поездке и удаляется вместе с ней.'],
  [
    'places → events',
    '1:N, необязательно',
    'Удаление места обнуляет place_id; подпись и собственное фото сохраняются.',
  ],
  [
    'users → checklists → checklist_items',
    '1:N → 1:N',
    'Списки личные; trip_id — необязательный контекст.',
  ],
  [
    'categories → places / expenses',
    '1:N',
    'Категории двух доменов, логическое удаление сохраняет историю.',
  ],
  [
    'media → trips / places / events',
    '1:N',
    'Только метаданные в БД; изображение — в объектном хранилище.',
  ],
  [
    'trips → expenses / invitations',
    '1:N',
    'Общие расходы и приглашения удаляются каскадно с поездкой.',
  ],
]

export const sourceMap = [
  [
    'Аккаунт',
    'LoginPage, RegistrationPage, Profile, password.ts',
    'users + sessions; серверные сессии и владение записями',
  ],
  [
    'Trip.role, Participant',
    'trip.types.ts; editable(); members()',
    'trip_members; профиль участника читается из users',
  ],
  [
    'Place + TripPlace',
    'placesForTrip(); addPlaceToTrip()',
    'places + trip_places; личная библиотека отделена от поездок',
  ],
  [
    'PlanEvent',
    'EventForm; imageForEvent(); placeForEvent()',
    'events; время с зоной поездки, фото и категория от места',
  ],
  [
    'Checklist.items[]',
    'ChecklistsPage; copyChecklistToTrip()',
    'checklists + checklist_items; owner_id и position',
  ],
  [
    'Expense.amount, category',
    'ExpensesPage; category.types.ts',
    'expenses + categories; numeric и отдельные ID',
  ],
  ['image: data URL', 'PhotoUpload; travel.storage.ts', 'media; ссылки на файлы вместо base64'],
  [
    '/join/:tripId и QR',
    'InviteForm; JoinPage',
    'invitations; секретный токен, срок, отзыв и лимит',
  ],
]

export const permissions = [
  ['Поездки, события, расходы', 'Читать и изменять', 'Читать'],
  ['Места поездки', 'Прикреплять свои; редактировать только свои', 'Читать прикреплённые'],
  ['Личная библиотека мест', 'Только владелец', 'Только владелец'],
  ['Личные чек-листы', 'Только владелец', 'Только владелец'],
  ['Копирование списка в поездку', 'Владелец списка + организатор', 'Недоступно в текущем UI'],
  ['Приглашения, удаление участников', 'Управлять; сохранять организатора', 'Недоступно'],
]

export const overviewNotes = [
  {
    title: 'Сейчас — локальное приложение',
    text: 'Vue 3 + Pinia; данные живут в localStorage. Собственного HTTP API, базы данных, миграций и ORM в репозитории нет. Эндпоинты ниже — предлагаемый контракт v1, а SQL — проект серверной схемы.',
  },
  {
    title: 'Серверная модель расширяет клиентскую',
    text: 'Добавлены users, sessions, owner_id, media, invitations и time_zone. Это необходимые предложения для многопользовательской версии, а не описание уже работающего сервера. ORM не выбран: модели заданы независимо от библиотеки, SQL рассчитан на PostgreSQL.',
  },
  {
    title: 'Существующие интеграции',
    text: 'Карта и адреса используют Mapbox GL / Geocoding v6 напрямую из браузера; погода — Open-Meteo по геолокации. Это внешние сервисы, а не маршруты /api/v1. В этом проекте не предлагается сохранять их ответы в отдельные таблицы.',
  },
]
