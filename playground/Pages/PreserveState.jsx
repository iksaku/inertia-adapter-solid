import MainLayout from '@/Components/MainLayout'
import { Link, usePage } from 'inertia-adapter-solid'
import { Show, createMemo, createSignal } from 'solid-js'

export default function PreserveState(props) {
  const rand = Math.random()

  const [search, setSearch] = createSignal('')

  const page = usePage()
  const queryString = createMemo(() => new URL(page.url, window.location.origin).search)

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
            GET Links: Sends data as query string in request url
            <ul>
              <li>
                <Link href="/preserve-state" data={{ search: search() }}>
                  [GET] Default Behaviour (preserves state)
                </Link>
              </li>
              <li>
                <Link href="/preserve-state" data={{ search: search() }} preserveState={false}>
                  [GET] Without Preserve State (re-renders component)
                </Link>
              </li>
            </ul>
          </li>
          <li>
            POST Links: Sends data as JSON in request body
            <ul>
              <li>
                <Link href="/preserve-state" method="post" data={{ search: search() }}>
                  Default Behaviour (does not preserve state, aka re-render component)
                </Link>
              </li>
              <li>
                <Link href="/preserve-state" method="PoSt" data={{ search: search() }} preserveState>
                  With Preserve State
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <Show when={queryString().trim() !== ''}>
        <div>
          Current query string data:
          <br />
          {queryString()}
        </div>
      </Show>
      <Show when={props.data?.search}>
        <div>
          Last request query data:
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
