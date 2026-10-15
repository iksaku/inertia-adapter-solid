import { createSignal } from 'solid-js'
import { Form } from 'inertia-adapter-solid'
export default () => {
  const [validateFilesEnabled, setValidateFilesEnabled] = createSignal(false)
  return (
    <div>
      <h1>Form Precognition Files</h1>

      <Form action="/precognition/files" method="post" validationTimeout={100} validateFiles={validateFilesEnabled()}>
        {(props1) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => props1.validate('name')} />
              {props1.invalid('name') && <p>{props1.errors!.name}</p>}
              {props1.valid('name') && <p>Name is valid!</p>}
            </div>

            <div>
              <input type="file" name="avatar" id="avatar" />
              {props1.invalid('avatar') && <p>{props1.errors!.avatar}</p>}
              {props1.valid('avatar') && <p>Avatar is valid!</p>}
            </div>

            {props1.validating && <p>Validating...</p>}

            <button type="button" onClick={() => setValidateFilesEnabled(!validateFilesEnabled())}>
              Toggle Validate Files ({validateFilesEnabled() ? 'enabled' : 'disabled'})
            </button>

            <button type="button" onClick={() => props1.validate({ only: ['name', 'avatar'] })}>
              Validate Both
            </button>
          </>
        )}
      </Form>
    </div>
  )
}
