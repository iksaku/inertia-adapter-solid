import { Link } from 'inertia-adapter-solid'
declare global {
  interface Window {
    componentEvents: Array<{
      eventName: string
      data: unknown
      timestamp: number
    }>
  }
}
window.componentEvents = []
export default (props0: {
  page: number
}) => {
  let state = crypto.randomUUID()
  const trackEvent = (eventName: string, data: unknown = null) => {
    window.componentEvents.push({ eventName, data, timestamp: Date.now() })
  }
  return (
    <div>
      <h1>Link Custom Element - Page {props0.page}</h1>
      <p id="state">State: {state}</p>
      <Link
        as="div"
        href="/dump/get"
        class="get"
        style={{ 'background-color': 'blue', color: 'white', padding: '10px' }}
      >
        GET Custom Element
      </Link>
      <Link as="div" method="post" href="/dump/post" class="post">
        POST Custom Element
      </Link>
      <Link as="div" method="post" href="/dump/post" data={{ test: 'data' }} class="data">
        Custom Element with Data
      </Link>
      <Link as="div" href="/dump/get" headers={{ 'X-Test': 'header' }} class="headers">
        Custom Element with Headers
      </Link>
      <Link as="div" href="/links/as-element/2" preserveState={true} class="preserve">
        Custom Element with Preserve State
      </Link>
      <Link as="div" href="/links/as-element/3" replace={true} class="replace">
        Custom Element with Replace
      </Link>
      <Link
        as="div"
        href="/dump/get"
        onStart={(event) => trackEvent('onStart', event)}
        onFinish={(event) => trackEvent('onFinish', event)}
        onSuccess={(page) => trackEvent('onSuccess', page)}
        class="events"
      >
        Custom Element with Events
      </Link>
    </div>
  )
}
