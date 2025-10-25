import type { ComponentProps, JSX, ValidComponent } from 'solid-js'

/*
 * Based on the work done for @corvu packages.
 * Original code available at:
 * https://github.com/corvudev/corvu/blob/ff79bca96ead89a703637c0738191e20e1ffa67d/packages/utils/src/dynamic/types.ts
 */
type DynamicAttributes<T extends ValidComponent> = {
  /**
   * Component to render the dynamic component as.
   */
  as?: T | keyof JSX.HTMLElementTags
}

type OverrideProps<T, P> = Omit<T, keyof P> & P

export type DynamicProps<T extends ValidComponent, Props extends object> = OverrideProps<
  ComponentProps<T>,
  Props & DynamicAttributes<T>
>

/*
 * Based on the work done for @corvu packages.
 * Original code available at:
 * https://github.com/corvudev/corvu/blob/ff79bca96ead89a703637c0738191e20e1ffa67d/packages/utils/src/dom/types.ts#L6
 */
export type ElementOf<T> = T extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[T]
  : // biome-ignore lint/suspicious/noExplicitAny: A component be anything
    any
