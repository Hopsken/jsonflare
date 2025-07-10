import { JSONValue } from 'hono/utils/types'
import { Record, RecordMetadata, RecordMetadataObject } from '../model/record'
import { JSONPatch } from '../model/json'
import z4 from 'zod/v4'

const countSchema = z4.coerce.number().int().positive().default(0)

export class RecordService {
  private _recordCountKey = 'records:count'

  constructor(private readonly kv: KVNamespace) {}

  public async getCount() {
    const count = await this.kv.get(this._recordCountKey)
    return countSchema.catch(0).parse(count ?? undefined)
  }

  private async incTotalCount() {
    const count = await this.getCount()
    await this.kv.put(this._recordCountKey, String(count + 1))
  }

  private async decrTotalCount() {
    const count = await this.getCount()
    await this.kv.put(this._recordCountKey, String(Math.max(count - 1, 0)))
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
    await this.setAccessKey(record, accessKey)
    await this.kv.put(this.refKey(record), JSON.stringify(record.data), {
      metadata: record.metadata,
    })

    await this.incTotalCount().catch(() =>
      console.log('Unable to inc record count')
    )

    return record
  }

  async update(record: Record, data: JSONValue): Promise<Record | null>
  async update(id: string, data: JSONValue): Promise<Record | null>
  async update(
    entry: string | Record,
    data: JSONValue
  ): Promise<Record | null> {
    const refKey = this.refKey(entry)
    const id = typeof entry === 'string' ? entry : entry.id
    const record = await this.get(id)
    if (!record) return null

    record.setData(data)

    await this.kv.put(refKey, JSON.stringify(record.data), {
      metadata: record.metadata,
    })
    return record
  }

  async patch(record: Record, data: JSONPatch[]): Promise<Record | null>
  async patch(id: string, data: JSONPatch[]): Promise<Record | null>
  async patch(
    entry: string | Record,
    data: JSONPatch[]
  ): Promise<Record | null> {
    const refKey = this.refKey(entry)
    const id = typeof entry === 'string' ? entry : entry.id
    const record = await this.get(id)
    if (!record) return null

    record.applyPatch(data)

    await this.kv.put(refKey, JSON.stringify(record.data), {
      metadata: record.metadata,
    })
    return record
  }

  async delete(id: string): Promise<boolean>
  async delete(record: Record): Promise<boolean>
  async delete(entry: string | Record): Promise<boolean> {
    const refKey = this.refKey(entry)
    const exists = await this.kv.get(refKey)
    if (!exists) return true

    await this.kv.delete(refKey)
    await this.deleteAccessKey(entry)

    await this.decrTotalCount().catch(() =>
      console.log('Unable to decr record count')
    )

    return true
  }
}
