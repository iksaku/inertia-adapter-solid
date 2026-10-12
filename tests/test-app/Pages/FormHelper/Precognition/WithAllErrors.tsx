import { useForm } from 'inertia-adapter-solid'
import { For } from 'solid-js'
export default () => {
  const form = useForm({
    name: '',
    email: '',
  })
    .withPrecognition('post', '/precognition/with-all-errors')
    .setValidationTimeout(100)
    .withAllErrors()
  return (
    <div>
      <div>
        <input
          value={form.data.name}
          name="name"
          placeholder="Name"
          onInput={(e) => form.setData('name', e.currentTarget.value)}
          onBlur={() => form.validate('name')}
        />
        {form.invalid('name') && (
          <div>
            {Array.isArray(form.errors.name) ? (
              <For each={form.errors.name}>{(error, index) => <p id={`name-error-${index()}`}>{error}</p>}</For>
            ) : (
              <p id="name-error-0">{form.errors.name}</p>
            )}
          </div>
        )}
        {form.valid('name') && <p>Name is valid!</p>}
      </div>

      <div>
        <input
          value={form.data.email}
          name="email"
          placeholder="Email"
          onInput={(e) => form.setData('email', e.currentTarget.value)}
          onBlur={() => form.validate('email')}
        />
        {form.invalid('email') && (
          <div>
            {Array.isArray(form.errors.email) ? (
              <For each={form.errors.email}>{(error, index) => <p id={`email-error-${index()}`}>{error}</p>}</For>
            ) : (
              <p id="email-error-0">{form.errors.email}</p>
            )}
          </div>
        )}
        {form.valid('email') && <p>Email is valid!</p>}
      </div>

      {form.validating && <p>Validating...</p>}
    </div>
  )
}
