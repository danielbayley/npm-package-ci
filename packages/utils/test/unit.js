import fs from "node:fs/promises"
import { sep } from "node:path"
import { Readable } from "node:stream"

import { before, after, describe, it, assert } from "utils/test"
import { relative, load, write, capitalize, rangesFrom, arrayFrom, toDOM } from "utils"

const { dirname, filename } = import.meta
const fixtures  = `${dirname}/fixtures`
const recursive = true
before(() => fs.mkdir(fixtures, { recursive }))
after(()  => fs.rm(fixtures,    { recursive, force: true }))

describe("`relative`", () => {
  it("should resolve the relative path from a given directory", () => {
    const path = relative(`${dirname}/../..`, filename)
    const compare = filename.split(sep).slice(-3).join(sep)
    assert.equal(path, compare)
  })
})

describe("`load`", () => {
  const data = { a: 1 }

  it("should read and parse JSON files", async () => {
    const json = JSON.stringify(data)
    const file = `${fixtures}/data.json`
    await fs.writeFile(file, json)
    const parsed = await load(file)
    assert.deepEqual(parsed, data)
  })

  it("should read and parse YAML files", async () => {
    const file = `${fixtures}/data.yaml`
    await fs.writeFile(file, "a: 1")
    const parsed = await load(file)
    assert.deepEqual(parsed, data)
  })
})

describe("`write`", () =>
  it("should write to file path, creating any intermediate directories as required", async () => {
    const file = await write(`${fixtures}/file.json`, "{}")
    await assert.exists(file)
  }))

describe("`capitalize`", () =>
  it("should capitalize a given string", () =>
    assert.equal(capitalize("text"), "Text")))

describe("`rangesFrom`", () => {
  const array = [0, 1, 2, 4, 6, 7]

  it("should return a string of consecutive ranges from a given array of numbers", () =>
    assert.equal(rangesFrom(array), "0-2 4 6-7"))

  it("should take into account given separators", () =>
    assert.equal(rangesFrom(array, "–", ", "), `0–2, 4, 6–7`))
})

describe("`arrayFrom`", async () => {
  const array = [1, 2, 3]
  async function* generator() { yield * array }
  const asynchronous = generator()

  it("should return an array from an async generator", async () => {
    const compare = await arrayFrom(asynchronous)
    assert.deepEqual(compare, array)
  })

  it("should return an array from a readable stream", async () => {
    const stream  = Readable.from(array)
    const compare = await arrayFrom(stream)
    assert.deepEqual(compare, array)
  })
})

describe("`toDOM`", () => {
  const content = "content"
  const html = `<div id="id">${content}</div>`
  const document = toDOM(html)
  const {textContent} = document.querySelector("div#id")

  it("should parse HTML string to DOM", () =>
    assert.equal(textContent, content))
})
