import {
  type ErrorValue,
  type FormDataConvertible,
  type FormDataErrors,
  type FormDataKeys,
  type FormDataType,
  type FormDataValues,
  type GlobalEventsMap,
  type Method,
  type RequestPayload,
  type UrlMethodPair,
  type VisitOptions,
  config,
  router,
} from '@inertiajs/core'
import { trackStore } from '@solid-primitives/deep'
import { cloneDeep, isEqual, omit, toMerged } from 'es-toolkit'
import { get, set } from 'es-toolkit/compat'
import { batch, createMemo, createSignal } from 'solid-js'
import { type SetStoreFunction, type Store, createStore, produce, reconcile, unwrap } from 'solid-js/store'
import { isServer } from 'solid-js/web'
import useRemember from './useRemember'

type FormOptions = Omit<VisitOptions, 'data'>
type SubmitArgs = [Method, string, FormOptions?] | [UrlMethodPair, FormOptions?]
type TransformCallback<TForm> = (data: TForm) => object

export interface InertiaFormProps<TForm extends Record<string, FormDataConvertible>> {
  get data(): Store<TForm>
  setData: SetStoreFunction<TForm>
  get isDirty(): boolean

  defaults(): this
  defaults<K extends FormDataKeys<TForm>>(field: K, value: FormDataValues<TForm, K>): this
  defaults(fields: Partial<TForm>): this

  reset<K extends FormDataKeys<TForm>>(...fields: K[]): this

  get errors(): Store<FormDataErrors<TForm>>
  get hasErrors(): boolean
  setError<K extends FormDataKeys<TForm>>(field: K, value: ErrorValue): this
  setError(errors: FormDataErrors<TForm>): this
  clearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): this
  resetAndClearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): this

  transform(callback: TransformCallback<TForm>): this

  get processing(): boolean
  get progress(): GlobalEventsMap['progress']['parameters'][0]
  get wasSuccessful(): boolean
  get recentlySuccessful(): boolean

  submit(method: Method, url: string, options?: FormOptions): void
  submit(url: UrlMethodPair, options?: FormOptions): void
  get(url: string, options?: FormOptions): void
  post(url: string, options?: FormOptions): void
  put(url: string, options?: FormOptions): void
  patch(url: string, options?: FormOptions): void
  delete(url: string, options?: FormOptions): void
  cancel(): void
}

function cloneStore<TStore extends Store<Record<string, FormDataConvertible>>>(store: TStore): TStore {
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

export default function useForm<TForm extends FormDataType<TForm>>(initialValues?: TForm): InertiaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  initialValues?: TForm,
): InertiaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKeyOrInitialValues?: string | TForm,
  maybeInitialValues?: TForm,
): InertiaFormProps<TForm> {
  const rememberKey = typeof rememberKeyOrInitialValues === 'string' ? rememberKeyOrInitialValues : undefined

  const [defaults, setDefaults] = createStore<TForm>(
    typeof rememberKeyOrInitialValues === 'string' ? maybeInitialValues : rememberKeyOrInitialValues,
  )

  const [data, setData] = createRememberStore<TForm>(cloneStore(defaults), rememberKey, 'data')

  const isDirty = createMemo<boolean>(() => {
    trackStore(data)
    trackStore(defaults)

    return !isEqual(unwrap(data), unwrap(defaults))
  })

  const [errors, setErrors] = rememberKey
    ? useRemember<FormDataErrors<TForm>>({} as FormDataErrors<TForm>, `${rememberKey}:errors`)
    : createSignal<FormDataErrors<TForm>>({} as FormDataErrors<TForm>)

  const hasErrors = createMemo<boolean>(() => Object.keys(errors()).length > 0)

  let cancelToken = null
  let recentlySuccessfulTimeoutId = null
  let transform: TransformCallback<TForm> = (data) => data

  // Track if defaults was called manually during onSuccess to avoid
  // overriding user's custom defaults with automatic behavior.
  let defaultsCalledInOnSuccess = false

  const [processing, setProcessing] = createSignal<boolean>(false)
  const [progress, setProgress] = createSignal<GlobalEventsMap['progress']['parameters'][0]>(undefined)
  const [wasSuccessful, setWasSuccessful] = createSignal<boolean>(false)
  const [recentlySuccessful, setRecentlySuccessful] = createSignal<boolean>(false)

  return {
    get data() {
      return data
    },
    setData,
    get isDirty() {
      return isDirty()
    },

    defaults(fieldOrFields?: FormDataKeys<TForm> | Partial<TForm>, maybeValue?: unknown) {
      defaultsCalledInOnSuccess = true

      if (typeof fieldOrFields === 'undefined') {
        setDefaults(reconcile(cloneStore(data)))
      } else {
        setDefaults(
          produce((defaults) => {
            if (typeof fieldOrFields === 'string') {
              // Allows for dot-notation key assignment
              set(defaults, fieldOrFields, maybeValue)
            } else {
              Object.assign(defaults, fieldOrFields)
            }
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
    setError(fieldOrFields: FormDataKeys<TForm> | FormDataErrors<TForm>, maybeValue?: ErrorValue) {
      setErrors(
        (errors) =>
          toMerged(
            errors,
            typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields,
          ) as FormDataErrors<TForm>,
      )

      return this
    },
    clearErrors(...fields: FormDataKeys<TForm>[]) {
      if (fields.length === 0) {
        setErrors(() => ({}) as FormDataErrors<TForm>)
      } else {
        // @ts-ignore TypeScript complains that the expected return type is wrapped with an Omit<> 🤦‍♂️
        setErrors((errors) => omit(errors, fields) as FormDataErrors<TForm>)
      }

      return this
    },
    resetAndClearErrors(...fields: FormDataKeys<TForm>[]) {
      batch(() => {
        this.reset(...fields)
        this.clearErrors(...fields)
      })

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

    submit(...args: SubmitArgs) {
      if (isServer) return

      const objectPassed = args[0] !== null && typeof args[0] === 'object'

      const method = objectPassed ? args[0].method : (args[0] as Method)
      const url = objectPassed ? args[0].url : (args[1] as string)
      const options = (objectPassed ? args[1] : args[2]) ?? {}

      defaultsCalledInOnSuccess = false

      const store = this

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

          recentlySuccessfulTimeoutId = setTimeout(
            () => setRecentlySuccessful(false),
            config.get('form.recentlySuccessfulDuration'),
          )

          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null

          if (!defaultsCalledInOnSuccess) {
            setDefaults(() => cloneStore(data))
          }

          return onSuccess
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

      const transformedData = transform(unwrap(data)) as RequestPayload

      if (method === 'delete') {
        router.delete(url, { ..._options, data: transformedData })
      } else {
        router[method](url, transformedData, _options)
      }
    },
    get(url: string, options: VisitOptions) {
      this.submit('get', url, options)
    },
    post(url: string, options: VisitOptions) {
      this.submit('post', url, options)
    },
    put(url: string, options: VisitOptions) {
      this.submit('put', url, options)
    },
    patch(url: string, options: VisitOptions) {
      this.submit('patch', url, options)
    },
    delete(url: string, options: VisitOptions) {
      this.submit('delete', url, options)
    },

    cancel() {
      if (cancelToken) {
        cancelToken.cancel()
      }
    },
  }
}
