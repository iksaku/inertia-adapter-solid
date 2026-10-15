import { counts } from './whenMountedCounts'
export default function WhenMountedFallback() {
  counts.fallbackRenders++
  return <p id="when-mounted-fallback" data-testid="when-mounted-fallback">Loading widget...</p>
}
