import { cloneDeep } from 'es-toolkit'
import { type Store, unwrap } from 'solid-js/store'

export function cloneStore<TStore extends Store<object>>(store: TStore): TStore {
  return cloneDeep(unwrap(store))
}
