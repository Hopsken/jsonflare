import z from 'zod'
import { immutableJSONPatch, JSONPatchDocument } from 'immutable-json-patch'
import { JSONValue } from 'hono/utils/types'
import { nanoid } from '../lib/nanoid'
import { JSONPatch } from '../schemas/json'
import { PublicMode, RecordMetadataObject } from '../schemas/record'

const jsonSchemaCompatible = z
  .object({
    $schema: z.string().url(),
  })
  .passthrough()

export class Record {
  public metadata: RecordMetadata
  constructor(
    public id: string,
    public data: JSONValue,
    metadata: RecordMetadataObject | RecordMetadata
  ) {
    this.metadata = RecordMetadata.fromObject(metadata)
  }

  get schemaUrl() {
    try {
      const { $schema } = jsonSchemaCompatible.parse(this.data)
      return $schema
    } catch (_) {
      return null
    }
  }

  setData = (data: JSONValue) => {
    this.data = data
    this.metadata.setUpdatedAt()
  }

  applyPatch = (patch: JSONPatch[]) => {
    const updated = immutableJSONPatch(this.data, patch as JSONPatchDocument)
    this.setData(updated as JSONValue)
    return updated
  }

  public static fromData(data: JSONValue, mode: PublicMode) {
    const metadata = RecordMetadata.create(new Date(), mode)
    return new Record(nanoid(), data, metadata)
  }

  public static fromKVResult(
    id: string,
    result: KVNamespaceGetWithMetadataResult<JSONValue, RecordMetadataObject>
  ): Record | null {
    if (!result.value || !result.metadata) return null

    return new Record(id, result.value, result.metadata)
  }
}

export class RecordMetadata {
  constructor(
    public createdAt: string,
    public updatedAt: string,
    public mode: PublicMode
  ) {}

  setUpdatedAt = (date?: Date | string) => {
    date = date || new Date()
    this.updatedAt = date instanceof Date ? date.toISOString() : date
  }

  static fromObject(
    obj: RecordMetadataObject | RecordMetadata
  ): RecordMetadata {
    if (obj instanceof RecordMetadata) {
      return obj
    }
    return new RecordMetadata(
      obj.createdAt,
      obj.updatedAt,
      obj.mode ?? PublicMode.None
    )
  }

  static create(at?: Date, mode: PublicMode = PublicMode.None) {
    const createdAt = new Date(at ?? Date.now()).toISOString()
    return RecordMetadata.fromObject({
      createdAt,
      updatedAt: createdAt,
      mode,
    })
  }
}