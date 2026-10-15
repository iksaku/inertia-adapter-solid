import { router } from 'inertia-adapter-solid'
export default (props0: {
  auth: {
    user: {
      name: string
      email: string
      permissions?: string[]
    }
  }
}) => {
  return (
    <>
      <p id="name">Name: {props0.auth.user.name}</p>
      <p id="email">Email: {props0.auth.user.email}</p>
      <p id="permissions">Permissions: {props0.auth.user.permissions?.join(', ')}</p>
      <button onClick={() => router.reload({ only: ['auth.user.permissions'] })}>Reload Permissions</button>
    </>
  )
}
