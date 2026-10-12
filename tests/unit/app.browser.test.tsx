import { cleanup, render, waitFor } from '@solidjs/testing-library'
import type { Page } from '@inertiajs/core'
import { afterEach, expect, it } from 'vitest'
import { App, Deferred, router, usePage, useRemember } from 'inertia-adapter-solid'

afterEach(cleanup)

const page = (): Page => ({
  component: 'Consumer',
  props: { errors: {} },
  url: '/',
  version: null,
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
