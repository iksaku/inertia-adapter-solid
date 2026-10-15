import { Link } from 'inertia-adapter-solid'
import TriggerBoth from './TriggerBoth'
import type { User } from './UserCard'
export default function NavigateAway(props: { users: { data: User[] } }) {
  return (
    <div>
      <Link href="/article" id="leave">
        Leave to /article
      </Link>
      <Link href="/infinite-scroll/navigate-away/slow-article" id="leave-slowly">
        Leave slowly to /article
      </Link>
      <Link href="/infinite-scroll/navigate-away?order=desc" id="sort-slowly">
        Slowly sort descending
      </Link>
      <TriggerBoth users={props.users} />
    </div>
  )
}
