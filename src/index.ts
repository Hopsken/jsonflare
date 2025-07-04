import { Hono } from 'hono'

import records from './routes/records'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', c => {
  return c.text('Hello Hono!')
})

app.route('/r', records)

export default app
