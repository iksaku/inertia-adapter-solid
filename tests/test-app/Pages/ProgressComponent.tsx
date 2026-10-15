import { progress } from 'inertia-adapter-solid'
import { createSignal, For } from 'solid-js'
declare global { interface Window { progressTests: unknown[] } }
window.progressTests = []
export default function ProgressComponent() {
  const [logs, setLogs] = createSignal<string[]>([])
  const log = (...args: unknown[]) => { window.progressTests.push(...args); setLogs((prev) => [...prev, args.join(' ')]) }
  const actions: [string, () => void][] = [
    ['Start', () => { progress.start(); log('started') }],
    ...([25, 50, 75].map((percent) => [`Set ${percent}%`, () => { progress.set(percent / 100); log(`set ${percent}%`) }] as [string, () => void])),
    ['Finish', () => { progress.finish(); log('finished') }],
    ['Reset', () => { progress.reset(); log('reset') }],
    ['Remove', () => { progress.remove(); log('removed') }],
    ['Hide', () => { progress.hide(); log('hidden') }],
    ['Reveal', () => { progress.reveal(); log('revealed') }],
    ['Is Started', () => log('isStarted:', progress.isStarted())],
    ['Get Status', () => log('getStatus:', progress.getStatus())],
    ['Clear', () => { window.progressTests = []; setLogs([]) }],
  ]
  return <div><h1>Progress API Test</h1><For each={actions}>{(action) => <button onClick={action[1]}>{action[0]}</button>}</For><div>Logs: <span id="logs">{logs().join(', ')}</span></div></div>
}
