import type {
  //  LoaderFunction,
  MetaFunction,
} from '@remix-run/cloudflare'

export const meta: MetaFunction = () => {
  return [
    { title: 'JsonFlare - Share JSON Snippets Easily' },
    {
      name: 'description',
      content:
        'A simple and elegant way to share JSON snippets with expiration dates',
    },
  ]
}

export default function Index() {
  return <h1>Json Flare - Under building</h1>
}
