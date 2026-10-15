import { usePoll } from 'inertia-adapter-solid'
import { createSignal, onMount, onCleanup } from 'solid-js'

export default function UnchangedData() {
  const [replaceStateCalls, setReplaceStateCalls] = createSignal(0)
  const [pollsFinished, setPollsFinished] = createSignal(0)
  const original = window.history.replaceState
  onMount(() => {
    window.history.replaceState = function (...args) {
      setReplaceStateCalls((c) => c + 1)
      return original.apply(window.history, args)
    }
  })
  onCleanup(() => {
    window.history.replaceState = original
  })
  usePoll(500, {
    only: ['custom_prop'],
    onFinish: () => {
      setPollsFinished((c) => c + 1)
    },
  })
  return (
    <div>
      <p>
        replaceState calls: <span class="replaceStateCalls">{replaceStateCalls()}</span>
      </p>
      <p>
        polls finished: <span class="pollsFinished">{pollsFinished()}</span>
      </p>
    </div>
  )
}
