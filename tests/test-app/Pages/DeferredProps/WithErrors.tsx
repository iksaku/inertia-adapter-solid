import { Deferred, useForm, usePage } from 'inertia-adapter-solid'
import { Show } from 'solid-js'
export default function WithErrors() {
  const page = usePage<{ foo?: { text: string }; errors: { name?: string } }>()
  const form = useForm({ name: '' })
  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        <div id="foo">{page.props.foo?.text}</div>
      </Deferred>
      <Show when={page.props.errors?.name}>
        <p id="page-error">{page.props.errors?.name}</p>
      </Show>
      <Show when={form.errors.name}>
        <p id="form-error">{form.errors.name}</p>
      </Show>
      <button type="button" onClick={() => form.post('/deferred-props/with-errors')}>
        Submit
      </button>
    </>
  )
}
