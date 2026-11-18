export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
export interface ApiParameter {
  name: string
  in: 'path' | 'query'
  description: string
  schema: {
    type: string
    default?: string | number
    enum?: string[]
    minimum?: number
    maximum?: number
  }
  required?: boolean
}
export interface ApiEndpoint {
  id: string
  group: string
  method: HttpMethod
  path: string
  summary: string
  description: string
  access: string
  public?: boolean
  status: number
  requestSchema?: string
  responseSchema?: string
  query?: ApiParameter[]
  request?: unknown
  response?: unknown
}
export interface OrmField {
  name: string
  type: string
  constraint: string
  description: string
}
export interface OrmTable {
  name: string
  model: string
  description: string
  fields: OrmField[]
  constraints: string[]
  indexes: string[]
  rules: string[]
  source: string
}
