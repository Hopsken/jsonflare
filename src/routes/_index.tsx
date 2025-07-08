import { Hono } from 'hono'
import Index from '../components/Home'
import { host } from '../middlewares/host'

const app = new Hono()

app.get('/', host('jsonflare.com'), c => {
  return c.html(<Index />)
})

export default app
