import { Link } from 'inertia-adapter-solid'
import TriggerBoth from './TriggerBoth'
import type { User } from './UserCard'
export default function WithLink(props: { users: { data: User[] } }) {
  return (
    <div>
      <Link href="/infinite-scroll">Go back to Links</Link>
      <TriggerBoth users={props.users} />
    </div>
  )
}
