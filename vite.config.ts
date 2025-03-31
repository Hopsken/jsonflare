import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// import { plugin as markdown, Mode } from 'vite-plugin-markdown'

declare module '@remix-run/cloudflare' {
  interface Future {
    v3_singleFetch: true
  }
}

export default defineConfig({
  plugins: [
    // markdown({
    //   mode: [Mode.REACT, Mode.HTML],
    //   markdownIt: {},
    // }),
    remixCloudflareDevProxy(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
})
