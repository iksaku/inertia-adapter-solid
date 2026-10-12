import { Link, router } from 'inertia-adapter-solid'
import ManualAfter from './ManualAfter'
import type { User } from './UserCard'
export default function RememberState(props: { users: { data: User[] } }) {
  const prependUser = (id: number) => router.prependToProp('users.data', { id, name: `User ${id}` })
  return (
    <>
      <div style={{ 'margin-bottom': '40px', padding: '20px', 'border-top': '2px solid #ccc' }}>
        <div style={{ 'margin-bottom': '20px' }}>
          <button onClick={() => prependUser(0)} style={{ 'margin-right': '10px' }}>
            Prepend User '0'
          </button>
          <button onClick={() => prependUser(-1)} style={{ 'margin-right': '10px' }}>
            Prepend User '-1'
          </button>
        </div>
        <Link href="/home">Go Home</Link>
      </div>
      <ManualAfter users={props.users} />
      <div style={{ 'margin-top': '40px', padding: '20px', 'border-top': '2px solid #ccc' }}>
        <Link href="/home">Go to Home</Link>
      </div>
    </>
  )
}
