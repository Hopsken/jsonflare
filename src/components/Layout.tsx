import { FC } from 'hono/jsx'

import { css, Style } from 'hono/css'

const bodyCls = css`
  margin: 0;
  font-family: Inter, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f9fafb;
  line-height: 1.5;
`

export const Layout: FC = props => {
  return (
    <html lang='en'>
      <title>JSONFlare</title>
      <meta
        name='description'
        content='Store & retrieve your JSON data easily with JsonFlare. Share JSON snippets with others and access them from anywhere. JsonFlare is a simple and secure way to store and share your JSON data'
      ></meta>
      <link rel='shortcut icon' href='/favicon.svg' type='image/svg+xml' />
      <Style />
      <body class={bodyCls}>{props.children}</body>
    </html>
  )
}
