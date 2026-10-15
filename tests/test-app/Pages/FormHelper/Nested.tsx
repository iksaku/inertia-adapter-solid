import { useForm } from 'inertia-adapter-solid'
export default () => {
  const form = useForm({
    name: 'foo',
    address: {
      street: '123 Main St',
      city: 'New York',
    },
    organization: {
      name: 'Inertia',
      repo: {
        name: 'inertiajs/inertia',
        tags: ['v0.1', 'v0.2'],
      },
    },
    checked: ['foo', 'bar'],
  })
  const submit = () => {
    form.submit('post', '/dump/post')
  }
  return (
    <div>
      <label>
        Full Name
        <input
          type="text"
          id="name"
          name="name"
          onInput={(e) => form.setData('name', e.currentTarget.value)}
          value={form.data.name}
        />
      </label>
      <label>
        Street
        <input
          type="text"
          id="street"
          name="address.street"
          onInput={(e) => form.setData('address', 'street', e.currentTarget.value)}
          value={form.data.address.street}
        />
      </label>
      <label>
        City
        <input
          type="text"
          id="city"
          name="address.city"
          onInput={(e) => form.setData('address', 'city', e.currentTarget.value)}
          value={form.data.address.city}
        />
      </label>
      <label>
        Foo
        <input
          type="checkbox"
          id="foo"
          name="checked[]"
          value="foo"
          onInput={(e) =>
            form.setData(
              'checked',
              e.currentTarget.checked
                ? [...form.data.checked, e.currentTarget.value]
                : form.data.checked.filter((item) => item !== e.currentTarget.value),
            )
          }
          checked={form.data.checked.includes('foo')}
        />
      </label>
      <label>
        Bar
        <input
          type="checkbox"
          id="bar"
          name="checked[]"
          value="bar"
          onInput={(e) =>
            form.setData(
              'checked',
              e.currentTarget.checked
                ? [...form.data.checked, e.currentTarget.value]
                : form.data.checked.filter((item) => item !== e.currentTarget.value),
            )
          }
          checked={form.data.checked.includes('bar')}
        />
      </label>
      <label>
        Baz
        <input
          type="checkbox"
          id="baz"
          name="checked[]"
          value="baz"
          onInput={(e) =>
            form.setData(
              'checked',
              e.currentTarget.checked
                ? [...form.data.checked, e.currentTarget.value]
                : form.data.checked.filter((item) => item !== e.currentTarget.value),
            )
          }
          checked={form.data.checked.includes('baz')}
        />
      </label>
      <label>
        Organization Name
        <input
          type="text"
          id="organization-name"
          name="organization.name"
          onInput={(e) => form.setData('organization', 'name', e.currentTarget.value)}
          value={form.data.organization.name}
        />
      </label>
      <label>
        Repository Name
        <input
          type="text"
          id="repo-name"
          name="organization.repo.name"
          onInput={(e) => form.setData('organization', 'repo', 'name', e.currentTarget.value)}
          value={form.data.organization.repo.name}
        />
      </label>
      Repository Tags
      <label>
        v0.1
        <input
          type="checkbox"
          id="tag-0"
          name="organization.repo.tags[]"
          value="v0.1"
          onInput={(e) =>
            form.setData(
              'organization',
              'repo',
              'tags',
              e.currentTarget.checked
                ? [...form.data.organization.repo.tags, e.currentTarget.value]
                : form.data.organization.repo.tags.filter((item) => item !== e.currentTarget.value),
            )
          }
          checked={form.data.organization.repo.tags.includes('v0.1')}
        />
      </label>
      <label>
        v0.2
        <input
          type="checkbox"
          id="tag-1"
          name="organization.repo.tags[]"
          value="v0.2"
          onInput={(e) =>
            form.setData(
              'organization',
              'repo',
              'tags',
              e.currentTarget.checked
                ? [...form.data.organization.repo.tags, e.currentTarget.value]
                : form.data.organization.repo.tags.filter((item) => item !== e.currentTarget.value),
            )
          }
          checked={form.data.organization.repo.tags.includes('v0.2')}
        />
      </label>
      <label>
        v0.3
        <input
          type="checkbox"
          id="tag-2"
          name="organization.repo.tags[]"
          value="v0.3"
          onInput={(e) =>
            form.setData(
              'organization',
              'repo',
              'tags',
              e.currentTarget.checked
                ? [...form.data.organization.repo.tags, e.currentTarget.value]
                : form.data.organization.repo.tags.filter((item) => item !== e.currentTarget.value),
            )
          }
          checked={form.data.organization.repo.tags.includes('v0.3')}
        />
      </label>
      <button onClick={submit} class="submit">
        Submit form
      </button>
    </div>
  )
}
