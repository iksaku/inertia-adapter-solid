import { createSignal, onMount, onCleanup } from 'solid-js'
import { counts } from './whenMountedCounts'
export default function WhenMountedChild() {
  const [status, setStatus] = createSignal('pending')
  const [count, setCount] = createSignal(0)
  const mounts = ++counts.childMounts
  onMount(() => {
    const timer = setTimeout(() => setStatus('ready'), 100)
    onCleanup(() => clearTimeout(timer))
  })
  return <div><span id="child-status">{status()}</span><span id="child-count">{count()}</span>
    <span id="fallback-renders">{counts.fallbackRenders}</span><span id="child-mounts">{mounts}</span>
    <button id="child-increment" onClick={() => setCount((c) => c + 1)}>Increment</button>
  </div>
}
