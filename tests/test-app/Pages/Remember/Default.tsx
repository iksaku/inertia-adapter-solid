import { createSignal } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
export default () => {
  const [name, setName] = createSignal('')
  const [remember, setRemember] = createSignal(false)
  const [untracked, setUntracked] = createSignal('')
  return (
    <div>
      <label>
        Full Name
        <input type="text" id="name" name="full_name" value={name()} onInput={(e) => setName(e.target.value)} />
      </label>
      <label>
        Remember Me
        <input
          type="checkbox"
          id="remember"
          name="remember"
          checked={remember()}
          onInput={(e) => setRemember(e.target.checked)}
        />
      </label>
      <label>
        Untracked
        <input
          type="text"
          id="untracked"
          name="untracked"
          value={untracked()}
          onInput={(e) => setUntracked(e.target.value)}
        />
      </label>

      <Link href="/dump/get" class="link">
        Navigate away
      </Link>
    </div>
  )
}
