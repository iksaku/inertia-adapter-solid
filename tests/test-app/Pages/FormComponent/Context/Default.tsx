import { Form } from 'inertia-adapter-solid'
import ChildComponent from './ChildComponent'
import NestedComponent from './NestedComponent'
import OutsideFormComponent from './OutsideFormComponent'
export default () => (
  <>
    <Form action="/dump/post" method="post">
      {(props1) => (
        <>
          <div>
            <span>Parent: Form is {props1.isDirty ? 'dirty' : 'clean'}</span>
            {props1.hasErrors && <span> | Parent: Form has errors</span>}
            {props1.errors!.name && <span> | {props1.errors!.name}</span>}
          </div>

          <input type="text" name="name" value="John Doe" />
          <input type="email" name="email" value="john@example.com" />

          <ChildComponent />
          <NestedComponent />
        </>
      )}
    </Form>

    <OutsideFormComponent />
  </>
)
