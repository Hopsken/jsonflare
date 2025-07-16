import z from 'zod'
import { JSONValueSchema } from './json'

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