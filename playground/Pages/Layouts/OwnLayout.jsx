import { Link } from 'inertia-adapter-solid'

export default function OwnLayout() {
  return <div>This is a simple page with its own Persistent Layout</div>
}

function Layout(props) {
  return (
    <>
      <header>
        <nav>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
          </ul>
        </nav>
      </header>

      <hr />

      {props.children}
    </>
  )
}

OwnLayout.layout = Layout
