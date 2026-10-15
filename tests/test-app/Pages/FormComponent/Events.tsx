import { createSignal, createMemo, onMount, onCleanup } from 'solid-js'
import { Form } from 'inertia-adapter-solid'
export default () => {
  const [events, setEvents] = createSignal<string[]>([])
  const [globalEvents, setGlobalEvents] = createSignal<string[]>([])
  const [flashData, setFlashData] = createSignal('')
  const [cancelInOnBefore, setCancelInOnBefore] = createSignal(false)
  const [preventErrorEvents, setPreventErrorEvents] = createSignal(false)
  const [action, setAction] = createSignal('/form-component/events/success')
  const [cancelToken, setCancelToken] = createSignal<{
    cancel: () => void
  } | null>(null)
  function log(eventName: string) {
    setEvents((previousEvents) => [...previousEvents, eventName])
  }
  const formEvents = createMemo(() => ({
    onBefore: () => {
      log('onBefore')
      if (cancelInOnBefore()) {
        log('onCancel')
        return false
      }
    },
    onStart: () => log('onStart'),
    onProgress: () => log('onProgress'),
    onFinish: () => log('onFinish'),
    onCancel: () => log('onCancel'),
    onSuccess: () => log('onSuccess'),
    onError: () => log('onError'),
    onHttpException: () => {
      log('onHttpException')
      if (preventErrorEvents()) {
        return false
      }
    },
    onNetworkError: () => {
      log('onNetworkError')
      if (preventErrorEvents()) {
        return false
      }
    },
    onFlash: (flash: Record<string, unknown>) => {
      log('onFlash')
      setFlashData(JSON.stringify(flash))
    },
    onCancelToken: (token: {
      cancel: () => void
    }) => {
      log('onCancelToken')
      setCancelToken(token)
    },
  }))
  const cancelVisit = () => {
    if (cancelToken()) {
      cancelToken()!.cancel()
      setCancelToken(null)
    }
  }
  onMount(() => {
    const logGlobalEvent = (name: string) => () => setGlobalEvents((previousEvents) => [...previousEvents, name])
    const onHttpException = logGlobalEvent('httpException')
    const onNetworkError = logGlobalEvent('networkError')
    document.addEventListener('inertia:httpException', onHttpException)
    document.addEventListener('inertia:networkError', onNetworkError)
    onCleanup(() => {
      document.removeEventListener('inertia:httpException', onHttpException)
      document.removeEventListener('inertia:networkError', onNetworkError)
    })
  })
  return (
    <Form action={action()} method="post" {...formEvents()}>
      {(props1) => (
        <>
          <h1>Form Events & State</h1>

          <div>
            Events: <span id="events">{events()!.join(',')}</span>
          </div>

          <div>
            Global events: <span id="global-events">{globalEvents()!.join(',')}</span>
          </div>

          <div>
            Flash: <span id="flash">{flashData()}</span>
          </div>

          <div>
            Processing: <span id="processing">{String(props1.processing)}</span>
          </div>

          <div>
            Progress:{' '}
            <span id="progress" class={props1.progress!?.percentage ? 'uploading' : undefined}>
              {props1.progress!?.percentage || 0}
            </span>
          </div>

          <div>
            Was successful: <span id="was-successful">{String(props1.wasSuccessful)}</span>
          </div>

          <div>
            Recently successful: <span id="recently-successful">{String(props1.recentlySuccessful)}</span>
          </div>

          <div>
            <input type="file" name="avatar" id="avatar" />
          </div>

          <div>
            <button type="button" onClick={() => setCancelInOnBefore(true)}>
              Cancel in onBefore
            </button>
            <button type="button" onClick={() => setAction('/form-component/events/errors')}>
              Fail Request
            </button>
            <button type="button" onClick={() => setAction('/form-component/events/delay')}>
              Should Delay
            </button>
            <button type="button" onClick={() => setAction('/form-component/events/flash')}>
              Return Flash
            </button>
            <button type="button" onClick={() => setAction('/non-inertia')}>
              Trigger HTTP Exception
            </button>
            <button type="button" onClick={() => setAction('/disconnect')}>
              Trigger Network Error
            </button>
            <button type="button" onClick={() => setPreventErrorEvents(true)}>
              Prevent Error Events
            </button>
            <button type="button" onClick={cancelVisit}>
              Cancel Visit
            </button>
            <button type="button" onClick={props1.cancel}>
              Cancel Submission
            </button>
            <button type="submit">Submit</button>
          </div>
        </>
      )}
    </Form>
  )
}
