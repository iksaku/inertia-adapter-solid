import { Index } from 'solid-js'
import { Form } from 'inertia-adapter-solid'
interface Todo {
  id: number
  name: string
  done: boolean
}
export default (props1: {
  todos: Todo[]
}) => {
  return (
    <div>
      <h1>Form Component Optimistic</h1>

      <Form
        method="post"
        action="/form-component/optimistic"
        optimistic={(props, data) => ({
          todos: [
            ...((props.todos as Todo[]) || []),
            { id: Date.now(), name: (data.name as string) || '(empty todo...)', done: false },
          ],
        })}
        options={{ preserveScroll: true }}
      >
        {(props2) => (
          <>
            <input id="name-input" type="text" name="name" />
            <button id="submit-btn" type="submit" disabled={props2.processing}>
              Add Todo
            </button>
          </>
        )}
      </Form>

      <ul id="todo-list">
        {
          <Index each={props1.todos!}>
            {(todo) => (
              <li class="todo-item">
                <span>{todo()!.name}</span>
              </li>
            )}
          </Index>
        }
      </ul>

      <div id="todo-count">Count: {props1.todos!.length}</div>
    </div>
  )
}
