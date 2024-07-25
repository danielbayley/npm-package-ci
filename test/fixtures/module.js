export const func = () => true

export function uncovered() {
  const a = 2
  const b = 2
  const c = a + b
  return c === 4
}
