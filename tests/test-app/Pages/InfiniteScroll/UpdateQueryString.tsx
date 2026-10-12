import { usePage } from 'inertia-adapter-solid'
import TriggerBoth from './TriggerBoth'
import type { User } from './UserCard'
export default function UpdateQueryString(props: { users: { data: User[] } }) {
  const page = usePage()
  window.testing = {
    ...window.testing,
    get pageUrl() {
      return page.url
    },
  }
  return <TriggerBoth users={props.users} />
}
