import { Link, router, usePoll } from 'inertia-adapter-solid'
export default function DynamicData(props: { counter: number; last_received: number | null }) {
  // @ts-expect-error Core supports dynamic options; the Solid hook currently declares only ReloadOptions.
  usePoll(300, () => ({ data: { counter_seen: props.counter }, only: ['last_received'] }))
  return (
    <>
      <div id="counter">counter: {props.counter}</div>
      <div id="last_received">received: {props.last_received ?? 'null'}</div>
      <button onClick={() => router.reload({ only: ['counter'], data: { bump: props.counter + 1 } })}>Increment</button>
      <Link href="/">Home</Link>
    </>
  )
}
