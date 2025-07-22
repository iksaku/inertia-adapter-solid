import { http, HttpResponse } from 'msw'
import Inertia from './Inertia'

export default [
  http.get('/', ({ request }) => Inertia.render(request, 'Home')),
  http.get('/no-layout', ({ request }) => Inertia.render(request, 'NoLayout')),
  http.get('/own-layout', ({ request }) => Inertia.render(request, 'OwnLayout')),
  http.get<{ page?: string }>('/layouts/:page?', ({ request, params }) => {
    const page = params.page

    if (!page) return HttpResponse.redirect('/layouts/a')

    return Inertia.render(request, `Layouts/Page${page.toUpperCase()}`)
  }),
]
