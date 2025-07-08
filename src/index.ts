import { Hono } from 'hono'

import homepage from './routes/_index'
import records from './routes/records'

const app = new Hono<{ Bindings: Env }>()

app.route('/', homepage)
app.route('/r', records)

export default app
