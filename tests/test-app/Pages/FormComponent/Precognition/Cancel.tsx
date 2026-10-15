import { Form } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <h1>Precognition - Cancel Tests</h1>

      <h2>Auto Cancel Test</h2>
      <Form action="/precognition/default?slow=1" method="post" validationTimeout={100}>
        {(props1) => (
          <>
            <div>
              <input
                id="auto-cancel-name-input"
                name="name"
                placeholder="Name"
                onBlur={() => props1.validate('name')}
              />
              {props1.invalid('name') && <p class="error">{props1.errors!.name}</p>}
            </div>

            {props1.validating && <p class="validating">Validating...</p>}

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
