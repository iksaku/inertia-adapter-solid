import MainLayout from '@/Components/MainLayout'
import { For } from 'solid-js'
import { InfiniteScroll } from '../../../src'

export default function InfiniteScrollTest(props) {
  return (
    <InfiniteScroll data="users" reverse previous={() => 'Previous'} next={() => 'Next'}>
      <ul>
        <For each={props.users.data}>{(user) => <li>User #{user.id}</li>}</For>
      </ul>
    </InfiniteScroll>
  )
}

InfiniteScrollTest.layout = MainLayout
