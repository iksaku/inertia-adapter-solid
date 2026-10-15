import { createSignal, Show } from 'solid-js'
import { Link, useForm } from 'inertia-adapter-solid'
export default () => {
  const form = useForm('form', { name: 'foo', handle: 'example', remember: false })
  const [untracked, setUntracked] = createSignal('')
  const submit = () => {
    form.post('/remember/form-helper/remember')
  }
  const reset = () => {
    form.reset('handle')
    form.clearErrors('name')
  }
  return (
    <div>
      <label>
        Full Name
        <input
          type="text"
          id="name"
          name="name"
          value={form.data.name}
          onInput={(e) => form.setData('name', e.target.value)}
        />
      </label>
      <Show when={form.errors.name}>{<span class="name_error">{form.errors.name}</span>}</Show>
      <label>
        Handle
        <input
          type="text"
          id="handle"
          name="handle"
          value={form.data.handle}
          onInput={(e) => form.setData('handle', e.target.value)}
        />
      </label>
      <Show when={form.errors.handle}>{<span class="handle_error">{form.errors.handle}</span>}</Show>
      <label>
        Remember Me
        <input
          type="checkbox"
          id="remember"
          name="remember"
          checked={form.data.remember}
          onInput={(e) => form.setData('remember', e.target.checked)}
        />
      </label>
      <Show when={form.errors.remember}>{<span class="remember_error">{form.errors.remember}</span>}</Show>
      <label>
        Untracked
        <input
          type="text"
          id="untracked"
          name="untracked"
          value={untracked()}
          onInput={(e) => setUntracked(e.target.value)}
        />
      </label>

      <button onClick={submit} class="submit">
        Submit form
      </button>
      <button onClick={reset} class="reset-one">
        Reset one field & error
      </button>

      <Link href="/dump/get" class="link">
        Navigate away
      </Link>
    </div>
  )
}
