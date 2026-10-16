import { type HeadManager, createHeadManager } from '@inertiajs/core'
import {
  createContext,
  createEffect,
  createRenderEffect,
  createSignal,
  getOwner,
  onCleanup,
  runWithOwner,
  untrack,
  useContext,
} from 'solid-js'
import { useAssets } from 'solid-js/web'

export function createClientHeadManager(
  titleCallback: (title: string) => string,
  initialServerHead: string[],
): HeadManager {
  const manager = untrack(() => createHeadManager(false, titleCallback, () => {}, initialServerHead))
  const [revision, setRevision] = createSignal(0)

  // Provider updates may originate in DOM observers. Recollect under one owned
  // effect so the title callback's current signal dependencies stay subscribed.
  createEffect(() => {
    revision()
    manager.forceUpdate()
  })

  return {
    forceUpdate() {
      setRevision((value) => value + 1)
    },
    updateServerHead(elements) {
      untrack(() => manager.updateServerHead(elements))
      setRevision((value) => value + 1)
    },
    createProvider() {
      const provider = manager.createProvider()
      return {
        reconnect() {
          untrack(() => provider.reconnect())
          setRevision((value) => value + 1)
        },
        update(elements) {
          untrack(() => provider.update(elements))
          setRevision((value) => value + 1)
        },
        disconnect() {
          untrack(() => provider.disconnect())
          setRevision((value) => value + 1)
        },
      }
    },
  }
}

export function createServerHeadState() {
  let nextId = 0
  const titles = new Map<number, string | undefined>()
  return {
    titles,
    serverHead: [] as string[],
    register(readTitle: () => string | undefined) {
      const id = nextId++
      createRenderEffect(() => {
        // Read now so an enclosing Suspense sees this resource dependency.
        titles.set(id, readTitle())
        const owner = getOwner()
        let snapshotPending = true
        useAssets(() => {
          // Solid restores this request's resource context for asset evaluation,
          // before root disposal. Later getAssets() calls must not reread getters.
          if (snapshotPending) {
            snapshotPending = false
            titles.set(id, runWithOwner(owner, readTitle))
          }
          return ''
        })
        onCleanup(() => {
          snapshotPending = false
        })
      })
      return id
    },
  }
}

type ServerHeadState = ReturnType<typeof createServerHeadState>
export const ServerHeadContext = createContext<ServerHeadState>()
const HeadContext = createContext<HeadManager | ServerHeadState>()

export default HeadContext

export function useHeadManager(): HeadManager | ServerHeadState {
  const manager = useContext(HeadContext)

  if (manager === undefined) {
    throw new Error('`<Head>` must be used within an Inertia `<App>`')
  }

  return manager
}
