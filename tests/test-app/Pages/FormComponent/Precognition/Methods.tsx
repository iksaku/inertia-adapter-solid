import { Form } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <h1>Form Precognition - Touch, Reset & Validate</h1>

      <Form action="/precognition/default" method="post" validationTimeout={100}>
        {(props1) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => props1.touch('name')} />
              {props1.invalid('name') && <p>{props1.errors!.name}</p>}
            </div>

            <div>
              <input name="email" placeholder="Email" onBlur={() => props1.touch('email')} />
              {props1.invalid('email') && <p>{props1.errors!.email}</p>}
            </div>

            {props1.validating && <p>Validating...</p>}

            <p id="name-touched">{props1.touched('name') ? 'Name is touched' : 'Name is not touched'}</p>
            <p id="email-touched">{props1.touched('email') ? 'Email is touched' : 'Email is not touched'}</p>
            <p id="any-touched">{props1.touched() ? 'Form has touched fields' : 'Form has no touched fields'}</p>

            <button type="button" onClick={() => props1.validate()}>
              Validate All Touched
            </button>
            <button type="button" onClick={() => props1.validate('name')}>
              Validate Name
            </button>
            <button type="button" onClick={() => props1.validate({ only: ['name', 'email'] })}>
              Validate Name and Email
            </button>
            <button type="button" onClick={() => props1.touch('name', 'email')}>
              Touch Name and Email
            </button>
            <button
              type="button"
              onClick={() => {
                props1.touch('name')
                props1.touch('name')
              }}
            >
              Touch Name Twice
            </button>
            <button type="button" onClick={() => props1.reset()}>
              Reset All
            </button>
            <button type="button" onClick={() => props1.reset('name')}>
              Reset Name
            </button>
            <button type="button" onClick={() => props1.reset('name', 'email')}>
              Reset Name and Email
            </button>
          </>
        )}
      </Form>
    </div>
  )
}
