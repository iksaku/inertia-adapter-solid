import { useForm, usePage, WhenVisible } from 'inertia-adapter-solid'
import { Show } from 'solid-js'

export default function Visible(props: { foo?: string }) {
  const page = usePage<{ errors: { name?: string } }>()
  const form = useForm({ name: '' })
  return (
    <>
      <Show when={page.props.errors?.name}>
        <p id="page-error">{page.props.errors?.name}</p>
      </Show>
      <Show when={form.errors.name}>
        <p id="form-error">{form.errors.name}</p>
      </Show>
      <button type="button" onClick={() => form.post('/when-visible/preserve-errors')}>
        Submit
      </button>
      <div style={{ height: '2000px' }} />
      <WhenVisible data="foo" fallback={<div id="loading">Loading foo...</div>}>
        <div id="foo">Foo: {props.foo}</div>
      </WhenVisible>
    </>
  )
}
