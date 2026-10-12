import { Deferred, usePage } from 'inertia-adapter-solid'
import Manual from './Manual'
import type { User } from './UserCard'
const Users = () => {
  const page = usePage<{ users: { data: User[] } }>()
  return <Manual users={page.props.users} />
}
export default function DeferredScroll() {
  return (
    <Deferred data="users" fallback={<div>Loading deferred scroll prop...</div>}>
      <Users />
    </Deferred>
  )
}
