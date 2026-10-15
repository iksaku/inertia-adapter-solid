import { Form } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <h1>Reset On Error (Specific Fields) Test</h1>

      <Form method="post" action="/form-component/reset-on-error-fields" resetOnError={['name']}>
        {(props1) => (
          <>
            <div>
              <label for="name">Name</label>
              <input type="text" name="name" id="name" value="John Doe" />
              {props1.errors!.name && <p id="error_name">{props1.errors!.name}</p>}
            </div>

            <div>
              <label for="email">Email</label>
              <input type="email" name="email" id="email" value="john@doe.biz" />
              {props1.errors!.email && <p id="error_email">{props1.errors!.email}</p>}
            </div>

            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    </div>
  )
}
