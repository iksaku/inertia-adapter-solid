import {
  type CancelToken,
  type FormDataConvertible,
  type FormDataErrors,
  type FormDataKeys,
  type FormDataType,
  type Method,
  type OptimisticCallback,
  type RequestPayload,
  type UrlMethodPair,
  type UseFormArguments,
  type UseFormSubmitArguments,
  type UseFormSubmitOptions,
  UseFormUtils,
  type UseFormWithPrecognitionArguments,
  type VisitOptions,
  router,
} from '@inertiajs/core'
import type { NamedInputEvent, PrecognitionPath, Validator } from 'laravel-precognition'
import { batch } from 'solid-js'
import { unwrap } from 'solid-js/store'
import { isServer } from 'solid-js/web'
import useFormState, { type FormStateProps, type PrecognitionValidationConfig } from './useFormState'

export interface InertiaFormProps<TForm extends Record<string, FormDataConvertible>>
  extends Omit<FormStateProps<TForm>, 'withPrecognition'> {
  submit(...args: UseFormSubmitArguments): void
  get(url: string, options?: UseFormSubmitOptions): void
  post(url: string, options?: UseFormSubmitOptions): void
  put(url: string, options?: UseFormSubmitOptions): void
  patch(url: string, options?: UseFormSubmitOptions): void
  delete(url: string, options?: UseFormSubmitOptions): void
  cancel(): void

  dontRemember<K extends FormDataKeys<TForm>>(...fields: K[]): this

  optimistic<TProps>(callback: OptimisticCallback<TProps>): this

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

export default function useForm<TForm extends FormDataType<TForm>>(
  method: Method | (() => Method),
  url: string | (() => string),
  data: TForm | (() => TForm),
): InertiaPrecognitiveFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  urlMethodPair: UrlMethodPair | (() => UrlMethodPair),
  data: TForm | (() => TForm),
): InertiaPrecognitiveFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  data: TForm | (() => TForm),
): InertiaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(data: TForm | (() => TForm)): InertiaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(): InertiaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  ...args: UseFormArguments<TForm>
): InertiaFormProps<TForm> | InertiaPrecognitiveFormProps<TForm> {
  const { rememberKey, data, precognitionEndpoint } = UseFormUtils.parseUseFormArguments<TForm>(...args)

  const {
    form: baseForm,
    setDefaults,
    getTransform,
    getPrecognitionEndpoint,
    setProcessing,
    setProgress,
    markAsSuccessful,
    wasDefaultsCalledInOnSuccess,
    resetDefaultsCalledInOnSuccess,
    setRememberExcludeKeys,
    resetBeforeSubmit,
    finishProcessing,
  } = useFormState<TForm>({ data, rememberKey, precognitionEndpoint })

  let cancelToken: CancelToken | null = null
  let pendingOptimisticCallback: OptimisticCallback | null = null

  const form = baseForm as unknown as InertiaFormProps<TForm>

  const createSubmitMethod =
    (method: Method) =>
    (url: string, options: VisitOptions = {}) => {
      form.submit(method, url, options)
    }

  const originalWithPrecognition = form.withPrecognition

  Object.assign(form, {
    submit: (...args: UseFormSubmitArguments) => {
      if (isServer) return

      const { method, url, options } = UseFormUtils.parseSubmitArguments(args, getPrecognitionEndpoint())

      resetDefaultsCalledInOnSuccess()

      const _options: VisitOptions = {
        ...options,
        onCancelToken(token) {
          cancelToken = token

          return options.onCancelToken?.(token)
        },
        onBefore(visit) {
          resetBeforeSubmit()

          return options.onBefore?.(visit)
        },
        onStart(visit) {
          setProcessing(true)

          return options.onStart?.(visit)
        },
        onProgress(event) {
          setProgress(event)

          return options.onProgress?.(event)
        },
        async onSuccess(page) {
          markAsSuccessful()

          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null

          if (!wasDefaultsCalledInOnSuccess()) {
            setDefaults(unwrap(baseForm.data))
          }

          return onSuccess
        },
        onError(errors) {
          batch(() => {
            baseForm.clearErrors().setError(errors as FormDataErrors<TForm>)
          })

          return options.onError?.(errors)
        },
        onCancel() {
          return options.onCancel?.()
        },
        onFinish(visit) {
          finishProcessing()
          cancelToken = null

          return options.onFinish?.(visit)
        },
      }

      _options.optimistic = _options.optimistic ?? pendingOptimisticCallback ?? undefined
      pendingOptimisticCallback = null

      const transformedData = getTransform()(unwrap(baseForm.data)) as RequestPayload

      if (method === 'delete') {
        router.delete(url, { ..._options, data: transformedData })
      } else {
        router[method](url, transformedData, _options)
      }
    },

    get: createSubmitMethod('get'),
    post: createSubmitMethod('post'),
    put: createSubmitMethod('put'),
    patch: createSubmitMethod('patch'),
    delete: createSubmitMethod('delete'),

    cancel() {
      if (cancelToken) {
        cancelToken.cancel()
      }
    },

    dontRemember(...fields: FormDataKeys<TForm>[]) {
      setRememberExcludeKeys(fields)
      return this
    },

    optimistic<TProps>(callback: OptimisticCallback<TProps>) {
      pendingOptimisticCallback = callback as OptimisticCallback
      return this
    },

    withPrecognition(...args: UseFormWithPrecognitionArguments): InertiaPrecognitiveFormProps<TForm> {
      originalWithPrecognition(...args)
      return this as unknown as InertiaPrecognitiveFormProps<TForm>
    },
  })

  return getPrecognitionEndpoint() ? (form as unknown as InertiaPrecognitiveFormProps<TForm>) : form
}
