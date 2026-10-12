export default (props: { text: string }) => <div>
  <h1 data-testid="ssr-title">SSR Multi-Byte Body</h1>
  <p data-testid="character-count">Characters: {props.text.length}</p>
  <p data-testid="replacement-count">Replacement characters: {(props.text.match(/�/g) || []).length}</p>
  <p data-testid="text">{props.text}</p>
</div>
