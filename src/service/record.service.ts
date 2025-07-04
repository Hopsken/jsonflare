import { Record } from '../model/record'

export class RecordService {
  constructor(private readonly kv: KVNamespace) {}

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
    const data = await this.kv.getWithMetadata(this.refKey(id), 'json')
    return Record.fromKVResult(id, data)
  }

  async create(record: Record, accessKey: string): Promise<Record> {
    await this.setAccessKey(record, accessKey)
    await this.kv.put(this.refKey(record), JSON.stringify(record.data), {
      metadata: record.metadata,
    })

    return record
  }

  async update(record: Record, data: unknown): Promise<Record | null>
  async update(id: string, data: unknown): Promise<Record | null>
  async update(entry: string | Record, data: unknown): Promise<Record | null> {
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

  async delete(id: string): Promise<boolean>
  async delete(record: Record): Promise<boolean>
  async delete(entry: string | Record): Promise<boolean> {
    const refKey = this.refKey(entry)
    const exists = await this.kv.get(refKey)
    if (!exists) return true

    await this.kv.delete(refKey)
    await this.deleteAccessKey(entry)
    return true
  }
}
