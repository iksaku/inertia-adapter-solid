import { Form } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <h1>Precognition Error Sync Test</h1>

      <Form action="/precognition/error-sync" method="post" validationTimeout={100}>
        {(props1) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => props1.validate('name')} />
              {props1.invalid('name') && <p id="name-error">{props1.errors!.name}</p>}
            </div>

            <div>
              <input name="email" placeholder="Email" onBlur={() => props1.validate('email')} />
              {props1.invalid('email') && <p id="email-error">{props1.errors!.email}</p>}
            </div>

            {props1.validating && <p id="validating">Validating...</p>}

            <button type="submit" id="submit-btn">
              Submit
            </button>
          </>
        )}
      </Form>
    </div>
  )
}
