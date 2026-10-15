import { onCleanup } from 'solid-js'
import { router, usePage } from 'inertia-adapter-solid'
declare global {
  interface Window {
    messages: unknown[]
  }
}
window.messages = []
const internalAlert = (...args: unknown[]) => {
  window.messages.push(...args)
}
export default () => {
  const page = usePage()
  const listeners: (() => void)[] = []
  onCleanup(() => listeners.forEach((remove) => remove()))
  const listenForFlash = (listener: (event: Event) => void) => {
    document.addEventListener('inertia:flash', listener)
    listeners.push(() => document.removeEventListener('inertia:flash', listener))
  }
  const visitWithFlash = () => {
    listeners.push(
      router.on('flash', (event) => {
        internalAlert('Inertia.on(flash)')
        internalAlert(event.detail.flash)
      }),
    )
    listenForFlash((event) => {
      internalAlert('addEventListener(inertia:flash)')
      internalAlert((event as CustomEvent).detail.flash)
    })
    router.post(
      '/flash/events/with-data',
      {},
      {
        onFlash: (flash) => {
          internalAlert('onFlash')
          internalAlert(flash)
        },
        onSuccess: (page) => {
          internalAlert('onSuccess')
          internalAlert(page.flash)
        },
      },
    )
  }
  const visitWithErrorsAndFlash = () => {
    listeners.push(
      router.on('flash', (event) => {
        internalAlert('Inertia.on(flash)')
        internalAlert(event.detail.flash)
      }),
    )
    router.post(
      '/flash/events/with-errors',
      {},
      {
        onFlash: (flash) => {
          internalAlert('onFlash')
          internalAlert(flash)
        },
        onError: (errors) => {
          internalAlert('onError')
          internalAlert(errors)
        },
      },
    )
  }
  const visitWithoutFlash = () => {
    listeners.push(
      router.on('flash', () => {
        internalAlert('Inertia.on(flash)')
      }),
    )
    listenForFlash(() => {
      internalAlert('addEventListener(inertia:flash)')
    })
    router.post(
      '/flash/events/without-data',
      {},
      {
        onFlash: () => {
          internalAlert('onFlash')
        },
        onSuccess: () => {
          internalAlert('onSuccess')
        },
      },
    )
  }
  const navigateAway = () => {
    router.get('/')
  }
  return (
    <div>
      <span id="flash">{JSON.stringify(page.flash)}</span>

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          visitWithFlash()
        }}
        class="with-flash"
      >
        Visit with flash
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          visitWithErrorsAndFlash()
        }}
        class="with-errors-and-flash"
      >
        Visit with errors and flash
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          visitWithoutFlash()
        }}
        class="without-flash"
      >
        Visit without flash
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          navigateAway()
        }}
        class="navigate-away"
      >
        Navigate away
      </a>
    </div>
  )
}
