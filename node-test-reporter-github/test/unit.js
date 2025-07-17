import fs from "node:fs/promises"
import { Readable } from "node:stream"
import core from "@actions/core"
import { JSDOM } from "jsdom"

import { assert, describe, it, beforeEach, afterEach, mock } from "utils/test"
import { relative, writeFile, capitalize, blank, arrayFrom } from "utils"

import { toTable, detailsFrom, coverageFrom, annotate, render, preview } from "#lib"
import { reporter } from "#index"

const { dirname, filename } = import.meta
const { GITHUB_ACTIONS, GITHUB_WORKSPACE = `${dirname}/../../..`} = process.env
const file = relative(GITHUB_WORKSPACE, filename)
const fixtures = `${dirname}/fixtures`

export const toDOM = html => new JSDOM(html).window.document

const [
  coveredLinePercent,
  coveredBranchPercent,
  coveredFunctionPercent,
] = Array(3).fill(100)
const percent = coveredLinePercent.toFixed(2)
const totals  = {
  coveredLinePercent,
  coveredBranchPercent,
  coveredFunctionPercent
}

const selector = "details summary + blockquote"

describe("`toDOM`", () => {
  const content = "content"
  const html = `<div id="id">${content}</div>`
  const document = toDOM(html)
  const {textContent} = document.querySelector("div#id") ?? {}

  it("should parse HTML string to DOM", () =>
    assert.equal(textContent, content))
})

describe("`toTable`", () =>
  it("should return entries compatible with `core.summary.addTable`", () => {
    const entries = Object.entries({ float: 1.0, round: 1.6 })
    const table = [
      ["Float", "Round"].map(data => ({ data, header: true })),
      ["1", "2"],
    ]
    assert.deepEqual(entries.reduce(toTable, [ [], [] ]), table)
  }))

describe("`annotate`", () => {
  const results = {
    pass: "pass",
    todo: "pass", // notice
    skip: "fail",
    fail: "fail",
    warn: "fail",
  }
  const events = Object
    .entries(results)
    .map(([name, type], i) => {
      if (type === "fail") var error = { cause: blank }
      return {
        type, name, file, line: i + 1,
        skip: name === "skip",
        todo: ["todo", "warn"].includes(name),
        error,
      }
    })

  afterEach(mock.resetCalls)
  beforeEach(() => {
    mock.method(core, "error")
    mock.method(core, "warning")
    mock.method(core, "notice")
    annotate(events)
  })

  it("should annotate failed tests as errors", () => {
    const [fail] = core.error.mock.calls
    const { title, file: path, startLine } = fail.arguments.at(-1)

    assert.equal(core.error.mock.callCount(), 1)
    assert.equal(title, "fail")
    assert.equal(file, path)
    assert.equal(startLine, 4)
  })

  it("should annotate passed tests marked `.todo` as notices", () => {
    const [pass] = core.notice.mock.calls
    const { title, file: path, startLine } = pass.arguments.at(-1)
    const { name } = events.at(1)

    assert.equal(core.notice.mock.callCount(), 1)
    assert.equal(title, `TODO: ${name}`)
    assert.equal(file, path)
    assert.equal(startLine, 2)
  })

  it("should annotate failed tests marked `.todo` as warnings", () => {
    const [warn] = core.warning.mock.calls
    const { title, file: path, startLine } = warn.arguments.at(-1)
    const { name } = events.at(-1)

    assert.equal(core.warning.mock.callCount(), 1)
    assert.equal(title, `TODO: ${name}`)
    assert.equal(file, path)
    assert.equal(startLine, 5)
  })
})

describe("`coverageFrom`", () =>
  it("should return entries compatible with `core.summary.addTable`", () => {
    const lines  = [1, 0, 0, 1].map((count, i) => ({ line: i + 1, count }))
    const events = [{
      type: "coverage",
      workingDirectory: fixtures,
      files: [{ path: file, ...totals, lines }],
      totals,
    }]
    const [headings, row] = coverageFrom(events)
    const [{ data }] = headings

    assert.equal(data, "File")
    assert.deepEqual(row, [file, percent, percent, percent, "2-3"])
  }))

describe("`detailsFrom`", () => {
  const results = {
    pass: "pass",
    fail: "fail",
    skip: "fail",
    todo: "fail",
  }
  const tests = Object
    .entries(results)
    .map(([name, type]) => {
      const subtests = [{
        type, name, file,
        skip: name === "skip",
        todo: name === "todo",
      }]
      if (type === "fail") var error = { failureType: "subtestsFailed" }
      return { type: "suite", name: "suite", file, subtests, error }
    })

  const html = detailsFrom(tests)
  const document  = toDOM(html)
  const [summary] = document.getElementsByTagName("summary")
  const subtests  = [...document.querySelectorAll(`${selector} > *:first-child`)]
  const icons     = subtests.map(test => test.children[0])

  it("should have the correct name content", () => {
    const [pass, fail, skip, todo] = subtests.map(test => test.textContent.trim())
    assert.equal(summary.textContent.trim(), "suite")
    assert.equal(pass, "pass")
    assert.equal(fail, "fail")
    assert.equal(skip, "skip")
    assert.equal(todo, "todo")
  })

  it("should apply the appropriate `title` to icons", () => {
    const [pass, fail] = icons.map(img => img.title)
    assert.equal(pass, "pass")
    assert.equal(fail, "fail")
  })

  it("should render the appropriate icon", () => {
    const [pass, fail, skip, todo] = icons.map(img => img.src)
    assert.match(pass, /check-/)
    assert.match(fail, /x-/)
    assert.match(skip, /skip-/)
    assert.match(todo, /alert-/)
  })

  it("should default to `open` on any subtest failures", () => {
    const details = document.getElementsByTagName("details")
    const [pass, fail] = [...details]
    assert.equal(fail.open, true)
    assert.equal(pass.open, false)
  })
})

describe("`render`", () => {
  it("should render suite summary", () => {
    const summary = "pass"
    const suite = render(summary)
    const document = toDOM(suite)
    const {textContent} = document.querySelector("*:first-child") ?? {}
    assert.equal(textContent.trim(), summary)
  })

  it("should render nested `blockquote`s for subtest indentation", () => {
    const status = "fail"
    const content = `<div>${status}</div>`
    const body = render(null, content)
    const document = toDOM(body)
    const { innerHTML, textContent } = document.querySelector(selector) ?? {}
    assert.equal(innerHTML.trim(), content)
    assert.equal(textContent.trim(), status)
  })

  it("should render <code>`</code>backticks<code>`</code> as inline `code`", () => {
    const summary  = "some `code` inline"
    const body     = render(summary, summary)
    const document = toDOM(body)
    const codes    = document.querySelectorAll(`summary code, ${selector} code`)
    const compare  = [...codes].map(code => code.textContent)
    assert.equal(...compare)
  })
})

describe("`preview`", async () => {
  const summary = "pass"
  const content = `<div>${summary}</div>`
  const body = render(summary, content)
  const html = preview(body)
  const document = toDOM(html)

  it("should wrap `body` in `html` for local preview", () => {
    const {textContent} = document.querySelector(`html body ${selector} > *:first-child`) ?? {}
    assert.equal(textContent, summary)
  })

  it("should apply GitHub CSS", () => {
    const {href} = document.querySelector("head link") ?? {}
    assert.match(href, /github.*\.css$/)
    assert.equal(document.body.className, "markdown-body")
  })
})

describe("`reporter`", async () => {
  const results = {
    suite: "fail",
    pass:  "pass",
    fail:  "fail",
    skip:  "fail",
    todo:  "fail",
  }
  const names = Object.keys(results)
  const start = names.map((name, i) => ({
    type: "test:start",
    data: { name, nesting: ~~!!i, file, line: i + 1 }
  }))
  const tests = Object
    .values(results)
    .map((status, i) => {
      const name = names[i]
      const error = { failureType: "testCodeFailure" }
      const details = status === "fail" ? { error } : i > 0 ? {} : { type: "suite" }
      return {
        type: `test:${status}`,
        data: {
          name,
          file, line: i + 1,
          testNumber: i + 1,
          nesting: ~~!!i,
          details,
          skip: name === "skip",
          todo: name === "todo",
        }
      }
    })

  const events = [...start, ...tests].sort((a, b) => a.data.line - b.data.line)
  events.push(...events.splice(1, 1))

  const headings = [
    "tests",
    "suites",
    "pass",
    "fail",
    "cancelled",
    "skipped",
    "todo",
    "duration_ms",
  ]
  const tally = [4, 1, 1, 1, 0, 1, 1, 500.49]

  const diagnostics = tally.reduce((rows, n, i) => {
    const message = `${headings[i]} ${n}`
    return [...rows, { type: "test:diagnostic", data: { message }}]
  }, [])

  const coverage = {
    type: "test:coverage",
    data: {
      summary: {
        workingDirectory: dirname,
        files: [{
          path: file,
          ...totals,
          lines: [{ line: 1, count: 1 }]
        }],
        totals,
      }
    }
  }

  const report = [...events, ...diagnostics, coverage]
  const stream = Readable.from(report)

  const preview = `${fixtures}/index.html`
  await writeFile(preview)
  process.env.GITHUB_STEP_SUMMARY = preview

  mock.method(core.summary, "addHeading")
  mock.method(core.summary, "addTable")
  mock.method(core.summary, "clear")
  mock.method(core.summary, "write")

  await arrayFrom(reporter(stream))
  const html = await fs.readFile(preview, new TextDecoder)
  const document = toDOM(html)

  it("should create local HTML preview", () => {
    const {tagName} = document.querySelector("html body > *:first-child") ?? {}
    assert.equal(core.summary.write.mock.callCount() > 0, true)
    assert.equal(html.length > 0, true)
    assert.match(tagName, /^h[1-6]$/i)
  })

  it("should clear local preview before every report", () =>
    assert.equal(core.summary.clear.mock.callCount(), ~~!GITHUB_ACTIONS))

  it("should render section `h`eadings with appropriate hierarchy", () => {
    const { mock: method } = core.summary.addHeading
    assert.equal(method.callCount(), 3)
    method.calls.forEach(({ arguments: [,level] }, i) => {
      const {tagName} = document.querySelector(`h${level}`) ?? {}
      assert.equal(tagName, `H${level}`)
      assert.equal(~~!!i + 2, level)
    })
  })

  let level
  it("should render test results `table`", () => {
    const [{ arguments: [heading] }] = core.summary.addHeading.mock.calls
    const [{ arguments: [rows]    }] = core.summary.addTable.mock.calls
    const  { tagName, textContent }  = document.querySelector("h1, h2, h3") ?? {}
    const hn = tagName.toLowerCase()
    const table = document.querySelectorAll(`${hn} + table th`)
    level = parseInt(hn.charAt(1))

    const drop = n => n.slice(0, -1)
    const compare = {}
    compare.headings = [
      [...table].map(th => th.textContent),
      headings.map(capitalize),
    ]
    compare.tally = [
      tally.map(String),
      rows.at(-1),
    ]
    assert.equal(heading, textContent, "Test Results")
    assert.deepEqual(...compare.headings.map(drop))
    assert.deepEqual(...compare.tally.map(drop))
  })

  it("should render collapsible `details` section", () => {
    const { arguments: [heading] } = core.summary.addHeading.mock.calls.at(1)
    const { textContent } = document.querySelector(`h${level + 1}`) ?? {}
    const { open }        = document.querySelector("details") ?? {}
    const elements        = document.querySelectorAll(`${selector} > *:nth-child(odd)`)
    const contents        = [...elements].map(e => e.textContent.trim())

    assert.equal(heading, textContent, "Details")
    assert.equal(open, true)
    assert.deepEqual(names.slice(1), contents)
  })

  it("should render coverage `table`", () => {
    const { arguments: [heading] } = core.summary.addHeading.mock.calls.at(-1)
    const { arguments: [rows]    } = core.summary.addTable.mock.calls.at(-1)
    const { textContent } = document.querySelector(`h${level + 1}:last-of-type`) ?? {}

    const table = document.querySelectorAll("table:last-of-type td")
    const [{ textContent: td } = {}] = [...table]
    const row = rows.at(1)

    assert.equal(heading, textContent, "Coverage")
    assert.equal(row.at(0), td, file)
    assert.equal(...row.slice(1, -1), percent)
  })
})
