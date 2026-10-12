import { Deferred, usePage } from 'inertia-adapter-solid'

export default function TabDuplication() {
  const page = usePage<{ message?: string }>()
  return (
    <Deferred data="message" fallback={<div id="fallback">Loading message...</div>}>
      <div id="message">{page.props.message}</div>
    </Deferred>
  )
}
