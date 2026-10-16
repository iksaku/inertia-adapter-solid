import { type Page, type PageProps, type VisitOptions, axiosAdapter } from '@inertiajs/core'
import { createInertiaApp, router } from 'inertia-adapter-solid'
import type { Component } from 'solid-js'
import { hydrate, render } from 'solid-js/web'
import { alternateSuffix } from './Pages/Head/TitleCallback'

window.testing = { Inertia: router }
window.resolverReceivedPage = null
const params = new URLSearchParams(window.location.search)
// Keep upstream reference fixtures for APIs Solid does not expose out of the runnable bundle.
const pages = import.meta.glob<{ default: Component }>(
  ['./Pages/**/*.tsx', '!./Pages/LayoutProps/**/*.tsx', '!./Pages/NestedProps/RescuedDeferred*.tsx'],
  { eager: true },
)

await createInertiaApp<PageProps>({
  page: window.initialPage,
  resolve: async (name, page) => {
    window.resolverReceivedPage = page as Page
    if (name === 'DeferredProps/InstantReload') await new Promise((resolve) => setTimeout(resolve, 50))
    const component = pages[`./Pages/${name}.tsx`]
    if (!component) throw new Error(`Missing Solid test fixture: ${name}`)
    return component.default
  },
  setup({ el, App, props }) {
    const mount = el.hasAttribute('data-server-rendered') ? hydrate : render
    mount(() => <App {...props} />, el)
  },
  ...(params.has('withTitleCallback')
    ? {
        title: (title, page) =>
          [title, title === 'Third' ? alternateSuffix() : page.props.titleSuffix].filter(Boolean).join(' | '),
      }
    : {}),
  ...(params.has('withServerHead') ? { serverHead: true } : {}),
  ...(params.has('withServerHeadCallback') ? { serverHead: (page) => page.props.head as string[] } : {}),
  ...(params.has('withServerHeadProp') ? { serverHead: 'metaTags' } : {}),
  progress: { delay: 0, color: 'red', ...(params.get('popover') === 'false' ? { popover: false } : {}) },
  http: params.get('customXsrf')
    ? { xsrfCookieName: params.get('customXsrf')!, xsrfHeaderName: `X-${params.get('customXsrf')}` }
    : import.meta.env.VITE_HTTP_CLIENT === 'axios'
      ? axiosAdapter()
      : undefined,
  ...(params.has('withAppDefaults')
    ? {
        defaults: {
          visitOptions: (_href: string, options: VisitOptions) => ({
            headers: { ...options.headers, 'X-From-App-Defaults': 'test' },
          }),
        },
      }
    : {}),
  ...(params.has('nonce') ? { nonce: params.get('nonce') === 'default' ? 'test-default-nonce' : 'test-nonce' } : {}),
})
