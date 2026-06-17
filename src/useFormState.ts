import {
  type ErrorValue,
  type FormDataErrors,
  type FormDataKeys,
  type FormDataValues,
  type Progress,
  type UrlMethodPair,
  type UseFormTransformCallback,
  UseFormUtils,
  type UseFormWithPrecognitionArguments,
  config,
  router,
} from '@inertiajs/core'
import { trackStore } from '@solid-primitives/deep'
import { cloneDeep, isEqual, omit, toMerged } from 'es-toolkit'
import { get, has, set } from 'es-toolkit/compat'
import {
  type NamedInputEvent,
  type ValidationConfig,
  type Validator,
  createValidator,
  resolveName,
  toSimpleValidationErrors,
} from 'laravel-precognition'
import { type Setter, batch, createEffect, createMemo, createSignal, untrack } from 'solid-js'
import { type SetStoreFunction, type Store, createStore, produce, reconcile, unwrap } from 'solid-js/store'
import { isServer } from 'solid-js/web'
import useRemember from './useRemember'
import { cloneStore } from './util'

export type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>
}

export interface FormStateProps<TForm extends object> {
  get data(): Store<TForm>
  setData: SetStoreFunction<TForm>
  get isDirty(): boolean

  defaults(): this
  defaults<K extends FormDataKeys<TForm>>(field: K, value: FormDataValues<TForm, K>): this
  defaults(fields: Partial<TForm>): this

  reset<K extends FormDataKeys<TForm>>(...fields: K[]): this

  get errors(): FormDataErrors<TForm>
  get hasErrors(): boolean
  setError<K extends FormDataKeys<TForm>>(field: K, value: ErrorValue): this
  setError(errors: FormDataErrors<TForm>): this
  clearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): this
  resetAndClearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): this

  transform(callback: UseFormTransformCallback<TForm>): this

  get processing(): boolean
  get progress(): Progress | undefined
  get wasSuccessful(): boolean
  get recentlySuccessful(): boolean

  withPrecognition(...args: UseFormWithPrecognitionArguments): FormStateWithPrecognition<TForm>
}

export interface FormStateValidationProps<TForm extends object> {
  invalid<K extends FormDataKeys<TForm>>(field: K): boolean
  setValidationTimeout(duration: number): this
  touch<K extends FormDataKeys<TForm>>(field: K | NamedInputEvent | Array<K>, ...fields: K[]): this
  touched<K extends FormDataKeys<TForm>>(field?: K): boolean
  valid<K extends FormDataKeys<TForm>>(field: K): boolean
  validate<K extends FormDataKeys<TForm>>(
    field?: K | NamedInputEvent | PrecognitionValidationConfig<K>,
    config?: PrecognitionValidationConfig<K>,
  ): this
  validateFiles(): this
  validating: boolean
  validator(): Validator
  withAllErrors(): this
  withoutFileValidation(): this
  setErrors(errors: FormDataErrors<TForm> | Record<string, string | string[]>): this
  forgetError<K extends FormDataKeys<TForm> | NamedInputEvent>(field: K): this
}

export type FormStateWithPrecognition<TForm extends object> = FormStateProps<TForm> & FormStateValidationProps<TForm>

// biome-ignore lint/suspicious/noExplicitAny: Matching official adapters
type ReservedFormKeys = keyof FormStateProps<any>

type ValidateFormData<T> = {
  [K in keyof T]: K extends ReservedFormKeys ? ['Error: This field name is reserved by useForm:', K] : T[K]
}

export interface UseFormStateOptions<TForm extends object> {
  data: TForm | (() => TForm)
  rememberKey?: string | null
  precognitionEndpoint?: (() => UrlMethodPair) | null
}

export interface UseFormStateReturn<TForm extends object> {
  form: FormStateProps<TForm>
  setDefaults: (newDefaults: TForm) => void
  getTransform: () => UseFormTransformCallback<TForm>
  getPrecognitionEndpoint: () => (() => UrlMethodPair) | null
  setProcessing: Setter<boolean>
  setProgress: Setter<Progress | undefined>
  markAsSuccessful: () => void
  wasDefaultsCalledInOnSuccess: () => boolean
  resetDefaultsCalledInOnSuccess: () => void
  setRememberExcludeKeys: (keys: FormDataKeys<TForm>[]) => void
  resetBeforeSubmit: () => void
  finishProcessing: () => void
  withAllErrors: { enabled: () => boolean; enable: () => void }
}

export default function useFormState<TForm extends object>(
  options: UseFormStateOptions<TForm>,
): UseFormStateReturn<TForm> {
  const { data: dataOption, rememberKey } = options
  let { precognitionEndpoint } = options

  const isDataFunction = typeof dataOption === 'function'
  const resolveData = () => (isDataFunction ? (dataOption() as () => TForm)() : dataOption)

  const restored = isServer
    ? null
    : rememberKey
      ? (router.restore(rememberKey) as { data: TForm; errors: Record<FormDataKeys<TForm>, ErrorValue> } | null)
      : null

  const initialData = restored?.data ?? cloneDeep(resolveData())

  const [defaults, setDefaults] = createStore<TForm>(cloneDeep(initialData))
  // Track if defaults was called manually during onSuccess to avoid
  // overriding user's custom defaults with automatic behavior.
  let defaultsCalledInOnSuccess = false

  const [data, setData] = createStore(cloneStore(defaults))

  const rememberExcludeKeys = new Set<FormDataKeys<TForm>>()

  // Watch for remember functionality
  if (!isServer) {
    createEffect(() => {
      if (!rememberKey) {
        return
      }

      trackStore(data)

      const storedData = router.restore(rememberKey)
      const newData = untrack(() => {
        const formData = cloneStore(data)

        if (rememberExcludeKeys.size > 0) {
          // @ts-ignore
          return { data: omit(formData, [...rememberExcludeKeys]) as TForm, errors: errors() }
        }

        return { data: formData, errors: errors() }
      })

      if (!isEqual(storedData, newData)) {
        router.remember(newData, rememberKey)
      }
    })
  }

  const isDirty = createMemo<boolean>(() => {
    trackStore(data)
    trackStore(defaults)

    return untrack(() => !isEqual(unwrap(data), unwrap(defaults)))
  })

  const [errors, setErrors] = rememberKey
    ? useRemember<FormDataErrors<TForm>>({} as FormDataErrors<TForm>, `${rememberKey}:errors`)
    : createSignal<FormDataErrors<TForm>>({} as FormDataErrors<TForm>)

  const hasErrors = createMemo<boolean>(() => Object.keys(errors()).length > 0)

  let transform: UseFormTransformCallback<TForm> = (data) => data

  const [processing, setProcessing] = createSignal<boolean>(false)
  const [progress, setProgress] = createSignal<Progress | undefined>(undefined)
  const [wasSuccessful, setWasSuccessful] = createSignal<boolean>(false)
  const [recentlySuccessful, setRecentlySuccessful] = createSignal<boolean>(false)
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout> | undefined = undefined

  // Precognition state
  let validatorRef: Validator | null = null
  let withAllErrors: boolean | null = false
  const withAllErrorsEnabled = () => withAllErrors ?? config.get('form.withAllErrors')

  const [validating, setValidating] = createSignal(false)
  const [touchedFields, setTouchedFields] = createSignal<string[]>([])
  const [validFields, setValidFields] = createSignal<string[]>([])

  const tap = <T>(value: T, callback: (value: T) => unknown) => {
    callback(value)
    return value
  }

  const withPrecognition = (...args: UseFormWithPrecognitionArguments): FormStateWithPrecognition<TForm> => {
    precognitionEndpoint = UseFormUtils.createWayfinderCallback(...args)

    if (!validatorRef) {
      const validator = createValidator(
        (client) => {
          // biome-ignore lint/style/noNonNullAssertion: Matching official adapters
          const { method, url } = precognitionEndpoint!()
          const transformedData = cloneDeep(transform(unwrap(data))) as Record<string, unknown>

          return client[method](url, transformedData)
        },
        cloneStore(defaults) as Record<string, unknown>,
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
          const validationErrors = withAllErrorsEnabled()
            ? validator.errors()
            : toSimpleValidationErrors(validator.errors())

          batch(() => {
            setErrors(() => validationErrors as FormDataErrors<TForm>)
            setValidFields(validator.valid())
          })
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
      withAllErrors: () =>
        tap(precognitiveForm, () => {
          withAllErrors = true
        }),
      withoutFileValidation: () => tap(precognitiveForm, () => validatorRef?.withoutFileValidation()),
      validateFiles: () => tap(precognitiveForm, () => validatorRef?.validateFiles()),
      setValidationTimeout: (duration: number) => tap(precognitiveForm, () => validatorRef?.setTimeout(duration)),
      validate: (field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) => {
        if (typeof field === 'object' && !('target' in field)) {
          config = field
          field = undefined
        }

        if (field === undefined) {
          validatorRef?.validate(config)
        } else {
          const fieldName = resolveName(field)
          const transformedData = transform(unwrap(data)) as Record<string, unknown>
          validatorRef?.validate(fieldName, get(transformedData, fieldName), config)
        }

        return precognitiveForm
      },
      setErrors: (errors: FormDataErrors<TForm>) => tap(precognitiveForm, () => setErrors(() => errors)),
      forgetError: (field: FormDataKeys<TForm> | NamedInputEvent) =>
        tap(precognitiveForm, () =>
          form.clearErrors(resolveName(field as string | NamedInputEvent) as FormDataKeys<TForm>),
        ),
    }) as FormStateWithPrecognition<TForm>

    return precognitiveForm
  }

  const form: FormStateProps<TForm> = {
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

      validatorRef?.defaults(cloneStore(defaults) as Record<string, unknown>)

      return this
    },

    reset(...fields: string[]) {
      const resolvedData = isDataFunction ? cloneDeep(resolveData()) : unwrap(defaults)
      const clonedData = cloneDeep(resolvedData)

      if (fields.length === 0) {
        if (isDataFunction) {
          setDefaults(reconcile(clonedData))
        }
        setData(reconcile(clonedData))
      } else {
        setData(
          produce((data) => {
            for (const field of fields.filter((key) => has(clonedData, key))) {
              if (isDataFunction) {
                setDefaults(produce((defaults) => set(defaults, field, get(clonedData, field))))
              }
              set(data, field, get(clonedData, field, undefined))
            }
          }),
        )
      }

      validatorRef?.reset(...fields)

      return this
    },

    get errors() {
      return errors()
    },
    get hasErrors() {
      return hasErrors()
    },
    setError(fieldOrFields: FormDataKeys<TForm> | FormDataErrors<TForm>, maybeValue?: ErrorValue) {
      setErrors((errors) =>
        tap(
          {
            ...errors,
            ...(typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields),
          },
          (newErrors) => validatorRef?.setErrors(newErrors),
        ),
      )

      return this
    },
    clearErrors(...fields: FormDataKeys<TForm>[]) {
      setErrors((errors) => {
        return fields.length > 0
          ? // @ts-ignore TypeScript complains that the expected array type of fields is FormDataKeys<TForm>[]
            (omit(errors, fields) as FormDataErrors<TForm>)
          : ({} as FormDataErrors<TForm>)
      })

      if (validatorRef) {
        if (fields.length === 0) {
          validatorRef?.setErrors({})
        } else {
          fields.forEach(validatorRef.forgetError)
        }
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

    transform(callback: UseFormTransformCallback<TForm>) {
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

    withPrecognition,
  }

  return {
    form,
    setDefaults: (newDefaults: TForm) => {
      setDefaults(reconcile(cloneDeep(newDefaults)))
    },
    getTransform: () => transform,
    getPrecognitionEndpoint: () => precognitionEndpoint ?? null,
    setProcessing,
    setProgress,
    markAsSuccessful: () => {
      batch(() => {
        form.clearErrors()
        setWasSuccessful(true)
        setRecentlySuccessful(true)
      })

      clearTimeout(recentlySuccessfulTimeoutId)
      recentlySuccessfulTimeoutId = setTimeout(
        () => setRecentlySuccessful(false),
        config.get('form.recentlySuccessfulDuration'),
      )
    },
    wasDefaultsCalledInOnSuccess: () => defaultsCalledInOnSuccess,
    resetDefaultsCalledInOnSuccess: () => {
      defaultsCalledInOnSuccess = false
    },
    setRememberExcludeKeys: (keys: FormDataKeys<TForm>[]) => {
      rememberExcludeKeys.clear()
      keys.forEach((key) => rememberExcludeKeys.add(key))
    },
    resetBeforeSubmit: () => {
      batch(() => {
        setWasSuccessful(false)
        setRecentlySuccessful(false)
      })
      clearTimeout(recentlySuccessfulTimeoutId)
    },
    finishProcessing: () => {
      batch(() => {
        setProcessing(false)
        setProgress(undefined)
      })
    },
    withAllErrors: {
      enabled: withAllErrorsEnabled,
      enable: () => {
        withAllErrors = true
      },
    },
  }
}
