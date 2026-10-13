import { expect, test } from '@playwright/test'
import { consoleMessages, pageLoads } from './support'

const SSR_SERVER_PORT = 13714
const SSR_AUTO_PORTS: Record<string, number> = { vue3: 13718, react: 13719, svelte: 13720, solid: 13722 }
const SSR_AUTO_SERVER_PORT = SSR_AUTO_PORTS[process.env.PACKAGE || 'vue3']

test.describe('SSR', () => {
  test.describe('initial page load', () => {
    test('renders HTML with props on the server', async ({ page }) => {
      const response = await page.request.get('/ssr/page1')
      const html = await response.text()

      expect(html).toContain('<script data-page="app" type="application/json">')
      expect(html).toMatch(/Name:.*John Doe/)
      expect(html).toMatch(/Email:.*john@example\.com/)
      expect(html).toContain('Item 1')
      expect(html).toContain('Item 2')
      expect(html).toContain('Item 3')
      expect(html).toMatch(/Count:.*42/)
      expect(html).toMatch(/URL:.*\/ssr\/page1/)
    })

    test('hydrates correctly after initial SSR load', async ({ page }) => {
      consoleMessages.listen(page)

      await page.goto('/ssr/page1')

      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')
      await expect(page.getByTestId('user-name')).toHaveText('Name: John Doe')
      await expect(page.getByTestId('count')).toHaveText('Count: 42')
      await expect(page.getByTestId('page-url')).toHaveText('URL: /ssr/page1')

      expect(consoleMessages.errors).toHaveLength(0)
    })
  })

  test('renders big integers on the server and hydrates them without a mismatch', async ({ page }) => {
    const response = await page.request.get('/ssr/bigint')
    const html = await response.text()

    expect(html).toMatch(/big:.*900719925474099988/)
    expect(html).toContain('{"$bigint":"900719925474099988"}')

    consoleMessages.listen(page)

    await page.goto('/ssr/bigint')

    await expect(page.getByTestId('big')).toHaveText('big: 900719925474099988')
    await expect(page.getByTestId('big-type')).toHaveText('type: bigint')
    await expect(page.getByTestId('nested')).toHaveText('nested: 900719925474099988,2')

    const hydrationErrors = consoleMessages.messages.filter((msg) => msg.includes('Hydration'))
    expect(hydrationErrors).toHaveLength(0)
    expect(consoleMessages.errors).toHaveLength(0)
  })

  test('embeds page data in a script element', async ({ page }) => {
    const response = await page.request.get('/ssr/page-with-script-element')
    const html = await response.text()

    expect(html).toContain('data-page="app"')
    expect(html).toContain('<script data-page="app" type="application/json">')
    expect(html).toContain('Hello from script element! Escape \\u003c\\/script> and \\u003c!--\\u003cscript>.')

    await page.goto('/ssr/page-with-script-element')

    await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page With Script Element')

    const scriptContent = await page.locator('script[data-page="app"]').textContent()
    expect(JSON.parse(scriptContent || '')).toMatchObject({
      component: 'SSR/PageWithScriptElement',
      props: {
        message: 'Hello from script element! Escape </script> and <!--<script>.',
      },
    })
  })

  test('renders multi-byte characters when the SSR request body spans multiple chunks', async ({ page }) => {
    const response = await page.request.get('/ssr/multibyte-body')
    const html = await response.text()

    expect(html).not.toContain('\uFFFD')
    expect(html).toMatch(/Characters:.*175000/)
  })

  test.describe('client-side navigation', () => {
    test('navigates without full page reload after SSR', async ({ page }) => {
      pageLoads.watch(page)

      await page.goto('/ssr/page1')
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')

      await page.getByTestId('navigate-link').click()

      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 2')
      await expect(page.getByTestId('navigated-status')).toHaveText('Navigated: true')
      expect(pageLoads.count).toBe(1)
    })

    test('can navigate back and forth after SSR', async ({ page, request }) => {
      pageLoads.watch(page)

      await page.goto('/ssr/page1')
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')

      await page.getByTestId('navigate-link').click()
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 2')

      await page.getByTestId('back-link').click()
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')

      expect(pageLoads.count).toBe(1)

      // Verify SSR server is still healthy
      const response = await request.get(`http://localhost:${SSR_SERVER_PORT}/health`)
      const health = await response.json()
      expect(health.status).toBe('OK')
    })
  })
})

test.describe('SSR WhenMounted', () => {
  test('it renders the fallback instead of the children on the server', async ({ page }) => {
    const response = await page.request.get('/ssr/when-mounted')
    const html = await response.text()

    expect(html).toContain('Loading widget...')
    expect(html).not.toContain('Client path:')
  })

  test('it swaps the fallback for the children after hydration and never shows it again', async ({ page }) => {
    consoleMessages.listen(page)
    pageLoads.watch(page, 1)

    await page.goto('/ssr/when-mounted')

    await expect(page.getByTestId('when-mounted-content')).toHaveText('Client path: /ssr/when-mounted')
    await expect(page.getByTestId('when-mounted-fallback')).toHaveCount(0)
    await expect(page.locator('#fallback-renders')).toHaveText('1')

    await page.getByTestId('revisit-link').click()
    await expect(page.getByTestId('when-mounted-content')).toHaveText('Client path: /ssr/when-mounted')
    await expect(page.locator('#fallback-renders')).toHaveText('1')

    await page.getByTestId('leave-link').click()
    await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 2')

    await page.goBack()
    await expect(page.getByTestId('when-mounted-content')).toHaveText('Client path: /ssr/when-mounted')
    await expect(page.locator('#fallback-renders')).toHaveText('1')

    const hydrationErrors = consoleMessages.messages.filter((msg) => msg.includes('Hydration'))
    expect(hydrationErrors).toHaveLength(0)
    expect(consoleMessages.errors).toHaveLength(0)
    expect(pageLoads.count).toBe(1)
  })

  test('it does not show the fallback when arriving from another SSR page', async ({ page }) => {
    consoleMessages.listen(page)
    pageLoads.watch(page, 1)

    // Page1 has no WhenMounted, so the app has to be what records that hydration is over
    await page.goto('/ssr/page1')
    await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')

    await page.getByTestId('to-when-mounted-link').click()

    await expect(page.getByTestId('when-mounted-content')).toHaveText('Client path: /ssr/when-mounted')
    await expect(page.locator('#fallback-renders')).toHaveText('0')

    expect(consoleMessages.errors).toHaveLength(0)
    expect(pageLoads.count).toBe(1)
  })
})

test.describe('Head title escaping', () => {
  test.beforeEach(() => {
    test.skip(process.env.PACKAGE === 'svelte', 'Svelte adapter has no Head component')
  })

  test('it escapes HTML in the title prop to prevent XSS in SSR output', async ({ page }) => {
    const response = await page.request.get('/ssr/head-with-xss-title')
    const html = await response.text()

    expect(html).not.toContain('</title><script>alert(')
    // Solid escapes '<' in text nodes; escaping '>' is unnecessary for safety.
    expect(html).toMatch(/&lt;\/title(?:&gt;|>)&lt;script(?:&gt;|>)/)
  })

  test('it runs the titleCallback with the page during SSR', async ({ page }) => {
    test.skip(
      process.env.PACKAGE === 'solid',
      'Solid createInertiaApp types title as never; metadata uses @solidjs/meta',
    )
    const response = await page.request.get('/ssr/head-title?withTitleCallback')
    const html = await response.text()

    expect(html).toContain('<title data-inertia="">SSR Head Title | From Props</title>')
  })
})

test.describe('server head', () => {
  test('it renders server-provided head elements in the SSR output', async ({ page }) => {
    test.skip(process.env.PACKAGE === 'solid', 'Solid createInertiaApp types serverHead as never')
    const response = await page.request.get('/ssr/server-head')
    const html = await response.text()

    expect(html).toContain('<title data-inertia="title">Server Head SSR</title>')
    expect(html).toContain('<meta data-inertia="description" name="description" content="Rendered on the server">')
    expect(html).toContain('<link data-inertia="canonical" rel="canonical" href="https://example.com/ssr">')
    expect(html).toContain('Server head rendered on the server')
  })
})

test.describe('layout props', () => {
  test('it does not leak layout props between SSR requests', async ({ page, browserName }) => {
    test.skip(process.env.PACKAGE === 'solid', 'Solid has no mutable layout-props API to isolate')
    const responseA = await page.request.get('/ssr/layout-props-a')
    const htmlA = await responseA.text()

    expect(htmlA).toContain('Page A Content')

    const responseB = await page.request.get('/ssr/layout-props-b')
    const htmlB = await responseB.text()

    expect(htmlB).toContain('Page B Content')
    expect(htmlB).toContain('Default Title')
    expect(htmlB).not.toContain('Page A Title')
  })

  test('it hydrates without errors after setLayoutProps was used in a previous SSR request', async ({
    page,
    browserName,
  }) => {
    test.skip(process.env.PACKAGE === 'solid', 'Solid has no setLayoutProps API')
    consoleMessages.listen(page)

    await page.request.get('/ssr/layout-props-a')
    await page.goto('/ssr/layout-props-b')

    await expect(page.getByTestId('layout-title')).toHaveText('Default Title')
    await expect(page.getByTestId('page-content')).toHaveText('Page B Content')

    const hydrationErrors = consoleMessages.messages.filter((msg) => msg.includes('Hydration'))
    expect(hydrationErrors).toHaveLength(0)
    expect(consoleMessages.errors).toHaveLength(0)
  })

  test('it hydrates without errors on a page that uses layout tuple props', async ({ page, browserName }) => {
    test.skip(process.env.PACKAGE === 'solid', 'Solid supports component layouts, not layout tuple props')
    consoleMessages.listen(page)

    await page.goto('/ssr/layout-props-a')

    await expect(page.getByTestId('page-content')).toHaveText('Page A Content')

    const hydrationErrors = consoleMessages.messages.filter((msg) => msg.includes('Hydration'))
    expect(hydrationErrors).toHaveLength(0)
    expect(consoleMessages.errors).toHaveLength(0)
  })

  test('it renders layout tuple props in SSR HTML', async ({ page, browserName }) => {
    test.skip(process.env.PACKAGE === 'solid', 'Solid supports component layouts, not layout tuple props')
    const response = await page.request.get('/ssr/layout-props-a')
    const html = await response.text()

    expect(html).toContain('Page A Title')
    expect(html).toContain('Page A Content')
  })

  test('it supports a layout callback that receives page props during SSR', async ({ page, browserName }) => {
    test.skip(
      process.env.PACKAGE === 'solid',
      'Solid layout functions are components, not tuple-returning layout callbacks',
    )
    const response = await page.request.get('/ssr/layout-props-callback')
    const html = await response.text()

    expect(html).toContain('Profile: Callback Title')
    expect(html).toContain('Callback Content')
  })

  test('it hydrates a layout callback page without errors', async ({ page, browserName }) => {
    test.skip(
      process.env.PACKAGE === 'solid',
      'Solid layout functions are components, not tuple-returning layout callbacks',
    )
    consoleMessages.listen(page)

    await page.goto('/ssr/layout-props-callback')

    await expect(page.getByTestId('layout-title')).toHaveText('Profile: Callback Title')
    await expect(page.getByTestId('page-content')).toHaveText('Callback Content')

    const hydrationErrors = consoleMessages.messages.filter((msg) => msg.includes('Hydration'))
    expect(hydrationErrors).toHaveLength(0)
    expect(consoleMessages.errors).toHaveLength(0)
  })
})

test.describe('SSR InfiniteScroll', () => {
  for (const [pageNumber, hasPrevious, hasNext] of [
    [1, false, true],
    [2, true, true],
    [3, true, false],
  ] as const) {
    test(`it renders correct slot props during SSR on page ${pageNumber}`, async ({ page }) => {
      const response = await page.request.get(`/ssr/infinite-scroll?page=${pageNumber}`)
      expect(response.ok()).toBe(true)
      const html = await response.text()
      const slots = await page.evaluate((html) => {
        const document = new DOMParser().parseFromString(html, 'text/html')
        return {
          previous: document.querySelector('[data-testid="has-previous"]')?.textContent,
          next: document.querySelector('[data-testid="has-next"]')?.textContent,
        }
      }, html)

      expect(slots).toEqual({ previous: `Has previous: ${hasPrevious}`, next: `Has next: ${hasNext}` })
    })

    test(`it hydrates without mismatch on page ${pageNumber}`, async ({ page }) => {
      consoleMessages.listen(page)

      await page.goto(`/ssr/infinite-scroll?page=${pageNumber}`)

      await expect(page.getByTestId('has-previous')).toHaveText(`Has previous: ${hasPrevious}`)
      await expect(page.getByTestId('has-next')).toHaveText(`Has next: ${hasNext}`)

      expect(consoleMessages.errors).toHaveLength(0)
    })
  }
})

test.describe('SSR Auto Transform', () => {
  test.describe('Vite plugin SSR transform', () => {
    test('it renders HTML using the auto-transformed SSR entry', async ({ page }) => {
      const response = await page.request.get('/ssr-auto/page1')
      const html = await response.text()

      // Verify server-rendered content from the auto-transformed SSR entry
      expect(html).toContain('data-page=')
      expect(html).toMatch(/Name:.*Auto User/)
      expect(html).toMatch(/Email:.*auto@example\.com/)
      expect(html).toContain('Auto 1')
      expect(html).toContain('Auto 2')
      expect(html).toContain('Auto 3')
      expect(html).toMatch(/Count:.*100/)
      expect(html).toMatch(/URL:.*\/ssr-auto\/page1/)
    })

    test('it hydrates correctly after SSR with auto-transformed entry', async ({ page }) => {
      consoleMessages.listen(page)

      await page.goto('/ssr-auto/page1')

      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')
      await expect(page.getByTestId('user-name')).toHaveText('Name: Auto User')
      await expect(page.getByTestId('count')).toHaveText('Count: 100')

      expect(consoleMessages.errors).toHaveLength(0)
    })

    test('it handles client-side navigation after auto SSR', async ({ page, request }) => {
      pageLoads.watch(page)

      await page.goto('/ssr-auto/page1')
      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 1')

      await page.getByTestId('navigate-link').click()

      await expect(page.getByTestId('ssr-title')).toHaveText('SSR Page 2')
      await expect(page.getByTestId('navigated-status')).toHaveText('Navigated: true')
      expect(pageLoads.count).toBe(1)

      // Verify auto SSR server is healthy
      const response = await request.get(`http://localhost:${SSR_AUTO_SERVER_PORT}/health`)
      const health = await response.json()
      expect(health.status).toBe('OK')
    })

    test('it applies withApp callback during SSR rendering', async ({ page }) => {
      const response = await page.request.get('/ssr-auto/with-app')
      const html = await response.text()

      expect(html).toContain('SSR WithApp')
      expect(html).toMatch(/Value:.*injected-via-withApp/)
    })

    test('it passes the page object to the withApp callback during SSR rendering', async ({ page }) => {
      test.skip(process.env.PACKAGE === 'solid', 'Solid withApp receives { ssr }, not the page object')
      const response = await page.request.get('/ssr-auto/with-app')
      const html = await response.text()

      expect(html).toMatch(/Locale:.*en-CA/)
      expect(html).toMatch(/Component:.*SSR\/WithApp/)
    })

    test('Solid withApp receives SSR true and hydrates with CSR false', async ({ page }) => {
      test.skip(process.env.PACKAGE !== 'solid', 'Solid wrapper contract')
      const response = await page.request.get('/ssr-auto/with-app')
      expect(await response.text()).toMatch(/SSR:.*true/)
      consoleMessages.listen(page)
      await page.goto('/ssr-auto/with-app')
      await expect(page.getByTestId('with-app-value')).toHaveText('Value: injected-via-withApp')
      await expect(page.getByTestId('with-app-csr')).toHaveText('CSR option: false')
      expect(consoleMessages.errors).toHaveLength(0)
    })

    test('it renders components with top-level await during SSR', async ({ page }) => {
      test.skip(process.env.SVELTE_ASYNC !== 'true', 'Requires the async Svelte compiler option')

      const response = await page.request.get('/ssr-auto/async')
      const html = await response.text()

      // Verify that the top-level await resolved correctly on the server
      expect(html).toContain('Async SSR Page')
      expect(html).toContain('Result: Hello from async SSR!')
    })

    test('it hydrates async components without mismatch after SSR', async ({ page }) => {
      test.skip(process.env.SVELTE_ASYNC !== 'true', 'Requires the async Svelte compiler option')

      consoleMessages.listen(page)

      await page.goto('/ssr-auto/async')

      await expect(page.getByTestId('async-ssr-title')).toHaveText('Async SSR Page')
      await expect(page.getByTestId('async-result')).toHaveText('Result: Hello from async SSR!')

      expect(consoleMessages.errors).toHaveLength(0)
    })
  })
})

test('Solid renders and hydrates a component layout', async ({ page }) => {
  test.skip(process.env.PACKAGE !== 'solid', 'Solid component-layout contract, not mutable layout props')
  const response = await page.request.get('/ssr/layout-props-a')
  const html = await response.text()
  expect(html).toContain('Page A Title')
  expect(html).toContain('Page A Content')
  consoleMessages.listen(page)
  await page.goto('/ssr/layout-props-a')
  await expect(page.getByTestId('layout-title')).toHaveText('Page A Title')
  await expect(page.getByTestId('page-content')).toHaveText('Page A Content')
  expect(consoleMessages.errors).toHaveLength(0)
})

for (const [name, port] of [
  ['manual', SSR_SERVER_PORT],
  ['automatic', SSR_AUTO_SERVER_PORT],
] as const) {
  test(`Solid isolates page props and usePage context across concurrent ${name} SSR requests`, async ({
    page,
    request,
  }) => {
    test.skip(process.env.PACKAGE !== 'solid', 'Solid request-local page context')
    const pages = [
      {
        url: '/request-a',
        user: { name: 'Ada & <alpha>', email: 'a@example.com' },
        items: ['First', 'Second'],
        count: 12,
      },
      { url: '/request-b', user: { name: 'Grace', email: 'b@example.com' }, items: [], count: 37 },
    ]
    const responses = await Promise.all(
      pages.map(({ url, ...props }) =>
        request.post(`http://localhost:${port}/render`, {
          data: {
            component: 'SSR/Page1',
            url,
            props: { errors: {}, ...props },
            version: null,
            clearHistory: false,
            encryptHistory: false,
          },
        }),
      ),
    )
    for (const [index, response] of responses.entries()) {
      expect(response.ok()).toBe(true)
      const rendered = await response.json()
      // Inspect rendered DOM, not the embedded JSON which always echoes input.
      await page.setContent(rendered.body)
      await expect(page.getByTestId('user-name')).toHaveText(`Name: ${pages[index].user.name}`)
      await expect(page.getByTestId('user-email')).toHaveText(`Email: ${pages[index].user.email}`)
      await expect(page.getByTestId('page-url')).toHaveText(`URL: ${pages[index].url}`)
      await expect(page.getByTestId('count')).toHaveText(`Count: ${pages[index].count}`)
      await expect(page.getByTestId('item')).toHaveText(pages[index].items)
    }
  })
}
