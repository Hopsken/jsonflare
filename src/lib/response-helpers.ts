import { Context } from 'hono'
import { Record } from '../models/record'

export function setRecordCreationHeaders(c: Context, record: Record, accessKey: string): void {
  c.header('X-Access-Key', accessKey)
  c.header('X-Record-Id', record.id)
}