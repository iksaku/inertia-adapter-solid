import { router } from 'inertia-adapter-solid'
import { Show } from 'solid-js'
export default (props: { safe: number; big: bigint; negative: bigint; nested: { deep: bigint[] }; huge: bigint; collision?: { $bigint: string } | bigint; echoedType?: string }) => <div>
  <p>safe: <span id="safe">{String(props.safe)}</span> (<span id="safe-type">{typeof props.safe}</span>)</p>
  <p>big: <span id="big">{String(props.big)}</span> (<span id="big-type">{typeof props.big}</span>)</p>
  <p>negative: <span id="negative">{String(props.negative)}</span></p>
  <p>huge: <span id="huge">{String(props.huge)}</span></p>
  <p>nested: <span id="nested">{props.nested.deep.map(String).join(',')}</span></p>
  <Show when={props.collision}><p>collision: <span id="collision">{typeof props.collision === 'object' ? props.collision.$bigint : String(props.collision)}</span> (<span id="collision-type">{typeof props.collision}</span>)</p></Show>
  <Show when={props.echoedType}><p>echoed type: <span id="echoed-type">{props.echoedType}</span></p></Show>
  <button onClick={() => router.get('/bigint/reload')}>Load reload data</button><button onClick={() => router.get('/bigint/collision')}>Load collision data</button><button onClick={() => router.post('/bigint/echo', { value: 111222333444555666n })}>Submit echo</button>
</div>
