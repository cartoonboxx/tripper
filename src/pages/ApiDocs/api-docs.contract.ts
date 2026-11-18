import { dtoSchemas, endpoints, tables } from './api-docs.data'
import type { ApiEndpoint, OrmTable } from './ApiDocs.types'

export function tableSql(table: OrmTable): string {
  const columns = table.fields.map((field) =>
    `  ${field.name} ${field.type} ${field.constraint}`.trimEnd(),
  )
  return [
    `CREATE TABLE ${table.name} (\n${[...columns, ...table.constraints.map((constraint) => `  ${constraint}`)].join(',\n')}\n);`,
    ...table.indexes,
  ].join('\n')
}

export const sqlSchema = [
  '-- Tripper: proposed PostgreSQL schema. No backend or migrations are installed.',
  '-- UUIDs are assigned by the server. updated_at is maintained by the ORM.',
  '-- Domain, ownership, media access and membership checks also require application validation.',
  'BEGIN;',
  ...tables.map(tableSql),
  'COMMIT;',
].join('\n\n')

export function endpointParameters(endpoint: ApiEndpoint) {
  const path = [...endpoint.path.matchAll(/\{(\w+)\}/g)].map((match) => {
    const name = match[1]!
    const schema =
      name === 'day'
        ? { type: 'string', format: 'date' }
        : name === 'token'
          ? { type: 'string', description: 'Секретный токен приглашения' }
          : { type: 'string', format: 'uuid' }
    return {
      name,
      in: 'path',
      required: true,
      description: name === 'day' ? 'День в зоне поездки' : `Параметр ${name}`,
      schema,
    }
  })
  return [...path, ...(endpoint.query || [])]
}

export function buildOpenApi() {
  const paths: Record<string, Record<string, unknown>> = {}
  for (const endpoint of endpoints) {
    const ref = (schema: string) => ({ $ref: `#/components/schemas/${schema}` })
    const responses: Record<string, unknown> = {
      [endpoint.status]: {
        description:
          endpoint.status === 204 ? 'Операция выполнена, тело отсутствует' : 'Успешный ответ',
        ...(endpoint.responseSchema
          ? {
              content: {
                'application/json': {
                  schema: ref(endpoint.responseSchema),
                  example: endpoint.response,
                },
              },
            }
          : {}),
      },
    }
    for (const [code, description] of Object.entries({
      400: 'Некорректный JSON, курсор или параметры',
      401: 'Требуется вход или учётные данные неверны',
      403: 'Нет прав или CSRF-токен неверен',
      404: 'Ресурс не найден или недоступен',
      409: 'Конфликт состояния или дубликат',
      422: 'Ошибка проверки полей',
      429: 'Слишком много запросов',
      500: 'Внутренняя ошибка',
    })) {
      responses[code] = {
        description,
        content: { 'application/json': { schema: ref('ApiError') } },
      }
    }
    if (endpoint.requestSchema === 'MediaUpload') {
      for (const [code, description] of [
        [413, 'Файл больше 1 МБ'],
        [415, 'Формат изображения не поддерживается'],
      ] as const) {
        responses[code] = {
          description,
          content: { 'application/json': { schema: ref('ApiError') } },
        }
      }
    }
    if (endpoint.path === '/media/{mediaId}/content') {
      responses[200] = {
        description: 'Изображение после проверки доступа',
        content: Object.fromEntries(
          ['image/jpeg', 'image/png', 'image/webp'].map((type) => [
            type,
            { schema: { type: 'string', format: 'binary' } },
          ]),
        ),
      }
    }
    const parameters: unknown[] = endpointParameters(endpoint)
    if (!['GET'].includes(endpoint.method)) {
      parameters.push({
        name: 'X-CSRF-Token',
        in: 'header',
        required: true,
        description: 'Токен из GET /auth/csrf; также нужен для login и registration',
        schema: { type: 'string' },
      })
    }
    const operation = {
      operationId: endpoint.id,
      tags: [endpoint.group],
      summary: endpoint.summary,
      description: `${endpoint.description}\nДоступ: ${endpoint.access}.`,
      ...(endpoint.public ? { security: [] } : {}),
      parameters,
      ...(endpoint.requestSchema
        ? {
            requestBody: {
              required: true,
              content: {
                [endpoint.requestSchema === 'MediaUpload'
                  ? 'multipart/form-data'
                  : 'application/json']: {
                  schema: ref(endpoint.requestSchema),
                  ...(endpoint.requestSchema === 'MediaUpload'
                    ? {}
                    : { example: endpoint.request }),
                },
              },
            },
          }
        : {}),
      responses,
    }
    paths[endpoint.path] ||= {}
    paths[endpoint.path]![endpoint.method.toLowerCase()] = operation
  }
  return {
    openapi: '3.1.0',
    info: {
      title: 'Tripper API — проект контракта',
      version: '0.1.0-draft',
      description:
        'Предлагаемый API по сценариям Vue/Pinia приложения. HTTP-сервер, ORM и миграции ещё не реализованы. Модель серверных аккаунтов и владения данными дополняет локальный прототип.',
    },
    servers: [
      { url: '/api/v1', description: 'Предлагаемый базовый путь, сервер ещё не реализован' },
    ],
    tags: [...new Set(endpoints.map((endpoint) => endpoint.group))].map((name) => ({ name })),
    security: [{ sessionCookie: [] }],
    paths,
    components: {
      securitySchemes: {
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'tripper_session',
          description: 'HttpOnly; Secure; SameSite=Lax; токен серверной сессии',
        },
      },
      schemas: dtoSchemas,
    },
  }
}

export const errorExample = {
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Проверьте поля запроса.',
    fields: { end: 'Окончание должно быть позже начала.' },
    requestId: 'req_01_example',
  },
}
