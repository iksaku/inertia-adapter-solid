import { expect, it } from 'vitest'
import { isServer, renderToString, renderToStringAsync } from 'solid-js/web'
import { App, createInertiaApp, Deferred, useForm, useRemember, WhenMounted } from 'inertia-adapter-solid'
import type { Page } from '@inertiajs/core'

const page: Page = {
  component: 'SSR',
  props: { errors: {}, value: 0 },
  url: '/ssr',
  version: null,
  clearHistory: false,
  encryptHistory: false,
}

it('uses actual server conditions and renders only the mounting fallback', () => {
  expect(isServer).toBe(true)
  const body = renderToString(() => (
    <WhenMounted fallback={<b>server waiting</b>}>
      <b>browser only</b>
    </WhenMounted>
  ))
  expect(body).toContain('server waiting')
  expect(body).not.toContain('browser only')
})

it('renders a server App with falsy deferred data and isolated primitive state', () => {
  const Consumer = () => {
    const form = useForm({ name: 'server' })
    const [remembered] = useRemember(false, 'server-flag')
    form.post('/must-not-request')
    return (
      <Deferred data="value" fallback={<span>missing</span>}>
        <span>
          {form.data.name}:{String(remembered())}:{String(form.processing)}
        </span>
      </Deferred>
    )
  }
  const body = renderToString(() => <App initialPage={page} initialComponent={Consumer} />)
  expect(body.replace(/<!--.*?-->/g, '')).toContain('server:false:false')
  expect(body).not.toContain('missing')
})

it.each([renderToString, renderToStringAsync])(
  'creates the public SSR response with a supported renderer',
  async (render) => {
    const response = await createInertiaApp({
      page,
      resolve: () => () => <main>SSR content</main>,
      render,
      setup: ({ App, props }) => <App {...props} />,
    })
    expect(response.body).toContain('SSR content')
    expect(response.body).toContain('data-page=')
    expect(Array.isArray(response.head)).toBe(true)
  },
)
