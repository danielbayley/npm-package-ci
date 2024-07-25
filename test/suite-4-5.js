import assert from "node:assert/strict"
import { describe, it } from "node:test"

describe("suite `4`", () =>
  it("test `9` pass", () => assert.equal(true, true)))

describe("suite `5`", () =>
  it("test `10` fail", () => assert.equal(true, false)))
