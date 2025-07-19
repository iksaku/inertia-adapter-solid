import { HttpResponse } from 'msw'

function objectFilter<TObject>(obj: TObject, predicate: (entry: [string, unknown]) => boolean): object {
  return Object.fromEntries(
    Object.entries(obj)
      // @ts-ignore
      .filter(predicate),
  )
}

class LazyProp<TValue = unknown> {
  public constructor(protected callback: () => TValue) {}

  public resolve(): TValue {
    return this.callback()
  }
}

async function resolvePropertyInstances(props: object | unknown[]) {
  for (let [key, value] of Object.entries(props)) {
    if (typeof value === 'function') {
      value = value()
    }

    if (value instanceof LazyProp) {
      value = value.resolve()
    }

    // In case value is a Promise, otherwise, it resolves instantly
    value = await Promise.resolve(value)

    if (typeof value === 'object' && value !== null) {
      value = await this.resolvePropertyInstances(value)
    }

    props[key] = value
  }

  return props
}

export default {
  async render(request: Request, component: string, props: Record<string, unknown> = {}, version?: string) {
    const only = (request.headers.get('X-Inertia-Partial-Data') ?? '').split(',').filter(Boolean)

    return HttpResponse.json(
      {
        component,
        props: await resolvePropertyInstances(
          only && request.headers.get('X-Inertia-Partial-Component') === component
            ? objectFilter(props, ([key]) => only.includes(key))
            : objectFilter(props, ([, value]) => !(value instanceof LazyProp)),
        ),
        url: request.url,
        version,
      },
      {
        status: 200,
        headers: {
          'X-Inertia': 'true',
          'Content-Type': 'application/json',
        },
      },
    )
  },
}
