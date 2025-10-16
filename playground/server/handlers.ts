import { http, HttpResponse, delay } from 'msw'
import Inertia from './Inertia'

export default [
  http.get('/', ({ request }) => Inertia.render(request, 'Home')),

  http.get('/layouts/no-layout', ({ request }) => Inertia.render(request, 'Layouts/NoLayout')),
  http.get('/layouts/own-layout', ({ request }) => Inertia.render(request, 'Layouts/OwnLayout')),
  http.get<{ page?: string }>('/layouts/:page?', ({ request, params }) => {
    const page = params.page

    if (!page) return HttpResponse.redirect('/layouts/a')

    return Inertia.render(request, `Layouts/Page${page.toUpperCase()}`)
  }),

  http.get('/preserve-state', ({ request }) => Inertia.render(request, 'PreserveState')),
  http.post(
    '/preserve-state',
    async ({ request }) =>
      await Inertia.render(request, 'PreserveState', {
        data: await request.json(),
      }),
  ),

  /* Components */
  http.get('/components/deferred', ({ request }) =>
    Inertia.render(request, 'Components/Deferred', {
      messages: Inertia.defer(async () => {
        await delay(3_000)
        return ['Hello world!', 'This works!']
      }),
      users: Inertia.defer(async () => {
        await delay(3_000)
        return [
          {
            id: 1,
            name: 'iksaku',
          },
          {
            id: 2,
            name: 'lugro',
          },
        ]
      }),
    }),
  ),
  http.get('/components/when-visible', ({ request }) =>
    Inertia.render(request, 'Components/WhenVisible', {
      messages: Inertia.optional(async () => {
        // await delay(3_000)
        return ['Hello world!', 'This works!']
      }),
      users: Inertia.optional(async () => {
        return [
          {
            id: 1,
            name: 'iksaku',
          },
          {
            id: 2,
            name: 'lugro',
          },
        ]
      }),
    }),
  ),

  /* Utilities */
  http.get('/utilities/use-form', ({ request }) => Inertia.render(request, 'Util/UseForm')),
  http.get('/utilities/use-poll', ({ request }) =>
    Inertia.render(request, 'Util/UsePoll', {
      now: new Date().toISOString(),
    }),
  ),
  http.get('/utilities/use-remember', ({ request }) => Inertia.render(request, 'Util/UseRemember')),
]
