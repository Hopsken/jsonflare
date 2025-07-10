import z from 'zod'
import { immutableJSONPatch, JSONPatchDocument } from 'immutable-json-patch'
import { JSONValue } from 'hono/utils/types'
import { nanoid } from '../lib/nanoid'
import { JSONPatch, JSONValueSchema } from './json'

export enum PublicMode {
  None = 0,
  Read = 1,
  // Write = 2
}

export const RecordMetaDataSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  mode: z.nativeEnum(PublicMode),
})

export const RecordSchema = z.object({
  id: z.string(),
  data: JSONValueSchema,
})

export type RecordMetadataObject = z.infer<typeof RecordMetaDataSchema>

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
    this.data = data
    this.metadata.setUpdatedAt()
  }

  applyPatch = (patch: JSONPatch[]) => {
    const updated = immutableJSONPatch(this.data, patch as JSONPatchDocument)
    this.setData(updated as JSONValue)
    return updated
  }

  static fromData(data: JSONValue, mode: PublicMode) {
    const metadata = RecordMetadata.create(new Date(), mode)
    return new Record(nanoid(), data, metadata)
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
  constructor(
    public createdAt: string,
    public updatedAt: string,
    public mode: PublicMode
  ) {}

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

  setUpdatedAt = (date?: Date | string) => {
    date = date || new Date()
    this.updatedAt = date instanceof Date ? date.toISOString() : date
  }
}
