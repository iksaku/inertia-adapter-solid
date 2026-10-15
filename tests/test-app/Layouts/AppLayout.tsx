import { createUniqueId, mergeProps, Show, type JSX } from 'solid-js'
export default function AppLayout(props0Input: {
  title?: string
  showSidebar?: boolean
  theme?: string
  formatTitle?: (name: string) => string
  children: JSX.Element
}) {
  const props0 = mergeProps({ title: 'Default Title', showSidebar: true, theme: 'light' }, props0Input)
  const layoutId = createUniqueId()
  window._inertia_app_layout_id = layoutId
  return (
    <div data-theme={props0.theme} class="app-layout">
      <header>
        <h1 class="app-title">{props0.formatTitle ? props0.formatTitle('User') : props0.title}</h1>
      </header>
      <div class="app-content">
        <Show when={props0.showSidebar}>
          {
            <aside class="sidebar">
              <span>Sidebar</span>
            </aside>
          }
        </Show>
        <main>{props0.children}</main>
      </div>
    </div>
  )
}
