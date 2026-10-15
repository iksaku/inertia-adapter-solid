import { Form } from 'inertia-adapter-solid'
export default function PrecognitionHeaders() {
  return (
    <div>
      <h1>Precognition - Custom Headers</h1>

      <Form
        action="/precognition/headers"
        method="post"
        headers={{ 'X-Custom-Header': 'custom-value' }}
        validationTimeout={100}
      >
        {(props1) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => props1.validate('name')} />
              {props1.invalid('name') && <p>{props1.errors!.name}</p>}
            </div>

            {props1.validating && <p>Validating...</p>}

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
