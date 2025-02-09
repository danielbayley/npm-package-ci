import {strict} from "node:assert"
import {exists} from "utils"

export * from "node:test"

export const assert = Object.create(strict)
export default assert

assert.true      ??= unit => strict.equal(unit, true)
assert.false     ??= unit => strict.equal(unit, false)

assert.undefined ??= unit => assert.true(unit === undefined)
assert.null      ??= unit => assert.true(unit === null)
assert.nullish   ??= unit => assert.true(unit  == null)

assert.equall ??= (...compare) => compare
  .forEach(value => strict
  .equal(compare[0], value))

assert.zero ??= unit => strict.equal(unit, 0)
assert.one  ??= unit => strict.equal(unit, 1)
assert.two  ??= unit => strict.equal(unit, 2)

assert.includes ??= (a, b) => assert.true(a.includes(b))
assert.endsWith ??= (a, b) => assert.true(a.endsWith(b))

assert.match = (unit, pattern) => strict.match(unit, RegExp(pattern))

assert.deepMatch ??= strict.partialDeepStrictEqual

assert.exists ??= async path => assert.true(await exists(path))
