import { readFile } from "node:fs/promises"
import { Readable } from "node:stream"

import { describe, it, assert } from "utils/test"
import { parse } from "#index"

const fixtures = `${import.meta.dirname}/fixtures`
const path     = `${fixtures}/tests.js`

describe("`parse`", async () => {
  const content = await readFile(`${fixtures}/events.json`, "utf8")
  const events  = JSON.parse(content)
  const stream  = Readable.from(events)
  const parsed  = await parse(stream)

  it("should return `events`, `tests`, and `diagnostics` data", () => {
    const {length} = Object.keys(parsed.diagnostics)
    assert.equal(parsed.events.length > 0, true)
    assert.equal(parsed.tests.length  > 0, true)
    assert.equal(length > 0, true)
  })

  it("should flatten `events` data structure", () => {
    const { data: test } =        events.find(e => e.type === "test:pass")
    const { testNumber } = parsed.events.find(e => e.type === "pass")
    const { data: diagnostic } =  events.find(e => e.type === "test:diagnostic")
    const { message }    = parsed.events.find(e => e.type === "diagnostic")
    const { data: { summary }} =  events.find(e => e.type === "test:coverage")
    const coverage       = parsed.events.find(e => e.type === "coverage")

    assert.equal(test.name, "pass")
    assert.includes(test.file, path)
    assert.equal(test.testNumber, testNumber, 1)
    assert.equal(diagnostic.message, message)
    assert.deepMatch(coverage, summary)
  })

  it("should restructure `tests` into hierarchy", () => {
    const [{ type, file, subtests }] = parsed.tests
    const [{ testNumber }] = subtests
    const nested = subtests.at(-1)
    const [{ nesting }] = nested.subtests

    assert.equal(type, "suite")
    assert.includes(file, path)
    assert.equal(testNumber, 1)
    assert.equal(subtests.length, 5)
    assert.equal(nesting, 2)
  })

  it("should collate `diagnostics` object", () => {
    const keys = [
      "tests",
      "suites",
      "pass",
      "fail",
      "cancelled",
      "skipped",
      "todo",
      "duration_ms"
    ]
    const values = Object
      .values(parsed.diagnostics)
      .map(row => row.constructor)

    assert.deepEqual(Reflect.ownKeys(parsed.diagnostics), keys)
    assert.equal(...values, Number)
  })
})
