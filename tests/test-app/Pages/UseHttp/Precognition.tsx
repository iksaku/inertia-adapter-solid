import { useHttp } from 'inertia-adapter-solid'
import { createSignal } from 'solid-js'

export default () => {
  const form = useHttp({ name: '' }).withPrecognition('post', '/precognition/default').setValidationTimeout(50)
  const [configuration, setConfiguration] = createSignal('initial')

  return (
    <main>
      <h1>useHttp Precognition</h1>
      <label for="precognition-name">Name</label>
      <input
        id="precognition-name"
        name="name"
        value={form.data.name}
        onInput={(event) => form.setData('name', event.currentTarget.value)}
      />
      <button type="button" onClick={() => form.validate('name')}>
        Validate name
      </button>
      <button
        type="button"
        onClick={() => {
          const configured = form.withPrecognition('post', '/precognition/default')
          setConfiguration(configured === form ? 'same form' : 'different form')
        }}
      >
        Reconfigure Precognition
      </button>
      <p>
        Validating: <output id="precognition-validating">{String(form.validating)}</output>
      </p>
      <p>
        Name invalid: <output id="precognition-invalid">{String(form.invalid('name'))}</output>
      </p>
      <p>
        Name valid: <output id="precognition-valid">{String(form.valid('name'))}</output>
      </p>
      <p>
        Error: <output id="precognition-error">{form.errors.name ?? ''}</output>
      </p>
      <p>
        Configuration: <output id="precognition-configuration">{configuration()}</output>
      </p>
    </main>
  )
}
