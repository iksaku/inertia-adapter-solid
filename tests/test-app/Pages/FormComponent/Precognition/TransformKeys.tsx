import { Form } from 'inertia-adapter-solid'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformData = (data: Record<string, any>) => {
  const document = data.document || {}
  return document
}
export default () => {
  return (
    <div>
      <h1>Form Precognition Transform Keys</h1>

      <Form action="/precognition/transform-keys" method="post" validationTimeout={100} transform={transformData}>
        {(props1) => (
          <>
            <div>
              <input
                id="email-input"
                name="document[customer][email]"
                placeholder="Email"
                onBlur={() => props1.validate('customer.email')}
              />
              {props1.invalid('customer.email') && <p>{props1.errors['customer.email']}</p>}
              {props1.valid('customer.email') && <p>Email is valid!</p>}
            </div>

            {props1.validating && <p>Validating...</p>}
          </>
        )}
      </Form>
    </div>
  )
}
