import { useForm, usePage } from 'inertia-adapter-solid'
export default () => {
  const form = useForm({
    name: 'foo',
    handle: 'example',
    remember: false,
  })
  const page = usePage()
  const submit = () => {
    form.post(page.url)
  }
  const submitAndReset = () => {
    form.post('/form-helper/data/redirect-back', {
      onSuccess: () => form.reset(),
    })
  }
  const resetAll = () => {
    form.reset()
  }
  const resetOne = () => {
    form.reset('handle')
  }
  const reassign = () => {
    form.defaults()
  }
  const reassignObject = () => {
    form.defaults({ handle: 'updated handle', remember: true })
  }
  const reassignSingle = () => {
    form.defaults('name', 'single value')
  }
  return (
    <div>
      <label>
        Full Name
        <input
          type="text"
          id="name"
          name="name"
          onInput={(e) => form.setData('name', e.currentTarget.value)}
          value={form.data.name}
        />
      </label>
      {form.errors.name && <span class="name_error">{form.errors.name}</span>}
      <label>
        Handle
        <input
          type="text"
          id="handle"
          name="handle"
          onInput={(e) => form.setData('handle', e.currentTarget.value)}
          value={form.data.handle}
        />
      </label>
      {form.errors.handle && <span class="handle_error">{form.errors.handle}</span>}
      <label>
        Remember Me
        <input
          type="checkbox"
          id="remember"
          name="remember"
          onInput={(e) => form.setData('remember', e.currentTarget.checked)}
          checked={form.data.remember}
        />
      </label>
      {form.errors.remember && <span class="remember_error">{form.errors.remember}</span>}

      <button onClick={submit} class="submit">
        Submit form
      </button>

      <button onClick={submitAndReset} class="submit">
        Submit form and reset
      </button>

      <button onClick={resetAll} class="reset">
        Reset all data
      </button>
      <button onClick={resetOne} class="reset-one">
        Reset one field
      </button>

      <button onClick={reassign} class="reassign">
        Reassign current as defaults
      </button>
      <button onClick={reassignObject} class="reassign-object">
        Reassign default values
      </button>
      <button onClick={reassignSingle} class="reassign-single">
        Reassign single default
      </button>

      <span class="errors-status">Form has {form.hasErrors ? '' : 'no '}errors</span>
    </div>
  )
}
