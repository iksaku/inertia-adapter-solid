import { Deferred, usePage } from 'inertia-adapter-solid'
const DeferredContent = () => {
  const reactiveProps0Page = usePage<{
      auth: {
        notifications?: string[]
        roles?: string[]
      }
    }>(),
    reactiveProps0 = () => reactiveProps0Page.props
  return (
    <>
      <p id="notifications">Notifications: {reactiveProps0().auth.notifications?.join(', ')}</p>
      <p id="roles">Roles: {reactiveProps0().auth.roles?.join(', ')}</p>
    </>
  )
}
export default (props1: {
  auth: {
    user?: {
      name: string
      email: string
    }
    token?: string
    notifications?: string[]
    roles?: string[]
  }
}) => {
  return (
    <>
      <p id="user">
        User: {props1.auth.user?.name} ({props1.auth.user?.email})
      </p>
      <p id="token">Token: {props1.auth.token}</p>

      <Deferred data={['auth.notifications', 'auth.roles']} fallback={<div id="loading">Loading...</div>}>
        <DeferredContent />
      </Deferred>
    </>
  )
}
