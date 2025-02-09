import fs from "node:fs/promises"
import { basename, sep, join } from "node:path"
import { Readable } from "node:stream"

import { describe, it, assert } from "#test"
import { mock, before, after, afterEach } from "#test"
import {
  capitalize,
  rangesFrom,
  arrayFrom,
  filterKeys,
  assign,
  toINI,
  relative,
  pathFrom,
  parseFile,
  writeFile,
  memoize,
  delay,
  sanitize,
  esm,
} from "#index"

const { dirname, filename } = import.meta
const fixtures = `${dirname}/fixtures`

const recursive = true
before(() => fs.mkdir(fixtures, { recursive }))
after(()  => fs.rm(fixtures,    { recursive, force: true }))

describe("`capitalize`", () =>
  it("should capitalize a given `String`", () =>
    assert.equal(capitalize("text"), "Text")))

describe("`rangesFrom`", () => {
  const array = [0, 1, 2, 4, 6, 7]

  it("should `return` a `String` of consecutive ranges from a given `Array` of `Numbers`", () =>
    assert.equal(rangesFrom(array), "0-2 4 6-7"))

  it("should take into account given separators", () =>
    assert.equal(rangesFrom(array, "–", ", "), `0–2, 4, 6–7`))
})

describe("`arrayFrom`", async () => {
  const array = [1, 2, 3]
  async function* generator() { yield * array }
  const asynchronous = generator()

  it("should return an `Array` from an `async` generator", async () => {
    const compare = await arrayFrom(asynchronous)
    assert.deepEqual(compare, array)
  })

  it("should return an `Array` from a `ReadableStream`", async () => {
    const stream  = Readable.from(array)
    const compare = await arrayFrom(stream)
    assert.deepEqual(compare, array)
  })
})

describe("`filterKeys`", () =>
  it("`filter`s an `Object` by a given `Array` of keys", () => {
    const object = { a: 1, b: 2, c: 3 }
    const include = ["a", "c"]
    const copy = filterKeys(object, include)
    assert.deepEqual(copy, { a: 1, c: 3 })
  }))

describe("`assign`", () => {
  it("merges given `Object`s into the first", () => {
    const object = { a: 1 }
    assign(object, { b: 2 }, { c: 3, d: 4 })
    assert.deepEqual(object, { a: 1, b: 2, c: 3, d: 4 })
  })

  it("does not override existing properties", () => {
    const object = { a: 1 }
    assign(object, { a: 2 })
    assert.equal(object.a, 1)
  })

  it("unless they are `null`ish", () => {
    const object = { a: null }
    assign(object, { a: 1 }, { b: 2 })
    assert.deepEqual(object, { a: 1, b: 2 })
  })

  it("does not merge `null`ish values", () => {
    const object = {}
    assign(object, { a: null, b: undefined })
    const {length} = Object.keys(object)
    assert.deepEqual(length, 0)
  })
})

describe("`toINI`", () => {
  const object = { a: 1, b: 2 }

  it("reduces an `Object` to INI format `key=value` pairs", () => {
    const ini = toINI(object)
    assert.equal(ini, "a=1\nb=2")
  })

  it("serializes non-`String` values to `JSON`", () => {
    const array = [1, 2, 3]
    const ini = toINI({ object, array })

    assert.startsWith(ini, `object=${JSON.stringify(object)}`)
    assert.endsWith(ini,    `array=[${array.toString()}]`)
  })
})

describe("`relative`", () => {
  it("should `resolve` the `relative` `path` from a given directory", () => {
    const path = relative(`${dirname}/../..`, filename)
    const compare = filename.split(sep).slice(-3).join(sep)
    assert.equal(path, compare)
  })
})

describe("`pathFrom`", () => {
  const path = pathFrom(filename)
  const base = basename(filename)

  it("`return`s a `path` `Object` from a given path", () => {
    const [name, ext] = base.split(/(?=\.)/)
    assert.deepMatch(path, { dir: dirname, base, name, ext })
  })

  it("discards the `root` property if merely `" + sep + "`", () =>
    assert.undefined(path.root))

  it("adds an extra `absolute` path property", () =>
    assert.equal(join(dirname, sep, base), path.absolute))

  it("takes a second option for `relative` path", () => {
    const path = pathFrom(filename, dirname)
    assert.undefined(path.relative)
  })

  it("adds an extra `relative` property, if different to `base`", () =>
    assert.equal(join(...filename.split(sep).slice(-2)), path.relative))
})

describe("`sanitize`", () => {
  it("sanitizes given JavaScript source by stripping `//` comments", () => {
    const single = "some // comment"
    const multiline = `
      some
      // comment
      code
    `
    assert.match(sanitize(single),     /some/)
    assert.match(sanitize(multiline), /some\n\s*code/)
  })

  it("including `/*` block comments `*/`", () => {
    const single = "some /* comment */ code"
    const multiline =`
      some /*
      block
      comment
      */ code
    `
    assert.match(sanitize(single),     /some\s*code/)
    assert.match(sanitize(multiline), /some\s*code/)
  })
})

describe("`memoize`", () => {
  afterEach(() => mock.reset())

  it("memoizes a given `function`", () => {
    const func = memoize(mock.fn())
    func(1)
    assert.one(func.mock.calls.length)
    func(1)
    assert.one(func.mock.calls.length)
    func(2)
    assert.two(func.mock.calls.length)
  })

  it("including `async function`s", async () => {
    const func = memoize(mock.fn(async () => {}))
    await func(1)
    assert.one(func.mock.calls.length)
    await func(1)
    assert.one(func.mock.calls.length)
    await func(2)
    assert.two(func.mock.calls.length)
  })

  it("cached result expires after an optional `Timeout`", async () => {
    const ms = 100
    const func = memoize(mock.fn(), ms)
    func(1)
    assert.one(func.mock.calls.length)
    await delay(ms)
    func(1)
    assert.two(func.mock.calls.length)
  })
})

describe("`esm`", () =>
  it("loads a given JavaScript ESModule", async () => {
    const version = "3.0.0"
    // https://github.com/sindresorhus/in-range#readme
    const cdn = `https://esm.sh/in-range@${version}/es2022/in-range.mjs`
    const within = await esm(cdn)
    const range = { start: 1, end: 3 }
    assert.true(within(2, range))
  }))

describe("`parseFile`", () => {
  const data = { a: 1 }

  it("should read and `parse` `JSON` files", async () => {
    const json = JSON.stringify(data)
    const file = `${fixtures}/data.json`
    await fs.writeFile(file, json)
    const parsed = await parseFile(file)
    assert.deepEqual(parsed, data)
  })

  it("should read and `parse` YAML files", async () => {
    const file = `${fixtures}/data.yaml`
    await fs.writeFile(file, "a: 1")
    const parsed = await parseFile(file)
    assert.deepEqual(parsed, data)
  })
})

describe("`writeFile`", () =>
  it("should write to file `path`, creating any intermediate directories as required", async () => {
    const file = await writeFile(`${fixtures}/file.json`, "{}")
    await assert.exists(file)
  }))
