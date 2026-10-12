import { createUniqueId, mergeProps, type JSX } from 'solid-js'
export default function ContentLayout(props0Input: {
  padding?: string
  maxWidth?: string
  children: JSX.Element
}) {
  const props0 = mergeProps({ padding: 'md', maxWidth: 'lg' }, props0Input)
  const layoutId = createUniqueId()
  window._inertia_content_layout_id = layoutId
  return (
    <div class="content-layout" data-padding={props0.padding} data-max-width={props0.maxWidth}>
      <div class="content-wrapper">{props0.children}</div>
    </div>
  )
}
