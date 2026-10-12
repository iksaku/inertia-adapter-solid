import { usePoll } from 'inertia-adapter-solid'

export default function HookManual() {
  const poll = usePoll(
    500,
    {
      only: ['custom_prop'],
      onFinish() {
        console.log('hook poll finished')
      },
    },
    { autoStart: false },
  )
  return (
    <>
      <button onClick={poll.start}>Start</button>
      <button onClick={poll.stop}>Stop</button>
      <div>Polling: {poll.polling ? 'yes' : 'no'}</div>
    </>
  )
}
