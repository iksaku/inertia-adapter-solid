import { useForm } from 'inertia-adapter-solid'
export default () => {
  const form = useForm({ name: 'foo', foo: [] as string[] })
  const submit = () => {
    form.post('')
  }
  const defaults = () => {
    form.defaults()
  }
  const dataAndDefaults = () => {
    pushValue()
    defaults()
  }
  const pushValue = () => {
    form.setData('foo', [...form.data.foo, 'bar'])
  }
  const submitAndSetDefaults = () => {
    form.post('/form-helper/dirty/redirect-back', {
      onSuccess: () => form.defaults(),
    })
  }
  const submitAndSetCustomDefaults = () => {
    form.post('/form-helper/dirty/redirect-back', {
      onSuccess: () => form.defaults({ name: 'Custom Default', foo: [] }),
    })
  }
  return (
    <div>
      <div>Form is {form.isDirty ? 'dirty' : 'clean'}</div>
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

      <button onClick={submit} class="submit">
        Submit form
      </button>

      <button onClick={defaults} class="defaults">
        Defaults
      </button>

      <button onClick={dataAndDefaults} class="data-and-defaults">
        Data and Defaults
      </button>

      <button onClick={pushValue}>Push Value</button>

      <button onClick={submitAndSetDefaults} class="submit-and-set-defaults">
        Submit and setDefaults
      </button>

      <button onClick={submitAndSetCustomDefaults} class="submit-and-set-custom-defaults">
        Submit and setDefaults custom
      </button>
    </div>
  )
}
