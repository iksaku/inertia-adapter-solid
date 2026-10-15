import { createSignal, For, Show } from 'solid-js'
import { Link, useRemember } from 'inertia-adapter-solid'
import Notes from '../Components/Notes'
const users = [
  { id: 1, name: 'User One' },
  { id: 2, name: 'User Two' },
  { id: 3, name: 'User Three' },
]
export default () => {
  const [selected, setSelected] = useRemember<number[]>([], 'Users/Selected')
  const [showNotes, setShowNotes] = createSignal(false)
  const toggle = (id: number) =>
    setSelected((ids) => (ids.includes(id) ? ids.filter((selectedId) => selectedId !== id) : [...ids, id]))
  return (
    <div>
      <nav>
        <Link href="/remember/tabs/users">Users</Link>
        <Link href="/remember/tabs/teams">Teams</Link>
        <a href="/non-inertia">Navigate off-site</a>
      </nav>

      <h1>Users</h1>
      <p id="selected">{selected().length} selected</p>

      {
        <For each={users}>
          {(user) => (
            <label>
              <input type="checkbox" checked={selected().includes(user.id)} onInput={() => toggle(user.id)} />
              {user.name}
            </label>
          )}
        </For>
      }

      <button onClick={() => setShowNotes(!showNotes())}>Toggle notes</button>
      <Show when={showNotes()}>{<Notes />}</Show>
    </div>
  )
}
