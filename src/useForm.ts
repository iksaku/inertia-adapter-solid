import {
  type CancelToken,
  type ErrorValue,
  type Errors,
  type FormDataConvertible,
  type FormDataErrors,
  type FormDataKeys,
  type FormDataType,
  type FormDataValues,
  type GlobalEventsMap,
  type Method,
  type Page,
  type PendingVisit,
  type RequestPayload,
  type UrlMethodPair,
  type UseFormArguments,
  type UseFormSubmitArguments,
  type UseFormSubmitOptions,
  type UseFormTransformCallback,
  UseFormUtils,
  type UseFormWithPrecognitionArguments,
  config,
  router,
} from '@inertiajs/core'
import { trackStore } from '@solid-primitives/deep'
import { cloneDeep, isEqual, omit, toMerged } from 'es-toolkit'
import { get, set } from 'es-toolkit/compat'
import {
  type NamedInputEvent,
  type PrecognitionPath,
  type ValidationConfig,
  type Validator,
  createValidator,
  resolveName,
  toSimpleValidationErrors,
} from 'laravel-precognition'
import { batch, createMemo, createSignal } from 'solid-js'
import { type SetStoreFunction, type Store, createStore, produce, reconcile, unwrap } from 'solid-js/store'
import { isServer } from 'solid-js/web'
import useRemember from './useRemember'

type AxiosProgressEvent = GlobalEventsMap['progress']['parameters'][0]

type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>
}

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

  transform(callback: UseFormTransformCallback<TForm>): this

  get processing(): boolean
  get progress(): AxiosProgressEvent
  get wasSuccessful(): boolean
  get recentlySuccessful(): boolean

  submit(...args: UseFormSubmitArguments): void
  get(url: string, options?: UseFormSubmitOptions): void
  post(url: string, options?: UseFormSubmitOptions): void
  put(url: string, options?: UseFormSubmitOptions): void
  patch(url: string, options?: UseFormSubmitOptions): void
  delete(url: string, options?: UseFormSubmitOptions): void
  cancel(): void

  dontRemember<K extends FormDataKeys<TForm>>(...fields: K[]): this

  withPrecognition(...args: UseFormWithPrecognitionArguments): InertiaPrecognitiveFormProps<TForm>
}

export interface InertiaFormValidationProps<TForm extends Record<string, FormDataConvertible>> {
  invalid<K extends FormDataKeys<TForm>>(field: K): boolean
  setValidationTimeout(duration: number): InertiaPrecognitiveFormProps<TForm>
  touch<K extends FormDataKeys<TForm>>(
    field: K | NamedInputEvent | Array<K>,
    ...fields: K[]
  ): InertiaPrecognitiveFormProps<TForm>
  touched<K extends FormDataKeys<TForm>>(field?: K): boolean
  valid<K extends FormDataKeys<TForm>>(field: K): boolean
  validate<K extends FormDataKeys<TForm> | PrecognitionPath<TForm>>(
    field?: K | NamedInputEvent | PrecognitionValidationConfig<K>,
    config?: PrecognitionValidationConfig<K>,
  ): InertiaPrecognitiveFormProps<TForm>
  validateFiles(): InertiaPrecognitiveFormProps<TForm>
  validating: boolean
  validator(): Validator
  withAllErrors(): InertiaPrecognitiveFormProps<TForm>
  withoutFileValidation(): InertiaPrecognitiveFormProps<TForm>
  setErrors(errors: FormDataErrors<TForm>): InertiaPrecognitiveFormProps<TForm>
  forgetError<K extends FormDataKeys<TForm> | NamedInputEvent>(field: K): InertiaPrecognitiveFormProps<TForm>
}

export type InertiaPrecognitiveFormProps<TForm extends Record<string, FormDataConvertible>> = InertiaFormProps<TForm> &
  InertiaFormValidationProps<TForm>

// biome-ignore lint/suspicious/noExplicitAny: Matching official adapters
type ReservedFormKeys = keyof InertiaFormProps<any>

type ValidateFormData<T> = {
  [K in keyof T]: K extends ReservedFormKeys ? ['Error: This field name is reserved by useForm:', K] : T[K]
}

function cloneStore<TStore extends Store<Record<string, FormDataConvertible>>>(store: TStore): TStore {
  return cloneDeep(unwrap(store))
}

function createRememberStore<TValue extends object>(
  value: TValue,
  key: string | null,
  keySuffix: string,
  dontRememberKeys: Set<string>,
): ReturnType<typeof createStore<TValue>> {
  let restored = undefined

  if (!isServer && !!key) {
    key = `${key}:${keySuffix}`
    restored = router.restore(key)
  }

  const [store, setStore] = createStore<TValue>(restored ?? value)

  // @ts-ignore - We know this is safe, but TS can't infer the complex overloads
  const setStoreTrap: SetStoreFunction<TValue> = (...args: Parameters<SetStoreFunction<TValue>>) => {
    // @ts-ignore - We know this is safe, but TS can't infer the complex overloads
    setStore(...args)

    if (!isServer && !!key) {
      let dataToRemember = unwrap(store)
      if (dontRememberKeys.size > 0) {
        dataToRemember = omit(dataToRemember, [...dontRememberKeys]) as TValue
      }
      router.remember(dataToRemember, key)
    }
  }

  return [store, setStoreTrap]
}

export default function useForm<TForm extends FormDataType<TForm> & ValidateFormData<TForm>>(
  method: Method | (() => Method),
  url: string | (() => string),
  data: TForm | (() => TForm),
): InertiaPrecognitiveFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm> & ValidateFormData<TForm>>(
  urlMethodPair: UrlMethodPair | (() => UrlMethodPair),
  data: TForm | (() => TForm),
): InertiaPrecognitiveFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm> & ValidateFormData<TForm>>(
  rememberKey: string,
  data: TForm | (() => TForm),
): InertiaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm> & ValidateFormData<TForm>>(
  data: TForm | (() => TForm),
): InertiaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm> & ValidateFormData<TForm>>(
  ...args: UseFormArguments<TForm>
): InertiaFormProps<TForm> | InertiaPrecognitiveFormProps<TForm> {
  let { rememberKey, data: initialData, precognitionEndpoint } = UseFormUtils.parseUseFormArguments<TForm>(...args)

  const rememberExcludeKeys = new Set<FormDataKeys<TForm>>()

  const [defaults, setDefaults] = createStore<TForm>(typeof initialData === 'function' ? initialData() : initialData)

  const [data, setData] = createRememberStore<TForm>(cloneStore(defaults), rememberKey, 'data', rememberExcludeKeys)

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
  let transform: UseFormTransformCallback<TForm> = (data) => data

  // Track if defaults was called manually during onSuccess to avoid
  // overriding user's custom defaults with automatic behavior.
  let defaultsCalledInOnSuccess = false

  const [processing, setProcessing] = createSignal<boolean>(false)
  const [progress, setProgress] = createSignal<AxiosProgressEvent>(undefined)
  const [wasSuccessful, setWasSuccessful] = createSignal<boolean>(false)
  const [recentlySuccessful, setRecentlySuccessful] = createSignal<boolean>(false)

  // Precognition state
  let validatorRef: Validator | null = null
  const [validating, setValidating] = createSignal(false)
  const [touchedFields, setTouchedFields] = createSignal<string[]>([])
  const [validFields, setValidFields] = createSignal<string[]>([])
  let withAllErrors: boolean | null = null

  const withPrecognition = (...args: UseFormWithPrecognitionArguments): InertiaPrecognitiveFormProps<TForm> => {
    precognitionEndpoint = UseFormUtils.createWayfinderCallback(...args)

    if (!validatorRef) {
      const validator = createValidator(
        (client) => {
          if (!precognitionEndpoint) throw new Error('Precognition endpoint not configured.')
          const { method, url } = precognitionEndpoint()
          const transformedData = transform(unwrap(data)) as Record<string, unknown>
          return client[method](url, transformedData)
        },
        cloneDeep(unwrap(defaults)),
      )

      validatorRef = validator

      validator
        .on('validatingChanged', () => {
          setValidating(validator.validating())
        })
        .on('validatedChanged', () => {
          setValidFields(validator.valid())
        })
        .on('touchedChanged', () => {
          setTouchedFields(validator.touched())
        })
        .on('errorsChanged', () => {
          const validationErrors =
            (withAllErrors ?? config.get('form.withAllErrors'))
              ? validator.errors()
              : toSimpleValidationErrors(validator.errors())

          setErrors(() => validationErrors as FormDataErrors<TForm>)
          setValidFields(validator.valid())
        })
    }

    const precognitiveForm = Object.assign(form, {
      get validating() {
        return validating()
      },
      // biome-ignore lint/style/noNonNullAssertion: Matching official adapters
      validator: () => validatorRef!,
      valid: (field: string) => validFields().includes(field),
      invalid: (field: string) => field in errors(),
      touched: (field?: string): boolean =>
        typeof field === 'string' ? touchedFields().includes(field) : touchedFields().length > 0,
      touch: (
        field: FormDataKeys<TForm> | NamedInputEvent | Array<FormDataKeys<TForm>>,
        ...fields: FormDataKeys<TForm>[]
      ) => {
        if (Array.isArray(field)) {
          validatorRef?.touch(field as string[])
        } else if (typeof field === 'string') {
          validatorRef?.touch([field, ...fields])
        } else {
          validatorRef?.touch(field)
        }
        return precognitiveForm
      },
      withAllErrors: () => {
        withAllErrors = true
        return precognitiveForm
      },
      withoutFileValidation: () => {
        validatorRef?.withoutFileValidation()
        return precognitiveForm
      },
      validateFiles: () => {
        validatorRef?.validateFiles()
        return precognitiveForm
      },
      setValidationTimeout: (duration: number) => {
        validatorRef?.setTimeout(duration)
        return precognitiveForm
      },
      validate: (field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) => {
        if (typeof field === 'object' && !('target' in field)) {
          config = field
          field = undefined
        }

        if (field === undefined) {
          validatorRef?.validate(config)
        } else {
          const fieldName = resolveName(field as string | NamedInputEvent)
          const transformedData = transform(unwrap(data)) as Record<string, unknown>
          validatorRef?.validate(fieldName, get(transformedData, fieldName), config)
        }

        return precognitiveForm
      },
      setErrors: (errors: FormDataErrors<TForm>) => {
        setErrors(() => errors)
        return precognitiveForm
      },
      forgetError: (field: FormDataKeys<TForm> | NamedInputEvent) => {
        setErrors((errors) => omit(errors, [resolveName(field as string | NamedInputEvent)]) as FormDataErrors<TForm>)
        return precognitiveForm
      },
    }) as InertiaPrecognitiveFormProps<TForm>

    return precognitiveForm
  }

  const form: InertiaFormProps<TForm> = {
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

    submit(...args: UseFormSubmitArguments) {
      if (isServer) return

      const { method, url, options } = UseFormUtils.parseSubmitArguments(args, precognitionEndpoint)

      defaultsCalledInOnSuccess = false

      const store = this

      const _options = {
        ...options,
        onCancelToken(token: CancelToken) {
          cancelToken = token

          if (options.onCancelToken) {
            return options.onCancelToken(token)
          }
        },
        onBefore(visit: PendingVisit) {
          batch(() => {
            setWasSuccessful(false)
            setRecentlySuccessful(false)
          })
          clearTimeout(recentlySuccessfulTimeoutId)

          if (options.onBefore) {
            return options.onBefore(visit)
          }
        },
        onStart(visit: PendingVisit) {
          setProcessing(true)

          if (options.onStart) {
            return options.onStart(visit)
          }
        },
        onProgress(event: AxiosProgressEvent) {
          setProgress(event)

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        async onSuccess(page: Page) {
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
        onError(errors: Errors) {
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
    get(url: string, options?: UseFormSubmitOptions) {
      this.submit('get', url, options)
    },
    post(url: string, options?: UseFormSubmitOptions) {
      this.submit('post', url, options)
    },
    put(url: string, options?: UseFormSubmitOptions) {
      this.submit('put', url, options)
    },
    patch(url: string, options?: UseFormSubmitOptions) {
      this.submit('patch', url, options)
    },
    delete(url: string, options?: UseFormSubmitOptions) {
      this.submit('delete', url, options)
    },

    cancel() {
      if (cancelToken) {
        cancelToken.cancel()
      }
    },

    dontRemember(...fields: FormDataKeys<TForm>[]) {
      rememberExcludeKeys.clear()
      fields.forEach((field) => rememberExcludeKeys.add(field))
      return this
    },

    withPrecognition,
  }

  if (precognitionEndpoint) {
    return form.withPrecognition(precognitionEndpoint)
  }

  return form
}
