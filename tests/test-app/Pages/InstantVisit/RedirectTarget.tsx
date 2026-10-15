export default (props0: {
  redirected: boolean
}) => {
  return (
    <div>
      <div id="redirect-target">This is RedirectTarget</div>
      <div id="redirected">Redirected: {String(props0.redirected)}</div>
    </div>
  )
}
