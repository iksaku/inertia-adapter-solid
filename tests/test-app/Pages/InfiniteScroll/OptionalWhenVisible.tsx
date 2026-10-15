import { usePage, WhenVisible } from 'inertia-adapter-solid'
import Manual from './Manual'
import type { User } from './UserCard'
const Users = () => {
  const page = usePage<{ users: { data: User[] } }>()
  return <Manual users={page.props.users} />
}
export default function Optional(props: { users?: { data: User[] } }) {
  return (
    <div>
      <h1>Optional Scroll Prop + WhenVisible</h1>
      <div id="initial-state">Users prop present: {(!!props.users).toString()}</div>
      <div style={{ 'margin-top': '2000px' }}>
        <WhenVisible data="users" fallback={<div>Loading optional scroll prop...</div>}>
          <Users />
        </WhenVisible>
      </div>
    </div>
  )
}
