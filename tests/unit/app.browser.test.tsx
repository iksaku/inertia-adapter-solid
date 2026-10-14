import type { Page } from '@inertiajs/core'
import { cleanup, render, waitFor } from '@solidjs/testing-library'
import { App, Deferred, router, usePage, useRemember } from 'inertia-adapter-solid'
import { afterEach, expect, it } from 'vitest'

afterEach(cleanup)

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
