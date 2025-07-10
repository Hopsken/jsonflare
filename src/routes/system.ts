import { Hono } from 'hono'
import { serviceInjector } from './middlewares/service-injector'
import { host } from '../middlewares/host'

const app = new Hono()

app.use(serviceInjector)
app.use(host('api.jsonflare.com'))

app.get('/metrics', async c => {
  const recordService = c.get('recordService')

  const totalCount = await recordService.getCount()

  return c.json({ totalCount })
})

export default app
