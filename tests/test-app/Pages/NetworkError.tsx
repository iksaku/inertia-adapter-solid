import { createSignal } from 'solid-js'
import { router } from 'inertia-adapter-solid'
export default () => {
  const [error, setError] = createSignal(false)
  function makeRequest() {
    setError(false)
    router.get('/network-error', {}, { onNetworkError: () => setError(true) })
  }
  return (
    <div>
      <h1>Network Error</h1>
      {error() && <div id="network-error">Network error occurred</div>}
      <button id="make-request" onClick={makeRequest}>
        Make Request
      </button>
    </div>
  )
}
