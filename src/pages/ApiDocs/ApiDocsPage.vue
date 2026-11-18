<template>
  <div :class="style.page">
    <SectionHeader
      header="API & модель данных"
      level="h1"
      paragraph="Контракт серверной части Tripper, построенный по данным и сценариям приложения.">
      <template #actions>
        <Button
          variant="secondary"
          size="sm"
          @click="downloadOpenApi">
          <PhDownloadSimple :size="17" />
          OpenAPI JSON
        </Button>
        <Button
          variant="secondary"
          size="sm"
          @click="downloadSql">
          <PhDatabase :size="17" />
          Схема SQL
        </Button>
      </template>
    </SectionHeader>

    <div :class="style.notice">
      <PhCode :size="24" />
      <div>
        <div :class="style.noticeTitle">
          <strong>Проект контракта</strong>
          <Badge variant="neutral">v0.1 · draft</Badge>
        </div>
        <p>
          Сейчас данные хранятся в браузере. Описанные API, ORM и PostgreSQL ещё не реализованы. Эта
          страница — спецификация для разработки бэкенда, без отправки запросов.
        </p>
      </div>
    </div>

    <div :class="style.stats">
      <div>
        <span>Базовый путь</span>
        <code>/api/v1</code>
      </div>
      <div>
        <span>Маршруты</span>
        <strong>{{ endpoints.length }}</strong>
      </div>
      <div>
        <span>Таблицы ORM</span>
        <strong>{{ tables.length }}</strong>
      </div>
      <div>
        <span>Доступ</span>
        <strong>organizer / viewer</strong>
      </div>
    </div>

    <div :class="style.tabs">
      <Tab
        :active="tab === 'overview'"
        @click="tab = 'overview'">
        Обзор
      </Tab>
      <Tab
        :active="tab === 'api'"
        @click="tab = 'api'">
        API
        <span>{{ endpoints.length }}</span>
      </Tab>
      <Tab
        :active="tab === 'orm'"
        @click="tab = 'orm'">
        Таблицы ORM
        <span>{{ tables.length }}</span>
      </Tab>
    </div>

    <div
      v-if="tab === 'overview'"
      :class="style.sections">
      <section :class="style.panel">
        <SectionHeader
          header="От локального прототипа к серверу"
          paragraph="Текущая реализация и предлагаемые изменения разделены явно." />
        <div :class="style.notesGrid">
          <article
            v-for="note in overviewNotes"
            :key="note.title"
            :class="style.note">
            <SectionHeader
              :header="note.title"
              level="h3" />
            <p>{{ note.text }}</p>
          </article>
        </div>
        <div :class="style.architecture">
          <div>
            <PhCode :size="22" />
            <strong>Vue + Pinia</strong>
            <span>Интерфейс и адаптеры DTO</span>
          </div>
          <PhArrowRight :size="20" />
          <div>
            <PhBracketsCurly :size="22" />
            <strong>REST API</strong>
            <span>Сессии, права и валидация</span>
          </div>
          <PhArrowRight :size="20" />
          <div>
            <PhDatabase :size="22" />
            <strong>PostgreSQL + файлы</strong>
            <span>ORM и объектное хранилище</span>
          </div>
        </div>
      </section>
      <section :class="style.panel">
        <SectionHeader
          header="Что меняется в модели"
          paragraph="Сопоставление с типами, хранилищем и формами репозитория." />
        <div :class="style.tableScroll">
          <table>
            <thead>
              <tr>
                <th>Объект клиента</th>
                <th>Источник в проекте</th>
                <th>Серверная модель</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in sourceMap"
                :key="row[0]">
                <td
                  v-for="(cell, index) in row"
                  :key="index">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p :class="style.caption">
          Основные источники: src/types/trip.types.ts, src/stores/travel.ts, travel.state.ts,
          travel.storage.ts, формы поездок, событий, мест, чек-листов и расходов.
        </p>
      </section>
      <section :class="style.panel">
        <SectionHeader
          header="Права доступа"
          paragraph="Проверяются сервером по сессии, членству в поездке и владельцу записи." />
        <div :class="style.tableScroll">
          <table>
            <thead>
              <tr>
                <th>Ресурс</th>
                <th>Организатор</th>
                <th>Участник viewer</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in permissions"
                :key="row[0]">
                <td
                  v-for="(cell, index) in row"
                  :key="index">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p :class="style.caption">
          owner_id — дополнение серверной модели. В локальном прототипе нет полноценных аккаунтов
          нескольких пользователей и разграничения данных на сервере.
        </p>
      </section>
      <section :class="style.panel">
        <SectionHeader
          header="Правила контракта"
          paragraph="Единые соглашения для всех маршрутов." />
        <dl :class="style.rules">
          <div>
            <dt>Сессии и CSRF</dt>
            <dd>
              Cookie tripper_session: HttpOnly, Secure, SameSite=Lax. Клиент использует credentials:
              include. До изменяющих запросов получает GET /auth/csrf и передаёт X-CSRF-Token; после
              входа токен обновляется.
            </dd>
          </div>
          <div>
            <dt>Формат</dt>
            <dd>
              JSON, camelCase, UUID. Ответ: { data }; список: { data, meta: { nextCursor } }. DELETE
              и logout возвращают 204 без тела. Для файлов — multipart/form-data и двоичный ответ.
            </dd>
          </div>
          <div>
            <dt>Пагинация</dt>
            <dd>
              limit от 1 до 100, по умолчанию 50. cursor берётся из предыдущего ответа; null
              означает конец. Поездки сортируются по start, id; события по starts_at, id; остальные
              списки по created_at, id. Пункты списка — по position.
            </dd>
          </div>
          <div>
            <dt>Время события</dt>
            <dd>
              Дата берётся из выбранного дня. Изменение начала ставит окончание на час позже, если
              окончание не передано явно. Сервер хранит starts_at / ends_at и возвращает day / start
              / end / endDay в зоне поездки. Неоднозначное или несуществующее локальное время при
              переходе на летнее время отклоняется с 422.
            </dd>
          </div>
          <div>
            <dt>Место и фото</dt>
            <dd>
              У события нет своей категории. placeCategory вычисляется по placeId; imageUrl — фото
              места, иначе собственное фото события, иначе null. Свои фото сохраняются при привязке
              и отвязке места.
            </dd>
          </div>
          <div>
            <dt>Загрузка</dt>
            <dd>
              Только JPG, PNG, WebP до 1 МБ. Загрузка возвращает mediaId; затем он передаётся в
              запись. Сначала меняется ссылка в БД, затем старый неиспользуемый файл можно удалить.
              Медиа доступны только владельцу и участникам связанных поездок.
            </dd>
          </div>
          <div>
            <dt>Категории</dt>
            <dd>
              Только places и expenses. Системные категории защищены. Пользовательские скрываются
              через is_active=false, сохраняя подписи и связи старых записей.
            </dd>
          </div>
          <div>
            <dt>Транзакции</dt>
            <dd>
              Создание поездки с организатором, приём приглашения, копирование чек-листа, привязка
              места к событию и перестановки выполняются атомарно. При конфликте состояние не
              меняется частично.
            </dd>
          </div>
          <div>
            <dt>Конкурентные изменения</dt>
            <dd>
              Перестановки и счётчики используют блокировки в транзакции. Обычный PATCH пока имеет
              семантику «последняя запись побеждает»; ETag / версионность — отдельное будущее
              расширение.
            </dd>
          </div>
        </dl>
      </section>
      <section :class="style.panel">
        <SectionHeader
          header="Ошибки"
          paragraph="HTTP-статус описывает результат, error.code — причину для клиента. Технические детали сервера не раскрываются." />
        <div :class="style.errorGrid">
          <dl :class="style.statuses">
            <div
              v-for="error in errors"
              :key="error.code">
              <dt>{{ error.code }}</dt>
              <dd>{{ error.text }}</dd>
            </div>
          </dl>
          <pre :class="style.code"><code>{{ format(errorExample) }}</code></pre>
        </div>
      </section>
      <section :class="style.panel">
        <SectionHeader
          header="План перехода"
          paragraph="Документация описывает цель; текущий клиент продолжает работать локально." />
        <ol :class="style.migration">
          <li>
            Выбрать ORM, создать миграции по SQL-проекту и серверные проверки доступа. Добавить
            интеграционные тесты ролей, владельцев и удаления связей.
          </li>
          <li>
            Реализовать сессии, регистрацию, вход и профиль. Локальные пароли и session=true не
            переносить как доказательство личности: пользователь входит или регистрируется на
            сервере.
          </li>
          <li>
            Импортировать данные аккаунта с явным сопоставлением старых ID с UUID. Категории-строки
            заменить categoryId; старые названия мест сопоставлять только при однозначном
            совпадении.
          </li>
          <li>
            Загрузить собственные data URL как media; задать зону поездки. Восстановить starts_at /
            ends_at, отдельно проверив события через полночь.
          </li>
          <li>
            Заменить чтение Pinia/localStorage адаптерами API. Trip.role, imageUrl, placeCategory и
            суммы DTO не должны без преобразования подменять текущие клиентские типы.
          </li>
        </ol>
      </section>
    </div>

    <section
      v-else-if="tab === 'api'"
      :class="style.sections">
      <SectionHeader
        header="HTTP API"
        paragraph="Раскройте маршрут, чтобы увидеть права, параметры, примеры и JSON Schema. Запросы на сервер отсюда не выполняются." />
      <div :class="style.filters">
        <Input
          v-model="apiSearch"
          label="Поиск по API"
          placeholder="Маршрут, действие или ресурс"
          size="sm">
          <template #prefix><PhMagnifyingGlass :size="18" /></template>
        </Input>
        <Select
          v-model="method"
          label="HTTP-метод"
          :options="methodOptions"
          size="sm" />
        <Select
          v-model="group"
          label="Раздел API"
          :options="groupOptions"
          size="sm" />
      </div>
      <p :class="style.caption">
        Показано {{ filteredEndpoints.length }} из {{ endpoints.length }} маршрутов · /api/v1
      </p>
      <details
        v-for="endpoint in filteredEndpoints"
        :key="endpoint.id"
        :class="style.endpoint">
        <summary>
          <span :class="[style.method, style[endpoint.method.toLowerCase()]]">
            {{ endpoint.method }}
          </span>
          <span :class="style.endpointName">
            <code>{{ endpoint.path }}</code>
            <span>{{ endpoint.summary }}</span>
          </span>
          <PhCaretDown
            :size="18"
            :class="style.chevron" />
        </summary>
        <div :class="style.endpointBody">
          <div :class="style.metadata">
            <Badge variant="neutral">{{ endpoint.group }}</Badge>
            <span>{{ endpoint.access }}</span>
            <code>HTTP {{ endpoint.status }}</code>
          </div>
          <p>{{ endpoint.description }}</p>
          <p :class="style.caption">
            {{ endpoint.public ? 'Без авторизации.' : 'Требуется cookie серверной сессии.' }}
            {{ endpoint.method !== 'GET' ? 'Для изменения требуется X-CSRF-Token.' : '' }}
          </p>
          <div
            v-if="parameters(endpoint).length"
            :class="style.tableScroll">
            <table>
              <thead>
                <tr>
                  <th>Параметр</th>
                  <th>Где</th>
                  <th>Тип</th>
                  <th>Описание</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="parameter in parameters(endpoint)"
                  :key="parameter.name">
                  <td>
                    <code>{{ parameter.name }}</code>
                    {{ parameter.required ? ' *' : '' }}
                  </td>
                  <td>{{ parameter.in }}</td>
                  <td>{{ parameter.schema.type }}</td>
                  <td>{{ parameter.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div :class="style.examples">
            <div v-if="endpoint.requestSchema">
              <SectionHeader
                :header="
                  endpoint.requestSchema === 'MediaUpload'
                    ? 'Запрос · multipart/form-data'
                    : 'Пример запроса'
                "
                level="h3" />
              <pre :class="style.code"><code>{{ format(endpoint.request) }}</code></pre>
              <details :class="style.schema">
                <summary>JSON Schema запроса · {{ endpoint.requestSchema }}</summary>
                <pre
                  :class="
                    style.code
                  "><code>{{ format(dtoSchemas[endpoint.requestSchema]) }}</code></pre>
              </details>
            </div>
            <div>
              <SectionHeader
                :header="`Ответ · ${endpoint.status}`"
                level="h3" />
              <pre
                :class="
                  style.code
                "><code>{{ endpoint.status === 204 ? 'Без тела ответа.' : endpoint.response ? format(endpoint.response) : 'Binary: image/jpeg | image/png | image/webp' }}</code></pre>
              <details
                v-if="endpoint.responseSchema"
                :class="style.schema">
                <summary>JSON Schema ответа · {{ endpoint.responseSchema }}</summary>
                <pre
                  :class="
                    style.code
                  "><code>{{ format(dtoSchemas[endpoint.responseSchema]) }}</code></pre>
              </details>
            </div>
          </div>
        </div>
      </details>
      <EmptyState
        v-if="!filteredEndpoints.length"
        title="Маршруты не найдены"
        description="Измените запрос, метод или раздел."
        :icon="PhMagnifyingGlass">
        <Button
          variant="secondary"
          @click="resetApi">
          Сбросить фильтры
        </Button>
      </EmptyState>
    </section>

    <section
      v-else
      :class="style.sections">
      <SectionHeader
        header="Таблицы и модели ORM"
        paragraph="Проект PostgreSQL, независимый от ORM-библиотеки. snake_case в БД преобразуется в camelCase API через DTO." />
      <section :class="style.panel">
        <SectionHeader
          header="Связи между моделями"
          level="h3"
          paragraph="PK — первичный ключ, FK — внешний. UUID назначаются сервером; updated_at обновляется ORM, в SQL нет скрытых триггеров." />
        <div :class="style.tableScroll">
          <table>
            <thead>
              <tr>
                <th>Связь</th>
                <th>Тип</th>
                <th>Поведение</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in relationships"
                :key="row[0]">
                <td
                  v-for="(cell, index) in row"
                  :key="index">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <Input
        v-model="ormSearch"
        label="Поиск по таблицам"
        placeholder="Модель, таблица или поле"
        size="sm">
        <template #prefix><PhMagnifyingGlass :size="18" /></template>
      </Input>
      <p :class="style.caption">
        Показано {{ filteredTables.length }} из {{ tables.length }} таблиц
      </p>
      <details
        v-for="table in filteredTables"
        :key="table.name"
        :class="style.entity">
        <summary>
          <span :class="style.entityIcon"><PhDatabase :size="20" /></span>
          <span :class="style.endpointName">
            <code>{{ table.name }}</code>
            <span>{{ table.model }} · {{ table.description }}</span>
          </span>
          <PhCaretDown
            :size="18"
            :class="style.chevron" />
        </summary>
        <div :class="style.endpointBody">
          <div :class="style.tableScroll">
            <table>
              <thead>
                <tr>
                  <th>Поле</th>
                  <th>SQL-тип</th>
                  <th>Ограничения / FK</th>
                  <th>Назначение</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="field in table.fields"
                  :key="field.name">
                  <td>
                    <code>{{ field.name }}</code>
                  </td>
                  <td>
                    <code>{{ field.type }}</code>
                  </td>
                  <td>
                    <code>{{ field.constraint || 'NULL разрешён' }}</code>
                  </td>
                  <td>{{ field.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul :class="style.entityRules">
            <li
              v-for="rule in table.rules"
              :key="rule">
              {{ rule }}
            </li>
            <li
              v-for="constraint in table.constraints"
              :key="constraint">
              <code>{{ constraint }}</code>
            </li>
          </ul>
          <p :class="style.caption">Источник: {{ table.source }}</p>
          <details :class="style.schema">
            <summary>SQL таблицы и индексы</summary>
            <pre :class="style.code"><code>{{ tableSql(table) }}</code></pre>
          </details>
        </div>
      </details>
      <EmptyState
        v-if="!filteredTables.length"
        title="Таблицы не найдены"
        description="Попробуйте название модели или поля."
        :icon="PhDatabase">
        <Button
          variant="secondary"
          @click="ormSearch = ''">
          Сбросить поиск
        </Button>
      </EmptyState>
    </section>
    <p
      v-if="downloadError"
      :class="style.downloadError">
      {{ downloadError }}
    </p>
  </div>
</template>
<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import {
  PhArrowRight,
  PhBracketsCurly,
  PhCaretDown,
  PhCode,
  PhDatabase,
  PhDownloadSimple,
  PhMagnifyingGlass,
} from '@phosphor-icons/vue'
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import { Badge, Button, EmptyState, Input, Select, Tab } from '@/components/ui'
import {
  dtoSchemas,
  endpoints,
  overviewNotes,
  permissions,
  relationships,
  sourceMap,
  tables,
} from './api-docs.data'
import {
  buildOpenApi,
  endpointParameters,
  errorExample,
  sqlSchema,
  tableSql,
} from './api-docs.contract'
import style from './ApiDocsPage.module.scss'

export default defineComponent({
  name: 'ApiDocsPage',
  components: {
    SectionHeader,
    Badge,
    Button,
    EmptyState,
    Input,
    Select,
    Tab,
    PhArrowRight,
    PhBracketsCurly,
    PhCaretDown,
    PhCode,
    PhDatabase,
    PhDownloadSimple,
    PhMagnifyingGlass,
  },
  data() {
    return {
      style,
      endpoints: markRaw(endpoints),
      tables: markRaw(tables),
      dtoSchemas: markRaw(dtoSchemas),
      overviewNotes,
      permissions,
      relationships,
      sourceMap,
      errorExample,
      PhDatabase: markRaw(PhDatabase),
      PhMagnifyingGlass: markRaw(PhMagnifyingGlass),
      tab: 'overview',
      apiSearch: '',
      ormSearch: '',
      method: '',
      group: '',
      downloadError: '',
      errors: [
        { code: 400, text: 'Некорректный запрос' },
        { code: 401, text: 'Требуется вход' },
        { code: 403, text: 'Нет прав или неверный CSRF' },
        { code: 404, text: 'Ресурс недоступен' },
        { code: 409, text: 'Дубликат или конфликт состояния' },
        { code: 422, text: 'Неверные поля' },
        { code: 413, text: 'Файл больше 1 МБ' },
        { code: 415, text: 'Неподдерживаемый формат' },
        { code: 429, text: 'Превышен лимит запросов' },
        { code: 500, text: 'Ошибка сервера' },
      ],
      methodOptions: [
        { label: 'Все методы', value: '' },
        ...['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].map((value) => ({ label: value, value })),
      ],
    }
  },
  computed: {
    groupOptions() {
      return [
        { label: 'Все разделы', value: '' },
        ...[...new Set(this.endpoints.map((endpoint) => endpoint.group))].map((value) => ({
          label: value,
          value,
        })),
      ]
    },
    filteredEndpoints() {
      const search = this.apiSearch.trim().toLocaleLowerCase('ru')
      return this.endpoints.filter(
        (endpoint) =>
          (!this.method || endpoint.method === this.method) &&
          (!this.group || endpoint.group === this.group) &&
          `${endpoint.path} ${endpoint.summary} ${endpoint.description} ${endpoint.group}`
            .toLocaleLowerCase('ru')
            .includes(search),
      )
    },
    filteredTables() {
      const search = this.ormSearch.trim().toLocaleLowerCase('ru')
      return this.tables.filter((table) =>
        `${table.name} ${table.model} ${table.description} ${table.fields.map((field) => `${field.name} ${field.description}`).join(' ')}`
          .toLocaleLowerCase('ru')
          .includes(search),
      )
    },
  },
  methods: {
    tableSql,
    parameters: endpointParameters,
    format(value: unknown) {
      return JSON.stringify(value, null, 2)
    },
    resetApi() {
      this.apiSearch = ''
      this.method = ''
      this.group = ''
    },
    downloadOpenApi() {
      this.download(
        'tripper-openapi.json',
        JSON.stringify(buildOpenApi(), null, 2),
        'application/json',
      )
    },
    downloadSql() {
      this.download('tripper-schema.sql', sqlSchema, 'text/plain')
    },
    download(name: string, content: string, type: string) {
      this.downloadError = ''
      let url: string | undefined
      try {
        url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }))
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = name
        document.body.append(anchor)
        anchor.click()
        anchor.remove()
      } catch {
        this.downloadError = 'Не удалось скачать файл. Попробуйте ещё раз.'
      } finally {
        const downloadUrl = url
        if (downloadUrl) window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      }
    },
  },
})
</script>
