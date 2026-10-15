import type { PollOptions } from '@inertiajs/core'
import { usePoll } from 'inertia-adapter-solid'

export default function Overlap(props: { mode: string; time: number }) {
  const params = new URLSearchParams(window.location.search)
  const options: PollOptions = {}
  if (props.mode === 'overlap' || props.mode === 'cancel' || props.mode === 'rest') options.mode = props.mode
  if (params.get('keepAlive') === '1') options.keepAlive = true
  const background = params.get('background')
  if (background === 'throttle' || background === 'pause' || background === 'continue') options.background = background
  const poll = usePoll(parseInt(params.get('interval') || '200'), {}, options)
  return (
    <div>
      <span id="mode">{props.mode}</span>
      <span id="time">{props.time}</span>
      <button onClick={poll.stop}>Stop</button>
      <button onClick={poll.start}>Start</button>
    </div>
  )
}
