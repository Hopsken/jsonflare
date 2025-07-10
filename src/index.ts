import { Hono } from 'hono'
import { openAPISpecs } from 'hono-openapi'
import { Scalar } from '@scalar/hono-api-reference'

import homepage from './routes/_index'
import records from './routes/records'
import system from './routes/system'

const app = new Hono<{ Bindings: Env }>()

app.route('/', homepage)
app.route('/r', records)
app.route('/system', system)
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
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'X-Access-Key',
            in: 'header',
            description: `BYOK(Bring Your Own Key),
              pass the header in the create and following requests.
              If omit, JSONFlare will generate one for you and return in response header.`,
          },
        },
      },

      security: [
        {
          apiKey: [],
        },
      ],

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
