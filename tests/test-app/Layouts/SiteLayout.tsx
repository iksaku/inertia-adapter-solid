import { createSignal, createEffect, createUniqueId, type JSX } from 'solid-js'
import { usePage } from 'inertia-adapter-solid'
export default (props0: {
  children: JSX.Element
}) => {
  const [createdAt] = createSignal(Date.now())
  window._inertia_layout_id = createUniqueId()
  createEffect(() => (window._inertia_site_layout_props = usePage().props))
  return (
    <div>
      <span>Site Layout</span>
      <span>{createdAt()}</span>
      <div>{props0.children}</div>
    </div>
  )
}
