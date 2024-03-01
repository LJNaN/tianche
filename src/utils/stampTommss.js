export function stampTommss(tramp) {
  const a = Math.floor(tramp / 1000)
  let b = a
  let c = 0
  let d = 0
  while (b >= 60) {
    b = b - 60
    c++
  }
  d = b
  return `${c.toString().padStart(2, '0')}:${d.toString().padStart(2, '0')}`
}