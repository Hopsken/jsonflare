import { css } from 'hono/css'
import { Layout } from './Layout'
import { APIDescription } from './APIDescrption'

const containerCls = css`
  max-width: 48rem; /* Tailwind's max-w-7xl */
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem; /* Tailwind's px-4 */
  padding-right: 1rem; /* Tailwind's px-4 */
  padding-top: 2rem; /* Tailwind's pt-8 */
  padding-bottom: 2rem; /* Tailwind's pb-8 */
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
            A global, low-latency JSON storage. Store & retrieve your JSON data
            via handy API. Open sourced on{' '}
            <a href='https://github.com/Hopsken/jsonflare'>Github</a>.
          </p>

          <details>
            <summary>How this works</summary>
            <p>
              Jsonflare is a simple wrapper of Cloudflare KV namespace. Running
              on Cloudflare Worker.
            </p>
          </details>

          <APIDescription />
        </div>
      </div>
    </Layout>
  )
}
