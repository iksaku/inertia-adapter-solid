import { InfiniteScroll } from 'inertia-adapter-solid'
import { For, createSignal } from 'solid-js'
import UserCard, { type User } from './UserCard'
export default function Toggles(props: { users: { data: User[] } }) {
  const [manual, setManual] = createSignal(false)
  const [preserveUrl, setPreserveUrl] = createSignal(false)
  const [triggerMode, setTriggerMode] = createSignal<'onlyPrevious' | 'onlyNext' | 'both'>('onlyNext')
  return (
    <div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <p>
          <label>
            <input type="checkbox" checked={manual()} onChange={(e) => setManual(e.currentTarget.checked)} />
            Manual mode: {manual().toString()}
          </label>
        </p>
        <p>
          <label>
            <input type="checkbox" checked={preserveUrl()} onChange={(e) => setPreserveUrl(e.currentTarget.checked)} />
            Preserve URL: {preserveUrl().toString()}
          </label>
        </p>
        <p>
          <label>
            Trigger mode: {triggerMode()}
            <select
              value={triggerMode()}
              onChange={(e) => setTriggerMode(e.currentTarget.value as 'onlyPrevious' | 'onlyNext' | 'both')}
            >
              <option value="onlyPrevious">onlyPrevious</option>
              <option value="onlyNext">onlyNext</option>
              <option value="both">both</option>
            </select>
          </label>
        </p>
      </div>
      {/* @ts-expect-error The adapter's reactive accessor return type is not JSX-typed. */}
      <InfiniteScroll
        data="users"
        style={{ display: 'grid', gap: '20px' }}
        manual={manual()}
        preserveUrl={preserveUrl()}
        onlyNext={triggerMode() === 'onlyNext'}
        onlyPrevious={triggerMode() === 'onlyPrevious'}
        loading={() => <div style={{ 'text-align': 'center', padding: '20px' }}>Loading...</div>}
      >
        <For each={props.users.data}>{(user) => <UserCard user={user} />}</For>
      </InfiniteScroll>
      <p>Total items on page: {props.users.data.length}</p>
    </div>
  )
}
