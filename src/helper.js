// Clean/sanitize amount input
function sanitizeValueInput(value) {
  let amt = value.toString().replace(/[^0-9.-]/g, '') * 100
  return parseInt(amt) / 100
}

var symbols = {
  USD: '$',
  EUR: '€',
  GBP: '£'
}

export { sanitizeValueInput, symbols }
