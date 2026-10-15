import { getScrollableParent } from '@inertiajs/core'
import { For, createSignal, onMount, type JSX } from 'solid-js'

type Case = {
  id: string
  title: string
  container?: string
  style: JSX.CSSProperties
  childStyle?: JSX.CSSProperties
  count?: number
  text?: string
  contents?: boolean
  carousel?: boolean
}
const cases: Case[] = [
  { id: 'overflow-x-hidden', title: 'overflow-x: hidden', style: { 'overflow-x': 'hidden' }, text: 'Test' },
  {
    id: 'overflow-x-scroll',
    title: 'overflow-x: scroll',
    container: 'scroll-container-x',
    style: { 'overflow-x': 'scroll', width: '300px' },
    childStyle: { width: '600px' },
    text: 'Wide content',
  },
  {
    id: 'overflow-y-auto',
    title: 'overflow-y: auto + height',
    container: 'scroll-container-y',
    style: { 'overflow-y': 'auto', height: '100px' },
    count: 3,
  },
  { id: 'overflow-y-auto-no-height', title: 'overflow-y: auto (no height)', style: { 'overflow-y': 'auto' } },
  {
    id: 'overflow-x-scroll-y-hidden',
    title: 'overflow-x: scroll, overflow-y: hidden',
    container: 'scroll-container-x-y-hidden',
    style: { 'overflow-x': 'scroll', 'overflow-y': 'hidden', width: '300px' },
    childStyle: { width: '600px' },
    text: 'Wide content',
  },
  {
    id: 'horizontal-scroll-calc',
    title: 'overflow-x: scroll + max-width',
    container: 'scroll-container-max-width',
    style: { 'overflow-x': 'scroll', 'max-width': '300px' },
    childStyle: { width: '600px' },
    text: 'Wide content',
  },
  {
    id: 'vertical-scroll-max-height',
    title: 'overflow-y: auto + max-height',
    container: 'scroll-container-max-height',
    style: { 'overflow-y': 'auto', 'max-height': '100px' },
    count: 3,
  },
  { id: 'overflow-auto-no-constraints', title: 'overflow: auto (no constraints)', style: { overflow: 'auto' } },
  {
    id: 'flex-horizontal-carousel',
    title: 'Flex horizontal carousel',
    container: 'flex-carousel',
    style: { 'overflow-x': 'scroll', display: 'flex', gap: '10px', width: '300px' },
    childStyle: { 'min-width': '150px', height: '50px', background: 'lightblue' },
    text: 'Item',
    carousel: true,
  },
  {
    id: 'coerced-auto-no-constraint',
    title: 'overflow-x: scroll (overflow-y coerced)',
    container: 'coerced-auto',
    style: { 'overflow-x': 'scroll', display: 'flex', width: '300px' },
    childStyle: { 'min-width': '600px' },
    text: 'Wide',
  },
  {
    id: 'display-contents',
    title: 'display: contents (skip parent)',
    container: 'scroll-container-skip-contents',
    style: { 'overflow-y': 'auto', height: '100px' },
    count: 4,
    contents: true,
  },
  { id: 'overflow-clip', title: 'overflow: clip', style: { overflow: 'clip', height: '100px' }, count: 2 },
  {
    id: 'overflow-overlay',
    title: 'overflow: overlay',
    container: 'scroll-container-overlay',
    style: { overflow: 'overlay', height: '100px' },
    count: 4,
  },
  {
    id: 'inline-width-style',
    title: 'overflow-x: auto + inline width',
    container: 'inline-width-container',
    style: { 'overflow-x': 'auto', width: '300px' },
    childStyle: { width: '600px' },
    text: 'Wide',
  },
  {
    id: 'both-scroll-directions',
    title: 'overflow: scroll (both)',
    container: 'both-scroll',
    style: { 'overflow-x': 'scroll', 'overflow-y': 'scroll', width: '300px', height: '100px' },
    childStyle: { width: '600px' },
    count: 3,
    text: 'Wide and tall',
  },
  {
    id: 'overflow-y-auto-overflow-x-visible',
    title: 'overflow-y: auto + overflow-x: visible',
    container: 'overflow-y-auto-x-visible',
    style: { 'overflow-y': 'auto', 'overflow-x': 'visible', height: '100px' },
    count: 3,
  },
  {
    id: 'overflow-y-auto-overflow-x-clip',
    title: 'overflow-y: auto + overflow-x: clip',
    container: 'overflow-y-auto-x-clip',
    style: { 'overflow-y': 'auto', 'overflow-x': 'clip', height: '100px' },
    count: 3,
  },
  {
    id: 'overflow-x-auto-overflow-y-visible',
    title: 'overflow-x: auto + overflow-y: visible',
    container: 'overflow-x-auto-y-visible',
    style: { 'overflow-x': 'auto', 'overflow-y': 'visible', width: '300px' },
    childStyle: { width: '600px' },
    text: 'Wide content',
  },
  {
    id: 'overflow-x-auto-overflow-y-clip',
    title: 'overflow-x: auto + overflow-y: clip',
    container: 'overflow-x-auto-y-clip',
    style: { 'overflow-x': 'auto', 'overflow-y': 'clip', width: '300px' },
    childStyle: { width: '600px' },
    text: 'Wide content',
  },
  {
    id: 'overflow-y-auto-overflow-x-hidden',
    title: 'overflow-y: auto + overflow-x: hidden (no height)',
    style: { 'overflow-y': 'auto', 'overflow-x': 'hidden' },
  },
  {
    id: 'overflow-x-auto-overflow-y-hidden',
    title: 'overflow-x: auto + overflow-y: hidden (no width)',
    style: { 'overflow-x': 'auto', 'overflow-y': 'hidden' },
  },
]

export default function ScrollableParent() {
  const refs: Record<string, HTMLDivElement> = {}
  const [results, setResults] = createSignal<Record<string, HTMLElement | null>>({})
  onMount(() =>
    setResults(Object.fromEntries(Object.entries(refs).map(([id, element]) => [id, getScrollableParent(element)]))),
  )
  const Content = (props: { entry: Case }) => (
    <div
      ref={(el) => {
        refs[props.entry.id] = el
      }}
      data-testid={props.entry.id}
      style={props.entry.childStyle}
    >
      {props.entry.count ? (
        <For each={Array.from({ length: props.entry.count })}>
          {(_, index) => <p>{index() === 0 ? props.entry.text || 'Content' : 'Content'}</p>}
        </For>
      ) : (
        props.entry.text || 'Content'
      )}
    </div>
  )
  const result = (id: string, container?: string) =>
    container ? results()[id]?.dataset.testid || 'null' : results()[id]?.tagName || 'null'
  const CaseRow = (props: { entry: Case }) => (
    <div>
      <h3>{props.entry.title}</h3>
      <div
        style={{ border: '2px solid red', padding: '10px', ...props.entry.style }}
        data-testid={props.entry.container}
      >
        {props.entry.contents ? (
          <div style={{ display: 'contents' }}>
            <Content entry={props.entry} />
          </div>
        ) : (
          <Content entry={props.entry} />
        )}
        {props.entry.carousel && (
          <>
            <div style={{ 'min-width': '150px', height: '50px', background: 'lightgreen' }}>Item</div>
            <div style={{ 'min-width': '150px', height: '50px', background: 'lightcoral' }}>Item</div>
          </>
        )}
      </div>
      <p data-testid={`result-${props.entry.id}`}>{result(props.entry.id, props.entry.container)}</p>
    </div>
  )
  return (
    <div style={{ padding: '20px' }}>
      <h1>ScrollableParent Tests</h1>
      <div style={{ display: 'grid', gap: '20px', 'margin-top': '20px' }}>
        <For each={cases.slice(0, 7)}>{(entry) => <CaseRow entry={entry} />}</For>
        <div>
          <h3>Nested containers</h3>
          <div
            style={{ 'overflow-y': 'auto', height: '200px', border: '2px solid red', padding: '10px' }}
            data-testid="outer-scroll"
          >
            <p>Outer</p>
            <div
              style={{ 'overflow-y': 'auto', height: '100px', border: '2px solid blue', padding: '10px' }}
              data-testid="inner-scroll"
            >
              <div
                ref={(el) => {
                  refs['nested-scroll'] = el
                }}
                data-testid="nested-scroll"
              >
                <p>Content</p>
                <p>Content</p>
                <p>Content</p>
                <p>Content</p>
                <p>Content</p>
              </div>
            </div>
          </div>
          <p data-testid="result-nested-scroll">{result('nested-scroll', 'inner-scroll')}</p>
        </div>
        <For each={cases.slice(7)}>{(entry) => <CaseRow entry={entry} />}</For>
      </div>
    </div>
  )
}
