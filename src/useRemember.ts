import { router } from '@inertiajs/core'
import { deepTrack } from '@solid-primitives/deep'
import { createEffect } from 'solid-js'
import { createStore, unwrap } from 'solid-js/store'

export default function useRemember<State extends object>(initialState: State, key?: string) {
  const restored = router.restore(key) as State | undefined
  const [store, setStore] = createStore<State>(restored !== undefined ? restored : initialState)

  const deeplyTrackedStore = () => deepTrack(store)

  createEffect(() => {
    router.remember(unwrap(deeplyTrackedStore()), key)
  })

  return [store, setStore]
}
