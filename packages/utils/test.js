import {access} from "node:fs/promises"
import  assert  from "node:assert/strict"
export * from "node:test"

assert.unefined ??= unit => unit === undefined
assert.null     ??= unit => unit === null
assert.nullish  ??= unit => unit  == null

assert.equal = (...compare) => compare
  .forEach(value => assert
  .strictEqual(compare.at(0), value))

assert.deepMatch ??= (a, b) => a.constructor === Array
  ? assert.deepEqual(b.filter(i => a[i]), b)
  : assert.deepEqual(Object.fromEntries(Object.entries(a)
   .filter(([key, value]) => key in b && b[key] === value)), b)

assert.includes ??= (a, b) => assert.equal(a.includes(b), true)

assert.exists ??= async path => {
  const exists  = await access(path).then(() => true).catch(() => false)
  assert.equal(exists, true)
}

export {assert}
export default assert
