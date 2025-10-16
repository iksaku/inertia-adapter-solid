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

  http.get('/use-form', ({ request }) => Inertia.render(request, 'UseForm')),

  http.get('/use-poll', ({ request }) =>
    Inertia.render(request, 'UsePoll', {
      now: new Date().toISOString(),
    }),
  ),

  http.get('/use-remember', ({ request }) => Inertia.render(request, 'UseRemember')),

  http.get('/when-visible', ({ request }) =>
    Inertia.render(request, 'WhenVisible', {
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

  http.get('/props/deferred', ({ request }) =>
    Inertia.render(request, 'Props/Deferred', {
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
]
