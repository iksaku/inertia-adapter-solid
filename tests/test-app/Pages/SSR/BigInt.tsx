export default (props: { big: bigint; nested: { deep: bigint[] } }) => <div>
  <h1 data-testid="ssr-title">SSR Big Integers</h1>
  <p data-testid="big">big: {String(props.big)}</p>
  <p data-testid="big-type">type: {typeof props.big}</p>
  <p data-testid="nested">nested: {props.nested.deep.map(String).join(',')}</p>
</div>
