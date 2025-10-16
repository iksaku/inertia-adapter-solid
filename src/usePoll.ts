import { type PollOptions, type ReloadOptions, router } from '@inertiajs/core'
import { mergeProps, onCleanup, onMount } from 'solid-js'

type UsePollProps = {
  interval: number
  requestOptions?: ReloadOptions
  options?: PollOptions
}

export default function usePoll(_props: UsePollProps): ReturnType<(typeof router)['poll']> {
  const props = mergeProps(
    {
      requestOptions: {},
      options: {
        keepAlive: false,
        autoStart: true,
      },
    },
    _props,
  )

  const { start, stop } = router.poll(props.interval, props.requestOptions, {
    ...props.options,
    autoStart: false,
  })

  onMount(() => {
    if (props.options.autoStart ?? true) {
      start()
    }
  })

  onCleanup(() => {
    stop()
  })

  return { start, stop }
}
