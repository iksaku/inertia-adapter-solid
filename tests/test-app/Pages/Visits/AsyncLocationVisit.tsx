import { createSignal, onMount, onCleanup } from 'solid-js'
import { router } from 'inertia-adapter-solid'
export default () => {
  const [draft, setDraft] = createSignal('')
  const [banner, setBanner] = createSignal('')
  const [lastVersionChange, setLastVersionChange] = createSignal('')
  let bannerMode = false
  const [bannerModeLabel, setBannerModeLabel] = createSignal(false)
  onMount(() => {
    onCleanup(
      router.on('location', (event) => {
        setLastVersionChange(String(event.detail.versionChange))
        if (bannerMode && event.detail.versionChange) {
          event.preventDefault()
          setBanner('A new version is available')
        }
      }),
    )
  })
  const backgroundReload = () => {
    router.reload({ headers: { 'X-Simulate-Version-Change': '1' } })
  }
  const backgroundManualLocation = () => {
    router.reload({ headers: { 'X-Simulate-Manual-Location': '1' } })
  }
  const toggleBannerMode = () => {
    bannerMode = !bannerMode
    setBannerModeLabel(bannerMode)
  }
  return (
    <div>
      <span class="text">This is the page that demonstrates async location visits</span>

      <input id="draft" value={draft()} onInput={(e) => setDraft(e.target.value)} />

      <button onClick={backgroundReload} class="reload">
        Background reload
      </button>
      <button onClick={backgroundManualLocation} class="manual-location">
        Background manual location
      </button>
      <button onClick={toggleBannerMode} class="banner-mode">
        Banner mode: {String(bannerModeLabel())}
      </button>

      <span id="version-change">{lastVersionChange()}</span>
      <span id="banner">{banner()}</span>
    </div>
  )
}
