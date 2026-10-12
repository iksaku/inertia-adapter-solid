import { useForm } from 'inertia-adapter-solid'
export default () => {
  const form = useForm({ name: 'foo', handle: 'example', remember: false })
  const submit = () => {
    form.post('/form-helper/errors')
  }
  const clearErrors = () => {
    form.clearErrors()
  }
  const clearError = () => {
    form.clearErrors('handle')
  }
  const setErrors = () => {
    form.setError({
      name: 'Manually set Name error',
      handle: 'Manually set Handle error',
    })
  }
  const setError = () => {
    form.setError('handle', 'Manually set Handle error')
  }
  const resetAndClearErrors = () => {
    form.resetAndClearErrors()
  }
  const resetHandle = () => {
    form.resetAndClearErrors('handle')
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

      <button onClick={clearErrors} class="clear">
        Clear all errors
      </button>
      <button onClick={clearError} class="clear-one">
        Clear one error
      </button>
      <button onClick={setErrors} class="set">
        Set errors
      </button>
      <button onClick={setError} class="set-one">
        Set one error
      </button>
      <button onClick={resetAndClearErrors} class="reset-all">
        Reset all
      </button>
      <button onClick={resetHandle} class="reset-handle">
        Reset handle
      </button>

      <span class="errors-status">Form has {form.hasErrors ? '' : 'no '}errors</span>
    </div>
  )
}
