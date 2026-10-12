import { type PollOptions, type ReloadOptions, router } from '@inertiajs/core'
import { createSignal, onCleanup, onMount } from 'solid-js'

export default function usePoll(
  interval: number,
  requestOptions: ReloadOptions = {},
  options: PollOptions = {},
): { readonly polling: boolean; start: VoidFunction; stop: VoidFunction } {
  const [polling, setPolling] = createSignal(options.autoStart ?? true)
  const poll = router.poll(interval, requestOptions, {
    ...options,
    autoStart: false,
  })

  function start() {
    setPolling(true)
    poll.start()
  }

  function stop() {
    setPolling(false)
    poll.stop()
  }

  onMount(() => {
    if (options.autoStart ?? true) {
      start()
    }
  })

  onCleanup(() => {
    poll.destroy()
  })

  return {
    get polling() {
      return polling()
    },
    start,
    stop,
  }
}
