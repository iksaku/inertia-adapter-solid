import { Link, useForm } from 'inertia-adapter-solid'
export default () => {
  const form = useForm('password-form', {
    username: '',
    password: '',
  }).dontRemember('password')
  return (
    <div>
      <label>
        Username
        <input
          type="text"
          id="username"
          value={form.data.username}
          onInput={(e) => form.setData('username', e.target.value)}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          id="password"
          value={form.data.password}
          onInput={(e) => form.setData('password', e.target.value)}
        />
      </label>

      <Link href="/dump/get" class="link">
        Navigate away
      </Link>
    </div>
  )
}
