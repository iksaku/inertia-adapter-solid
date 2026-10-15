import { router } from 'inertia-adapter-solid'
import { onCleanup } from 'solid-js'

export default function RouterManual() {
  const poll = router.poll(
    500,
    {
      only: ['custom_prop'],
      onFinish() {
        console.log('hook poll finished')
      },
    },
    { autoStart: false },
  )
  onCleanup(() => poll.destroy())
  return (
    <>
      <button onClick={poll.start}>Start</button>
      <button onClick={poll.stop}>Stop</button>
    </>
  )
}
