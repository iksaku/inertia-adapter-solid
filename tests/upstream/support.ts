import { expect, Page, Request, Response } from '@playwright/test'

export const clickAndWaitForResponse = async (
  page: Page,
  buttonText: string,
  url: string | null = null,
  element: 'link' | 'button' = 'link',
) => {
  const responsePromise = page.waitForResponse(url ?? page.url())
  await page.getByRole(element, { exact: true, name: buttonText }).click()
  return await responsePromise
}

export const pageLoads = {
  count: 0,

  watch(page: Page, maxLoads = 1) {
    this.count = 0

    page.on('load', () => {
      // Ignore load events from about:blank (Firefox fires these, Chromium doesn't)
      if (page.url() === 'about:blank') {
        return
      }

      this.count++

      if (this.count > maxLoads) {
        throw new Error('The page loaded more than once')
      }
    })
  },
}

export const consoleMessages = {
  errors: [] as string[],
  messages: [] as string[],

  listen(page: Page) {
    this.errors = []
    this.messages = []
    page.on('console', (msg) => this.messages.push(msg.text()))
    page.on('pageerror', (error: Error) => this.errors.push(error.message))
  },
}

export const requests = {
  requests: [] as Request[],
  finished: [] as Request[],
  failed: [] as Request[],
  responses: [] as Response[],
  _handlers: {} as Record<string, { page: Page; handler: (...args: any[]) => void }>,

  _replaceListener(page: Page, event: string, handler: (...args: any[]) => void) {
    const existing = this._handlers[event]

    if (existing) {
      existing.page.off(event, existing.handler)
    }

    this._handlers[event] = { page, handler }
    page.on(event, handler)
  },

  listen(page: Page) {
    this.requests = []
    this._replaceListener(page, 'request', (request: Request) => this.requests.push(request))
  },

  listenForFinished(page: Page) {
    this.finished = []
    this._replaceListener(page, 'requestfinished', (request: Request) => this.finished.push(request))
  },

  listenForFailed(page: Page) {
    this.failed = []
    this._replaceListener(page, 'requestfailed', (request: Request) => this.failed.push(request))
  },

  listenForResponses(page: Page) {
    this.responses = []
    this._replaceListener(page, 'response', (data: Response) => this.responses.push(data))
  },
}

export const shouldBeDumpPage = async (page: Page, method: 'get' | 'post' | 'patch' | 'put' | 'delete') => {
  await expect(page).toHaveURL(new RegExp(`dump/${method}`))
  // Wait for Vue/React/Svelte to mount and set the dump (Firefox may need this)
  await page.waitForFunction(() => window._inertia_request_dump !== undefined)
  // @ts-ignore
  const dump = await page.evaluate(() => window._inertia_request_dump)

  return dump
}

export const scrollElementTo = async (page: Page, promise: Promise<void>) => {
  await promise
  // Wait for scroll listener debounce
  await page.waitForTimeout(100)
}

export const gotoPageAndWaitForContent = async (page: Page, url: string) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
}

export const reloadAndWaitForContent = async (page: Page) => {
  await page.reload({ waitUntil: 'domcontentloaded' })
}

// Wait for scroll to complete after navigating to a fragment
export const waitForFragmentScroll = async (page: Page) => {
  // Give time for the scroll animation to complete
  await page.waitForTimeout(200)
}

// Exercise the same public Head interactions before and after SSR hydration.
export const headAssertions = {
  async titleFallback(page: Page) {
    const title = page.locator('head title[data-inertia]')
    await expect(page).toHaveTitle('Title from Children')
    await expect(title).toHaveCount(1)
    await page.getByRole('button', { name: 'Empty child title' }).click()
    await expect(title).toHaveCount(1)
    await expect(page).toHaveTitle('')
    await page.getByRole('button', { name: 'Remove child title' }).click()
    await expect(page).toHaveTitle('Title from Prop & <fallback>')
    await expect(title).toHaveCount(1)
    await page.getByRole('button', { name: 'Clear title prop' }).click()
    await expect(title).toHaveCount(0)
  },
  async providerRestoration(page: Page) {
    const description = page.locator('head meta[name="description"]')
    await expect(page).toHaveTitle('Page title')
    await expect(description).toHaveCount(1)
    await expect(description).toHaveAttribute('content', 'Page description')
    await page.getByRole('button', { name: 'Update layout head' }).click()
    // Wait until the older provider's update reaches the actual document head.
    await expect(page.locator('head meta[name="layout-revision"]')).toHaveAttribute('content', 'Updated layout title')
    await expect(page).toHaveTitle('Page title')
    await expect(description).toHaveAttribute('content', 'Page description')
    await page.getByRole('button', { name: 'Remove page head' }).click()
    await expect(page).toHaveTitle('Updated layout title')
    await expect(description).toHaveCount(1)
    await expect(description).toHaveAttribute('content', 'Updated layout title')
    await page.getByRole('button', { name: 'Remove layout head' }).click()
    await expect(page).toHaveTitle('Server title')
    await expect(description).toHaveCount(1)
    await expect(description).toHaveAttribute('content', 'Server description')
    await expect(page.locator('head meta[name="layout-revision"]')).toHaveCount(0)
    await expect(page.locator('head title')).toHaveCount(1)
  },
  async escapedKey(page: Page) {
    const metadata = page.locator('head meta[name="escaped-key"]')
    await expect(metadata).toHaveCount(1)
    await expect(metadata).toHaveAttribute('data-inertia', 'description" & <page>')
    await expect(metadata).toHaveAttribute('content', 'First & "quoted" <value>')
    await expect(page.locator('head [head-key], head [data-inertia][data-hk]')).toHaveCount(0)
    await page.getByRole('button', { name: 'Update keyed metadata' }).click()
    await expect(metadata).toHaveCount(1)
    await expect(metadata).toHaveAttribute('data-inertia', 'description" & <page>')
    await expect(metadata).toHaveAttribute('content', 'Second > value & "changed"')
    await page.getByRole('button', { name: 'Remove keyed metadata' }).click()
    await expect(metadata).toHaveCount(1)
    await expect(metadata).toHaveAttribute('data-inertia', 'description" & <page>')
    await expect(metadata).toHaveAttribute('content', 'Fallback description')
  },
  async rawText(page: Page) {
    await expect(page.getByTestId('head-mounted')).toHaveText('mounted')
    const structuredData = page.locator('head script[type="application/ld+json"][data-inertia]')
    const stylesheet = page.locator('head style[data-inertia="stylesheet"]')
    const root = page.locator('html')
    await expect(structuredData).toHaveCount(2)
    await expect
      .poll(() => structuredData.evaluateAll((elements) => elements.map((element) => JSON.parse(element.textContent!))))
      .toEqual([
        { '@type': 'WebPage', name: 'A & < B "quoted"' },
        { '@type': 'WebPage', name: 'A & < B "quoted"' },
      ])
    await expect.poll(() => stylesheet.textContent()).toBe(':root { --head-raw-text: "A & < B"; }')
    await expect(root).toHaveAttribute('data-head-script-value', 'A & < B "quoted"')
    await expect(root).toHaveAttribute('data-head-script-runs', '1')

    await page.getByRole('button', { name: 'Update raw head content' }).click()
    await expect
      .poll(() => structuredData.evaluateAll((elements) => elements.map((element) => JSON.parse(element.textContent!))))
      .toEqual([
        { '@type': 'WebPage', name: 'C > D & "changed"' },
        { '@type': 'WebPage', name: 'C > D & "changed"' },
      ])
    await expect.poll(() => stylesheet.textContent()).toBe(':root { --head-raw-text: "C > D &"; }')
    await expect(root).toHaveAttribute('data-head-script-value', 'C > D & "changed"')
    await expect(root).toHaveAttribute('data-head-script-runs', '2')
    await expect(page.locator('head script[data-inertia="executable"]')).toHaveCount(1)
  },
}
