import { Form } from 'inertia-adapter-solid'
import MethodsTestComponent from './MethodsTestComponent'
export default () => (
  <Form action="/form-component/context/methods" method="post">
    {(props1) => (
      <>
        {Object.keys(props1.errors).length > 0 && <pre>{JSON.stringify(props1.errors, null, 2)}</pre>}

        <input type="text" name="name" value="Initial Name" />
        <input type="email" name="email" value="initial@example.com" />
        <textarea name="bio">Initial bio</textarea>

        <MethodsTestComponent />
      </>
    )}
  </Form>
)
