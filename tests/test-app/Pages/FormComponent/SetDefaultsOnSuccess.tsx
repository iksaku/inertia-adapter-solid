import { Form } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <h1>Set Defaults On Success Test</h1>

      <Form method="post" action="/form-component/set-defaults-on-success" setDefaultsOnSuccess>
        {(props1) => (
          <>
            <p id="dirty-status">{props1.isDirty ? 'Form is dirty' : 'Form is clean'}</p>

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
