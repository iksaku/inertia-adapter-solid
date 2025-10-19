import { Inertia, type InertiaSharedProps } from '@antennajs/core'
import type { AlwaysProp, DeferProp, LazyProp, MergeProp, OptionalProp, ScrollProp } from '@antennajs/core/dist/props'
import type { ProvidesScrollMetadata } from '@antennajs/core/dist/scroll'
import type { InertiaPrimitive, MaybeResolvable, Resolvable } from '@antennajs/core/dist/types'
import type { Promisable } from 'type-fest'
import html from '../index.html?raw'

type InertiaMswAdapter = Omit<Inertia, 'render'> & {
  render(request: Request, component: string, props?: InertiaSharedProps): Promise<Response>

  // Fixes static methods not being available
  lazy<TValue extends InertiaPrimitive>(callback: Resolvable<TValue>): LazyProp<TValue>
  optional<TValue extends InertiaPrimitive>(callback: Resolvable<TValue>): OptionalProp<TValue>
  defer<TValue extends InertiaPrimitive>(callback: Resolvable<TValue>, group?: string): DeferProp<TValue>
  merge<TValue extends InertiaPrimitive>(value: MaybeResolvable<TValue>): MergeProp<TValue>
  deepMerge<TValue extends InertiaPrimitive>(value: MaybeResolvable<TValue>): MergeProp<TValue>
  always<TValue extends InertiaPrimitive>(value: MaybeResolvable<TValue>): AlwaysProp<TValue>
  scroll<TValue extends InertiaPrimitive>(
    value: MaybeResolvable<TValue>,
    wrapper?: string,
    metadata?: ProvidesScrollMetadata | ((value: Promisable<TValue>) => ProvidesScrollMetadata),
  ): ScrollProp<TValue>
  location(request: Request, url: string | URL): Response
}

export default new Proxy<InertiaMswAdapter>(
  // @ts-ignore
  {},
  {
    get(_, property, receiver) {
      if (Reflect.has(Inertia, property)) {
        return Reflect.get(Inertia, property, receiver)
      }

      const inertia = new Inertia()

      inertia.setView(() => html)

      return Reflect.get(inertia, property, receiver)
    },
  },
)
