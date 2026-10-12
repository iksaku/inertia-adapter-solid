import { Deferred, router } from 'inertia-adapter-solid'
import { onMount } from 'solid-js'

export default function InstantReload(props: { foo?: { text: string }; bar?: { text: string } }) {
  onMount(() => router.reload({ only: ['foo'] }))
  return (
    <>
      <Deferred data="foo" fallback={<div>Loading foo...</div>}>
        <div>{props.foo?.text}</div>
      </Deferred>
      <Deferred data="bar" fallback={<div>Loading bar...</div>}>
        <div>{props.bar?.text}</div>
      </Deferred>
    </>
  )
}
