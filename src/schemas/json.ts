import z from 'zod'

export const JSONLiteralSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
])

export type JSONLiteral = z.infer<typeof JSONLiteralSchema>

export type JSONValue = JSONLiteral | { [key: string]: JSONValue } | JSONValue[]

export const JSONValueSchema: z.ZodType<JSONValue> = z.lazy(() =>
  z.union([
    JSONLiteralSchema,
    z.array(JSONValueSchema),
    z.record(JSONValueSchema),
  ])
)

export const JSONPatchSchema = z.union([
  z.object({
    op: z.literal('add'),
    path: z.string(),
    value: JSONValueSchema,
  }),
  z.object({
    op: z.literal('remove'),
    path: z.string(),
  }),
  z.object({
    op: z.literal('replace'),
    path: z.string(),
    value: JSONValueSchema,
  }),
  z.object({
    op: z.literal('copy'),
    from: z.string(),
    path: z.string(),
  }),
  z.object({
    op: z.literal('move'),
    from: z.string(),
    path: z.string(),
  }),
  z.object({
    op: z.literal('test'),
    path: z.string(),
    value: JSONValueSchema,
  }),
])

export type JSONPatch = z.infer<typeof JSONPatchSchema>
