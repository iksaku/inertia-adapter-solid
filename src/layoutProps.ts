import { type LayoutProps, type NamedLayoutProps, createLayoutPropsStore } from '@inertiajs/core'
import { createSignal } from 'solid-js'
import { isServer } from 'solid-js/web'

const store = createLayoutPropsStore()

const [layoutProps, publishLayoutProps] = createSignal(store.get())
export { layoutProps }

store.subscribe(() => {
  publishLayoutProps(store.get())
})

export function setLayoutProps(props: Partial<LayoutProps>): void
export function setLayoutProps<K extends keyof NamedLayoutProps>(name: K, props: Partial<NamedLayoutProps[K]>): void
export function setLayoutProps<T = never>(props: Partial<NoInfer<T>>): void
export function setLayoutProps<T = never>(name: string, props: Partial<NoInfer<T>>): void
export function setLayoutProps(nameOrProps: string | Record<string, unknown>, props?: Record<string, unknown>): void {
  // Dynamic overrides are client state, never process-wide SSR request state.
  if (isServer) return

  if (typeof nameOrProps === 'string') {
    store.setFor(nameOrProps, props!)
  } else {
    store.set(nameOrProps)
  }
}

export function resetLayoutProps(): void {
  if (isServer) return

  store.reset()
  // Replacement pages must not read the previous page's overrides.
  publishLayoutProps(store.get())
}
