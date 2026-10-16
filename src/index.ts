import { config as coreConfig } from '@inertiajs/core'
import type { SolidInertiaAppConfig } from './types'

export { http, progress, router } from '@inertiajs/core'
export {
  default as App,
  type InertiaAppProps,
  type InertiaComponent,
  type InertiaLayout,
  type InertiaLayoutComponent,
} from './App'
export { default as createInertiaApp } from './createInertiaApp'
export { resetLayoutProps, setLayoutProps } from './layoutProps'

export { default as Deferred } from './Deferred'
export { default as Form, useFormContext } from './Form'
export { default as InfiniteScroll } from './InfiniteScroll'
export { default as Link, type InertiaLinkProps } from './Link'
export {
  default as useForm,
  type InertiaForm,
  type InertiaFormProps,
  type InertiaPrecognitiveFormProps,
} from './useForm'
export { default as useHttp } from './useHttp'
export { default as usePage } from './usePage'
export { default as usePoll } from './usePoll'
export { default as usePrefetch } from './usePrefetch'
export { default as useRemember } from './useRemember'
export { default as WhenMounted } from './WhenMounted'
export { default as WhenVisible } from './WhenVisible'

export const config = coreConfig.extend<SolidInertiaAppConfig>({})
