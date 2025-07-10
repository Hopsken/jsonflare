import { Hono } from 'hono'
import { cors } from 'hono/cors'

import z from 'zod'
import 'zod-openapi/extend'
import { describeRoute, DescribeRouteOptions } from 'hono-openapi'
import { validator as zValidator, resolver } from 'hono-openapi/zod'

import { randomKey } from '../lib/nanoid'
import { PublicMode, Record, RecordMetaDataSchema } from '../model/record'
import { HTTPException } from 'hono/http-exception'
import {
  publicModeCheck,
  validateAccessKey,
} from './middlewares/validate-access-key'
import { serviceInjector } from './middlewares/service-injector'
import { host } from '../middlewares/host'
import { JSONPatchSchema } from '../model/json'

const app = new Hono()

app.use(serviceInjector)
app.use(host('api.jsonflare.com'))
app.use(
  cors({
    origin: '*',
    allowHeaders: ['X-Access-Key'],
  })
)

const headerSchema = z.object({
  'X-Access-Key': z.string().optional(),
})

const jsonContentSchema = {
  'Content-Type': z.literal('application/json'),
}

const paramsSchema = z.object({
  id: z.string().openapi({ description: 'record id' }),
})

const responseDescription = <T extends z.ZodSchema>(
  schema: T
): DescribeRouteOptions['responses'] => ({
  200: {
    description: 'Success',
    content: {
      'application/json': {
        schema: resolver(schema),
      },
    },
  },
})

/**
 * POST Create record
 */
const querySchema = z.object({
  public: z
    .preprocess(val => (val === 'true' ? true : false), z.boolean())
    .openapi({
      description: 'Mark the record **Public Readable** (without access key)',
    }),
})
app.post(
  '/',
  describeRoute({
    description: 'Create a JSON record',
    responses: responseDescription(
      z.any().openapi({
        description: 'Any JSON value',
        ref: 'JSON',
      })
    ),
  }),
  zValidator('header', headerSchema.extend(jsonContentSchema)),
  zValidator('query', querySchema),
  async c => {
    const data = await c.req.json()

    const accessKey = c.req.header('X-Access-Key') || randomKey()
    const recordService = c.get('recordService')

    const isPublic = c.req.valid('query').public

    const record = Record.fromData(
      data,
      isPublic ? PublicMode.Read : PublicMode.None
    )

    const createdRecord = await recordService.create(record, accessKey)

    c.header('X-Access-Key', accessKey)
    c.header('X-Record-Id', createdRecord.id)
    return c.json(createdRecord.data as object)
  }
)

app.get(
  '/:id',
  describeRoute({
    description: 'Read a JSON record',
    responses: responseDescription(
      z.any().openapi({
        description: 'Any JSON value',
        ref: 'JSON',
      })
    ),
  }),
  zValidator('header', headerSchema),
  zValidator('param', paramsSchema),
  validateAccessKey(publicModeCheck),
  async c => {
    const id = c.req.param('id')
    const recordService = c.get('recordService')

    const record = await recordService.get(id)
    if (!record) {
      throw new HTTPException(404, { message: 'Record not found' })
    }

    return c.json(record.data as object)
  }
)

app.get(
  '/:id/metadata',
  describeRoute({
    description: `Get a JSON record's metadata`,
    responses: responseDescription(
      RecordMetaDataSchema.openapi({
        ref: 'RecordMetadata',
        refType: 'output',
        description: `Metadata of JSON records`,
      })
    ),
  }),
  zValidator('header', headerSchema),
  zValidator('param', paramsSchema),
  validateAccessKey(publicModeCheck),
  async c => {
    const id = c.req.param('id')
    const recordService = c.get('recordService')
    const recordMetadataCache = c.var.recordMetadataCache

    // Use existing cache from validation process, saving another query
    const metadata =
      recordMetadataCache ?? (await recordService.getMetadata(id))

    if (!metadata) {
      throw new HTTPException(404, { message: 'Record not found' })
    }

    return c.json(metadata)
  }
)

app.put(
  '/:id',
  describeRoute({
    description: 'Update a JSON record',
    responses: responseDescription(
      z.any().openapi({
        description: 'Any JSON value',
        ref: 'JSON',
      })
    ),
  }),
  zValidator('header', headerSchema.extend(jsonContentSchema)),
  zValidator('param', paramsSchema),
  validateAccessKey(),
  async c => {
    const id = c.req.param('id')
    const data = await c.req.json()
    const recordService = c.get('recordService')

    const updatedRecord = await recordService.update(id, data)
    if (!updatedRecord) {
      throw new HTTPException(404, { message: 'Record not found' })
    }

    return c.json(updatedRecord.data as object)
  }
)

app.patch(
  '/:id',
  describeRoute({
    description: 'Patch a record using JSON Patch',
    responses: responseDescription(
      z.any().openapi({
        description: 'Any JSON value',
        ref: 'JSON',
      })
    ),
  }),
  zValidator('header', headerSchema.extend(jsonContentSchema)),
  zValidator('param', paramsSchema),
  zValidator(
    'json',
    z.array(
      JSONPatchSchema.openapi({
        description: 'A JSON Patch operation',
        ref: 'JSON Patch Operation',
      })
    )
  ),
  validateAccessKey(),
  async c => {
    const id = c.req.valid('param').id
    const recordService = c.get('recordService')

    const patch = c.req.valid('json')

    const updatedRecord = await recordService.patch(id, patch)
    if (!updatedRecord) {
      throw new HTTPException(404, { message: 'Record not found' })
    }

    return c.json(updatedRecord.data as object)
  }
)

app.delete(
  '/:id',
  describeRoute({
    description: 'Delete a JSON record',
    responses: responseDescription(z.object({ ok: z.boolean() })),
  }),
  zValidator('header', headerSchema),
  zValidator('param', paramsSchema),
  validateAccessKey(),
  async c => {
    const id = c.req.param('id')
    const recordService = c.get('recordService')

    await recordService.delete(id)

    return c.json({ ok: true })
  }
)

export default app
