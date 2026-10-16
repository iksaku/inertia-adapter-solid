import type { Method, Page, UrlMethodPair } from '@inertiajs/core'
import {
  App,
  Deferred,
  type InertiaComponent,
  InfiniteScroll,
  WhenMounted,
  createInertiaApp,
  resetLayoutProps,
  setLayoutProps,
  useForm,
  useHttp,
  usePage,
  useRemember,
} from 'inertia-adapter-solid'
import { type ParentComponent, createContext, useContext } from 'solid-js'
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

it('renders nested layouts under their providers with request-local props', () => {
  const Context = createContext('missing')
  const Outer: ParentComponent<Page['props']> = (props) => (
    <Context.Provider value={`outer:${props.value}`}>{props.children}</Context.Provider>
  )
  const Inner: ParentComponent<Page['props']> = (props) => {
    const parent = useContext(Context)
    return <Context.Provider value={`${parent}/inner:${props.value}`}>{props.children}</Context.Provider>
  }
  const Consumer = () => {
    const parent = useContext(Context)
    const current = usePage()
    return <output>{`${parent}/page:${current.props.value}`}</output>
  }
  Consumer.layout = [Outer, Inner]
  const render = (value: number) =>
    renderToString(() => (
      <App initialPage={{ ...page, props: { errors: {}, value } }} initialComponent={Consumer} />
    )).replace(/<!--.*?-->/g, '')

  expect(render(7)).toContain('outer:7/inner:7/page:7')
  expect(render(19)).toContain('outer:19/inner:19/page:19')
  expect(render(0)).toContain('outer:0/inner:0/page:0')
})

it.each(['manual', 'automatic'] as const)(
  'renders request-local default layout props with %s SSR setup',
  async (mode) => {
    const Layout: ParentComponent<Record<string, unknown>> = (props) => (
      <section>
        <h1>{String(props.title)}</h1>
        {props.children}
      </section>
    )
    const Inner: ParentComponent<Record<string, unknown>> = (props) => (
      <main>
        <h2>{String(props.title)}</h2>
        {props.children}
      </main>
    )
    const Consumer: InertiaComponent = () => {
      setLayoutProps({ title: 'must not leak' })
      setLayoutProps('app', { title: 'must not leak either' })
      return <article>content</article>
    }
    const options = {
      resolve: () => Consumer,
      layout: (name: string, page: Page) => ({
        app: [Layout, { title: `${name}:${page.props.value}` }] as [typeof Layout, Record<string, unknown>],
        content: { component: Inner, props: { title: undefined } },
      }),
    }
    const factory = await createInertiaApp(options)
    const render = async (value: number) => {
      const initial = { ...page, props: { errors: {}, value, title: 'page fallback' } }
      const response =
        mode === 'automatic'
          ? await factory!(initial, renderToString)
          : await createInertiaApp({
              ...options,
              page: initial,
              render: renderToString,
              setup: ({ App, props }) => <App {...props} />,
            })
      return response.body.replace(/<!--.*?-->/g, '')
    }
    const first = await render(7)
    expect(first).toContain('<h1>SSR:7</h1>')
    expect(first).toContain('<h2>undefined</h2>')
    expect(first).toContain('>content</article>')
    expect(await render(19)).toContain('<h1>SSR:19</h1>')
    Consumer.layout = { title: 'page override' }
    const overridden = await render(23)
    expect(overridden).toContain('<h1>page override</h1>')
    expect(overridden).toContain('<h2>page override</h2>')
    expect(overridden).not.toContain('must not leak')
    resetLayoutProps()
  },
)

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
