import { GlobalEventsMap, Method, RequestPayload, router, VisitOptions } from '@inertiajs/core'
import cloneDeep from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'
import { batch, createMemo, createSignal } from 'solid-js'
import { createStore, reconcile, SetStoreFunction, Store, unwrap } from 'solid-js/store'
import { isServer } from 'solid-js/web'
import useRemember from './useRemember'

type FormState = Record<string, unknown>
type FormErrors<TForm extends FormState> = Partial<Record<keyof TForm, string>>

interface InertiaFormProps<TForm extends FormState> {
  get isDirty(): boolean

  defaults(): this

  defaults(field: keyof TForm, value: unknown): this

  defaults(fields: TForm): this

  reset(...fields: string[]): this

  transform(callback: (data: TForm) => RequestPayload): this

  get errors(): FormErrors<TForm>

  get hasErrors(): boolean

  setError(field: keyof TForm, value: string): this

  setError(fields: Record<keyof TForm, string>): this

  clearErrors(...fields: string[]): this

  get processing(): boolean

  get progress(): GlobalEventsMap['progress']['parameters'][0]

  get wasSuccessful(): boolean

  get recentlySuccessful(): boolean

  get(url: string, options?: Partial<VisitOptions>): void

  post(url: string, options?: Partial<VisitOptions>): void

  put(url: string, options?: Partial<VisitOptions>): void

  patch(url: string, options?: Partial<VisitOptions>): void

  delete(url: string, options?: Partial<VisitOptions>): void

  submit(method: Method, url: string, options: Partial<VisitOptions>): void

  cancel(): void
}

function createRememberStore<TValue extends object>(
  value: TValue,
  key: string | undefined,
  keySuffix: string,
): ReturnType<typeof createStore<TValue>> {
  let restored = undefined

  if (!isServer && key !== undefined) {
    key = `${key}:${keySuffix}`
    restored = router.restore(key)
  }

  const [store, setStore] = createStore<TValue>(restored ?? value)

  function setStoreTrap(...args) {
    // @ts-ignore
    setStore(...args)

    if (!isServer && key !== undefined) {
      router.remember(unwrap(store), key)
    }
  }

  return [store, setStoreTrap]
}

export type InertiaForm<TForm extends FormState> = [
  get: Store<TForm> & InertiaFormProps<TForm>,
  set: SetStoreFunction<TForm>,
]

export function useForm<TForm extends FormState>(initialValues?: TForm): InertiaForm<TForm>
export function useForm<TForm extends FormState>(rememberKey: string, initialValues?: TForm): InertiaForm<TForm>

export default function useForm<TForm extends FormState>(
  rememberKeyOrInitialValues?: string | TForm,
  maybeInitialValues?: TForm,
): InertiaForm<TForm> {
  const rememberKey = typeof rememberKeyOrInitialValues === 'string' ? rememberKeyOrInitialValues : undefined

  const [defaults, setDefaults] = createSignal<TForm>(
    typeof rememberKeyOrInitialValues === 'string' ? maybeInitialValues : rememberKeyOrInitialValues,
  )

  const [data, setData] = createRememberStore<TForm>(cloneDeep(defaults()), rememberKey, 'data')
  const dataMemo = createMemo(() =>
    unwrap(
      Object.keys(defaults()).reduce((carry, key) => {
        carry[key] = data[key]
        return carry
      }, {}) as TForm,
    ),
  )
  const isDirty = createMemo<boolean>(() => !isEqual(dataMemo(), defaults()))

  const [errors, setErrors] = rememberKey
    ? useRemember<FormErrors<TForm>>({}, `${rememberKey}:errors`)
    : createSignal<FormErrors<TForm>>({})
  const hasErrors = createMemo<boolean>(() => Object.keys(errors()).length > 0)

  let cancelToken = null
  let recentlySuccessfulTimeoutId = null
  // @ts-ignore
  let transform: (data: TForm) => RequestPayload = (data) => data

  const [processing, setProcessing] = createSignal<boolean>(false)
  const [progress, setProgress] = createSignal<GlobalEventsMap['progress']['parameters'][0]>(undefined)
  const [wasSuccessful, setWasSuccessful] = createSignal<boolean>(false)
  const [recentlySuccessful, setRecentlySuccessful] = createSignal<boolean>(false)

  const store = {
    get isDirty() {
      return isDirty()
    },

    defaults(fieldOrFields?: keyof TForm | Record<keyof TForm, unknown>, maybeValue?: unknown) {
      if (typeof fieldOrFields === 'undefined') {
        setDefaults((defaults) => Object.assign(defaults, cloneDeep(data)))

        return this
      }

      if (typeof fieldOrFields === 'string') {
        // @ts-ignore
        fieldOrFields = { [fieldOrFields]: maybeValue }
      }

      // setDefaults((defaults) => Object.assign(defaults, fieldOrFields))

      return this
    },

    reset(...fields: string[]) {
      if (fields.length === 0) {
        setData(reconcile(defaults()))

        return this
      }

      setData(
        Object.keys(defaults())
          .filter((key) => fields.includes(key))
          .reduce((carry, key) => {
            carry[key] = defaults()[key]
            return carry
          }, {}) as TForm,
      )

      return this
    },

    transform(callback: typeof transform) {
      transform = callback

      return this
    },

    get errors() {
      return errors()
    },
    get hasErrors() {
      return hasErrors()
    },
    setError(fieldOrFields: keyof TForm | Record<keyof TForm, string>, maybeValue?: string) {
      if (typeof fieldOrFields === 'string') {
        // @ts-ignore
        fieldOrFields = { [fieldOrFields]: maybeValue }
      }

      setErrors((errors) => Object.assign(errors, fieldOrFields))

      return this
    },
    clearErrors(...fields: string[]) {
      if (fields.length === 0) {
        setErrors({})

        return this
      }

      setErrors((errors) =>
        Object.keys(defaults()).reduce(
          (carry, field) => Object.assign(carry, !fields.includes(field) ? { [field]: errors[field] } : {}),
          {},
        ),
      )

      return this
    },

    get processing() {
      return processing()
    },
    get progress() {
      return progress()
    },
    get wasSuccessful() {
      return wasSuccessful()
    },
    get recentlySuccessful() {
      return recentlySuccessful()
    },

    get(url: string, options: Partial<VisitOptions> = {}) {
      this.submit('get', url, options)
    },
    post(url: string, options: Partial<VisitOptions> = {}) {
      this.submit('post', url, options)
    },
    put(url: string, options: Partial<VisitOptions> = {}) {
      this.submit('put', url, options)
    },
    patch(url: string, options: Partial<VisitOptions> = {}) {
      this.submit('patch', url, options)
    },
    delete(url: string, options: Partial<VisitOptions> = {}) {
      this.submit('delete', url, options)
    },
    submit(method: Method, url: string, options: Partial<VisitOptions> = {}) {
      if (isServer) return

      const store = this

      const data = transform(dataMemo())
      const _options = {
        ...options,
        onCancelToken(token) {
          cancelToken = token

          if (options.onCancelToken) {
            return options.onCancelToken(token)
          }
        },
        onBefore(visit) {
          batch(() => {
            setWasSuccessful(true)
            setRecentlySuccessful(false)
          })
          clearTimeout(recentlySuccessfulTimeoutId)

          if (options.onBefore) {
            return options.onBefore(visit)
          }
        },
        onStart(visit) {
          setProcessing(true)

          if (options.onStart) {
            return options.onStart(visit)
          }
        },
        onProgress(event) {
          setProgress(event)

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        async onSuccess(page) {
          batch(() => {
            setProcessing(false)
            setProgress(undefined)
            setWasSuccessful(true)
            setRecentlySuccessful(true)

            store.clearErrors()
          })

          recentlySuccessfulTimeoutId = setTimeout(() => setRecentlySuccessful(false), 2000)

          // setDefaults(() => dataMemo())

          if (options.onSuccess) {
            return await options.onSuccess(page)
          }
        },
        onError(errors) {
          batch(() => {
            setProcessing(false)
            setProgress(undefined)

            store.clearErrors().setError(errors)
          })

          if (options.onError) {
            return options.onError(errors)
          }
        },
        onCancel() {
          batch(() => {
            setProcessing(false)
            setProgress(undefined)
          })

          if (options.onCancel) {
            return options.onCancel()
          }
        },
        onFinish(visit) {
          batch(() => {
            setProcessing(false)
            setProgress(undefined)
          })
          cancelToken = null

          if (options.onFinish) {
            return options.onFinish(visit)
          }
        },
      }

      if (method === 'delete') {
        router.delete(url, { ..._options, data })
      } else {
        router[method](url, data, _options)
      }
    },

    cancel() {
      if (cancelToken) {
        cancelToken.cancel()
      }
    },
  }

  const proxy = new Proxy(store, {
    get(target, property) {
      if (property in target) {
        return target[property]
      }

      // @ts-ignore
      return data[property]
    },
  })

  // @ts-ignore
  return [proxy, setData]
}
