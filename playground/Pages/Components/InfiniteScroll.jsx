import MainLayout from '@/Components/MainLayout'
import { InfiniteScroll } from 'inertia-adapter-solid'
import { For } from 'solid-js'

export default function InfiniteScrollTest(props) {
  return (
    <InfiniteScroll data="users">
      {/*<header id="top">Top</header>*/}

      <ul id="items">
        <For each={props.users.data}>{(user) => <li>User #{user.id}</li>}</For>
      </ul>

      {/*<footer id="bottom">Bottom</footer>*/}
    </InfiniteScroll>
  )
}

InfiniteScrollTest.layout = MainLayout
