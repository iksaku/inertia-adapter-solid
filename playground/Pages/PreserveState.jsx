import MainLayout from '@/Components/MainLayout'
import { Link } from 'inertia-adapter-solid'
import { Show, createSignal } from 'solid-js'

export default function PreserveState(props) {
  const rand = Math.random()

  const [search, setSearch] = createSignal('')

  return (
    <>
      <div>Test for Preserve State: {rand}</div>
      <div>
        <input
          type="text"
          placeholder="Search something..."
          value={search()}
          onInput={(e) => setSearch(e.target.value)}
        />
        <ul>
          <li>
            <Link href="/preserve-state" method="post" data={{ search: search() }} preserveState={false}>
              Default Search
            </Link>
          </li>
          <li>
            <Link href="/preserve-state" method="PoSt" data={{ search: search() }} preserveState>
              Search with Preserve State
            </Link>
          </li>
        </ul>
      </div>
      <Show when={props.data?.search}>
        <div>
          Your most recent search query is:
          <br />
          {props.data.search}
        </div>
      </Show>
    </>
  )
}

function Layout(props) {
  const rand = Math.random()

  return (
    <ul>
      <li>
        Persistent Layout: {rand}
        <ul>
          <li>{props.children}</li>
        </ul>
      </li>
    </ul>
  )
}

PreserveState.layout = [MainLayout, Layout]
