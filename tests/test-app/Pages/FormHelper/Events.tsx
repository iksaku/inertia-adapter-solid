import { createEffect, on, onMount } from 'solid-js'
import type { CancelToken, Errors, HttpProgressEvent, Page, PendingVisit } from '@inertiajs/core'
import { useForm, usePage } from 'inertia-adapter-solid'
declare global {
  interface Window {
    events: string[]
    data: Array<{
      type: string
      data: unknown
      event: string | null
    }>
  }
}
const pushEvent = (message: string) => {
  window.events.push(message)
}
const pushData = (type: string, data: unknown) => {
  const currentEvent = window.events[window.events.length - 1] ?? null
  window.data.push({
    type,
    data,
    event: currentEvent,
  })
}
const callbacks = (overrides = {}) => ({
  onBefore: () => pushEvent('onBefore'),
  onCancelToken: () => pushEvent('onCancelToken'),
  onStart: () => pushEvent('onStart'),
  onProgress: () => pushEvent('onProgress'),
  onFinish: () => pushEvent('onFinish'),
  onCancel: () => pushEvent('onCancel'),
  onSuccess: () => pushEvent('onSuccess'),
  onError: () => pushEvent('onError'),
  ...overrides,
})
export default () => {
  const form = useForm({ name: 'foo', remember: false })
  const page = usePage()
  onMount(() => {
    window.events = []
    window.data = []
  })
  createEffect(
    on(
      () => [form.processing],
      () => {
        pushData('processing', form.processing)
      },
    ),
  )
  createEffect(
    on(
      () => [form.progress],
      () => {
        pushData('progress', form.progress)
      },
    ),
  )
  createEffect(
    on(
      () => [form.errors],
      () => {
        pushData('errors', form.errors)
      },
    ),
  )
  createEffect(
    on(
      () => [form.hasErrors],
      () => {
        pushData('hasErrors', form.hasErrors)
      },
    ),
  )
  const submit = () => {
    form.post(page.url)
  }
  const successfulRequest = () => {
    form.post(page.url, { ...callbacks() })
  }
  const onSuccessResetErrors = () => {
    form.post('/form-helper/events/errors', {
      onError: (errors: Errors) => {
        pushEvent('onError')
        form.post('/form-helper/events', {
          ...callbacks({
            onStart: () => {
              pushEvent('onStart')
              pushData('errors', errors)
            },
            onSuccess: () => {
              pushEvent('onSuccess')
              pushData('errors', form.errors)
            },
            onFinish: () => {
              pushEvent('onFinish')
              pushData('errors', form.errors)
            },
          }),
        })
      },
    })
  }
  const errorsSetOnError = () => {
    form.post('/form-helper/events/errors', callbacks())
  }
  const onBeforeVisit = () => {
    form.post('/sleep', {
      ...callbacks({
        onBefore: (visit: PendingVisit) => {
          pushEvent('onBefore')
          pushData('visit', visit)
        },
      }),
    })
  }
  const onBeforeVisitCancelled = () => {
    form.post('/sleep', {
      ...callbacks({
        onBefore: () => {
          pushEvent('onBefore')
          return false
        },
      }),
    })
  }
  const onStartVisit = () => {
    form.post('/form-helper/events', {
      ...callbacks({
        onStart: (visit: PendingVisit) => {
          pushEvent('onStart')
          pushData('visit', visit)
        },
      }),
    })
  }
  const onProgressVisit = () => {
    form.transform((data) => {
      return { ...data, file: new File(['foobar'], 'example.bin') }
    })
    form.post('/dump/post', {
      ...callbacks({
        onProgress: (event: HttpProgressEvent) => {
          pushEvent('onProgress')
          pushData('progressEvent', event)
        },
      }),
    })
  }
  const cancelledVisit = () => {
    form.post('/sleep', {
      ...callbacks({
        onCancelToken: (token: CancelToken) => {
          pushEvent('onCancelToken')
          setTimeout(() => {
            pushEvent('CANCELLING!')
            token.cancel()
          }, 10)
        },
      }),
    })
  }
  const onCancelProcessing = () => {
    form.post('/sleep', {
      ...callbacks({
        onCancelToken: (token: CancelToken) => {
          pushEvent('onCancelToken')
          setTimeout(() => {
            token.cancel()
          }, 10)
        },
        onCancel: () => {
          pushEvent('onCancel')
        },
      }),
    })
  }
  const onCancelProgress = () => {
    form.transform((data) => ({
      ...data,
      file: new File(['foobar'], 'example.bin'),
    }))
    form.post('/sleep', {
      ...callbacks({
        onCancelToken: (token: CancelToken) => {
          pushEvent('onCancelToken')
          setTimeout(() => {
            token.cancel()
          }, 10)
        },
        onCancel: () => {
          pushEvent('onCancel')
        },
      }),
    })
  }
  const onSuccessVisit = () => {
    form.post('/dump/post', {
      ...callbacks({
        onSuccess: (page: Page) => {
          pushEvent('onSuccess')
          pushData('page', page)
        },
      }),
    })
  }
  const onSuccessPromiseVisit = () => {
    form.post('/dump/post', {
      ...callbacks({
        onSuccess: () => {
          pushEvent('onSuccess')
          setTimeout(() => pushEvent('onFinish should have been fired by now if Promise functionality did not work'), 5)
          return new Promise((resolve) => setTimeout(resolve, 20))
        },
      }),
    })
  }
  const onErrorVisit = () => {
    form.post('/form-helper/events/errors', {
      ...callbacks({
        onError: (errors: Errors) => {
          pushEvent('onError')
          pushData('errors', errors)
        },
      }),
    })
  }
  const onErrorPromiseVisit = () => {
    form.post('/form-helper/events/errors', {
      ...callbacks({
        onError: () => {
          pushEvent('onError')
          setTimeout(() => pushEvent('onFinish should have been fired by now if Promise functionality did not work'), 5)
          return new Promise((resolve) => setTimeout(resolve, 20))
        },
      }),
    })
  }
  const onSuccessProcessing = () => {
    form.post(page.url, callbacks())
  }
  const onSuccessResetValue = () => {
    form.post(page.url, {
      ...callbacks({
        onSuccess: () => {
          form.reset()
        },
      }),
    })
  }
  const onErrorProcessing = () => {
    form.post('/form-helper/events/errors', callbacks())
  }
  const onSuccessProgress = () => {
    form.transform((data) => ({ ...data, file: new File(['foo'], 'example.bin') }))
    form.post('/sleep', callbacks())
  }
  const onErrorProgress = () => {
    form.transform((data) => ({
      ...data,
      file: new File(['foobar'], 'example.bin'),
    }))
    form.post('/form-helper/events/errors', callbacks())
  }
  const progressNoFiles = () => {
    form.post(page.url, callbacks())
  }
  return (
    <div>
      <button onClick={submit} class="submit">
        Submit form
      </button>

      <button onClick={successfulRequest} class="successful-request">
        Successful request
      </button>
      <button onClick={cancelledVisit} class="cancel">
        Cancellable Visit
      </button>

      <button onClick={onBeforeVisit} class="before">
        onBefore
      </button>
      <button onClick={onBeforeVisitCancelled} class="before-cancel">
        onBefore cancellation
      </button>
      <button onClick={onStartVisit} class="start">
        onStart
      </button>
      <button onClick={onProgressVisit} class="progress">
        onProgress
      </button>

      <button onClick={onSuccessVisit} class="success">
        onSuccess
      </button>
      <button onClick={onSuccessProgress} class="success-progress">
        onSuccess progress property
      </button>
      <button onClick={onSuccessProcessing} class="success-processing">
        onSuccess resets processing
      </button>
      <button onClick={onSuccessResetErrors} class="success-reset-errors">
        onSuccess resets errors
      </button>
      <button onClick={onSuccessPromiseVisit} class="success-promise">
        onSuccess promise
      </button>
      <button onClick={onSuccessResetValue} class="success-reset-value">
        onSuccess resets value
      </button>

      <button onClick={onErrorVisit} class="error">
        onError
      </button>
      <button onClick={onErrorProgress} class="error-progress">
        onError progress property
      </button>
      <button onClick={onErrorProcessing} class="error-processing">
        onError resets processing
      </button>
      <button onClick={errorsSetOnError} class="errors-set-on-error">
        Errors set on error
      </button>
      <button onClick={onErrorPromiseVisit} class="error-promise">
        onError promise
      </button>

      <button onClick={onCancelProcessing} class="cancel-processing">
        onCancel resets processing
      </button>
      <button onClick={onCancelProgress} class="cancel-progress">
        onCancel progress property
      </button>

      <button onClick={progressNoFiles} class="no-progress">
        progress no files
      </button>

      <span class="success-status">Form was {form.wasSuccessful ? '' : 'not '}successful</span>
      <span class="recently-status">Form was {form.recentlySuccessful ? '' : 'not '}recently successful</span>

      <input
        type="text"
        class="name-input"
        value={form.data.name}
        onInput={(e) => form.setData('name', e.currentTarget.value)}
      />
      <input
        type="checkbox"
        class="remember-input"
        checked={form.data.remember}
        onInput={(e) => form.setData('remember', e.currentTarget.checked)}
      />
    </div>
  )
}
