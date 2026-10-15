import { router } from 'inertia-adapter-solid'
export default (props0: {
  auth: {
    user: string
    token?: string
    sessionId?: string
  }
}) => {
  return (
    <>
      <p id="user">User: {props0.auth.user}</p>
      <p id="token">Token: {props0.auth.token}</p>
      <p id="session-id">Session: {props0.auth.sessionId}</p>
      <button onClick={() => router.reload({ except: ['auth.token'] })}>Reload Without Token</button>
      <button onClick={() => router.reload({ except: ['auth.token', 'auth.sessionId'] })}>
        Reload Without Token and Session
      </button>
    </>
  )
}
