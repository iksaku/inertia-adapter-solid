import { Index } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
interface User {
  id: number
  name: string
  email: string
}
export default (props1: {
  users: User[]
}) => {
  return (
    <div>
      <h1>Users Index</h1>
      <ul>
        {
          <Index each={props1.users!}>
            {(user) => (
              <li>
                <Link href={`/remember/users/${user()!.id}/edit`}>Edit {user()!.name}</Link>
              </li>
            )}
          </Index>
        }
      </ul>
    </div>
  )
}
