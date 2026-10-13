import { InfiniteScroll, router } from 'inertia-adapter-solid'
import { For } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function Reload(props: { users: { data: User[] }; time: number }) {
  return (
    <div>
      <div>
        <button onClick={() => router.reload({ only: ['time'] })} id="reload-button">
          Reload Time
        </button>
        <span id="time-display"> Current time: {props.time}</span>
      </div>
      <InfiniteScroll data="users">
        <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
      </InfiniteScroll>
    </div>
  )
}
