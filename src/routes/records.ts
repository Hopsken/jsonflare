import { Hono } from 'hono'
import { randomKey } from '../lib/nanoid'
import { Record } from '../model/record'
import { RecordService } from '../service/record.service'
import { HTTPException } from 'hono/http-exception'
import { validateAccessKey } from './middlewares/validate-access-key'
import { serviceInjector } from './middlewares/service-injector'
import { host } from '../middlewares/host'

type HonoEnv = {
  Variables: {
    recordService: RecordService
    sendRecord: (record: Record) => Response
  }
  Bindings: Env
}

const app = new Hono<HonoEnv>()

app.use(serviceInjector)
app.use(host('api.jsonflare.com'))

app.post('/', async c => {
  const data = await c.req.json()

  const accessKey = c.req.header('X-Access-Key') || randomKey()
  const recordService = c.get('recordService')

  const record = Record.fromData(data)
  const createdRecord = await recordService.create(record, accessKey)

  c.header('X-Access-Key', accessKey)
  c.header('X-Record-Id', createdRecord.id)
  return c.json(createdRecord.data as object)
})

app.get('/:id', validateAccessKey, async c => {
  const id = c.req.param('id')
  const recordService = c.get('recordService')

  const record = await recordService.get(id)
  if (!record) {
    throw new HTTPException(404, { message: 'Record not found' })
  }

  return c.json(record.data as object)
})

app.get('/:id/metadata', validateAccessKey, async c => {
  const id = c.req.param('id')
  const recordService = c.get('recordService')

  const metadata = await recordService.getMetadata(id)
  if (!metadata) {
    throw new HTTPException(404, { message: 'Record not found' })
  }

  return c.json(metadata)
})

app.put('/:id', validateAccessKey, async c => {
  const id = c.req.param('id')
  const data = await c.req.json()
  const recordService = c.get('recordService')

  const updatedRecord = await recordService.update(id, data)
  if (!updatedRecord) {
    throw new HTTPException(404, { message: 'Record not found' })
  }

  return c.json(updatedRecord.data as object)
})

app.delete('/:id', validateAccessKey, async c => {
  const id = c.req.param('id')
  const recordService = c.get('recordService')

  await recordService.delete(id)

  return c.json({ ok: true })
})

export default app
