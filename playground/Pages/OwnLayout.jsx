import { Link } from 'inertia-adapter-solid'

export default function OwnLayout() {
  return 'This is a simple page with its own Persistent Layout'
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
      {props.children}
    </>
  )
}

OwnLayout.layout = Layout
