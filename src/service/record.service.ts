import { JSONValue } from 'hono/utils/types'
import { Record, RecordMetadata } from '../models/record'
import { RecordMetadataObject } from '../schemas/record'
import { JSONPatch } from '../schemas/json'
import z4 from 'zod/v4'
import { validateSchema } from '../lib/json-schema'
import { HTTPException } from 'hono/http-exception'

const countSchema = z4.coerce.number().int().positive().default(0)

export class RecordService {
  private _recordCountKey = 'records:count'

  constructor(private readonly kv: KVNamespace) {}

  public async validate(record: Record) {
    return validateSchema(record)
  }

  public async validateOrThrow(record: Record) {
    const validated = await this.validate(record)

    if (!validated.valid) {
      throw new HTTPException(400, {
        message: 'Invalid data, not conform to defined $schema.',
        cause: validated.errors,
      })
    }
  }

  public async getCount() {
    const count = await this.kv.get(this._recordCountKey)
    return countSchema.catch(0).parse(count ?? undefined)
  }

  private async incTotalCount(): Promise<void> {
    try {
      const count = await this.getCount()
      await this.kv.put(this._recordCountKey, String(count + 1))
    } catch (error) {
      console.error('Failed to increment record count:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        operation: 'incTotalCount'
      })
      // Don't throw - count operations shouldn't fail the main operation
    }
  }

  private async decrTotalCount(): Promise<void> {
    try {
      const count = await this.getCount()
      await this.kv.put(this._recordCountKey, String(Math.max(count - 1, 0)))
    } catch (error) {
      console.error('Failed to decrement record count:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        operation: 'decrTotalCount'
      })
      // Don't throw - count operations shouldn't fail the main operation
    }
  }

  refKey(record: string | Record): string {
    const id = typeof record === 'string' ? record : record.id
    return `record:${id}`
  }

  refAccessKey(record: string | Record): string {
    const id = typeof record === 'string' ? record : record.id
    return `record:${id}:accesskey`
  }

  async getAccessKey(id: string | Record): Promise<string | null> {
    return this.kv.get(this.refAccessKey(id), 'text')
  }

  private async setAccessKey(
    id: string | Record,
    accessKey: string
  ): Promise<string> {
    await this.kv.put(this.refAccessKey(id), accessKey)
    return accessKey
  }

  private async deleteAccessKey(id: string | Record): Promise<void> {
    await this.kv.delete(this.refAccessKey(id))
  }

  async get(id: string): Promise<Record | null> {
    const data = await this.kv.getWithMetadata<JSONValue, RecordMetadataObject>(
      this.refKey(id),
      'json'
    )
    return Record.fromKVResult(id, data)
  }

  async getMetadata(id: string): Promise<RecordMetadata | null> {
    // ignore the stream to get only the metadata
    const data = await this.kv.getWithMetadata<RecordMetadata>(
      this.refKey(id),
      'stream'
    )
    if (!data.metadata) return null
    return RecordMetadata.fromObject(data.metadata)
  }

  async create(record: Record, accessKey: string): Promise<Record> {
    await this.validateOrThrow(record)

    await this.setAccessKey(record, accessKey)
    await this.kv.put(this.refKey(record), JSON.stringify(record.data), {
      metadata: record.metadata,
    })

    await this.incTotalCount()

    return record
  }

  private async _updateRecord(
    entry: string | Record,
    transformer: (record: Record) => void
  ): Promise<Record | null> {
    const refKey = this.refKey(entry)
    const id = typeof entry === 'string' ? entry : entry.id
    const record = await this.get(id)
    if (!record) return null

    transformer(record)

    await this.validateOrThrow(record)

    await this.kv.put(refKey, JSON.stringify(record.data), {
      metadata: record.metadata,
    })
    return record
  }

  async update(record: Record, data: JSONValue): Promise<Record | null>
  async update(id: string, data: JSONValue): Promise<Record | null>
  async update(
    entry: string | Record,
    data: JSONValue
  ): Promise<Record | null> {
    return this._updateRecord(entry, (record) => record.setData(data))
  }

  async patch(record: Record, data: JSONPatch[]): Promise<Record | null>
  async patch(id: string, data: JSONPatch[]): Promise<Record | null>
  async patch(
    entry: string | Record,
    data: JSONPatch[]
  ): Promise<Record | null> {
    return this._updateRecord(entry, (record) => record.applyPatch(data))
  }

  async delete(id: string): Promise<boolean>
  async delete(record: Record): Promise<boolean>
  async delete(entry: string | Record): Promise<boolean> {
    const refKey = this.refKey(entry)
    const exists = await this.kv.get(refKey)
    if (!exists) return true

    await this.kv.delete(refKey)
    await this.deleteAccessKey(entry)

    await this.decrTotalCount()

    return true
  }
}
