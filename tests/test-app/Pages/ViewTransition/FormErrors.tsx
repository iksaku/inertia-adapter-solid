import { Show } from 'solid-js'
import { useForm } from 'inertia-adapter-solid'
export default () => {
  const form = useForm({ name: '' })
  const submit = () => {
    form.post('/view-transition/form-errors', {
      viewTransition: (viewTransition) => {
        viewTransition.ready.then(() => console.log('ready'))
        viewTransition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
        viewTransition.finished.then(() => console.log('finished'))
      },
    })
  }
  return (
    <div>
      <h1>View Transition Form Errors Test</h1>

      <label>
        Name
        <input
          type="text"
          id="name"
          name="name"
          onInput={(e) => form.setData('name', e.target.value)}
          value={form.data.name}
        />
      </label>

      <Show when={form.errors.name}>{<p class="name_error">{form.errors.name}</p>}</Show>

      <button onClick={submit} class="submit">
        Submit with View Transition
      </button>
    </div>
  )
}
