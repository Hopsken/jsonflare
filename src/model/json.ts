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
