import { createSignal } from 'solid-js'
import { useHttp } from 'inertia-adapter-solid'
interface TransformResponse {
  success: boolean
  received: {
    transformed_name: string
    transformed_email: string
    original_name: string
  }
}
export default () => {
  const transformTest = useHttp<
    {
      name: string
      email: string
    },
    TransformResponse
  >({
    name: '',
    email: '',
  })
  const [lastTransformResponse, setLastTransformResponse] = createSignal<TransformResponse | null>(null)
  const performTransform = async () => {
    try {
      transformTest.transform((data) => ({
        transformed_name: data.name.toUpperCase(),
        transformed_email: data.email.toLowerCase(),
        original_name: data.name,
      }))
      const result = await transformTest.post('/api/transform')
      setLastTransformResponse(result ?? null)
    } catch (e) {
      console.error('Transform failed:', e)
    }
  }
  return (
    <div>
      <h1>useHttp Transform Test</h1>

      {/* Transform Test */}
      <section id="transform-test">
        <h2>Transform</h2>
        <label>
          Name
          <input
            type="text"
            id="transform-name"
            value={transformTest.data.name}
            onInput={(e) => transformTest.setData('name', e.currentTarget.value)}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            id="transform-email"
            value={transformTest.data.email}
            onInput={(e) => transformTest.setData('email', e.currentTarget.value)}
          />
        </label>
        <button onClick={performTransform} id="transform-button">
          Submit with Transform
        </button>
        {lastTransformResponse() && (
          <div id="transform-result">
            Transformed Name: {lastTransformResponse()!.received.transformed_name}
            <br />
            Transformed Email: {lastTransformResponse()!.received.transformed_email}
            <br />
            Original Name: {lastTransformResponse()!.received.original_name}
          </div>
        )}
      </section>
    </div>
  )
}
