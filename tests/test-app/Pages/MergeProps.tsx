import { router } from 'inertia-adapter-solid'

export default function Merge(props: { bar: number[]; foo: number[] }) {
  return (
    <>
      <div>bar count is {props.bar.length}</div>
      <div>foo count is {props.foo.length}</div>
      <button onClick={() => router.reload({ only: ['foo'] })}>Reload</button>
      <button onClick={() => router.reload({ reset: ['foo'] })}>Get Fresh</button>
    </>
  )
}
