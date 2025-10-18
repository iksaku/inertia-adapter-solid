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
              Components
              <ul>
                <li>
                  <Link href="/components/deferred">Deferred</Link>
                </li>
                <li>
                  <Link href="/components/infinite-scroll">InfiniteScroll</Link>
                </li>
                <li>
                  <Link href="/components/when-visible">WhenVisible</Link>
                </li>
              </ul>
            </li>
            <li>
              Utilities
              <ul>
                <li>
                  <Link href="/utilities/use-form">UseForm</Link>
                </li>
                <li>
                  <Link href="/utilities/use-poll">UsePoll</Link>
                </li>
                <li>
                  <Link href="/utilities/use-prefetch">UsePrefetch</Link>
                </li>
                <li>
                  <Link href="/utilities/use-remember">UseRemember</Link>
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
