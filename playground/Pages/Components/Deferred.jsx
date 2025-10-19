import MainLayout from '@/Components/MainLayout'
import { Deferred } from 'inertia-adapter-solid'
import { For, Show } from 'solid-js'

export default function DeferredTest(props) {
  return (
    <>
      <div>
        <h3>Inertia's &lt;Deferred /&gt; component</h3>
        <Deferred data={['messages', 'users']} fallback={<p>Loading "deferred" users and messages...</p>}>
          <ul>
            <For each={props.messages}>{(message) => <li>{message}</li>}</For>
            <For each={props.users}>{(user) => <li>{user.name}</li>}</For>
          </ul>
        </Deferred>
      </div>

      <div>
        <h3>Compatibility with &lt;Show /&gt; component</h3>
        <Show when={props.users} fallback={<p>Loading "deferred" users...</p>}>
          <ul>
            <For each={props.users}>{(user) => <li>{user.name}</li>}</For>
          </ul>
        </Show>
      </div>
    </>
  )
}

DeferredTest.layout = MainLayout
