import { nanoid } from '../lib/nanoid'

export class Record {
  constructor(
    public id: string,
    public data: unknown,
    public metadata: RecordMetadata
  ) {}

  static fromData(data: unknown) {
    const createdAt = new Date().toISOString()
    return new Record(nanoid(), data, new RecordMetadata(createdAt, createdAt))
  }

  static fromKVResult(
    id: string,
    result: KVNamespaceGetWithMetadataResult<unknown, unknown>
  ): Record | null {
    if (!result.value || !result.metadata) return null

    return new Record(id, result.value, result.metadata as RecordMetadata)
  }
}

export class RecordMetadata {
  constructor(public createdAt: string, public updatedAt: string) {}

  setUpdatedAt(date?: Date | string) {
    date = date || new Date()
    this.updatedAt = date instanceof Date ? date.toISOString() : date
  }
}
