import assert from "node:assert/strict"
import { describe, it } from "node:test"

describe("suite", () => {
  it("pass", () => assert.equal(true, true))
  it("fail", () => assert.equal(true, false))
  it.skip("skip", () => assert.equal(true, false))
  it.todo("todo", () => assert.equal(true, true))

  describe("suite nested", () => {
    it.skip("skip", () => assert.equal(true, true))
    it.todo("todo", () => assert.equal(true, false))
  })
})
