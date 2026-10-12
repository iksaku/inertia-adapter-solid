import { Form } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <h1>Form Precognition Transform</h1>

      <Form
        action="/precognition/default"
        method="post"
        validationTimeout={100}
        transform={(data) => ({ name: String(data.name || '').repeat(2) })}
      >
        {(props1) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => props1.validate('name')} />
              {props1.invalid('name') && <p>{props1.errors!.name}</p>}
              {props1.valid('name') && <p>Name is valid!</p>}
            </div>

            {props1.validating && <p>Validating...</p>}
          </>
        )}
      </Form>
    </div>
  )
}
