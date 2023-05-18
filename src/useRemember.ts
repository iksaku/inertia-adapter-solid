import { router } from '@inertiajs/core'
import { createEffect, createSignal } from 'solid-js'

export default function useRemember<State extends object>(
  initialState: State,
  key?: string,
): ReturnType<typeof createSignal<State>> {
  const restored = router.restore(key) as State | undefined
  const [signal, setSignal] = createSignal<State>(restored !== undefined ? restored : initialState)

  createEffect(() => {
    router.remember(signal(), key)
  })

  return [signal, setSignal]
}
