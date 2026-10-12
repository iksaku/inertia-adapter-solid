import { useForm } from 'inertia-adapter-solid'
export default () => {
  const form = useForm({
    name: '',
    handle: '',
  })
  return (
    <div>
      <label>
        Name
        <input
          type="text"
          id="name"
          name="name"
          value={form.data.name}
          onInput={(e) => form.setData('name', e.currentTarget.value)}
        />
      </label>
      {form.errors.name && <span id="name-error">{form.errors.name}</span>}

      <label>
        Handle
        <input
          type="text"
          id="handle"
          name="handle"
          value={form.data.handle}
          onInput={(e) => form.setData('handle', e.currentTarget.value)}
        />
      </label>
      {form.errors.handle && <span id="handle-error">{form.errors.handle}</span>}

      <button onClick={() => form.post('/form-helper/errors/clear-on-resubmit')} id="submit">
        Submit
      </button>

      <span class="errors-status">Form has {form.hasErrors ? '' : 'no '}errors</span>
    </div>
  )
}
