import { For, type JSX } from 'solid-js'
import { VisitHelperOptions } from '@inertiajs/core'
import { router } from 'inertia-adapter-solid'
import WithScrollRegion from '@/Layouts/WithScrollRegion'
const ScrollRegionList = (props0: {
  user_id?: number
}) => {
  const navigate = (id: number, options: VisitHelperOptions = {}) => {
    router.get(`/links/scroll-region-list/user/${id}`, {}, options)
  }
  const users = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }))
  return (
    <div>
      <span class="text">Scrollable list with scroll region</span>
      <div class="user-text">Clicked user: {props0.user_id || 'none'}</div>

      {
        <For each={users}>
          {(user) => (
            <div style={{ padding: '20px', 'border-bottom': '1px solid #ccc' }}>
              <div style={{ 'margin-bottom': '10px', width: '500px' }}>{user.name}</div>
              <button onClick={() => navigate(user.id)}>Default</button>
              <button onClick={() => navigate(user.id, { preserveScroll: true })}>Preserve True</button>
              <button onClick={() => navigate(user.id, { preserveScroll: false })}>Preserve False</button>
            </div>
          )}
        </For>
      }
    </div>
  )
}
ScrollRegionList.layout = (props: { children: JSX.Element }) => <WithScrollRegion children={props.children} />
export default ScrollRegionList
