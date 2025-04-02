import type {
  //  LinksFunction,
  MetaFunction,
} from '@remix-run/cloudflare'
import apiDocument from '../docs/api.md?raw'
import Markdown from 'react-markdown'

import '../style.css'

import logo from '../assets/logo.png'

export const meta: MetaFunction = () => {
  return [
    { title: 'Jsonflare' },
    {
      name: 'description',
      content:
        'Store & retrieve your JSON data easily with JsonFlare. Share JSON snippets with others and access them from anywhere. JsonFlare is a simple and secure way to store and share your JSON data.',
    },
  ]
}

// export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

export default function Index() {
  return (
    <div className='container' suppressHydrationWarning>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          marginBlockEnd: '2rem',
        }}
      >
        <img src={logo} alt='logo' width={48} height={48} />
        <h1>Jsonflare</h1>
      </div>
      <div className='prose'>
        <Markdown>{apiDocument}</Markdown>
      </div>
    </div>
  )
}
