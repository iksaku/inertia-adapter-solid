import { createSignal, createEffect, on } from 'solid-js'
import { useForm } from 'inertia-adapter-solid'
export default () => {
  const [count, setCount] = createSignal(0)
  const [effectCount, setEffectCount] = createSignal(0)
  const formState1 = useForm({ count: 0, foo: 'bar' })
  createEffect(
    on(count, () => {
      formState1.setData('count', count())
      formState1.defaults()
      setEffectCount((e) => e + 1)
    }),
  )
  return (
    <div>
      <p id="data-count">Count: {count()}</p>
      <button onClick={() => setCount(count() + 1)}>Increment</button>
      <p id="form-data">Form data: {JSON.stringify(formState1.data)}</p>
      <button onClick={() => formState1.reset()}>Reset</button>
      <p id="effect-count">Effect count: {effectCount()}</p>
    </div>
  )
}
