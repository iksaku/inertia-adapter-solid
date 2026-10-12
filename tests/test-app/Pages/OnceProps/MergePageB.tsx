import { Link, router } from 'inertia-adapter-solid'
export default function PageB(props: { items: string[]; bar: string }) {
  return (
    <>
      <p id="items">Items count: {props.items.length}</p>
      <p id="bar">Bar: {props.bar}</p>
      <Link href="/once-props/merge/a">Go to Merge Page A</Link>
      <button onClick={() => router.reload({ only: ['items'] })}>Load more items</button>
    </>
  )
}
