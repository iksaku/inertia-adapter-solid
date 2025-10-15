import { Link } from 'inertia-adapter-solid'

export default function MainLayout(props) {
  return (
    <>
      <header>
        <nav>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/preserve-state">Preserve State</Link>
            </li>
            <li>
              <Link href="/use-remember">UseRemember</Link>
            </li>
            <li>
              <Link href="/use-form">UseForm</Link>
            </li>
            <li>
              <Link href="/when-visible">WhenVisible</Link>
            </li>
            <li>
              Props
              <ul>
                <li>
                  <Link href="/props/deferred">Deferred</Link>
                </li>
              </ul>
            </li>
            <li>
              Layouts
              <ul>
                <li>
                  <Link href="/layouts/no-layout">No-Layout</Link>
                </li>
                <li>
                  <Link href="/layouts/own-layout">Own-Layout</Link>
                </li>
                <li>
                  Distinct Persistent Layouts
                  <ul>
                    <li>
                      <Link href="/layouts/a">Page A</Link>
                    </li>
                    <li>
                      <Link href="/layouts/b">Page B</Link>
                    </li>
                  </ul>
                </li>
                <li>
                  Shared Persistent Layout
                  <ul>
                    <li>
                      <Link href="/layouts/c">Page C</Link>
                    </li>
                    <li>
                      <Link href="/layouts/d">Page D</Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </header>

      <hr />

      {props.children}
    </>
  )
}
