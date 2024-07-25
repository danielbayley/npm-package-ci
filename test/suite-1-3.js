import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { func } from "./fixtures/module.js" //, uncovered }

describe("suite `1`", () => {
  it("test `1` pass", () => assert.equal(true, true))
  it("test `2` fail", () => assert.equal(func(), false))
  it.skip("test `3` skip", () => assert.equal(true, false))
  it.todo("test `4` todo", () => assert.equal(true, true))

  describe("suite `2` nested", () => {
    it("test `5` pass", () => assert.equal(true, true))
    it("test `6` fail", () => assert.equal(true, false))
    it.todo("test `7` todo", () => assert.equal(true, false))

    describe("suite `3` nested", () => {
      it("test `8` pass", () => assert.equal(true, true))
    })
  })
})
