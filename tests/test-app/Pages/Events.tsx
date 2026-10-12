import { Link, router as inertiaRouter, usePage } from 'inertia-adapter-solid'
import { onCleanup } from 'solid-js'

declare global {
  interface Window {
    messages: unknown[]
  }
}

window.messages = []

export default () => {
  const subscriptions: (() => void)[] = []
  // Only subscription ownership changes; requests and events use the real router.
  const router: Pick<typeof inertiaRouter, 'get' | 'post' | 'on' | 'once'> = {
    get: inertiaRouter.get.bind(inertiaRouter),
    post: inertiaRouter.post.bind(inertiaRouter),
    on: (name, callback) => {
      const unsubscribe = inertiaRouter.on(name, callback)
      subscriptions.push(unsubscribe)
      return unsubscribe
    },
    once: (name, callback) => {
      const unsubscribe = inertiaRouter.once(name, callback)
      subscriptions.push(unsubscribe)
      return unsubscribe
    },
  }
  const document: Pick<Document, 'addEventListener'> = {
    addEventListener: (
      name: string,
      callback: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      window.document.addEventListener(name, callback, options)
      subscriptions.push(() => window.document.removeEventListener(name, callback, options))
    },
  }
  onCleanup(() => {
    // Page disposal precedes the navigation's terminal events. Observe that final
    // navigate/finish dispatch, then remove every listener before another visit.
    setTimeout(() => subscriptions.splice(0).forEach((unsubscribe) => unsubscribe()), 0)
  })
  const payloadWithFile = {
    file: new File(['foobar'], 'example.bin'),
  }

  const page = usePage()

  const internalAlert = (...args: unknown[]) => {
    args.forEach((arg) => window.messages.push(arg))
  }

  const withoutEventListeners = (e: MouseEvent) => {
    e.preventDefault()
    router.post(page.url, {})
  }

  const removeInertiaListener = (e: MouseEvent) => {
    e.preventDefault()
    const removeEventListener = router.on('before', () => internalAlert('Inertia.on(before)'))

    internalAlert('Removing Inertia.on Listener')
    removeEventListener()

    router.post(
      page.url,
      {},
      {
        onBefore: () => internalAlert('onBefore'),
        onStart: () => internalAlert('onStart'),
      },
    )
  }

  const onceInertiaListener = (e: MouseEvent) => {
    e.preventDefault()
    router.once('before', () => internalAlert('Inertia.once(before)'))

    router.post(page.url, {}, { onBefore: () => internalAlert('onBefore-1') })
    router.post(page.url, {}, { onBefore: () => internalAlert('onBefore-2') })
  }

  const removeOnceInertiaListener = (e: MouseEvent) => {
    e.preventDefault()
    const removeEventListener = router.once('before', () => internalAlert('Inertia.once(before)'))

    internalAlert('Removing Inertia.once Listener')
    removeEventListener()

    router.post(page.url, {}, { onBefore: () => internalAlert('onBefore') })
  }

  const beforeVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('before', (event) => {
      internalAlert('Inertia.on(before)')
      internalAlert(event)
    })

    document.addEventListener('inertia:before', (event) => {
      internalAlert('addEventListener(inertia:before)')
      internalAlert(event)
    })

    router.post(
      page.url,
      {},
      {
        onBefore: (event) => {
          internalAlert('onBefore')
          internalAlert(event)
        },
        onStart: () => internalAlert('onStart'),
      },
    )
  }

  const beforeVisitPreventLocal = (e: MouseEvent) => {
    e.preventDefault()
    document.addEventListener('inertia:before', () => internalAlert('addEventListener(inertia:before)'))
    router.on('before', () => internalAlert('Inertia.on(before)'))

    router.post(
      page.url,
      {},
      {
        onBefore: () => {
          internalAlert('onBefore')
          return false
        },
        onStart: () => internalAlert('This listener should not have been called.'),
      },
    )
  }

  const beforeVisitPreventGlobalInertia = (e: MouseEvent) => {
    e.preventDefault()
    document.addEventListener('inertia:before', () => internalAlert('addEventListener(inertia:before)'))
    router.on('before', () => {
      internalAlert('Inertia.on(before)')
      return false
    })

    router.post(
      page.url,
      {},
      {
        onBefore: () => internalAlert('onBefore'),
        onStart: () => internalAlert('This listener should not have been called.'),
      },
    )
  }

  const beforeVisitPreventGlobalNative = (e: MouseEvent) => {
    e.preventDefault()
    router.on('before', () => internalAlert('Inertia.on(before)'))
    document.addEventListener('inertia:before', (event) => {
      internalAlert('addEventListener(inertia:before)')
      event.preventDefault()
    })

    router.post(
      page.url,
      {},
      {
        onBefore: () => internalAlert('onBefore'),
        onStart: () => internalAlert('This listener should not have been called.'),
      },
    )
  }

  const cancelTokenVisit = (e: MouseEvent) => {
    e.preventDefault()
    // @ts-expect-error - We're testing that the router doesn't have an onCancelToken listener
    router.on('cancelToken', () => internalAlert('This listener should not have been called.'))
    document.addEventListener('inertia:cancelToken', () => internalAlert('This listener should not have been called.'))

    router.post(
      page.url,
      {},
      {
        onCancelToken: (event) => {
          internalAlert('onCancelToken')
          internalAlert(event)
        },
      },
    )
  }

  const startVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('start', (event) => {
      internalAlert('Inertia.on(start)')
      internalAlert(event)
    })

    document.addEventListener('inertia:start', (event) => {
      internalAlert('addEventListener(inertia:start)')
      internalAlert(event)
    })

    router.post(
      page.url,
      {},
      {
        onStart: (event) => {
          internalAlert('onStart')
          internalAlert(event)
        },
      },
    )
  }

  const progressVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('progress', (event) => {
      internalAlert('Inertia.on(progress)')
      internalAlert(event)
    })

    document.addEventListener('inertia:progress', (event) => {
      internalAlert('addEventListener(inertia:progress)')
      internalAlert(event)
    })

    router.post(page.url, payloadWithFile, {
      onProgress: (event) => {
        internalAlert('onProgress')
        internalAlert(event)
      },
    })
  }

  const progressNoFilesVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('progress', (event) => {
      internalAlert('Inertia.on(progress)')
      internalAlert(event)
    })

    document.addEventListener('inertia:progress', (event) => {
      internalAlert('addEventListener(inertia:progress)')
      internalAlert(event)
    })

    router.post(
      page.url,
      {},
      {
        onBefore: () => internalAlert('progressNoFilesOnBefore'),
        onProgress: (event) => {
          internalAlert('onProgress')
          internalAlert(event)
        },
      },
    )
  }

  const cancelVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('cancel', (event) => {
      internalAlert('Inertia.on(cancel)')
      internalAlert(event)
    })

    document.addEventListener('inertia:cancel', (event) => {
      internalAlert('addEventListener(inertia:cancel)')
      internalAlert(event)
    })

    router.post(
      page.url,
      {},
      {
        onCancelToken: (token) => token.cancel(),
        // @ts-expect-error - We're testing that the onCancel callback has no arguments, so event will be undefined
        onCancel: (event) => {
          internalAlert('onCancel')
          internalAlert(event)
        },
      },
    )
  }

  const errorVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('error', (event) => {
      internalAlert('Inertia.on(error)')
      internalAlert(event)
    })

    document.addEventListener('inertia:error', (event) => {
      internalAlert('addEventListener(inertia:error)')
      internalAlert(event)
    })

    router.post(
      '/events/errors',
      {},
      {
        onError: (errors) => {
          internalAlert('onError')
          internalAlert(errors)
        },
      },
    )
  }

  const errorPromiseVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.post(
      '/events/errors',
      {},
      {
        onError: () => callbackSuccessErrorPromise('onError'),
        onSuccess: () => internalAlert('This listener should not have been called'),
        onFinish: () => internalAlert('onFinish'),
      },
    )
  }

  const successVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('success', (event) => {
      internalAlert('Inertia.on(success)')
      internalAlert(event)
    })

    document.addEventListener('inertia:success', (event) => {
      internalAlert('addEventListener(inertia:success)')
      internalAlert(event)
    })

    router.post(
      page.url,
      {},
      {
        onError: () => internalAlert('This listener should not have been called'),
        onSuccess: (page) => {
          internalAlert('onSuccess')
          internalAlert(page)
        },
      },
    )
  }

  const successPromiseVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.post(
      page.url,
      {},
      {
        onSuccess: () => callbackSuccessErrorPromise('onSuccess'),
        onError: () => internalAlert('This listener should not have been called'),
        onFinish: () => internalAlert('onFinish'),
      },
    )
  }

  const finishVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('finish', (event) => {
      internalAlert('Inertia.on(finish)')
      internalAlert(event)
    })

    document.addEventListener('inertia:finish', (event) => {
      internalAlert('addEventListener(inertia:finish)')
      internalAlert(event)
    })

    router.post(
      page.url,
      {},
      {
        onFinish: (event) => {
          internalAlert('onFinish')
          internalAlert(event)
        },
      },
    )
  }

  const httpExceptionVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('httpException', (event) => {
      internalAlert('Inertia.on(httpException)')
      internalAlert(event)
    })

    document.addEventListener('inertia:httpException', (event) => {
      internalAlert('addEventListener(inertia:httpException)')
      internalAlert(event)
    })

    router.post(
      '/non-inertia',
      {},
      {
        onHttpException: () => internalAlert('onHttpException'),
      },
    )
  }

  const httpExceptionPreventVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('httpException', (event) => {
      internalAlert('Inertia.on(httpException)')
      internalAlert(event)
    })

    document.addEventListener('inertia:httpException', (event) => {
      internalAlert('addEventListener(inertia:httpException)')
      internalAlert(event)
    })

    router.post(
      '/non-inertia',
      {},
      {
        onHttpException: (response) => {
          internalAlert('onHttpException')
          internalAlert(response)
          return false
        },
      },
    )
  }

  const httpExceptionInertiaResponseVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('httpException', (event) => {
      internalAlert('Inertia.on(httpException)')
      internalAlert(event)
    })

    document.addEventListener('inertia:httpException', (event) => {
      internalAlert('addEventListener(inertia:httpException)')
      internalAlert(event)
    })

    router.get(
      '/inertia-error-page',
      {},
      {
        onHttpException: () => internalAlert('onHttpException'),
      },
    )
  }

  const httpExceptionInertiaResponsePreventVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('httpException', (event) => {
      internalAlert('Inertia.on(httpException)')
      internalAlert(event)
    })

    document.addEventListener('inertia:httpException', (event) => {
      internalAlert('addEventListener(inertia:httpException)')
      internalAlert(event)
    })

    router.get(
      '/inertia-error-page',
      {},
      {
        onHttpException: (response) => {
          internalAlert('onHttpException')
          internalAlert(response)
          return false
        },
      },
    )
  }

  const networkErrorVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('networkError', (event) => {
      internalAlert('Inertia.on(networkError)')
      internalAlert(event)
    })

    document.addEventListener('inertia:networkError', (event) => {
      internalAlert('addEventListener(inertia:networkError)')
      internalAlert(event)
    })

    router.post(
      '/disconnect',
      {},
      {
        onNetworkError: () => internalAlert('onNetworkError'),
      },
    )
  }

  const networkErrorPreventVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('networkError', (event) => {
      internalAlert('Inertia.on(networkError)')
      internalAlert(event)
    })

    document.addEventListener('inertia:networkError', (event) => {
      internalAlert('addEventListener(inertia:networkError)')
      internalAlert(event)
    })

    router.post(
      '/disconnect',
      {},
      {
        onNetworkError: (error) => {
          internalAlert('onNetworkError')
          internalAlert(error)
          return false
        },
      },
    )
  }

  const navigateVisit = (e: MouseEvent) => {
    e.preventDefault()
    router.on('navigate', (event) => {
      internalAlert('Inertia.on(navigate)')
      internalAlert(event)
    })

    document.addEventListener('inertia:navigate', (event) => {
      internalAlert('addEventListener(inertia:navigate)')
      internalAlert(event)
    })

    router.get(
      '/',
      {},
      {
        // @ts-expect-error - We're testing that the VisitCallbacks interface does not have an onNavigate method
        onNavigate: () => internalAlert('This listener should not have been called.'),
      },
    )
  }

  const registerAllListeners = () => {
    router.on('before', () => internalAlert('Inertia.on(before)'))
    // @ts-expect-error - We're testing that the router doesn't have an onCancelToken listener
    router.on('cancelToken', () => internalAlert('Inertia.on(cancelToken)'))
    router.on('cancel', () => internalAlert('Inertia.on(cancel)'))
    router.on('start', () => internalAlert('Inertia.on(start)'))
    router.on('progress', () => internalAlert('Inertia.on(progress)'))
    router.on('error', () => internalAlert('Inertia.on(error)'))
    router.on('success', () => internalAlert('Inertia.on(success)'))
    router.on('httpException', () => internalAlert('Inertia.on(httpException)'))
    router.on('networkError', () => internalAlert('Inertia.on(networkError)'))
    router.on('finish', () => internalAlert('Inertia.on(finish)'))
    router.on('navigate', () => internalAlert('Inertia.on(navigate)'))
    document.addEventListener('inertia:before', () => internalAlert('addEventListener(inertia:before)'))
    document.addEventListener('inertia:cancelToken', () => internalAlert('addEventListener(inertia:cancelToken)'))
    document.addEventListener('inertia:cancel', () => internalAlert('addEventListener(inertia:cancel)'))
    document.addEventListener('inertia:start', () => internalAlert('addEventListener(inertia:start)'))
    document.addEventListener('inertia:progress', () => internalAlert('addEventListener(inertia:progress)'))
    document.addEventListener('inertia:error', () => internalAlert('addEventListener(inertia:error)'))
    document.addEventListener('inertia:success', () => internalAlert('addEventListener(inertia:success)'))
    document.addEventListener('inertia:httpException', () => internalAlert('addEventListener(inertia:httpException)'))
    document.addEventListener('inertia:networkError', () => internalAlert('addEventListener(inertia:networkError)'))
    document.addEventListener('inertia:finish', () => internalAlert('addEventListener(inertia:finish)'))
    document.addEventListener('inertia:navigate', () => internalAlert('addEventListener(inertia:navigate)'))

    return {
      onBefore: () => internalAlert('onBefore'),
      onCancelToken: () => internalAlert('onCancelToken'),
      onCancel: () => internalAlert('onCancel'),
      onStart: () => internalAlert('onStart'),
      onProgress: () => internalAlert('onProgress'),
      onError: () => internalAlert('onError'),
      onSuccess: () => internalAlert('onSuccess'),
      onHttpException: () => internalAlert('onHttpException'),
      onNetworkError: () => internalAlert('onNetworkError'),
      onFinish: () => internalAlert('onFinish'),
      onNavigate: () => internalAlert('onNavigate'), // Does not exist.
    }
  }

  const lifecycleSuccess = (e: MouseEvent) => {
    e.preventDefault()
    router.post(page.url, payloadWithFile, registerAllListeners())
  }

  const lifecycleError = (e: MouseEvent) => {
    e.preventDefault()
    router.post('/events/errors', payloadWithFile, registerAllListeners())
  }

  const lifecycleCancel = (e: MouseEvent) => {
    e.preventDefault()
    router.post('/sleep', payloadWithFile, {
      ...registerAllListeners(),
      onCancelToken: (token) => {
        internalAlert('onCancelToken')

        setTimeout(() => {
          internalAlert('CANCELLING!')
          token.cancel()
        }, 250)
      },
    })
  }

  const lifecycleCancelAfterFinish = (e: MouseEvent) => {
    e.preventDefault()
    type CancelToken = {
      cancel: () => void
    }

    let cancelToken = null as CancelToken | null

    router.post(page.url, payloadWithFile, {
      ...registerAllListeners(),
      onCancelToken: (token: CancelToken) => {
        internalAlert('onCancelToken')
        cancelToken = token
      },
      onFinish: () => {
        internalAlert('onFinish')
        internalAlert('CANCELLING!')
        cancelToken?.cancel()
      },
    })
  }

  const callbackSuccessErrorPromise = (eventName: string) => {
    internalAlert(eventName)
    setTimeout(() => internalAlert('onFinish should have been fired by now if Promise functionality did not work'), 5)
    return new Promise((resolve) => setTimeout(resolve, 20))
  }

  return (
    <div>
      {/* Listeners */}
      <a href="#" onClick={withoutEventListeners} class="without-listeners">
        Basic Visit
      </a>
      <a href="#" onClick={removeInertiaListener} class="remove-inertia-listener">
        Remove Inertia Listener
      </a>
      <a href="#" onClick={onceInertiaListener} class="register-inertia-once-listener">
        Register Inertia Once Listener
      </a>
      <a href="#" onClick={removeOnceInertiaListener} class="remove-inertia-once-listener">
        Remove Inertia Once Listener
      </a>

      {/* Events: Before */}
      <a href="#" onClick={beforeVisit} class="before">
        Before Event
      </a>
      <a href="#" onClick={beforeVisitPreventLocal} class="before-prevent-local">
        Before Event (Prevent)
      </a>
      <Link
        href={page.url}
        method="post"
        onBefore={(visit) => internalAlert('linkOnBefore', visit)}
        onStart={() => internalAlert('linkOnStart')}
        class="link-before"
      >
        Before Event Link
      </Link>
      <Link
        href={page.url}
        method="post"
        onBefore={() => {
          internalAlert('linkOnBefore')
          return false
        }}
        onStart={() => internalAlert('This listener should not have been called.')}
        class="link-before-prevent-local"
      >
        Before Event Link (Prevent)
      </Link>
      <a href="#" onClick={beforeVisitPreventGlobalInertia} class="before-prevent-global-inertia">
        Before Event - Prevent globally using Inertia Event Listener
      </a>
      <a href="#" onClick={beforeVisitPreventGlobalNative} class="before-prevent-global-native">
        Before Event - Prevent globally using Native Event Listeners
      </a>

      {/* Events: CancelToken */}
      <a href="#" onClick={cancelTokenVisit} class="canceltoken">
        Cancel Token Event
      </a>
      <Link
        href={page.url}
        method="post"
        onCancelToken={(event) => internalAlert('linkOnCancelToken', event)}
        class="link-canceltoken"
      >
        Cancel Token Event Link
      </Link>

      {/* Events: Cancel */}
      <a href="#" onClick={cancelVisit} class="cancel">
        Cancel Event
      </a>
      <Link
        href={page.url}
        method="post"
        onCancelToken={(token) => token.cancel()}
        // @ts-expect-error - We're testing that the onCancel callback has no arguments, so event will be undefined
        onCancel={(event) => internalAlert('linkOnCancel', event)}
        class="link-cancel"
      >
        Cancel Event Link
      </Link>

      {/* Events: Start */}
      <a href="#" onClick={startVisit} class="start">
        Start Event
      </a>
      <Link href={page.url} method="post" onStart={(event) => internalAlert('linkOnStart', event)} class="link-start">
        Start Event Link
      </Link>

      {/* Events: Progress */}
      <a href="#" onClick={progressVisit} class="progress">
        Progress Event
      </a>
      <a href="#" onClick={progressNoFilesVisit} class="progress-no-files">
        Missing Progress Event (no files)
      </a>
      <Link
        href={page.url}
        method="post"
        data={payloadWithFile}
        onProgress={(event) => internalAlert('linkOnProgress', event)}
        class="link-progress"
      >
        Progress Event Link
      </Link>
      <Link
        href={page.url}
        method="post"
        onBefore={() => internalAlert('linkProgressNoFilesOnBefore')}
        onProgress={(event) => internalAlert('linkOnProgress', event)}
        class="link-progress-no-files"
      >
        Progress Event Link (no files)
      </Link>

      {/* Events: Error */}
      <a href="#" onClick={errorVisit} class="error">
        Error Event
      </a>
      <a href="#" onClick={errorPromiseVisit} class="error-promise">
        Error Event (delaying onFinish w/ Promise)
      </a>
      <Link
        href="/events/errors"
        method="post"
        onError={(errors) => internalAlert('linkOnError', errors)}
        onSuccess={() => internalAlert('This listener should not have been called')}
        class="link-error"
      >
        Error Event Link
      </Link>
      <Link
        href="/events/errors"
        method="post"
        onError={() => callbackSuccessErrorPromise('linkOnError')}
        onSuccess={() => internalAlert('This listener should not have been called')}
        onFinish={() => internalAlert('linkOnFinish')}
        class="link-error-promise"
      >
        Error Event Link (delaying onFinish w/ Promise)
      </Link>

      {/* Events: Success */}
      <a href="#" onClick={successVisit} class="success">
        Success Event
      </a>
      <a href="#" onClick={successPromiseVisit} class="success-promise">
        Success Event (delaying onFinish w/ Promise)
      </a>
      <Link
        href={page.url}
        method="post"
        onError={() => internalAlert('This listener should not have been called')}
        onSuccess={(event) => internalAlert('linkOnSuccess', event)}
        class="link-success"
      >
        Success Event Link
      </Link>
      <Link
        href={page.url}
        method="post"
        onError={() => internalAlert('This listener should not have been called')}
        onSuccess={() => callbackSuccessErrorPromise('linkOnSuccess')}
        onFinish={() => internalAlert('linkOnFinish')}
        class="link-success-promise"
      >
        Success Event Link (delaying onFinish w/ Promise)
      </Link>

      {/* Events: Flash */}
      <Link
        href="/events/flash"
        method="post"
        onFlash={(flash) => internalAlert('linkOnFlash', flash)}
        class="link-flash"
      >
        Flash Event Link
      </Link>

      {/* Events: HTTP Exception */}
      <a href="#" onClick={httpExceptionVisit} class="http-exception">
        HTTP Exception Event
      </a>
      <a href="#" onClick={httpExceptionPreventVisit} class="http-exception-prevent">
        HTTP Exception Event (Prevent)
      </a>
      <a href="#" onClick={httpExceptionInertiaResponseVisit} class="http-exception-inertia-response">
        HTTP Exception Event (Inertia Response)
      </a>
      <a href="#" onClick={httpExceptionInertiaResponsePreventVisit} class="http-exception-inertia-response-prevent">
        HTTP Exception Event (Inertia Response Prevent)
      </a>

      <Link
        href="/non-inertia"
        method="post"
        onHttpException={(response) => internalAlert('linkOnHttpException', response.status)}
        class="link-http-exception"
      >
        HTTP Exception Event Link
      </Link>
      <Link
        href="/non-inertia"
        method="post"
        onHttpException={() => {
          internalAlert('linkOnHttpException')
          return false
        }}
        class="link-http-exception-prevent"
      >
        HTTP Exception Event Link (Prevent)
      </Link>

      {/* Events: Network Error */}
      <a href="#" onClick={networkErrorVisit} class="network-error">
        Network Error Event
      </a>
      <a href="#" onClick={networkErrorPreventVisit} class="network-error-prevent">
        Network Error Event (Prevent)
      </a>
      <Link
        href="/disconnect"
        method="post"
        onNetworkError={(error) => internalAlert('linkOnNetworkError', error.message)}
        class="link-network-error"
      >
        Network Error Event Link
      </Link>
      <Link
        href="/disconnect"
        method="post"
        onNetworkError={() => {
          internalAlert('linkOnNetworkError')
          return false
        }}
        class="link-network-error-prevent"
      >
        Network Error Event Link (Prevent)
      </Link>

      {/* Events: Finish */}
      <a href="#" onClick={finishVisit} class="finish">
        Finish Event
      </a>
      <Link
        href={page.url}
        method="post"
        onFinish={(event) => internalAlert('linkOnFinish', event)}
        class="link-finish"
      >
        Finish Event Link
      </Link>

      {/* Events: Navigate */}
      <a href="#" onClick={navigateVisit} class="navigate">
        Navigate Event
      </a>

      {/* Events: Prefetch */}
      <Link
        as="button"
        href="/prefetch/2"
        prefetch="hover"
        onPrefetching={(visit) => internalAlert('linkOnPrefetching', visit)}
        onPrefetched={(response, visit) => internalAlert('linkOnPrefetched', response, visit)}
        class="link-prefetch-hover"
      >
        Prefetch Event Link (Hover)
      </Link>

      {/* Lifecycles */}
      <a href="#" onClick={lifecycleSuccess} class="lifecycle-success">
        Lifecycle Success
      </a>
      <a href="#" onClick={lifecycleError} class="lifecycle-error">
        Lifecycle Error
      </a>
      <a href="#" onClick={lifecycleCancel} class="lifecycle-cancel">
        Lifecycle Cancel
      </a>
      <a href="#" onClick={lifecycleCancelAfterFinish} class="lifecycle-cancel-after-finish">
        Lifecycle Cancel - After Finish
      </a>
    </div>
  )
}
