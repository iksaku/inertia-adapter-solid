import { Form } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <h1>OnSubmitComplete Defaults Test</h1>

      <Form method="post" onSubmitComplete={(props) => props.defaults()}>
        {(props1) => (
          <>
            <div>
              <p id="dirty-status">{props1.isDirty ? 'Form is dirty' : 'Form is clean'}</p>
            </div>

            <div>
              <input type="text" name="name" id="name" placeholder="Name" value="John Doe" />
              {props1.errors!.name && <p id="error_name">{props1.errors!.name}</p>}
            </div>

            <div>
              <input type="email" name="email" id="email" placeholder="Email" value="john@doe.biz" />
              {props1.errors!.email && <p id="error_email">{props1.errors!.email}</p>}
            </div>

            <div>
              <button type="submit">Submit</button>
            </div>
          </>
        )}
      </Form>
    </div>
  )
}
