import type { Method, Page, UrlMethodPair } from '@inertiajs/core'
import {
  App,
  Deferred,
  Head,
  InfiniteScroll,
  WhenMounted,
  createInertiaApp,
  useForm,
  useHttp,
  usePage,
  useRemember,
} from 'inertia-adapter-solid'
import { ErrorBoundary, Suspense, createResource } from 'solid-js'
import { isServer, renderToString, renderToStringAsync, useAssets } from 'solid-js/web'
import { describe, expect, it } from 'vitest'

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
        props: {
          ...page.props,
          head: ['<meta data-inertia="description" name="description" content="Server default">'],
        },
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
          <Head title="SSR & <title>">
            <meta name="description" content="Page & description" head-key="description" />
          </Head>
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
      serverHead: true,
      title: (title, page) => `${title} | ${page.props.value}`,
      setup: ({ App, props }) => <App {...props} />,
    })
    const body = response.body.replace(/<!--.*?-->/g, '')
    expect(body).toContain('SSR content')
    expect(body).toContain('accounts:true:false')
    expect(body).toContain('messages:false:true')
    expect(body).toContain('optional:false:false')
    expect(response.body).toContain('data-page=')
    const head = response.head.join('')
    expect(head).toContain('<title data-inertia="">SSR &amp; &lt;title&gt; | 0</title>')
    expect(head).toContain('content="Page &amp; description"')
    expect(head.match(/name="description"/g)).toHaveLength(1)
    expect(head).not.toContain('Server default')
    expect(body).not.toContain('<meta')
    expect(body).not.toContain('<title')
    expect(body).not.toContain('<template')
  },
)

describe('Head SSR', () => {
  it.each(['native', 'yielding'] as const)(
    'isolates resolved Head declarations, Solid assets and nonces across concurrent SSR with a %s renderer',
    async (kind) => {
      const Consumer = () => {
        const props = usePage<{ name: string; delay: number }>().props
        const [title] = createResource(
          () => new Promise<string>((resolve) => setTimeout(() => resolve(`${props.name} title`), props.delay)),
        )
        const Metadata = () => {
          const [description] = createResource(() => Promise.resolve(`${props.name} description`))
          return (
            <Suspense fallback={<meta name="loading" content="Loading metadata" />}>
              <meta name="description" content={description()} />
            </Suspense>
          )
        }
        useAssets(() => <meta name="solid-asset" content={props.name} />)
        useAssets(() => <script>{'window.assetBoundaryText = "</head>"'}</script>)
        return (
          <>
            <Head title={title()}>
              <Metadata />
            </Head>
            <Suspense
              fallback={
                <Head title="Abandoned">
                  <meta name="fallback" content="Loading title" />
                </Head>
              }
            >
              <main>{title()}</main>
            </Suspense>
          </>
        )
      }
      const render: typeof renderToStringAsync =
        kind === 'native'
          ? renderToStringAsync
          : async (root, options) => {
              const html = await renderToStringAsync(root, options)
              await new Promise((resolve) => setTimeout(resolve, 30))
              return html
            }
      const requests = [
        { name: 'First', delay: 20, nonce: 'first-nonce' },
        { name: 'Second', delay: 1, nonce: 'second-nonce' },
      ]
      const responses = await Promise.all(
        requests.map((props) =>
          createInertiaApp({
            page: { ...page, props: { errors: {}, ...props } },
            resolve: () => Consumer,
            render,
            nonce: props.nonce,
            title: (title, page) => `${title}:${page.props.name}`,
            setup: ({ App, props }) => <App {...props} />,
          }),
        ),
      )
      for (const [index, { name, nonce }] of requests.entries()) {
        const { head, body } = responses[index]
        const tags = head.join('')
        expect(tags).toContain(`<title data-inertia="">${name} title:${name}</title>`)
        expect(tags.match(/name="description"/g)).toHaveLength(1)
        expect(tags).toContain(`content="${name} description"`)
        expect(tags.match(/name="solid-asset"/g)).toHaveLength(1)
        expect(tags).toContain(`content="${name}"`)
        expect(tags).toContain('window.assetBoundaryText = "</head>"')
        expect(tags).not.toMatch(/Abandoned|Loading|name="fallback"|name="loading"/)
        expect(tags).not.toContain(name === 'First' ? 'Second' : 'First')
        const nonces = Array.from(`${tags}${body}`.matchAll(/nonce="([^"]+)"/g), (match) => match[1])
        expect(nonces.length).toBeGreaterThanOrEqual(2)
        expect([...new Set(nonces)]).toEqual([nonce])
        expect(body.replace(/<!--.*?-->/g, '')).toMatch(new RegExp(`<main[^>]*>${name} title</main>`))
        expect(body).not.toMatch(/<head|<meta|<title|<template/)
      }
    },
  )

  it('discards Head declarations when a pending resource rejects into a Solid ErrorBoundary', async () => {
    const Consumer = () => {
      const [title] = createResource<string>(() => Promise.reject(new Error('Title failed')))
      return (
        <ErrorBoundary fallback={<main>Recovered</main>}>
          <Suspense fallback={<main>Loading</main>}>
            <Head title={title()}>
              <meta name="abandoned" content="Abandoned" />
            </Head>
            <main>{title()}</main>
          </Suspense>
        </ErrorBoundary>
      )
    }
    const response = await createInertiaApp({
      page,
      resolve: () => Consumer,
      render: renderToStringAsync,
      setup: ({ App, props }) => <App {...props} />,
    })
    expect(response.body).toMatch(/<main\b[^>]*>Recovered<\/main>/)
    expect(response.body).not.toContain('data-inertia-head')
    expect(response.head.join('')).not.toMatch(/<title|<meta|Abandoned/)
  })
})
