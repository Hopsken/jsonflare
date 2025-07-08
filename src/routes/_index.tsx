import { Hono } from 'hono'
import Index from '../components/Home'

const app = new Hono()

app.get('/', c => {
  return c.html(<Index />)
})

export default app
