import { Method, router, VisitOptions } from '@inertiajs/core'
import { deepTrack } from '@solid-primitives/deep'
import cloneDeep from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'
import { createEffect, createMemo, createSignal } from 'solid-js'
import { createStore, reconcile, SetStoreFunction, Store, unwrap } from 'solid-js/store'

type FormState = Record<string, unknown>
type InertiaRestoredState<TForm extends FormState> = { data: TForm; errors: Record<keyof TForm, string> }

interface InertiaFormProps<TForm extends FormState> {
  isDirty: boolean

  defaults(): this
  defaults(field: keyof TForm, value: unknown): this
  defaults(fields: TForm): this

  reset(...fields: string[]): void
  transform(callback: (data: TForm) => null): void

  errors: Partial<Record<keyof TForm, string>>
  hasErrors: boolean
  setError(field: keyof TForm, value: string): this
  setError(fields: Record<keyof TForm, string>): this
  clearErrors(...fields: string[]): this

  get(url: string, options?: Partial<VisitOptions>): void
  post(url: string, options?: Partial<VisitOptions>): void
  put(url: string, options?: Partial<VisitOptions>): void
  patch(url: string, options?: Partial<VisitOptions>): void
  delete(url: string, options?: Partial<VisitOptions>): void
  cancel(): void
}

export type InertiaForm<TForm extends FormState> = [get: Store<InertiaFormProps<TForm>>, set: SetStoreFunction<TForm>]

export default function useForm<TForm extends FormState>(initialValues?: TForm): InertiaForm<TForm>
export default function useForm<TForm extends FormState>(rememberKey: string, initialValues?: TForm): InertiaForm<TForm>
export default function useForm<TForm extends FormState>(
  rememberKeyOrInitialValues?: string | TForm,
  maybeInitialValues?: TForm,
): InertiaForm<TForm> {
  const rememberKey: string | null = typeof rememberKeyOrInitialValues === 'string' ? rememberKeyOrInitialValues : null
  const data: TForm = typeof rememberKeyOrInitialValues === 'string' ? maybeInitialValues : rememberKeyOrInitialValues
  const restored: InertiaRestoredState<TForm> | null = rememberKey
    ? (router.restore(rememberKey) as InertiaRestoredState<TForm>)
    : null

  const [defaults, setDefaults] = createSignal(data)
  let cancelToken = null
  let recentlySuccessfulTimeoutId = null
  let transform = (data) => data

  let dataMemo
  let isDirtyMemo
  let hasErrorsMemo
  let submit

  const [form, setForm] = createStore({
    ...(restored ? restored.data : cloneDeep(defaults())),
    get data() {
      return dataMemo()
    },
    get isDirty() {
      return isDirtyMemo()
    },

    defaults(fieldOrFields?: keyof TForm | Record<keyof TForm, unknown>, maybeValue?: unknown) {
      if (typeof fieldOrFields === 'undefined') {
        setDefaults(Object.assign(defaults(), this.data))

        return this
      }

      setDefaults(
        Object.assign(
          {},
          cloneDeep(defaults()),
          typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields,
        ),
      )

      return this
    },

    reset(...fields: string[]) {
      if (fields.length === 0) {
        setForm(cloneDeep(defaults()))

        return this
      }

      setForm(
        Object.keys(defaults())
          .filter((key) => fields.includes(key))
          .reduce((carry, key) => {
            carry[key] = defaults()[key]
            return carry
          }, {}),
      )

      return this
    },
    transform(callback) {
      transform = callback

      return this
    },

    errors: restored ? restored.errors : {},
    get hasErrors() {
      return hasErrorsMemo()
    },
    setError(fieldOrFields: keyof TForm | Record<keyof TForm, string>, maybeValue?: string) {
      if (typeof fieldOrFields === 'string') {
        // @ts-ignore-error
        fieldOrFields = { [fieldOrFields]: maybeValue }
      }

      // @ts-ignore
      setForm('errors', (errors) => ({ ...errors, ...fieldOrFields }))

      return this
    },
    clearErrors(...fields: string[]) {
      setForm('errors', (errors) =>
        reconcile(
          Object.keys(errors).reduce(
            (carry, field) => ({
              ...carry,
              ...(fields.length > 0 && !fields.includes(field) ? { [field]: errors[field] } : {}),
            }),
            {},
          ),
        ),
      )

      return this
    },

    processing: false,
    progress: null,
    wasSuccessful: false,
    recentlySuccessful: false,

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
    get submit() {
      return submit
    },
    cancel() {
      if (cancelToken) {
        cancelToken.cancel()
      }
    },
  })

  dataMemo = createMemo(() =>
    Object.keys(defaults()).reduce((carry, key) => {
      carry[key] = form[key]
      return carry
    }, {}),
  )
  isDirtyMemo = createMemo(() => isEqual(form.data, defaults()))

  const deeplyTrackedFormErrors = () => deepTrack(form.errors)
  hasErrorsMemo = createMemo(() => Object.keys(unwrap(deeplyTrackedFormErrors())).length > 0)

  submit = (method: Method, url: string, options: Partial<VisitOptions> = {}) => {
    const data = transform(form.data)
    const _options = {
      ...options,
      onCancelToken(token) {
        cancelToken = token

        if (options.onCancelToken) {
          return options.onCancelToken(token)
        }
      },
      onBefore(visit) {
        setForm('wasSuccessful', true)
        setForm('recentlySuccessful', false)
        clearTimeout(recentlySuccessfulTimeoutId)

        if (options.onBefore) {
          return options.onBefore(visit)
        }
      },
      onStart(visit) {
        setForm('processing', true)

        if (options.onStart) {
          return options.onStart(visit)
        }
      },
      onProgress(event) {
        setForm('progress', event)

        if (options.onProgress) {
          return options.onProgress(event)
        }
      },
      async onSuccess(page) {
        setForm({
          processing: false,
          progress: null,
          wasSuccessful: true,
          recentlySuccessful: true,
        })

        form.clearErrors()
        recentlySuccessfulTimeoutId = setTimeout(() => setForm('recentlySuccessful', false), 2000)

        setDefaults(cloneDeep(form.data))

        if (options.onSuccess) {
          return await options.onSuccess(page)
        }
      },
      onError(errors) {
        setForm({
          processing: false,
          progress: null,
        })

        form.clearErrors().setError(errors)

        if (options.onError) {
          return options.onError(errors)
        }
      },
      onCancel() {
        setForm({
          processing: false,
          progress: null,
        })

        if (options.onCancel) {
          return options.onCancel()
        }
      },
      onFinish(visit) {
        setForm({
          processing: false,
          progress: null,
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
  }

  if (rememberKey) {
    createEffect(() => {
      router.remember({ data: unwrap(form.data), errors: unwrap(deeplyTrackedFormErrors()) }, rememberKey)
    })
  }

  return [form, setForm]
}
