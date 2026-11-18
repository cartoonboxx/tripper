import { describe, expect, it } from 'vitest'
import { buildOpenApi, sqlSchema } from '@/pages/ApiDocs/api-docs.contract'
import { dtoSchemas, tables } from '@/pages/ApiDocs/api-docs.data'

function references(value: unknown): string[] {
  if (!value || typeof value !== 'object') return []
  const record = value as Record<string, unknown>
  return [
    ...(typeof record.$ref === 'string' ? [record.$ref] : []),
    ...Object.values(record).flatMap(references),
  ]
}

describe('proposed API documentation', () => {
  it('exports a self-contained OpenAPI contract with distinct operations and all path parameters', () => {
    const spec = buildOpenApi()
    expect(spec.openapi).toBe('3.1.0')
    expect(spec.paths['/auth/registration']?.post).toMatchObject({ security: [] })
    expect(spec.paths['/media']?.post).toMatchObject({
      requestBody: { content: { 'multipart/form-data': {} } },
    })
    expect(spec.paths['/trips/{tripId}/events']?.post).toMatchObject({
      requestBody: {
        content: { 'application/json': { schema: { $ref: '#/components/schemas/EventCreate' } } },
      },
    })
    const operations = Object.entries(spec.paths).flatMap(([path, methods]) =>
      Object.values(methods).map((operation) => ({
        path,
        ...(operation as {
          operationId: string
          parameters: { in: string; name: string; required?: boolean }[]
        }),
      })),
    )
    expect(new Set(operations.map((operation) => operation.operationId)).size).toBe(
      operations.length,
    )
    for (const operation of operations) {
      for (const match of operation.path.matchAll(/\{(\w+)\}/g)) {
        expect(operation.parameters).toContainEqual(
          expect.objectContaining({ in: 'path', name: match[1], required: true }),
        )
      }
    }
    for (const ref of references(spec)) {
      expect(ref.startsWith('#/components/schemas/')).toBe(true)
      expect(dtoSchemas).toHaveProperty(ref.replace('#/components/schemas/', ''))
    }
  })

  it('keeps event categories derived and stores timestamps and independent fallback photos', () => {
    const events = tables.find((table) => table.name === 'events')!
    expect(events.fields.map((field) => field.name)).toEqual(
      expect.arrayContaining(['place_id', 'starts_at', 'ends_at', 'own_photo_media_id']),
    )
    expect(events.fields.map((field) => field.name)).not.toContain('category_id')
    expect(dtoSchemas.EventCreate?.properties).not.toHaveProperty('category')
    expect(dtoSchemas.Event?.properties).toHaveProperty('placeCategory')
    expect(dtoSchemas.Event?.properties).toHaveProperty('imageSource')
  })

  it('exports SQL with resolvable foreign keys, safe deletion rules and decimal money', () => {
    const names = new Set(tables.map((table) => table.name))
    const created = new Set<string>()
    for (const table of tables) {
      const targets = table.fields.flatMap((field) =>
        [...field.constraint.matchAll(/REFERENCES (\w+)\(/g)].map((match) => match[1]!),
      )
      for (const target of targets) {
        expect(names.has(target)).toBe(true)
        expect(created.has(target)).toBe(true)
      }
      created.add(table.name)
    }
    expect(sqlSchema).toContain('CREATE TABLE trip_members')
    expect(sqlSchema).toContain('PRIMARY KEY (trip_id, place_id)')
    expect(sqlSchema).toContain('place_id uuid REFERENCES places(id) ON DELETE SET NULL')
    expect(sqlSchema).toContain('trip_id uuid REFERENCES trips(id) ON DELETE SET NULL')
    expect(sqlSchema).toContain('numeric(14,2) NOT NULL CHECK (amount > 0)')
    expect(sqlSchema).toContain('DEFERRABLE INITIALLY DEFERRED')
    expect(sqlSchema).not.toContain('CREATE TABLE event_categories')
  })
})
