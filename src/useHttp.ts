import {
  type CancelToken,
  type Errors,
  type FormDataConvertible,
  type FormDataErrors,
  type FormDataKeys,
  type FormDataType,
  HttpCancelledError,
  type HttpProgressEvent,
  HttpResponseError,
  type Method,
  type UrlMethodPair,
  type UseFormArguments,
  type UseFormTransformCallback,
  UseFormUtils,
  type UseFormWithPrecognitionArguments,
  type UseHttpSubmitArguments,
  type UseHttpSubmitOptions,
  hasFiles,
  http as httpModule,
  mergeDataIntoQueryString,
  objectToFormData,
} from '@inertiajs/core'
import { cloneDeep } from 'es-toolkit'
import {
  type NamedInputEvent,
  type PrecognitionPath,
  type Validator,
  toSimpleValidationErrors,
} from 'laravel-precognition'
import { batch, createSignal } from 'solid-js'
import { reconcile, unwrap } from 'solid-js/store'
import { isServer } from 'solid-js/web'
import useFormState, { type FormStateProps, type PrecognitionValidationConfig } from './useFormState'
import { cloneStore } from './util'

export interface HttpFormProps<TForm extends Record<string, FormDataConvertible>, TResponse = unknown>
  extends Omit<FormStateProps<TForm>, 'transform' | 'withPrecognition'> {
  response: TResponse | null

  submit(...args: UseHttpSubmitArguments<TResponse, TForm>): Promise<TResponse>
  get(url: string, options?: UseHttpSubmitOptions<TResponse, TForm>): Promise<TResponse>
  post(url: string, options?: UseHttpSubmitOptions<TResponse, TForm>): Promise<TResponse>
  put(url: string, options?: UseHttpSubmitOptions<TResponse, TForm>): Promise<TResponse>
  patch(url: string, options?: UseHttpSubmitOptions<TResponse, TForm>): Promise<TResponse>
  delete(url: string, options?: UseHttpSubmitOptions<TResponse, TForm>): Promise<TResponse>
  cancel(): void

  dontRemember<K extends FormDataKeys<TForm>>(...fields: K[]): this

  optimistic(callback: (currentData: TForm) => Partial<TForm> | void): this

  withAllErrors(): this

  transform(callback: UseFormTransformCallback<TForm>): this

  withPrecognition(...args: UseFormWithPrecognitionArguments): HttpPrecognitiveFormProps<TForm, TResponse>
}

export interface HttpFormValidationProps<TForm extends Record<string, FormDataConvertible>, TResponse = unknown> {
  invalid<K extends FormDataKeys<TForm>>(field: K): boolean
  setValidationTimeout(duration: number): HttpPrecognitiveFormProps<TForm, TResponse>
  touch<K extends FormDataKeys<TForm>>(
    field: K | NamedInputEvent | Array<K>,
    ...fields: K[]
  ): HttpPrecognitiveFormProps<TForm, TResponse>
  touched<K extends FormDataKeys<TForm>>(field?: K): boolean
  valid<K extends FormDataKeys<TForm>>(field: K): boolean
  validate<K extends FormDataKeys<TForm> | PrecognitionPath<TForm>>(
    field?: K | NamedInputEvent | PrecognitionValidationConfig<K>,
    config?: PrecognitionValidationConfig<K>,
  ): HttpPrecognitiveFormProps<TForm, TResponse>
  validateFiles(): HttpPrecognitiveFormProps<TForm, TResponse>
  validating: boolean
  validator(): Validator
  withAllErrors(): HttpPrecognitiveFormProps<TForm, TResponse>
  withoutFileValidation(): HttpPrecognitiveFormProps<TForm, TResponse>
  setErrors(errors: FormDataErrors<TForm>): HttpPrecognitiveFormProps<TForm, TResponse>
  forgetError<K extends FormDataKeys<TForm> | NamedInputEvent>(field: K): HttpPrecognitiveFormProps<TForm, TResponse>
}

export type HttpPrecognitiveFormProps<
  TForm extends Record<string, FormDataConvertible>,
  TResponse = unknown,
> = HttpFormProps<TForm, TResponse> & HttpFormValidationProps<TForm, TResponse>

export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  method: Method | (() => Method),
  url: string | (() => string),
  data: TForm | (() => TForm),
): HttpPrecognitiveFormProps<TForm, TResponse>
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  urlMethodPair: UrlMethodPair | (() => UrlMethodPair),
  data: TForm | (() => TForm),
): HttpPrecognitiveFormProps<TForm, TResponse>
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  rememberKey: string,
  data: TForm | (() => TForm),
): HttpFormProps<TForm, TResponse>
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  data: TForm | (() => TForm),
): HttpFormProps<TForm, TResponse>
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(): HttpFormProps<
  TForm,
  TResponse
>
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  ...args: UseFormArguments<TForm>
): HttpFormProps<TForm, TResponse> | HttpPrecognitiveFormProps<TForm, TResponse> {
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
    withAllErrors,
  } = useFormState<TForm>({ data, rememberKey, precognitionEndpoint })

  const [response, setResponse] = createSignal<TResponse | null>(null)
  let abortController: AbortController | null = null
  let pendingOptimisticCallback: ((currentData: TForm) => Partial<TForm> | void) | null = null

  const form = baseForm as unknown as HttpFormProps<TForm, TResponse>

  const submit = async (
    method: Method,
    url: string,
    options: UseHttpSubmitOptions<TResponse, TForm>,
  ): Promise<TResponse> => {
    if (isServer) {
      return Promise.reject(new Error('useHttp cannot be used during server-side rendering.'))
    }

    const onBefore = options.onBefore?.()
    if (onBefore === false) {
      return Promise.reject(new Error('Request cancelled by onBefore.'))
    }

    resetDefaultsCalledInOnSuccess()
    resetBeforeSubmit()

    abortController = new AbortController()

    const cancelToken: CancelToken = {
      cancel: () => abortController?.abort(),
    }

    options.onCancelToken?.(cancelToken)

    options.optimistic = options.optimistic ?? pendingOptimisticCallback ?? undefined
    pendingOptimisticCallback = null

    let snapshot: TForm | undefined

    if (options.optimistic) {
      snapshot = cloneStore(form.data)
      const optimisticData = options.optimistic(cloneDeep(snapshot))

      if (optimisticData) {
        form.setData(reconcile({ ...snapshot, ...optimisticData }))
      }
    }

    setProcessing(true)
    options.onStart?.()

    const transformedData = getTransform()(unwrap(form.data)) as Record<string, FormDataConvertible>
    const useFormData = hasFiles(transformedData)

    let requestUrl = url
    let requestData: FormData | string | undefined = undefined
    let contentType: string | undefined

    if (method === 'get') {
      const [urlWithParams] = mergeDataIntoQueryString(method, url, transformedData)
      requestUrl = urlWithParams
    } else {
      if (useFormData) {
        requestData = objectToFormData(transformedData)
      } else {
        requestData = JSON.stringify(transformedData)
        contentType = 'application/json'
      }
    }

    try {
      const _response = await httpModule.getClient().request({
        method,
        url: requestUrl,
        data: requestData,
        headers: {
          Accept: 'application/json',
          ...(contentType ? { 'Content-Type': contentType } : {}),
          ...options.headers,
        },
        signal: abortController.signal,
        onUploadProgress: (event: HttpProgressEvent) => {
          setProgress(event)
          options.onProgress?.(event)
        },
      })

      const responseData = (_response.data ? JSON.parse(_response.data) : null) as TResponse

      if (_response.status >= 200 && _response.status < 300) {
        markAsSuccessful()
        setResponse(() => responseData)

        options.onSuccess?.(responseData, _response)

        if (!wasDefaultsCalledInOnSuccess()) {
          setDefaults(cloneStore(baseForm.data))
        }

        return responseData
      }

      throw new HttpResponseError(`Request failed with status ${_response.status}`, _response, url)
    } catch (error) {
      if (snapshot) {
        form.setData(reconcile(snapshot))
      }

      if (error instanceof HttpResponseError) {
        if (error.response.status === 422) {
          const responseData = JSON.parse(error.response.data)
          const validationErrors = responseData.errors || {}
          const processedErrors = (
            withAllErrors.enabled() ? validationErrors : toSimpleValidationErrors(validationErrors)
          ) as FormDataErrors<TForm>

          batch(() => {
            form.clearErrors().setError(processedErrors)
          })

          options.onError?.(processedErrors as Errors)
        } else {
          options.onHttpException?.(error.response)
        }

        throw error
      }

      if (error instanceof HttpCancelledError || (error instanceof Error && error.name === 'AbortError')) {
        options.onCancel?.()
        throw new HttpCancelledError('Request was cancelled', url)
      }

      options.onNetworkError?.(error instanceof Error ? error : new Error('Unknown error'))

      throw error
    } finally {
      finishProcessing()
      abortController = null
      options.onFinish?.()
    }
  }

  const createSubmitMethod =
    (method: Method) =>
    async (url: string, options: UseHttpSubmitOptions<TResponse, TForm> = {}) => {
      return submit(method, url, options)
    }

  const originalWithPrecognition = form.withPrecognition

  Object.assign(form, {
    get response() {
      return response()
    },
    submit(...args: UseHttpSubmitArguments<TResponse, TForm>): Promise<TResponse> {
      // biome-ignore lint/suspicious/noExplicitAny: Matching official adapters
      const parsed = UseFormUtils.parseSubmitArguments(args as any, getPrecognitionEndpoint())

      return submit(parsed.method, parsed.url, parsed.options as unknown as UseHttpSubmitOptions<TResponse, TForm>)
    },

    get: createSubmitMethod('get'),
    post: createSubmitMethod('post'),
    put: createSubmitMethod('put'),
    patch: createSubmitMethod('patch'),
    delete: createSubmitMethod('delete'),

    cancel: () => {
      if (abortController) {
        abortController.abort()
      }
    },

    dontRemember(...fields: FormDataKeys<TForm>[]) {
      setRememberExcludeKeys(fields)
      return this
    },

    optimistic(callback: (currentData: TForm) => Partial<TForm> | void) {
      pendingOptimisticCallback = callback
      return this
    },

    withAllErrors() {
      withAllErrors.enable()
      return this
    },

    withPrecognition(...args: UseFormWithPrecognitionArguments): HttpPrecognitiveFormProps<TForm, TResponse> {
      originalWithPrecognition(...args)
      return this as unknown as HttpPrecognitiveFormProps<TForm, TResponse>
    },
  })

  return getPrecognitionEndpoint() ? (form as unknown as HttpPrecognitiveFormProps<TForm, TResponse>) : form
}
