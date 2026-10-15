import { Form } from 'inertia-adapter-solid'

// The Solid Form callback receives Record<string, FormDataConvertible>, not
// the generic React field shape. Narrow values at the consumer boundary.
export default () => (
  <div>
    <Form
      action="/users"
      method="post"
      optimistic={(props, data) => ({
        ...props,
        user: {
          name: typeof data.name === 'string' ? data.name : '',
          email: typeof data.email === 'string' ? data.email : '',
        },
      })}
      transform={(data) => ({
        name: typeof data.name === 'string' ? data.name : '',
        email: typeof data.email === 'string' ? data.email : '',
      })}
    >
      <input name="name" />
      <input name="email" />
      <button type="submit">Submit</button>
    </Form>
    <Form
      action="/users"
      method="post"
      optimistic={(_props, data) => {
        console.log(data.anything)
      }}
    >
      <button type="submit">Submit</button>
    </Form>
  </div>
)
