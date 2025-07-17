import { JSONValue } from 'hono/utils/types'
import { Record, RecordMetadata } from '../models/record'
import { RecordMetadataObject } from '../schemas/record'
import { JSONPatch } from '../schemas/json'
import z4 from 'zod/v4'
import { validateSchema } from '../lib/json-schema'
import { HTTPException } from 'hono/http-exception'
import { logger } from '../lib/logger'
import { randomKey } from '../lib/nanoid'
import { KeyBuilder } from '../lib/key-builder'

const countSchema = z4.coerce.number().int().positive().default(0)

export class RecordService {
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
    const count = await this.kv.get(KeyBuilder.forRecordCount())
    return countSchema.catch(0).parse(count ?? undefined)
  }

  private async incTotalCount(): Promise<void> {
    try {
      const count = await this.getCount()
      await this.kv.put(KeyBuilder.forRecordCount(), String(count + 1))
    } catch (error) {
      logger.error('Failed to increment record count', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        operation: 'incTotalCount'
      })
      // Don't throw - count operations shouldn't fail the main operation
      // The count will be eventually consistent when other operations succeed
    }
  }

  private async decrTotalCount(): Promise<void> {
    try {
      const count = await this.getCount()
      await this.kv.put(KeyBuilder.forRecordCount(), String(Math.max(count - 1, 0)))
    } catch (error) {
      logger.error('Failed to decrement record count', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        operation: 'decrTotalCount'
      })
      // Don't throw - count operations shouldn't fail the main operation
      // The count will be eventually consistent when other operations succeed
    }
  }

  private getRecordId(record: string | Record): string {
    return typeof record === 'string' ? record : record.id
  }

  refKey(record: string | Record): string {
    return KeyBuilder.forRecord(this.getRecordId(record))
  }

  refAccessKey(record: string | Record): string {
    return KeyBuilder.forAccessKey(this.getRecordId(record))
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

  async create(record: Record, accessKey?: string): Promise<{ record: Record; accessKey: string }> {
    await this.validateOrThrow(record)

    const finalAccessKey = accessKey || randomKey()
    
    await this.setAccessKey(record, finalAccessKey)
    await this.kv.put(this.refKey(record), JSON.stringify(record.data), {
      metadata: record.metadata,
    })

    await this.incTotalCount()

    return { record, accessKey: finalAccessKey }
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

  async updateById(id: string, data: JSONValue): Promise<Record | null> {
    return this._updateRecord(id, (record) => record.setData(data))
  }

  async update(record: Record, data: JSONValue): Promise<Record | null> {
    return this._updateRecord(record, (record) => record.setData(data))
  }

  async patchById(id: string, data: JSONPatch[]): Promise<Record | null> {
    return this._updateRecord(id, (record) => record.applyPatch(data))
  }

  async patch(record: Record, data: JSONPatch[]): Promise<Record | null> {
    return this._updateRecord(record, (record) => record.applyPatch(data))
  }

  async deleteById(id: string): Promise<boolean> {
    return this._deleteRecord(id)
  }

  async delete(record: Record): Promise<boolean> {
    return this._deleteRecord(record)
  }

  private async _deleteRecord(entry: string | Record): Promise<boolean> {
    const refKey = this.refKey(entry)
    const exists = await this.kv.get(refKey)
    if (!exists) return true

    await this.kv.delete(refKey)
    await this.deleteAccessKey(entry)

    await this.decrTotalCount()

    return true
  }
}
