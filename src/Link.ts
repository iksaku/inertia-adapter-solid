import {
  FormDataConvertible,
  mergeDataIntoQueryString,
  Method,
  PreserveStateOption,
  Progress,
  router,
  shouldIntercept,
} from '@inertiajs/core'
import { ComponentProps, JSX, mergeProps, ParentProps, splitProps } from 'solid-js'
import { createComponent, Dynamic, isServer } from 'solid-js/web'

type InertiaLinkProps = {
  as?: keyof JSX.IntrinsicElements
  data?: Record<string, FormDataConvertible>
  href: string
  method?: Method
  preserveScroll?: PreserveStateOption
  preserveState?: PreserveStateOption
  replace?: boolean
  only?: string[]
  headers?: Record<string, string>
  queryStringArrayFormat?: 'indices' | 'brackets'
  onClick?: (event: MouseEvent) => void
  onCancelToken?: (cancelToken: any) => void
  onBefore?: () => void
  onStart?: () => void
  onProgress?: (progress: Progress) => void
  onFinish?: () => void
  onCancel?: () => void
  onSuccess?: () => void
  onError?: () => void
}

const noop = () => {}

export default function Link(_props: ParentProps<InertiaLinkProps> & ComponentProps<InertiaLinkProps['as']>) {
  let [props, attributes] = splitProps(_props, [
    'children',
    'as',
    'data',
    'href',
    'method',
    'preserveScroll',
    'preserveState',
    'replace',
    'only',
    'headers',
    'queryStringArrayFormat',
    'onClick',
    'onCancelToken',
    'onBefore',
    'onStart',
    'onProgress',
    'onFinish',
    'onCancel',
    'onSuccess',
    'onError',
  ])

  // Set default prop values
  props = mergeProps(
    {
      as: 'a',
      data: {},
      method: 'get',
      preserveScroll: false,
      preserveState: null,
      replace: false,
      only: [],
      headers: {},
      queryStringArrayFormat: 'brackets',
    },
    props,
  )

  // Mutate (once) props into prover values
  props = mergeProps(props, {
    as: props.as.toLowerCase() as InertiaLinkProps['as'],
    method: props.method.toLowerCase() as Method,
  })

  const [href, data] = mergeDataIntoQueryString(
    props.method,
    props.href || '',
    props.data,
    props.queryStringArrayFormat,
  )

  props = mergeProps(props, { data })

  if (props.as === 'a') {
    attributes = mergeProps(attributes, { href })

    if (props.method !== 'get') {
      console.warn(
        `Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link href="${href}" method="${props.method}" as="button">...</Link>`,
      )
    }
  }

  const visit = (event: MouseEvent) => {
    if (isServer) return

    props.onClick?.(event)

    // @ts-ignore
    if (shouldIntercept(event)) {
      event.preventDefault()

      router.visit(props.href, {
        data: props.data,
        method: props.method,
        preserveScroll: props.preserveScroll,
        preserveState: props.preserveState ?? props.method === 'get',
        replace: props.replace,
        only: props.only,
        headers: props.headers,
        onCancelToken: props.onCancelToken || noop,
        onBefore: props.onBefore || noop,
        onStart: props.onStart || noop,
        onProgress: props.onProgress || noop,
        onFinish: props.onFinish || noop,
        onCancel: props.onCancel || noop,
        onSuccess: props.onSuccess || noop,
        onError: props.onError || noop,
      })
    }
  }

  return createComponent(
    // @ts-ignore
    Dynamic,
    mergeProps(attributes, {
      get component() {
        return props.as
      },
      get children() {
        return props.children
      },
      onClick: visit,
    }),
  )
}
