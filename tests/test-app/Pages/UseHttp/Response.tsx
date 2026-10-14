import { HttpCancelledError, HttpResponseError } from '@inertiajs/core'
import { useHttp } from 'inertia-adapter-solid'
import { createSignal } from 'solid-js'

export default () => {
  const form = useHttp({ name: 'Ada', email: 'ada@example.test' })
  const [callbackResponse, setCallbackResponse] = createSignal<unknown>('not called')
  const [returnedResponse, setReturnedResponse] = createSignal<unknown>('not submitted')
  const [outcome, setOutcome] = createSignal('idle')

  const request = async (method: 'get' | 'post', url: string) => {
    setOutcome('pending')
    try {
      const result = await form[method](url, {
        onSuccess: () => setCallbackResponse(() => form.response),
      })
      setReturnedResponse(() => result)
      setOutcome(result === undefined ? 'validation' : 'resolved')
    } catch (error) {
      setOutcome(
        error instanceof HttpCancelledError
          ? 'cancelled'
          : error instanceof HttpResponseError
            ? `HTTP ${error.response.status}`
            : 'network error',
      )
    }
  }

  return (
    <main>
      <h1>useHttp stored response</h1>
      <p>
        Stored response: <output id="stored-response">{JSON.stringify(form.response)}</output>
      </p>
      <p>
        Read during onSuccess: <output id="callback-response">{JSON.stringify(callbackResponse())}</output>
      </p>
      <p>
        Promise result: <output id="returned-response">{JSON.stringify(returnedResponse()) ?? 'undefined'}</output>
      </p>
      <p>
        Outcome: <output id="response-outcome">{outcome()}</output>
      </p>
      <p>
        Processing: <output id="response-processing">{String(form.processing)}</output>
      </p>
      <p>
        Errors: <output id="response-errors">{JSON.stringify(form.errors)}</output>
      </p>
      <div style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
        <button type="button" disabled={form.processing} onClick={() => request('get', '/api/data')}>
          Read JSON
        </button>
        <button type="button" disabled={form.processing} onClick={() => request('post', '/api/users')}>
          Replace JSON
        </button>
        <button type="button" disabled={form.processing} onClick={() => request('post', '/api/validate-multiple')}>
          Validation failure
        </button>
        <button type="button" disabled={form.processing} onClick={() => request('post', '/api/error')}>
          HTTP failure
        </button>
        <button type="button" disabled={form.processing} onClick={() => request('get', '/api/slow')}>
          Slow request
        </button>
        <button type="button" disabled={!form.processing} onClick={() => form.cancel()}>
          Cancel
        </button>
        <button type="button" disabled={form.processing} onClick={() => request('post', '/api/no-content')}>
          Empty response
        </button>
      </div>
    </main>
  )
}
