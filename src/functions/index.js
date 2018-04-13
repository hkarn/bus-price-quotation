export function durationToString (input) {
  const dechours = input / 3600
  const hours = Math.trunc(dechours)
  const decminutes = dechours - hours
  const minutes = Math.round(decminutes * 60)
  let result = ''
  if (hours > 1) { result = result + hours + ' timmar ' }
  if (hours === 1) { result = result + hours + ' tim ' }

  result = result + minutes + ' min'
  return result
}
