import { spawnSync } from 'node:child_process'

// A red declaration check must not prevent the browser and SSR contracts from running.
const scripts = ['test:types', 'test:fixtures:types', 'test:unit', 'test:browser', 'test:ssr']
const results = scripts.map((script) => {
  console.log(`\n=== ${script} ===`)
  const result = spawnSync('pnpm', ['run', script], { stdio: 'inherit' })
  if (result.error) console.error(result.error)
  return { script, passed: result.status === 0 }
})

console.log('\n=== Test layers ===')
for (const { script, passed } of results) console.log(`${passed ? 'PASS' : 'FAIL'} ${script}`)
process.exitCode = results.every(({ passed }) => passed) ? 0 : 1
