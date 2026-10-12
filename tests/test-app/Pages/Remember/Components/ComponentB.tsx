import { createSignal, splitProps, type JSX } from 'solid-js'
import { useRemember } from 'inertia-adapter-solid'
export default (props0: JSX.HTMLAttributes<HTMLDivElement>) => {
  const [, props] = splitProps(props0, [])
  const [untracked, setUntracked] = createSignal('')
  const [data, setData] = useRemember({ name: '', remember: false }, 'Example/ComponentB')
  return (
    <div {...props}>
      <span>This component uses a callback-style 'key' for the remember functionality.</span>
      <label>
        Full Name
        <input
          type="text"
          class="b-name"
          name="full_name"
          value={data().name}
          onInput={(e) => setData({ ...data(), name: e.target.value })}
        />
      </label>
      <label>
        Remember Me
        <input
          type="checkbox"
          class="b-remember"
          name="remember"
          checked={data().remember}
          onInput={(e) => setData({ ...data(), remember: e.target.checked })}
        />
      </label>
      <label>
        Remember Me
        <input
          type="text"
          class="b-untracked"
          name="untracked"
          value={untracked()}
          onInput={(e) => setUntracked(e.target.value)}
        />
      </label>
    </div>
  )
}
