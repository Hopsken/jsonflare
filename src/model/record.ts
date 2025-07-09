import { JSONValue } from 'hono/utils/types'
import { nanoid } from '../lib/nanoid'

export interface RecordMetadataObject {
  createdAt: string
  updatedAt: string
}

export class Record {
  public metadata: RecordMetadata
  constructor(
    public id: string,
    public data: JSONValue,
    metadata: RecordMetadataObject | RecordMetadata
  ) {
    this.metadata = RecordMetadata.fromObject(metadata)
  }

  setData = (data: JSONValue) => {
    console.log(`Record ${JSON.stringify(this)}}`)
    this.data = data
    this.metadata.setUpdatedAt()
  }

  static fromData(data: JSONValue) {
    const createdAt = new Date().toISOString()
    return new Record(nanoid(), data, new RecordMetadata(createdAt, createdAt))
  }

  static fromKVResult(
    id: string,
    result: KVNamespaceGetWithMetadataResult<JSONValue, RecordMetadataObject>
  ): Record | null {
    if (!result.value || !result.metadata) return null

    return new Record(id, result.value, result.metadata)
  }
}

export class RecordMetadata {
  constructor(public createdAt: string, public updatedAt: string) {}

  static fromObject(
    obj: RecordMetadataObject | RecordMetadata
  ): RecordMetadata {
    if (obj instanceof RecordMetadata) {
      return obj
    }
    return new RecordMetadata(obj.createdAt, obj.updatedAt)
  }

  setUpdatedAt = (date?: Date | string) => {
    date = date || new Date()
    this.updatedAt = date instanceof Date ? date.toISOString() : date
  }
}
