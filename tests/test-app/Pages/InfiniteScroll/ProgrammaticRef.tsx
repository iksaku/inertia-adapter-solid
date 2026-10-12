import type { InfiniteScrollRef } from '@inertiajs/core'
import { InfiniteScroll } from 'inertia-adapter-solid'
import { For, createSignal } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function ProgrammaticRef(props: { users: { data: User[] } }) {
  let infRef: InfiniteScrollRef | undefined
  const [hasPrevious, setHasPrevious] = createSignal(false)
  const [hasNext, setHasNext] = createSignal(false)
  const updateStates = () => {
    setHasPrevious(infRef?.hasPrevious() || false)
    setHasNext(infRef?.hasNext() || false)
  }
  return (
    <div>
      <h1>Programmatic Ref Test</h1>
      <div style={{ 'margin-bottom': '20px' }}>
        <p>Has more previous items: {hasPrevious().toString()}</p>
        <p>Has more next items: {hasNext().toString()}</p>
        <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
          <button onClick={() => infRef?.fetchPrevious({ onFinish: updateStates })}>Load Previous (Ref)</button>
          <button onClick={() => infRef?.fetchNext({ onFinish: updateStates })}>Load Next (Ref)</button>
        </div>
      </div>
      {/* @ts-expect-error The adapter's reactive accessor return type is not JSX-typed. */}
      <InfiniteScroll
        ref={(value) => {
          infRef = value
          updateStates()
        }}
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        manual
        loading={() => <div style={{ 'text-align': 'center', padding: '20px' }}>Loading...</div>}
      >
        <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
      </InfiniteScroll>
      <p>Total items on page: {props.users.data.length}</p>
    </div>
  )
}
