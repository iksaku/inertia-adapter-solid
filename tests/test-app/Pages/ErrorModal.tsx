import { router } from 'inertia-adapter-solid'
export default () => <div>
  <span onClick={() => router.post('/non-inertia')} class="invalid-visit">Invalid Visit</span>
  <span onClick={() => router.post('/json')} class="invalid-visit-json">Invalid Visit (JSON response)</span>
  <span onClick={() => router.post('/non-inertia/xss')} class="invalid-visit-xss">Invalid Visit (XSS)</span>
</div>
