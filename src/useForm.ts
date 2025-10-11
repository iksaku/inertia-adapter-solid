import {
  type FormDataConvertible,
  type GlobalEventsMap,
  type Method,
  type RequestPayload,
  type VisitOptions,
  router,
} from '@inertiajs/core'
import { trackStore } from '@solid-primitives/deep'
import { cloneDeep, isEqual, omit, toMerged } from 'es-toolkit'
import { get, set } from 'es-toolkit/compat'
import { batch, createMemo, createSignal } from 'solid-js'
import { type SetStoreFunction, type Store, createStore, produce, reconcile, unwrap } from 'solid-js/store'
import { isServer } from 'solid-js/web'
import useRemember from './useRemember'

type StringKeyOf<T> = Extract<keyof T, string>

type FormState = Record<string, FormDataConvertible>
type FormErrors<TForm extends FormState> = Partial<Record<StringKeyOf<TForm>, string>>

interface InertiaFormProps<TForm extends FormState, TFormKey extends StringKeyOf<TForm> = StringKeyOf<TForm>> {
  get data(): Store<TForm>
  setData: SetStoreFunction<TForm>
  get isDirty(): boolean

  defaults(): this
  defaults(field: TFormKey, value: FormDataConvertible): this
  defaults(fields: Partial<TForm>): this

  reset(...fields: TFormKey[]): this

  get errors(): Store<FormErrors<TForm>>
  get hasErrors(): boolean
  setError(field: TFormKey, value: string): this
  setError(errors: Record<TFormKey, string>): this
  clearErrors(...fields: TFormKey[]): this

  transform(callback: (data: TForm) => RequestPayload): void

  get processing(): boolean
  get progress(): GlobalEventsMap['progress']['parameters'][0]
  get wasSuccessful(): boolean
  get recentlySuccessful(): boolean

  submit(method: Method, url: string, options: Partial<VisitOptions>): void
  get(url: string, options?: Partial<VisitOptions>): void
  post(url: string, options?: Partial<VisitOptions>): void
  put(url: string, options?: Partial<VisitOptions>): void
  patch(url: string, options?: Partial<VisitOptions>): void
  delete(url: string, options?: Partial<VisitOptions>): void
  cancel(): void
}

function cloneStore<TStore extends Store<FormState>>(store: TStore): TStore {
  return cloneDeep(unwrap(store))
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

  // @ts-ignore - We know this is safe, but TS can't infer the complex overloads
  const setStoreTrap: SetStoreFunction<TValue> = (...args: Parameters<SetStoreFunction<TValue>>) => {
    // @ts-ignore - We know this is safe, but TS can't infer the complex overloads
    setStore(...args)

    if (!isServer && key !== undefined) {
      router.remember(unwrap(store), key)
    }
  }

  return [store, setStoreTrap]
}

export default function useForm<TForm extends FormState>(initialValues?: TForm): InertiaFormProps<TForm>
export default function useForm<TForm extends FormState>(
  rememberKey: string,
  initialValues?: TForm,
): InertiaFormProps<TForm>
export default function useForm<TForm extends FormState>(
  rememberKeyOrInitialValues?: string | TForm,
  maybeInitialValues?: TForm,
): InertiaFormProps<TForm> {
  const rememberKey = typeof rememberKeyOrInitialValues === 'string' ? rememberKeyOrInitialValues : undefined

  const [defaults, setDefaults] = createStore<TForm>(
    typeof rememberKeyOrInitialValues === 'string' ? maybeInitialValues : rememberKeyOrInitialValues,
  )

  const [data, setData] = createRememberStore<TForm>(cloneStore(defaults), rememberKey, 'data')

  const isDirty = createMemo<boolean>(() => {
    trackStore(defaults)
    trackStore(data)

    return !isEqual(unwrap(data), unwrap(defaults))
  })

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
    get data() {
      return data
    },
    setData,
    get isDirty() {
      return isDirty()
    },

    defaults(fieldOrFields?: StringKeyOf<TForm> | Partial<TForm>, maybeValue?: FormDataConvertible) {
      if (typeof fieldOrFields === 'undefined') {
        setDefaults(reconcile(cloneStore(data)))
      } else {
        setDefaults(
          produce((defaults) => {
            Object.assign(defaults, typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields)
          }),
        )
      }

      return this
    },

    reset(...fields: string[]) {
      const _defaults = cloneStore(defaults)

      if (fields.length === 0) {
        setData(reconcile(_defaults))
      } else {
        setData(
          produce((data) => {
            for (const field of fields) {
              set(data, field, get(_defaults, field, undefined))
            }
          }),
        )
      }

      return this
    },

    get errors() {
      return errors()
    },
    get hasErrors() {
      return hasErrors()
    },
    setError(fieldOrFields: StringKeyOf<TForm> | Record<StringKeyOf<TForm>, string>, maybeValue?: string) {
      setErrors((errors) =>
        toMerged(errors, typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields),
      )

      return this
    },
    clearErrors: function (...fields: StringKeyOf<TForm>[]) {
      if (fields.length === 0) {
        setErrors({})
      } else {
        // @ts-ignore Typescript complains that the expected return type is wrapped with an Omit<> 🤦‍♂️
        setErrors((errors) => omit(errors, fields))
      }

      return this
    },

    transform(callback: typeof transform) {
      transform = callback

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

    submit(method: Method, url: string, options: Partial<VisitOptions> = {}) {
      if (isServer) return

      const store = this

      const _data = transform(unwrap(data))
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

            setDefaults(() => cloneStore(data))
          })

          recentlySuccessfulTimeoutId = setTimeout(() => setRecentlySuccessful(false), 2000)

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
        router.delete(url, { ..._options, data: _data })
      } else {
        router[method](url, _data, _options)
      }
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

    cancel() {
      if (cancelToken) {
        cancelToken.cancel()
      }
    },
  }

  const warnedProperties = new Set()

  return new Proxy(store, {
    get(target, property) {
      if (property in target) {
        return Reflect.get(target, property)
      }

      if (!warnedProperties.has(property)) {
        warnedProperties.add(property)

        console.warn(`Direct property access to form objects is deprecated and will be removed in the near future. Please access form data through the "data" property:
❌ form.${String(property)}
✅ form.data.${String(property)}
        `)
      }

      return Reflect.get(data, property)
    },
  })
}
