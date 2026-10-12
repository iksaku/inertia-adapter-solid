import { Form } from 'inertia-adapter-solid'
import ChildComponent from './ChildComponent'
export default () => (
  <>
    <Form action="/dump/post" method="post">
      {(props1) => (
        <>
          <div>
            <span>Form 1 Parent: {props1.isDirty ? 'dirty' : 'clean'}</span>
            {props1.errors!.name && <span> | Error: {props1.errors!.name}</span>}
          </div>
          <input type="text" name="name" value="Form 1 Name" />
          <ChildComponent formId="form1" />
        </>
      )}
    </Form>

    <Form action="/dump/post" method="post">
      {(props2) => (
        <>
          <div>
            <span>Form 2 Parent: {props2.isDirty ? 'dirty' : 'clean'}</span>
            {props2.errors!.name && <span> | Error: {props2.errors!.name}</span>}
          </div>
          <input type="text" name="name" value="Form 2 Name" />
          <ChildComponent formId="form2" />
        </>
      )}
    </Form>
  </>
)
