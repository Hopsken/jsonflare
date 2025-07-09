import { Hono } from 'hono'
import { openAPISpecs } from 'hono-openapi'
import { Scalar } from '@scalar/hono-api-reference'

import homepage from './routes/_index'
import records from './routes/records'

const app = new Hono<{ Bindings: Env }>()

app.route('/', homepage)
app.route('/r', records)
app.get(
  '/openapi',
  openAPISpecs(app, {
    documentation: {
      info: {
        title: 'JSONFlare API',
        version: '1.0.0',
        description: 'Store and hosting JSON records without hassle',
      },
      components: {
        schemas: {
          JSON: {
            type: 'object',
          },
        },
      },
      servers: [
        {
          url: 'https://api.jsonflare.com',
          description: 'API server',
        },
      ],
    },
  })
)

app.get('/doc', Scalar({ url: '/openapi' }))

export default app
