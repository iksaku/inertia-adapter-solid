import { Form } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <h1>Form Precognition - All Errors</h1>

      <Form action="/precognition/with-all-errors" method="post" validationTimeout={100} withAllErrors>
        {(props1) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => props1.validate('name')} />
              {props1.invalid('name') && (
                <div>
                  {Array.isArray(props1.errors!.name) ? (
                    props1.errors!.name.map((error, index) => <p id={`name-error-${index}`}>{error}</p>)
                  ) : (
                    <p id="name-error-0">{props1.errors!.name}</p>
                  )}
                </div>
              )}
              {props1.valid('name') && <p>Name is valid!</p>}
            </div>

            <div>
              <input name="email" placeholder="Email" onBlur={() => props1.validate('email')} />
              {props1.invalid('email') && (
                <div>
                  {Array.isArray(props1.errors!.email) ? (
                    props1.errors!.email.map((error, index) => <p id={`email-error-${index}`}>{error}</p>)
                  ) : (
                    <p id="email-error-0">{props1.errors!.email}</p>
                  )}
                </div>
              )}
              {props1.valid('email') && <p>Email is valid!</p>}
            </div>

            {props1.validating && <p>Validating...</p>}
          </>
        )}
      </Form>
    </div>
  )
}
