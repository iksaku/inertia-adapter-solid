import { Link } from 'inertia-adapter-solid'

export default function NoLayout() {
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
      Simple page without Persistent Layout
    </>
  )
}
