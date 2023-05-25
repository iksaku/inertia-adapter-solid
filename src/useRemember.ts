import { router } from '@inertiajs/core'
import { createEffect, createSignal } from 'solid-js'
import { isServer } from 'solid-js/web'

export default function useRemember<State = unknown>(
  initialState: State,
  key?: string,
): ReturnType<typeof createSignal<State>> {
  const restored = isServer ? undefined : (router.restore(key) as State | undefined)
  const [state, setState] = createSignal<State>(restored !== undefined ? restored : initialState)

  createEffect(() => {
    router.remember(state(), key)
  })

  return [state, setState]
}
