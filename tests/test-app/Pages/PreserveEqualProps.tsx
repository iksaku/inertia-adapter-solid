import { createSignal, createEffect, on } from 'solid-js'
import { Link } from 'inertia-adapter-solid'
export default (props0: {
  nestedA: {
    count: number
  }
  nestedB: {
    date: number
  }
}) => {
  const [effectACount, setEffectACount] = createSignal(0)
  const [effectBCount, setEffectBCount] = createSignal(0)
  const initialA = props0.nestedA
  createEffect(
    on(
      () => props0.nestedA,
      () => {
        setEffectACount((count) => count + 1)
      },
    ),
  )
  createEffect(
    on([() => props0.nestedB, () => props0.nestedB.date], () => {
      setEffectBCount((count) => count + 1)
    }),
  )
  return (
    <div>
      <h1>Preserve Equal Props</h1>
      <p id="count-a">Count A: {props0.nestedA.count}</p>
      <p id="date-b">Date B: {props0.nestedB.date}</p>
      <p id="effect-a">Effect A Count: {effectACount()}</p>
      <p id="effect-b">Effect B Count: {effectBCount()}</p>
      <p data-testid="equal-a-reference">{String(props0.nestedA === initialA)}</p>
      <Link method="post" href="/preserve-equal-props/back">
        Submit and redirect back
      </Link>
    </div>
  )
}
