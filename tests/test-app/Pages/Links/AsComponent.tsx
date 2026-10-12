import { splitProps, type JSX } from 'solid-js'
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
const CustomButton = (props0: {
  children: JSX.Element
  [key: string]: unknown
}) => {
  const [, props] = splitProps(props0, ['children'])
  return (
    <button
      {...props}
      style={{
        'background-color': 'blue',
        color: 'white',
        padding: '10px',
      }}
    >
      {props0.children}
    </button>
  )
}
export default (props1: {
  page: number
}) => {
  let state = crypto.randomUUID()
  const trackEvent = (eventName: string, data: unknown = null) => {
    window.componentEvents.push({ eventName, data, timestamp: Date.now() })
  }
  return (
    <div>
      <h1>Link Custom Component - Page {props1.page}</h1>
      <p id="state">State: {state}</p>
      <Link as={CustomButton} href="/dump/get" class="get">
        GET Custom Component
      </Link>
      <Link as={CustomButton} method="post" href="/dump/post" class="post">
        POST Custom Component
      </Link>
      <Link as={CustomButton} method="post" href="/dump/post" data={{ test: 'data' }} class="data">
        Custom Component with Data
      </Link>
      <Link as={CustomButton} href="/dump/get" headers={{ 'X-Test': 'header' }} class="headers">
        Custom Component with Headers
      </Link>
      <Link as={CustomButton} href="/links/as-component/2" preserveState={true} class="preserve">
        Custom Component with Preserve State
      </Link>
      <Link as={CustomButton} href="/links/as-component/3" replace={true} class="replace">
        Custom Component with Replace
      </Link>
      <Link
        as={CustomButton}
        href="/dump/get"
        onStart={(event) => trackEvent('onStart', event)}
        onFinish={(event) => trackEvent('onFinish', event)}
        onSuccess={(page) => trackEvent('onSuccess', page)}
        class="events"
      >
        Custom Component with Events
      </Link>
    </div>
  )
}
