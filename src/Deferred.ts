import { type JSX, type ParentProps, Show, createComponent, createMemo, createSignal } from 'solid-js'
import { usePage } from './index'

type DeferredProps = ParentProps<{
  data: string | string[]
  fallback: JSX.Element
}>

export default function Deferred(props: DeferredProps) {
  if (!props.data) {
    throw new Error('`<Deferred>` requires a `data` prop to be a string or array of strings')
  }

  if (!props.fallback) {
    throw new Error('`<Deferred>` requires a `fallback` prop')
  }

  const pageProps = usePage().props
  const keys = createMemo(() => (Array.isArray(props.data) ? props.data : [props.data]))

  return createComponent(Show, {
    keyed: undefined,
    get when() {
      return keys().every((key) => pageProps[key] !== undefined)
    },
    get children() {
      return props.children
    },
    get fallback() {
      return props.fallback
    },
  })
}
