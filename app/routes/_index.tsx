import type {
  //  LoaderFunction,
  MetaFunction,
} from '@remix-run/cloudflare'
import apiDocument from '../docs/api.md?raw'
// import { Markdown } from '../lib/markdown.client'
import Markdown from 'react-markdown'

import '../style.css'

export const meta: MetaFunction = () => {
  return [
    { title: 'JsonFlare' },
    {
      name: 'description',
      content:
        'Store & retrieve your JSON data easily with JsonFlare. Share JSON snippets with others and access them from anywhere. JsonFlare is a simple and secure way to store and share your JSON data.',
    },
  ]
}

export default function Index() {
  return (
    <div className='container prose' suppressHydrationWarning>
      <h1>JsonFlare</h1>
      <Markdown>{apiDocument}</Markdown>
    </div>
  )
}
