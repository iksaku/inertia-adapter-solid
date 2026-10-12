// Type-only upstream bootstrap coverage. A .ts extension keeps this out of the fixture page glob.
import { createInertiaApp } from 'inertia-adapter-solid'
import type { Component } from 'solid-js'
declare module '@inertiajs/core' {
  export interface InertiaConfig {
    sharedPageProps: { auth: { user: { name: string } | null } }
  }
}
createInertiaApp({
  resolve: (name, page) => {
    console.log(page?.props.auth.user?.name)
    // @ts-expect-error - email is not declared on the shared user
    console.log(page?.props.auth.user?.email)
    const pages = import.meta.glob<{ default: Component }>('./Pages/**/*.tsx', { eager: true })
    return pages[`./Pages/${name}.tsx`]
  },
  setup({ props }) {
    console.log(props.initialPage.props.auth.user?.name)
    // @ts-expect-error - email is not declared on the shared user
    console.log(props.initialPage.props.auth.user?.email)
  },
})
