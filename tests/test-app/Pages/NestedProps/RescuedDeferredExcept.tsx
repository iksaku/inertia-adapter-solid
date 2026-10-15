import { Deferred, router, usePage } from 'inertia-adapter-solid'
export default () => {
  const reactiveProps0Page = usePage<{
      auth: {
        user?: string
        token?: string
        notifications?: string[]
      }
      status: string
    }>(),
    reactiveProps0 = () => reactiveProps0Page.props
  return (
    <>
      <p id="user">User: {reactiveProps0().auth.user}</p>
      <p id="token">Token: {reactiveProps0().auth.token}</p>
      <p id="status">Status: {reactiveProps0().status}</p>

      <Deferred
        data="auth.notifications"
        fallback={<div id="loading">Loading notifications...</div>}
        rescue={
          <button
            id="reload-except"
            onClick={() => router.reload({ except: ['auth.notifications'], headers: { 'X-Test-Retry': 'true' } })}
          >
            Reload without notifications
          </button>
        }
      >
        <p id="notifications">Notifications: {reactiveProps0().auth.notifications?.join(', ')}</p>
      </Deferred>
    </>
  )
}
