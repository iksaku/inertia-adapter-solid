export default (props0: {
  greeting?: string
  timestamp?: number
  auth?: {
    user: string
  }
  errors?: Record<string, string>
}) => {
  return (
    <div>
      <div id="target">This is Target</div>
      <div id="greeting">Greeting: {props0.greeting ?? 'none'}</div>
      <div id="timestamp">Timestamp: {props0.timestamp ?? 'none'}</div>
      <div id="auth">Auth: {props0.auth?.user ?? 'none'}</div>
      <div id="errors">
        Errors: {Object.keys(props0.errors ?? {}).length > 0 ? JSON.stringify(props0.errors) : 'none'}
      </div>
      <hr style={{ padding: '500px 0' }} />
      <div id="after-scroll">After scroll</div>
    </div>
  )
}
