import { cleanup, render } from '@solidjs/testing-library'
import { createRoot } from 'solid-js'
import { afterEach, describe, expect, it } from 'vitest'
import { Form, router, useForm, useFormContext, useHttp, usePage, usePoll, WhenMounted } from 'inertia-adapter-solid'

afterEach(cleanup)

describe('public form consumers', () => {
  it('clears only selected nested errors and resets only selected data', () => {
    createRoot((dispose) => {
      try {
        const form = useForm({ nested: { name: 'Ada', count: 7 } })
        form.setData('nested', 'name', 'Grace')
        form.setData('nested', 'count', 99)
        form.setError('nested.name', 'Required').setError({ 'nested.count': 'Too large' })
        expect(form.hasErrors).toBe(true)
        form.resetAndClearErrors('nested.name')
        expect(form.data.nested).toEqual({ name: 'Ada', count: 99 })
        expect(form.errors).toEqual({ 'nested.count': 'Too large' })
        expect(form.hasErrors).toBe(true)
        form.clearErrors()
        expect(form.hasErrors).toBe(false)
      } finally {
        dispose()
      }
    })
  })

  it('owns polling lifetime and exposes start/stop state without network requests', () => {
    let poll!: ReturnType<typeof usePoll>
    const baseline = router.activePolls
    const view = render(() => {
      poll = usePoll(60_000, {}, { autoStart: false })
      return <output>{String(poll.polling)}</output>
    })
    expect(view.container.textContent).toBe('false')
    poll.start()
    expect(view.container.textContent).toBe('true')
    expect(router.activePolls).toBe(baseline + 1)
    poll.stop()
    expect(view.container.textContent).toBe('false')
    poll.start()
    view.unmount()
    expect(router.activePolls).toBe(baseline)
  })

  it('tracks nested edits, selective defaults and resets without losing siblings', () => {
    let form!: ReturnType<typeof useForm<{ profile: { name: string; age: number }; tags: string[] }>>
    render(() => {
      form = useForm({ profile: { name: 'Ada', age: 31 }, tags: ['blue', 'gold'] })
      return (
        <output>
          {form.data.profile.name}|{form.data.profile.age}|{String(form.isDirty)}
        </output>
      )
    })
    expect(document.querySelector('output')!.textContent).toBe('Ada|31|false')
    form.setData('profile', 'name', 'Grace')
    form.setData('profile', 'age', 48)
    form.setData('tags', 1, 'red')
    expect(document.querySelector('output')!.textContent).toBe('Grace|48|true')
    form.defaults('profile.name', 'Katherine').reset('profile.name', 'tags.1')
    expect(form.data).toEqual({ profile: { name: 'Katherine', age: 48 }, tags: ['blue', 'gold'] })
    expect(form.isDirty).toBe(true)
    form.reset('profile.age')
    expect(form.isDirty).toBe(false)
    form.setData('profile', 'name', 'Dorothy')
    form.defaults()
    form.setData('profile', 'name', 'temporary')
    form.reset()
    expect(form.data.profile.name).toBe('Dorothy')
    expect(form.isDirty).toBe(false)
  })

  it.each(['useForm', 'useHttp'] as const)('%s refreshes only selected factory defaults on reset', (hook) => {
    let seed = { nested: { name: 'first', count: 7 }, active: false }
    let form!: ReturnType<typeof useForm<typeof seed>> | ReturnType<typeof useHttp<typeof seed>>
    const view = render(() => {
      const factory = () => seed
      form = hook === 'useForm' ? useForm(factory) : useHttp(factory)
      return (
        <output>
          {form.data.nested.name}|{form.data.nested.count}|{String(form.data.active)}|{String(form.isDirty)}|
          {String(form.hasErrors)}
        </output>
      )
    })
    expect(view.container.textContent).toBe('first|7|false|false|false')
    form.setData('nested', 'count', 99)
    form.setData('active', true)
    form.setError({ 'nested.name': 'name error', 'nested.count': 'count error' })
    expect(seed).toEqual({ nested: { name: 'first', count: 7 }, active: false })
    seed = { nested: { name: 'second', count: 17 }, active: true }
    expect(view.container.textContent).toBe('first|99|true|true|true')
    form.resetAndClearErrors('nested.name')
    expect(form.data.nested).toEqual({ name: 'second', count: 99 })
    expect(form.errors).toEqual({ 'nested.count': 'count error' })
    expect(view.container.textContent).toBe('second|99|true|true|true')
    form.setData('nested', 'count', 7)
    form.setData('active', false)
    expect(view.container.textContent).toBe('second|7|false|false|true')
    const defaultsError = 'You cannot call `defaults()` when using a function to define your form data.'
    expect(() => form.defaults()).toThrow(defaultsError)
    expect(() => form.defaults('nested.count', 51)).toThrow(defaultsError)
    expect(() => form.defaults({ active: true })).toThrow(defaultsError)
    expect(view.container.textContent).toBe('second|7|false|false|true')
    seed = { nested: { name: '', count: 0 }, active: false }
    expect(view.container.textContent).toBe('second|7|false|false|true')
    form.reset()
    expect(view.container.textContent).toBe('|0|false|false|true')
    form.resetAndClearErrors()
    expect(view.container.textContent).toBe('|0|false|false|false')
  })

  it('provides form context only to owned descendants', () => {
    expect(useFormContext()).toBeUndefined()
    let context: ReturnType<typeof useFormContext>
    const Child = () => {
      context = useFormContext()
      return <span>{String(context?.processing)}</span>
    }
    const view = render(() => (
      <Form action="/profile" method="post">
        <Child />
      </Form>
    ))
    expect(context).toBeDefined()
    expect(view.container.textContent).toBe('false')
    view.unmount()
    expect(view.container.childNodes.length).toBe(0)
    expect(useFormContext()).toBeUndefined()
  })

  it('rejects page consumers outside App and renders mounted content in a browser root', () => {
    expect(() =>
      createRoot((dispose) => {
        try {
          usePage()
        } finally {
          dispose()
        }
      }),
    ).toThrow('usePage must be used within the Inertia component.')
    const view = render(() => (
      <WhenMounted fallback={<span>waiting</span>}>
        <span>ready</span>
      </WhenMounted>
    ))
    expect(view.container.textContent).toBe('ready')
  })
})
