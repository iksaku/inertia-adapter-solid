import {
  type Errors,
  type FormComponentProps,
  type FormComponentSlotProps,
  type FormDataConvertible,
  type Method,
  type VisitOptions,
  formDataToObject,
  isUrlMethodPair,
  mergeDataIntoQueryString,
  resetFormFields,
} from '@inertiajs/core'
import { isEqual } from 'es-toolkit'
import {
  type Component,
  type JSX,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
  splitProps,
} from 'solid-js'
import { createDynamic } from 'solid-js/web'
import useForm from './useForm'

type FormProps = FormComponentProps & {
  children: JSX.Element | Component<FormComponentSlotProps>
}

type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>

const noop = () => {}

export default function Form(_props: FormProps) {
  let [props, attributes] = splitProps(_props, [
    'action',
    'method',
    'headers',
    'queryStringArrayFormat',
    'errorBag',
    'showProgress',
    'transform',
    'options',
    'onStart',
    'onProgress',
    'onFinish',
    'onBefore',
    'onBeforeUpdate',
    'onCancel',
    'onSuccess',
    'onError',
    'onCancelToken',
    'onSubmitComplete',
    'disableWhileProcessing',
    'resetOnError',
    'resetOnSuccess',
    'setDefaultsOnSuccess',
    'invalidateCacheTags',
    'children',
  ])

  props = mergeProps(
    {
      action: '',
      method: 'get',
      headers: {},
      queryStringFormat: 'brackets',
      errorBag: null,
      showProgress: true,
      transform: (data: Record<string, FormDataConvertible>) => data,
      options: {},
      disableWhileProcessing: false,
      resetOnError: false,
      resetOnSuccess: false,
      setDefaultsOnSuccess: false,
      invalidateCacheTags: [],
    },
    props,
  )

  const form = useForm<Record<string, FormDataConvertible>>({})

  let formElement: HTMLFormElement

  function getFormData(): FormData {
    return new FormData(formElement)
  }

  // Convert the FormData to an object because we can't compare two FormData
  // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
  // expects an object, and submitting a FormData instance directly causes problems with nested objects.
  function getData(): Record<string, FormDataConvertible> {
    return formDataToObject(getFormData())
  }

  const method = createMemo(() => (isUrlMethodPair(props.action) ? props.action.method : (props.method as Method)))

  // Can't use computed because FormData is not reactive
  const [isDirty, setIsDirty] = createSignal(false)

  const [defaultData, setDefaultData] = createSignal(new FormData())
  function defaults() {
    setDefaultData(getFormData())
    setIsDirty(false)
  }

  const formEvents: Array<keyof HTMLElementEventMap> = ['input', 'change', 'reset']

  function onFormUpdate(event: Event) {
    // If the form is reset, we set isDirty to false as we already know it's back
    // to defaults. Also, the fields are updated after the reset event, so the
    // comparison will be incorrect unless we use the nextTick / setTimeout.
    setIsDirty(event.type === 'reset' ? false : !isEqual(getData(), formDataToObject(defaultData())))
  }

  onMount(() => {
    setDefaultData(getFormData())
    formEvents.forEach((e) => formElement.addEventListener(e, onFormUpdate))
  })

  onCleanup(() => {
    formEvents.forEach((e) => formElement?.removeEventListener(e, onFormUpdate))
  })

  function reset(...fields: string[]) {
    resetFormFields(formElement.value, defaultData(), fields)
  }

  function resetAndClearErrors(...fields: string[]) {
    form.clearErrors(...fields)
    reset(...fields)
  }

  function submit() {
    const [action, data] = mergeDataIntoQueryString(
      method(),
      isUrlMethodPair(props.action) ? props.action.url : props.action,
      getData(),
      props.queryStringArrayFormat,
    )

    function maybeReset(resetOption: boolean | string[]) {
      if (!resetOption) return

      if (resetOption === true) {
        reset()
      } else if (resetOption.length > 0) {
        reset(...resetOption)
      }
    }

    const submitOptions: FormSubmitOptions = {
      headers: props.headers,
      errorBag: props.errorBag,
      showProgress: props.showProgress,
      invalidateCacheTags: props.invalidateCacheTags,
      onCancelToken: props.onCancelToken ?? noop,
      onBefore: props.onBefore ?? noop,
      onBeforeUpdate: props.onBeforeUpdate ?? noop,
      onStart: props.onStart ?? noop,
      onProgress: props.onProgress ?? noop,
      onFinish: props.onFinish ?? noop,
      onCancel: props.onCancel ?? noop,
      onSuccess: (...args) => {
        props.onSuccess?.(...args)
        props.onSubmitComplete?.(exposed)
        maybeReset(props.resetOnSuccess)

        if (props.setDefaultsOnSuccess === true) {
          defaults()
        }
      },
      onError: (...args) => {
        props.onError?.(...args)
        maybeReset(props.resetOnError)
      },
      ...props.options,
    }

    // We need to transform because we can't override the default data with different keys (by design)
    form.transform(() => props.transform(data)).submit(method(), action, submitOptions)
  }

  const exposed: FormComponentSlotProps = {
    get errors() {
      return form.errors
    },
    get hasErrors() {
      return form.hasErrors
    },
    get processing() {
      return form.processing
    },
    get progress() {
      return form.progress
    },
    get wasSuccessful() {
      return form.wasSuccessful
    },
    get recentlySuccessful() {
      return form.recentlySuccessful
    },
    clearErrors: (...fields: string[]) => form.clearErrors(...fields),
    resetAndClearErrors,
    setError: (fieldOrFields: string | Record<string, string>, maybeValue?: string) =>
      form.setError((typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields) as Errors),
    get isDirty() {
      return isDirty()
    },
    reset,
    submit,
    defaults,
  }

  return createDynamic(
    () => 'form',
    mergeProps(attributes, {
      ref(el: HTMLFormElement) {
        formElement = el
      },
      get action() {
        return isUrlMethodPair(props.action) ? props.action.url : props.action
      },
      get method() {
        return method() as JSX.HTMLFormMethod
      },
      onSubmit(event: Event) {
        event.preventDefault()
        submit()
      },
      get inert() {
        return props.disableWhileProcessing && form.processing
      },
      get children() {
        if (typeof props.children !== 'function') {
          return props.children
        }

        return props.children(exposed)
      },
    }),
  )
}
