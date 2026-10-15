import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'
export default (props: { users: { data: { id: number; name: string }[] } }) => <div>
  <h1 data-testid="ssr-title">SSR Infinite Scroll</h1>
  <InfiniteScroll data="users" manual
    previous={(slot) => <p data-testid="has-previous">Has previous: {String(slot.hasMore)}</p>}
    next={(slot) => <p data-testid="has-next">Has next: {String(slot.hasMore)}</p>}>
    <For each={props.users.data}>{(user) => <div data-testid="user">{user.name}</div>}</For>
  </InfiniteScroll>
</div>
