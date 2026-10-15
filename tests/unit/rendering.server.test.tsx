import type { Method, Page, UrlMethodPair } from '@inertiajs/core'
import {
  App,
  Deferred,
  InfiniteScroll,
  WhenMounted,
  createInertiaApp,
  useForm,
  useHttp,
  useRemember,
} from 'inertia-adapter-solid'
import { isServer, renderToString, renderToStringAsync } from 'solid-js/web'
import { expect, it } from 'vitest'

const page: Page = {
  component: 'SSR',
  props: { errors: {}, value: 0 },
  url: '/ssr',
  version: null,
  rescuedProps: [],
  flash: {},
  rememberedState: {},
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

it.each(['useForm', 'useHttp'] as const)(
  'initializes %s legacy validation during SSR without resolving endpoints',
  (hook) => {
    const lazyMethod = (): Method => {
      throw new Error('The method must not be resolved during initialization.')
    }
    const lazyUrl = (): string => {
      throw new Error('The URL must not be resolved during initialization.')
    }
    const lazyWayfinder = (): UrlMethodPair => {
      throw new Error('Wayfinder must not be resolved during initialization.')
    }
    const body = renderToString(() => {
      const data = { name: 'server' }
      const use = hook === 'useForm' ? useForm<typeof data> : useHttp<typeof data>
      const forms = [
        use('post', '/must-not-request', data),
        use(lazyMethod, lazyUrl, data),
        use({ method: 'post', url: '/must-not-request' }, data),
        use(lazyWayfinder, data),
      ]
      return (
        <output>
          {forms
            .map((form) => `${form.data.name}:${form.validating}:${form.touched('name')}:${form.invalid('name')}`)
            .join('|')}
        </output>
      )
    })
    expect(body.replace(/<!--.*?-->/g, '')).toContain(
      'server:false:false:false|server:false:false:false|server:false:false:false|server:false:false:false',
    )
  },
)

it.each(['object', 'factory'] as const)(
  'renders a server App with isolated %s form data and falsy deferred props',
  (kind) => {
    const Consumer = () => {
      const form = useForm(kind === 'factory' ? () => ({ name: 'server' }) : { name: 'server' })
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
  },
)

it.each([renderToString, renderToStringAsync])(
  'creates the public SSR response with a supported renderer',
  async (render) => {
    const response = await createInertiaApp({
      page: {
        ...page,
        scrollProps: {
          accounts: { pageName: 'accounts', previousPage: 41, currentPage: 42, nextPage: null, reset: false },
          messages: {
            pageName: 'messages',
            previousPage: null,
            currentPage: 'cursor-A',
            nextPage: 'cursor-B',
            reset: false,
          },
        },
      },
      resolve: () => () => (
        <main>
          SSR content
          <InfiniteScroll
            data="accounts"
            previous={(slot) => (
              <b>
                accounts:{String(slot.hasMore)}:{String(slot.hasNext)}
              </b>
            )}
          >
            Accounts
          </InfiniteScroll>
          <InfiniteScroll
            data="messages"
            next={(slot) => (
              <b>
                messages:{String(slot.hasPrevious)}:{String(slot.hasMore)}
              </b>
            )}
          >
            Messages
          </InfiniteScroll>
          <InfiniteScroll
            data="optional"
            next={(slot) => (
              <b>
                optional:{String(slot.hasPrevious)}:{String(slot.hasMore)}
              </b>
            )}
          >
            Optional
          </InfiniteScroll>
        </main>
      ),
      render,
      setup: ({ App, props }) => <App {...props} />,
    })
    const body = response.body.replace(/<!--.*?-->/g, '')
    expect(body).toContain('SSR content')
    expect(body).toContain('accounts:true:false')
    expect(body).toContain('messages:false:true')
    expect(body).toContain('optional:false:false')
    expect(response.body).toContain('data-page=')
    expect(Array.isArray(response.head)).toBe(true)
  },
)
