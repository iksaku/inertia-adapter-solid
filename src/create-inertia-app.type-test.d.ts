import type { Page, PageProps, SharedPageProps } from '@inertiajs/core'
import type { Component } from 'solid-js'
import createInertiaApp from './createInertiaApp.ts'

type Assert<T extends true> = T

/*
 * Function comparison checks exact type-level equality instead of subtype compatibility.
 */
type IsEqual<One, Two> =
  (<T>(value?: T) => T extends One ? 1 : 2) extends <T>(value?: T) => T extends Two ? 1 : 2
    ? (<T>(value?: T) => T extends Two ? 1 : 2) extends <T>(value?: T) => T extends One ? 1 : 2
      ? true
      : false
    : false

/*
 * Call-signature assignability tests whether a function can be called with the argument shape.
 */
type CallableWith<Function, Argument> = Function extends { (argument: Argument): unknown } ? true : false

type ComponentResolver = (
  name: string,
  page?: Page<SharedPageProps>,
) => Component | Promise<Component> | { default: Component }

type CreateInertiaAppCSROptionsWithoutTitle = {
  page: Page<PageProps & SharedPageProps>
  resolve: ComponentResolver
  setup(options: { el: Element }): void
}

type CreateInertiaAppCSROptionsWithTitle = CreateInertiaAppCSROptionsWithoutTitle & {
  title: (title: string) => string
}

type _CreateInertiaAppCSRAcceptsOmittedTitle = Assert<
  CallableWith<typeof createInertiaApp, CreateInertiaAppCSROptionsWithoutTitle>
>

type _CreateInertiaAppCSRRejectsTitle = Assert<
  IsEqual<CallableWith<typeof createInertiaApp, CreateInertiaAppCSROptionsWithTitle>, false>
>
