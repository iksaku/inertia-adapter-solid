import { type PollOptions, type ReloadOptions, router } from '@inertiajs/core'
import { onCleanup, onMount } from 'solid-js'

export default function usePoll(
  interval: number,
  requestOptions: ReloadOptions = {},
  options: PollOptions = { keepAlive: false, autoStart: true },
): ReturnType<(typeof router)['poll']> {
  const { start, stop } = router.poll(interval, requestOptions, {
    ...options,
    autoStart: false,
  })

  onMount(() => {
    if (options.autoStart ?? true) {
      start()
    }
  })

  onCleanup(() => {
    stop()
  })

  return { start, stop }
}
