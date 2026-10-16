import { type ParentProps, mergeProps } from 'solid-js'

export default function Layout(props: ParentProps<{ title?: string }>) {
  const resolved = mergeProps({ title: 'Default Title' }, props)
  return <div><h2 data-testid="layout-title">{resolved.title}</h2>{resolved.children}</div>
}
