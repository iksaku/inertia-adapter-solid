import { Form } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <h1>Form Empty Action Test</h1>

      <Form method="post">
        {(props1) => (
          <>
            <div>
              <input type="text" name="name" placeholder="Name" value="John Doe" />
              {props1.errors!.name && <p id="error_name">{props1.errors!.name}</p>}
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
