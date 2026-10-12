import { Link, router } from 'inertia-adapter-solid'
export default function PageA(props: { items: string[]; bar: string }) {
  return (
    <>
      <p id="items">Items count: {props.items.length}</p>
      <p id="bar">Bar: {props.bar}</p>
      <Link href="/once-props/merge/b">Go to Merge Page B</Link>
      <button onClick={() => router.reload({ only: ['items'] })}>Load more items</button>
    </>
  )
}
