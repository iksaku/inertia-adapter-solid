import { Link } from 'inertia-adapter-solid'
export default () => {
  return (
    <div>
      <nav>
        <Link href="/remember/tabs/users">Users</Link>
        <Link href="/remember/tabs/teams">Teams</Link>
      </nav>

      <h1>Teams</h1>
    </div>
  )
}
