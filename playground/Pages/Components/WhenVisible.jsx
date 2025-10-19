import MainLayout from '@/Components/MainLayout'
import { WhenVisible } from 'inertia-adapter-solid'
import { For } from 'solid-js'

export default function WhenVisibleTest(props) {
  return (
    <>
      <ul>
        <For each={[...Array(20).keys()]}>{(item) => <li>{'↓'.repeat(item)}</li>}</For>
      </ul>
      <WhenVisible data={['messages', 'users']} always buffer={100} fallback={<div>Loading...</div>}>
        <>
          <div>
            <p>Messages</p>
            <ul>
              <For each={props.messages} fallback={<div>No messages</div>}>
                {(message) => <li>{message}</li>}
              </For>
            </ul>
          </div>

          <div>
            <p>Users</p>
            <ul>
              <For each={props.users} fallback={<div>No users</div>}>
                {(user) => <li>{user.name}</li>}
              </For>
            </ul>
          </div>
        </>
      </WhenVisible>
    </>
  )
}

WhenVisibleTest.layout = MainLayout
