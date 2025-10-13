import { http, HttpResponse } from 'msw'
import Inertia from './Inertia'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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

  http.get('/use-remember', ({ request }) => Inertia.render(request, 'UseRemember')),

  http.get('/use-form', ({ request }) => Inertia.render(request, 'UseForm')),

  http.get('/when-visible', ({ request }) =>
    Inertia.render(request, 'WhenVisible', {
      messages: Inertia.optional(async () => {
        // await wait(3_000)
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
]
