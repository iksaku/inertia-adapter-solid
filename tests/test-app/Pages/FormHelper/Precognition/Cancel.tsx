import { useForm } from 'inertia-adapter-solid'
export default () => {
  const form = useForm({
    name: '',
  })
    .withPrecognition('post', '/precognition/default?slow=1')
    .setValidationTimeout(100)
  return (
    <div>
      <div>
        <input
          id="auto-cancel-name-input"
          value={form.data.name}
          name="name"
          placeholder="Name"
          onInput={(e) => form.setData('name', e.currentTarget.value)}
          onBlur={() => form.validate('name')}
        />
        {form.invalid('name') && <p>{form.errors.name}</p>}
        {form.valid('name') && <p>Name is valid!</p>}
      </div>

      {form.validating && <p>Validating...</p>}
    </div>
  )
}
