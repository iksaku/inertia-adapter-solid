import { createSignal, createEffect } from 'solid-js'
import * as adapter from 'inertia-adapter-solid'
import { Link } from 'inertia-adapter-solid'
import AppLayout from '../../Layouts/AppLayout'
const Basic = () => {
  const [sidebarVisible, setSidebarVisible] = createSignal(true)
  createEffect(() =>
    adapter.setLayoutProps({
      showSidebar: sidebarVisible(),
    }),
  )
  return (
    <div>
      <h2>Basic Layout Props Page</h2>
      <p>This page demonstrates setting layout props dynamically.</p>

      <div>
        <button type="button" onClick={() => setSidebarVisible(!sidebarVisible())}>
          Toggle Sidebar
        </button>
        <span>Sidebar: {sidebarVisible() ? 'visible' : 'hidden'}</span>
      </div>

      <div>
        <button type="button" onClick={() => adapter.setLayoutProps({ title: 'Updated Title' })}>
          Update Title
        </button>
      </div>

      <nav>
        <Link href="/layout-props/navigate">Go to Navigate Page</Link>
      </nav>
    </div>
  )
}
Basic.layout = [AppLayout, { title: 'Basic Layout Props', showSidebar: true }]
export default Basic
