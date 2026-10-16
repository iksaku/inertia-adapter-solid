import type { Page } from '@inertiajs/core'
import { cleanup, fireEvent, render, waitFor } from '@solidjs/testing-library'
import {
  App,
  Deferred,
  type InertiaComponent,
  resetLayoutProps,
  router,
  setLayoutProps,
  usePage,
  useRemember,
} from 'inertia-adapter-solid'
import {
  type ParentComponent,
  createContext,
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  useContext,
} from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
  cleanup()
  resetLayoutProps()
})

const page = (): Page => ({
  component: 'Consumer',
  props: { errors: {} },
  url: '/',
  version: null,
  rescuedProps: [],
  flash: {},
  rememberedState: {},
  clearHistory: false,
  encryptHistory: false,
})

it('reactively gates every deferred key by presence, not truthiness', async () => {
  const Consumer = () => {
    const current = usePage()
    return (
      <Deferred data={['count', 'enabled', 'label', 'nullable']} fallback={<span>waiting</span>}>
        <output>
          {JSON.stringify([current.props.count, current.props.enabled, current.props.label, current.props.nullable])}
        </output>
      </Deferred>
    )
  }
  const view = render(() => <App initialPage={page()} initialComponent={Consumer} resolveComponent={() => Consumer} />)
  expect(view.container.textContent).toBe('waiting')
  await new Promise<void>((resolve) =>
    router.replace({
      props: { errors: {}, count: 0, enabled: false, label: '' },
      preserveState: true,
      onSuccess: () => resolve(),
    }),
  )
  expect(view.container.textContent).toBe('waiting')
  router.replace({ props: { errors: {}, count: 0, enabled: false, label: '', nullable: null }, preserveState: true })
  await waitFor(() => expect(view.container.textContent).toBe('[0,false,"",null]'))
  router.replace({
    props: { errors: {}, count: undefined, enabled: true, label: 'yes', nullable: 1 },
    preserveState: true,
  })
  await waitFor(() => expect(view.container.textContent).toBe('waiting'))
})

it('reactively gates nested deferred paths through missing parents and falsy values', async () => {
  const Consumer = () => {
    const current = usePage<{
      auth: { count: number; enabled: boolean; label: string; nullable: number | null }
    }>()
    return (
      <Deferred data={['auth.count', 'auth.enabled', 'auth.label', 'auth.nullable']} fallback={<span>waiting</span>}>
        <output>
          {JSON.stringify([
            current.props.auth.count,
            current.props.auth.enabled,
            current.props.auth.label,
            current.props.auth.nullable,
          ])}
        </output>
      </Deferred>
    )
  }
  const view = render(() => <App initialPage={page()} initialComponent={Consumer} resolveComponent={() => Consumer} />)
  expect(view.container.textContent).toBe('waiting')
  await new Promise<void>((resolve) =>
    router.replace({
      props: { errors: {}, auth: { count: 0, enabled: false, label: '' } },
      preserveState: true,
      onSuccess: () => resolve(),
    }),
  )
  expect(view.container.textContent).toBe('waiting')
  router.replace({
    props: { errors: {}, auth: { count: 0, enabled: false, label: '', nullable: null } },
    preserveState: true,
  })
  await waitFor(() => expect(view.container.textContent).toBe('[0,false,"",null]'))
  router.replace({ props: { errors: {} }, preserveState: true })
  await waitFor(() => expect(view.container.textContent).toBe('waiting'))
})

it('updates page props without mutating initial or newly received prop objects', async () => {
  const initial = { ...page(), props: { errors: {}, profile: { name: 'original' } } }
  const replacement = { errors: {}, profile: { name: 'replacement' }, extra: { count: 7 } }
  const Consumer = () => {
    const current = usePage<{ profile: { name: string }; extra?: { count: number } }>()
    return <output>{`${current.props.profile.name}:${current.props.extra?.count ?? 'missing'}`}</output>
  }
  const view = render(() => <App initialPage={initial} initialComponent={Consumer} resolveComponent={() => Consumer} />)
  expect(view.container.textContent).toBe('original:missing')
  await new Promise<void>((resolve) =>
    router.replace({ props: replacement, preserveState: true, onSuccess: () => resolve() }),
  )
  expect(view.container.textContent).toBe('replacement:7')
  expect(initial.props.profile.name).toBe('original')
  await new Promise<void>((resolve) =>
    router.replace({
      props: { errors: {}, profile: { name: 'next' }, extra: { count: 11 } },
      preserveState: true,
      onSuccess: () => resolve(),
    }),
  )
  expect(view.container.textContent).toBe('next:11')
  expect(replacement).toEqual({ errors: {}, profile: { name: 'replacement' }, extra: { count: 7 } })
})

it('restores remembered falsy state after a genuine client-side page remount', async () => {
  let setValue!: (value: number) => unknown
  let mounts = 0
  const Consumer = () => {
    mounts++
    const [value, set] = useRemember(23, 'consumer-counter')
    setValue = set
    return <output>{value()}</output>
  }
  const view = render(() => <App initialPage={page()} initialComponent={Consumer} resolveComponent={() => Consumer} />)
  await waitFor(() => expect(view.container.textContent).toBe('23'))
  setValue(0)
  await waitFor(() => expect(router.restore('consumer-counter')).toBe(0))
  const before = mounts
  await new Promise<void>((resolve) =>
    router.replace({ props: { errors: {} }, preserveState: false, onSuccess: () => resolve() }),
  )
  expect(mounts).toBeGreaterThan(before)
  await waitFor(() => expect(view.container.textContent).toBe('0'))
})

it('retains only the shared layout prefix, with live props and correctly owned descendants', async () => {
  const Context = createContext('root')
  const disposed: string[] = []
  const counts: unknown[] = []
  const layout =
    (name: string): ParentComponent<Page['props']> =>
    (props) => {
      const parent = useContext(Context)
      const [count, setCount] = createSignal(0)
      onCleanup(() => disposed.push(name))
      if (name === 'outer') createEffect(() => counts.push(props.count))
      return (
        <section data-layout={name} data-parent={parent}>
          <output>{`${props.label}:${props.count}:${props.extra ?? 'missing'}`}</output>
          <button type="button" onClick={() => setCount(count() + 1)}>
            {count()}
          </button>
          <Context.Provider value={name}>{props.children}</Context.Provider>
        </section>
      )
    }
  const Outer = layout('outer')
  const Inner = layout('inner')
  const Other = layout('other')
  const Replacement = layout('replacement')
  const consumer = (name: string, layouts: ParentComponent<Page['props']>[]) => {
    const Consumer = () => {
      const parent = useContext(Context)
      const current = usePage()
      return (
        <article data-page={name} data-parent={parent}>
          {String(current.props.label)}
        </article>
      )
    }
    Consumer.layout = layouts
    return Consumer
  }
  const components = {
    A: consumer('A', [Outer, Inner]),
    B: consumer('B', [Outer, Inner]),
    C: consumer('C', [Outer, Other]),
    D: consumer('D', [Outer]),
    E: consumer('E', [Replacement, Inner]),
    F: consumer('F', []),
  }
  const view = render(() => (
    <App
      initialPage={{ ...page(), component: 'A', props: { errors: {}, label: 'first', count: 7, extra: 'present' } }}
      initialComponent={components.A}
      resolveComponent={(name) => components[name as keyof typeof components]}
    />
  ))
  const element = (name: string) => view.container.querySelector(`[data-layout="${name}"]`)!
  const outer = element('outer')
  const inner = element('inner')
  fireEvent.click(outer.querySelector('button')!)
  fireEvent.click(inner.querySelector('button')!)
  expect(inner.getAttribute('data-parent')).toBe('outer')
  expect(view.container.querySelector('article')?.getAttribute('data-parent')).toBe('inner')

  const visit = (component: keyof typeof components, label: string, count = 7) =>
    new Promise<void>((resolve) =>
      router.replace({
        component,
        props: { errors: {}, label, count },
        preserveState: false,
        onSuccess: () => resolve(),
      }),
    )

  await visit('B', 'second')
  expect(element('outer')).toBe(outer)
  expect(element('inner')).toBe(inner)
  expect(outer.querySelector('button')?.textContent).toBe('1')
  expect(inner.querySelector('button')?.textContent).toBe('1')
  expect(outer.querySelector('output')?.textContent).toBe('second:7:missing')
  expect(inner.querySelector('output')?.textContent).toBe('second:7:missing')
  expect(view.container.querySelector('article')?.textContent).toBe('second')
  expect(counts).toEqual([7])
  expect(disposed).toEqual([])

  await visit('C', 'third', 11)
  expect(element('outer')).toBe(outer)
  expect(element('other').getAttribute('data-parent')).toBe('outer')
  expect(view.container.querySelector('article')?.getAttribute('data-parent')).toBe('other')
  expect(element('inner')).toBeNull()
  expect(disposed).toEqual(['inner'])
  expect(counts).toEqual([7, 11])

  await visit('D', 'fourth', 11)
  expect(element('outer')).toBe(outer)
  expect(element('other')).toBeNull()
  expect(view.container.querySelector('article')?.getAttribute('data-parent')).toBe('outer')
  expect(disposed).toEqual(['inner', 'other'])

  await visit('A', 'fifth', 11)
  const newInner = element('inner')
  expect(element('outer')).toBe(outer)
  expect(newInner).not.toBe(inner)
  expect(newInner.querySelector('button')?.textContent).toBe('0')
  expect(newInner.getAttribute('data-parent')).toBe('outer')

  await visit('E', 'sixth', 11)
  expect(element('outer')).toBeNull()
  expect(element('inner')).not.toBe(newInner)
  expect(element('inner').getAttribute('data-parent')).toBe('replacement')
  expect(disposed.filter((name) => name === 'inner')).toHaveLength(2)
  expect(disposed.filter((name) => name === 'outer')).toHaveLength(1)

  await visit('F', 'bare', 11)
  expect(view.container.querySelector('section')).toBeNull()
  expect(view.container.querySelector('article')?.getAttribute('data-parent')).toBe('root')
  await visit('A', 'wrapped again', 11)
  expect(element('outer')).not.toBe(outer)
  expect(element('inner').getAttribute('data-parent')).toBe('outer')
  view.unmount()
  expect(disposed.filter((name) => name === 'outer')).toHaveLength(2)
  expect(disposed.filter((name) => name === 'inner')).toHaveLength(4)
  expect(disposed.filter((name) => name === 'replacement')).toHaveLength(1)
})

it('updates the page through a transparent layout without relying on a parent DOM insertion', async () => {
  const Layout: ParentComponent = (props) => props.children
  const A = () => <h1>Page A</h1>
  const B = () => <h1>Page B</h1>
  A.layout = Layout
  B.layout = Layout
  const view = render(() => (
    <App
      initialPage={{ ...page(), component: 'A' }}
      initialComponent={A}
      resolveComponent={(name) => (name === 'A' ? A : B)}
    />
  ))
  expect(view.container.textContent).toBe('Page A')
  await new Promise<void>((resolve) =>
    router.replace({ component: 'B', preserveState: true, onSuccess: () => resolve() }),
  )
  expect(view.container.textContent).toBe('Page B')
})

it('separates page resets from layout identity, including two resets within the same clock tick', async () => {
  const Layout: ParentComponent<Page['props']> = (props) => <main>{props.children}</main>
  const consumer = () => {
    const Consumer = (props: Page['props']) => {
      const [count, setCount] = createSignal(0)
      return (
        <article>
          <output>{String(props.label)}</output>
          <button type="button" onClick={() => setCount(count() + 1)}>
            {count()}
          </button>
        </article>
      )
    }
    Consumer.layout = Layout
    return Consumer
  }
  const A = consumer()
  const B = consumer()
  const C = consumer()
  C.layout = (props) => <Layout {...props}>{props.children}</Layout>
  const components = { A, B, C }
  const view = render(() => (
    <App
      initialPage={{ ...page(), component: 'A', props: { errors: {}, label: 'first' } }}
      initialComponent={A}
      resolveComponent={(name) => components[name as keyof typeof components]}
    />
  ))
  const layout = view.container.querySelector('main')
  const article = view.container.querySelector('article')
  const button = () => view.container.querySelector('button')!
  const visit = (component: string, preserveState: boolean, label = 'updated') =>
    new Promise<void>((resolve) =>
      router.replace({ component, props: { errors: {}, label }, preserveState, onSuccess: () => resolve() }),
    )

  fireEvent.click(button())
  await visit('A', true)
  expect(view.container.querySelector('article')).toBe(article)
  expect(view.container.querySelector('output')?.textContent).toBe('updated')
  expect(button().textContent).toBe('1')

  const clock = vi.spyOn(Date, 'now').mockReturnValue(123456789)
  try {
    await visit('A', false)
    expect(view.container.querySelector('article')).not.toBe(article)
    expect(button().textContent).toBe('0')
    fireEvent.click(button())
    await visit('A', false)
    expect(button().textContent).toBe('0')
    fireEvent.click(button())
    await visit('B', true)
    expect(button().textContent).toBe('0')
    expect(view.container.querySelector('main')).toBe(layout)
    // Equal rendered markup does not make a new wrapper the same Solid component.
    await visit('C', true)
    expect(view.container.querySelector('main')).not.toBe(layout)
  } finally {
    clock.mockRestore()
  }
})

it('updates layered and named props without remounting layouts or notifying unchanged prop consumers', async () => {
  const counts: unknown[] = []
  const Mirror: ParentComponent<Record<string, unknown>> = (props) => {
    const resolved = mergeProps({ extra: 'fallback' }, props)
    return (
      <>
        <output>{`${String(resolved.title)}:${String(resolved.count)}:${String(resolved.extra)}`}</output>
        <small>{Object.keys(props).includes('extra') ? 'extra present' : 'extra absent'}</small>
        <em>{typeof resolved.format === 'function' ? resolved.format(String(resolved.title)) : ''}</em>
        {resolved.children}
      </>
    )
  }
  const layout =
    (name: string): ParentComponent<Record<string, unknown>> =>
    (props) => {
      const [count, setCount] = createSignal(0)
      if (name === 'outer') createEffect(() => counts.push(props.count))
      return (
        <section data-layout={name}>
          <button type="button" onClick={() => setCount(count() + 1)}>
            {count()}
          </button>
          <Mirror {...props} />
        </section>
      )
    }
  const Outer = layout('outer')
  const Inner = layout('inner')
  const A: InertiaComponent = () => <article>A</article>
  const B: InertiaComponent = () => <article>B</article>
  const C: InertiaComponent = () => <article>C</article>
  A.layout = {
    app: {
      component: Outer,
      props: { title: 'outer A', children: 'not the page', format: (title: string) => title.toUpperCase() },
    },
    content: [Inner, { title: 'inner A' }],
  }
  B.layout = { app: [Outer, { title: 'outer B' }], content: [Inner, { title: 'inner B' }] }
  C.layout = { '': [Outer], content: [Inner] }
  const components = { A, B, C }
  const view = render(() => (
    <App
      initialPage={{ ...page(), component: 'A', props: { errors: {}, title: 'page', count: 7 } }}
      initialComponent={A}
      resolveComponent={(name) => components[name as keyof typeof components]}
    />
  ))
  const outer = view.container.querySelector('[data-layout="outer"]')!
  const inner = view.container.querySelector('[data-layout="inner"]')!
  const text = (element: Element) => element.querySelector('output')!.textContent
  expect(text(outer)).toBe('outer A:7:fallback')
  expect(text(inner)).toBe('inner A:7:fallback')
  expect(outer.querySelector('em')?.textContent).toBe('OUTER A')
  expect(view.container.querySelector('article')?.textContent).toBe('A')
  fireEvent.click(outer.querySelector('button')!)

  setLayoutProps({ title: 'intermediate', count: 99 })
  setLayoutProps({ title: 'shared', count: 7, extra: 0 })
  setLayoutProps('app', { title: 'named' })
  setLayoutProps('not-mounted', { title: 'ignored' })
  await waitFor(() => expect(text(outer)).toBe('named:7:0'))
  expect(text(inner)).toBe('shared:7:0')
  expect(outer.querySelector('em')?.textContent).toBe('NAMED')
  expect(outer.querySelector('small')?.textContent).toBe('extra present')
  expect(counts).toEqual([7])

  setLayoutProps('app', { title: undefined, count: false, extra: '' })
  await waitFor(() => expect(text(outer)).toBe('undefined:false:'))
  expect(text(inner)).toBe('shared:7:0')
  resetLayoutProps()
  expect(text(outer)).toBe('outer A:7:fallback')
  expect(outer.querySelector('small')?.textContent).toBe('extra absent')
  expect(counts).toEqual([7, false, 7])

  const visit = (component: string, preserveState: boolean) =>
    new Promise<void>((resolve) =>
      router.replace({
        component,
        props: { errors: {}, title: 'new page', count: 7 },
        preserveState,
        onSuccess: () => resolve(),
      }),
    )
  setLayoutProps({ title: 'preserved' })
  setLayoutProps('app', { title: 'named preserved' })
  await visit('B', true)
  expect(text(outer)).toBe('named preserved:7:fallback')
  expect(text(inner)).toBe('preserved:7:fallback')
  expect(view.container.querySelector('article')?.textContent).toBe('B')

  setLayoutProps('', { title: 'ignored empty name' })
  await visit('C', true)
  expect(text(outer)).toBe('preserved:7:fallback')
  expect(text(inner)).toBe('preserved:7:fallback')
  expect(view.container.querySelector('article')?.textContent).toBe('C')

  await visit('A', false)
  expect(text(outer)).toBe('outer A:7:fallback')
  expect(text(inner)).toBe('inner A:7:fallback')
  expect(view.container.querySelector('[data-layout="outer"]')).toBe(outer)
  expect(view.container.querySelector('[data-layout="inner"]')).toBe(inner)
  expect(outer.querySelector('button')?.textContent).toBe('1')
  expect(counts).toEqual([7, false, 7])
})

it('resolves defaults from the current page, applies props-only overrides, and honors explicit opt-outs', async () => {
  const Layout: ParentComponent<Record<string, unknown>> = (props) => (
    <section>
      <output>{String(props.title)}</output>
      {props.children}
    </section>
  )
  const Default: InertiaComponent = () => <article>default page</article>
  const Overrides: InertiaComponent = () => <article>overrides page</article>
  const Explicit: InertiaComponent = () => <article>explicit page</article>
  const Disabled: InertiaComponent = () => <article>disabled page</article>
  const Empty: InertiaComponent = () => <article>empty page</article>
  const Null: InertiaComponent = () => <article>null page</article>
  Overrides.layout = { title: 'page override' }
  Explicit.layout = { component: Layout, props: { title: 'explicit' } }
  Disabled.layout = false
  Empty.layout = []
  Null.layout = null
  const components = { Default, Overrides, Explicit, Disabled, Empty, Null }
  const view = render(() => (
    <App
      initialPage={{ ...page(), component: 'Default' }}
      initialComponent={Default}
      resolveComponent={(name) => components[name as keyof typeof components]}
      defaultLayout={(name, page) => [Layout, { title: `${name}:${page.url}` }]}
    />
  ))
  const layout = view.container.querySelector('section')
  expect(view.container.querySelector('output')?.textContent).toBe('Default:/')
  const visit = (component: keyof typeof components) =>
    new Promise<void>((resolve) =>
      router.replace({ component, url: '/next', preserveState: false, onSuccess: () => resolve() }),
    )
  await visit('Overrides')
  expect(view.container.querySelector('output')?.textContent).toBe('page override')
  await visit('Explicit')
  expect(view.container.querySelector('output')?.textContent).toBe('explicit')
  expect(view.container.querySelector('section')).toBe(layout)
  await visit('Disabled')
  expect(view.container.querySelector('section')).toBeNull()
  await visit('Empty')
  expect(view.container.querySelector('section')).toBeNull()
  await visit('Null')
  expect(view.container.querySelector('output')?.textContent).toBe('Null:/next')
  await visit('Default')
  expect(view.container.querySelector('output')?.textContent).toBe('Default:/next')
})
