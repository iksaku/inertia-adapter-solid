import {
  type ErrorValue,
  type Errors,
  type FormComponentProps,
  type FormComponentRef,
  FormComponentResetSymbol,
  type FormComponentSlotProps,
  type FormDataConvertible,
  type Method,
  UseFormUtils,
  type VisitOptions,
  config,
  formDataToObject,
  isUrlMethodPair,
  mergeDataIntoQueryString,
  resetFormFields,
} from '@inertiajs/core'
import { isEqual } from 'es-toolkit'
import type { NamedInputEvent, ValidationConfig } from 'laravel-precognition'
import {
  type Component,
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  on,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from 'solid-js'
import { createComponent, createDynamic } from 'solid-js/web'
import useForm from './useForm'

type FormProps = FormComponentProps & {
  ref?: (val: FormComponentRef) => void
  children: JSX.Element | Component<FormComponentSlotProps>
}

type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>
type FormSubmitter = HTMLElement | null

const noop = () => {}

const FormContext = createContext<FormComponentRef | undefined>(undefined)

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
    'validateFiles',
    'validationTimeout',
    'withAllErrors',
    'ref',
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
      validateFiles: false,
      validationTimeout: 1500,
      withAllErrors: null,
    },
    props,
  )

  const getTransformedData = (): Record<string, FormDataConvertible> => {
    const [_url, data] = getUrlAndData()

    return props.transform(data)
  }

  // biome-ignore lint/suspicious/noExplicitAny: Matching official adapters
  const form = useForm<Record<string, any>>({})
    .withPrecognition(
      () => method(),
      () => getUrlAndData()[0],
    )
    .transform(getTransformedData)
    .setValidationTimeout(props.validationTimeout)

  if (props.validateFiles) {
    form.validateFiles()
  }

  if (props.withAllErrors ?? config.get('form.withAllErrors')) {
    form.withAllErrors()
  }

  let formElement: HTMLFormElement

  function getFormData(submitter?: FormSubmitter): FormData {
    return new FormData(formElement, submitter)
  }

  // Convert the FormData to an object because we can't compare two FormData
  // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
  // expects an object, and submitting a FormData instance directly causes problems with nested objects.
  function getData(submitter?: FormSubmitter): Record<string, FormDataConvertible> {
    return formDataToObject(getFormData(submitter))
  }

  function getUrlAndData(submitter?: FormSubmitter): [string, Record<string, FormDataConvertible>] {
    return mergeDataIntoQueryString(
      method(),
      isUrlMethodPair(props.action) ? props.action.url : props.action,
      getData(submitter),
      props.queryStringArrayFormat,
    )
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
    if (event.type === 'reset' && (event as CustomEvent).detail?.[FormComponentResetSymbol]) {
      // When the form is reset programatically, prevent native reset behavior
      event.preventDefault()
    }

    // If the form is reset, we set isDirty to false as we already know it's back
    // to defaults. Also, the fields are updated after the reset event, so the
    // comparison will be incorrect unless we use the nextTick / setTimeout.
    setIsDirty(event.type === 'reset' ? false : !isEqual(getData(), formDataToObject(defaultData())))
  }

  onMount(() => {
    setDefaultData(getFormData())

    form.defaults(getData())

    formEvents.forEach((e) => formElement.addEventListener(e, onFormUpdate))
  })

  createEffect(
    on(
      () => props.validateFiles,
      (value) => (value ? form.validateFiles() : form.withoutFileValidation()),
    ),
  )

  createEffect(
    on(
      () => props.validationTimeout,
      (value) => form.setValidationTimeout(value),
    ),
  )

  onCleanup(() => {
    formEvents.forEach((e) => formElement?.removeEventListener(e, onFormUpdate))
  })

  function reset(...fields: string[]) {
    resetFormFields(formElement, defaultData(), fields)
  }

  function clearErrors(...fields: string[]) {
    form.clearErrors(...fields)
  }

  function resetAndClearErrors(...fields: string[]) {
    clearErrors(...fields)
    reset(...fields)
  }

  function submit(submitter?: FormSubmitter) {
    const [url, data] = getUrlAndData(submitter)
    const formTarget = (submitter as HTMLButtonElement | HTMLInputElement | null)?.getAttribute('formtarget')

    if (formTarget === '_blank' && method() === 'get') {
      window.open(url, '_blank')
      return
    }

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
      queryStringArrayFormat: props.queryStringArrayFormat,
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

    // We need transform because we can't override the default data with different keys (by design)
    form.transform(() => props.transform(data)).submit(method(), url, submitOptions)

    // Reset the transformer back so the submitter is not used for future submissions
    form.transform(getTransformedData)
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
    get isDirty() {
      return isDirty()
    },
    clearErrors: (...fields: string[]) => form.clearErrors(...fields),
    resetAndClearErrors,
    setError: (fieldOrFields: string | Errors, maybeValue?: ErrorValue) =>
      form.setError(typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields),
    reset,
    submit,
    defaults,
    getData,
    getFormData,

    // Precognition
    touch: form.touch,
    touched: form.touched,
    get validating() {
      return form.validating
    },
    valid: form.valid,
    invalid: form.invalid,
    validate: (field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) =>
      form.validate(...UseFormUtils.mergeHeadersForValidation(field, config, props.headers)),
    validator: () => form.validator(),
  }

  props.ref?.(exposed)

  return createComponent(FormContext.Provider, {
    value: exposed,
    get children() {
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
          onSubmit(event: SubmitEvent) {
            event.preventDefault()
            submit(event.submitter)
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
    },
  })
}

export function useFormContext(): FormComponentRef | undefined {
  return useContext(FormContext)
}
