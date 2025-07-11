import { css } from 'hono/css'
import { Layout } from './Layout'

const containerCls = css`
  max-width: 48rem;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 2rem;
  padding-bottom: 2rem;
`

export default function Index() {
  return (
    <Layout>
      <div class={containerCls}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            marginBlockEnd: '2rem',
          }}
        >
          <img src='/assets/logo.png' alt='logo' width={48} height={48} />
          <h1>JSONFlare</h1>
        </div>
        <div class='prose'>
          <p>
            A JSON storage & hosting platform that <strong>Just Works</strong>.
          </p>

          <p>
            <a href='https://github.com/Hopsken/jsonflare'>
              <img
                alt='Github'
                src='https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white'
              />
            </a>
          </p>

          <p>
            <a href='/doc'>API Document</a>
            {' | '}
            <a href='/openapi'>OpenAPI Schema</a>
          </p>

          <div>
            <h2>Key features</h2>
            <ul>
              <li>Store and hosting any JSON objects</li>
              <li>Account-less, no need to create an account</li>
              <li>Use JSON-Patch for partial updates</li>
              <li>Auto validate JSON Schema</li>
              <li>Create Public Read JSON records</li>
              <li>Easy to use RESTful API</li>
              <li>OpenAPI schema for easy integration</li>
            </ul>
          </div>

          <div>
            <h2>BYOK (Bring Your Own Key)</h2>
            <p>
              JSONFlare uses the <code>X-Access-Key</code> header for
              authorization. Pass a custom key in the <code>Create record</code>{' '}
              request, or let JSONFlare generate one automatically, which will
              be returned in the response header.
            </p>
          </div>

          <div>
            <h2>Auto validate JSON Schema</h2>
            <p>
              JSONFlare will automatically validate the JSON Schema when you
              create or update a record (contains a <code>$schema</code> field).
              If the JSON object does not match the schema, the request will
              fail.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
