import { Deferred, usePage } from 'inertia-adapter-solid'
const Notifications = () => {
  const reactiveProps0Page = usePage<{
      auth: {
        notifications?: string[]
      }
    }>(),
    reactiveProps0 = () => reactiveProps0Page.props
  return <p id="notifications">Notifications: {reactiveProps0().auth.notifications?.join(', ')}</p>
}
export default () => {
  const reactiveProps1Page = usePage<{
      auth: {
        user?: string
        notifications?: string[]
      }
    }>(),
    reactiveProps1 = () => reactiveProps1Page.props
  return (
    <>
      <p id="user">User: {reactiveProps1().auth.user}</p>

      <Deferred data="auth.notifications" fallback={<div id="loading">Loading notifications...</div>}>
        <Notifications />
      </Deferred>
    </>
  )
}
