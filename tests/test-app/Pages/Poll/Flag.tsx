import { router, usePoll } from 'inertia-adapter-solid'
import { createSignal } from 'solid-js'

export default function Flag() {
  const [pollFlag, setPollFlag] = createSignal('pending')
  const [reloadFlag, setReloadFlag] = createSignal('pending')
  usePoll(500, {
    onFinish(visit) {
      setPollFlag(String((visit as any).poll === true))
    },
  })
  const reload = () =>
    router.reload({
      onFinish(visit) {
        setReloadFlag(String((visit as any).poll === true))
      },
    })
  return (
    <div>
      <div id="poll-flag">poll: {pollFlag()}</div>
      <div id="reload-flag">reload: {reloadFlag()}</div>
      <button onClick={reload}>Reload</button>
    </div>
  )
}
