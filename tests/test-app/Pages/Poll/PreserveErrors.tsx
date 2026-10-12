import { useForm, usePage, usePoll } from 'inertia-adapter-solid'
import { Show } from 'solid-js'

export default function PreserveErrors(props: { time: number }) {
  const page = usePage<{ errors: { name?: string } }>()
  const form = useForm({ name: '' })
  usePoll(300, { only: ['time'] })
  return (
    <>
      <Show when={page.props.errors?.name}>
        <p id="page-error">{page.props.errors?.name}</p>
      </Show>
      <Show when={form.errors.name}>
        <p id="form-error">{form.errors.name}</p>
      </Show>
      <button type="button" onClick={() => form.post('/poll/preserve-errors')}>
        Submit
      </button>
      <p id="time">Time: {props.time}</p>
    </>
  )
}
