import { type ParentProps, Show, createComponent, createSignal, onMount, sharedConfig } from 'solid-js'
import { isServer } from 'solid-js/web'

export default function WhenMounted(props: ParentProps<{ fallback?: ParentProps['children'] }>) {
  const [mounted, setMounted] = createSignal(!isServer && !sharedConfig.context)

  onMount(() => setMounted(true))

  return createComponent(Show, {
    keyed: true,
    get when() {
      return mounted()
    },
    get fallback() {
      return props.fallback
    },
    get children() {
      return props.children
    },
  })
}
