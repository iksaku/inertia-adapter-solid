import { config as coreConfig } from '@inertiajs/core'
import type { SolidInertiaAppConfig } from './types'

export { progress, router } from '@inertiajs/core'
export { default as createInertiaApp } from './createInertiaApp'

export { default as Deferred } from './Deferred'
export { default as Form, useFormContext } from './Form'
export { default as InfiniteScroll } from './InfiniteScroll'
export { default as Link, type InertiaLinkProps } from './Link'
export { default as useForm, type InertiaFormProps } from './useForm'
export { default as usePage } from './usePage'
export { default as usePoll } from './usePoll'
export { default as usePrefetch } from './usePrefetch'
export { default as useRemember } from './useRemember'
export { default as WhenVisible } from './WhenVisible'

export const config = coreConfig.extend<SolidInertiaAppConfig>({})
