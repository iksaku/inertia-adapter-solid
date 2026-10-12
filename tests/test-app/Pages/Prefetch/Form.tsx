import { Link, useForm } from 'inertia-adapter-solid'

export default function Form(props: { randomValue: number }) {
  const form = useForm({})
  return (
    <div>
      <p>
        Random Value: <span class="random-value">{props.randomValue}</span>
      </p>
      <button onClick={() => form.post('/prefetch/form')}>Submit to Same URL</button>
      <button onClick={() => form.post('/prefetch/redirect-back')}>Submit to Other URL</button>
      <Link href="/prefetch/test-page">Back to Test Page</Link>
    </div>
  )
}
