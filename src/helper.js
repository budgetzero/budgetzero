// Clean/sanitize amount input
function sanitizeValueInput(value) {
  let amt = value.toString().replace(/[^0-9.-]/g, '')
  return parseInt(amt)
}

export { sanitizeValueInput }
