import { relative } from "node:path"
import core from "@actions/core"
import {parse} from "./packages/node--test-parser/index.js"

const { dirname } = import.meta
const { GITHUB_ACTIONS, GITHUB_WORKSPACE, INPUT_COVERAGE, INPUT_ANNOTATE_TODO } = process.env
process.env.GITHUB_STEP_SUMMARY ??= `${dirname}/test/fixtures/index.html`
const cwd = GITHUB_WORKSPACE ?? process.cwd()

const [owner, repo, branch] = dirname.split("/").slice(-3)
const path = GITHUB_ACTIONS
  ? `https://github.com/${owner}/${repo}/raw/${branch}`
  : dirname

// https://primer.style/foundations/icons
const src = `${path}/octicons`
const icons = {
  pass: "check-circle-fill-16",
  fail: "x-circle-fill-16",
  skip: "skip-16",
}
icons.true  = icons.pass
icons.false = icons.fail
icons.todo  = icons.skip

const capitalize = text => text[0].toUpperCase() + text.slice(1)

const rangesFrom = (array, dash = "-", sep = " ") => array
  .reduce((string, n, i) => {
    if (array[i - 1] !== n - 1) string += n
    return string += array[i + 1] === n + 1 ? dash : n + sep
  }, "")
  .replace(/(.)\1+/g, "$1")
  .trim()

function toTable(entries, [data, n]) {
  var [data, unit = ""] = capitalize(data).split("_")
  entries[0].push({ data, header: true })
  entries[1].push(Math.round(n) + unit)
  return entries
}

function coverageFrom(events) {
  const { summary } = events.find(e => e.type === "coverage") ?? {}
  if (summary == null) return

  const headers = ["File", "Line (%)", "Branch (%)", "Functions (%)", "Uncovered lines"]
    .map(data => ({ data, header: true }))

  const { workingDirectory, files, totals } = summary
  const {
    coveredLinePercent,
    coveredBranchPercent,
    coveredFunctionPercent
  } = totals

  const coverage = files.reduce((cover, file, i) => {
    const {
      path,
      coveredLinePercent,
      coveredBranchPercent,
      coveredFunctionPercent,
      lines,
    } = file

    const uncovered = lines
      .filter(l => l.count === 0)
      .map(l => l.line)

    const row = [
      relative(workingDirectory, path),
      coveredLinePercent.toFixed(2),
      coveredBranchPercent.toFixed(2),
      coveredFunctionPercent.toFixed(2),
      rangesFrom(uncovered),
    ]

    i += 1
    cover[i] ??= []
    cover[i].push(...row)

    return cover
  }, [headers])

  coverage.push([
    "All files",
    coveredLinePercent.toFixed(2),
    coveredBranchPercent.toFixed(2),
    coveredFunctionPercent.toFixed(2),
    "",
  ])
  return coverage
}

const detailsFrom = tests =>
  tests?.reduce((body, { type, name, error, skip, todo, subtests }) => {
    const fail = type === "fail" || error?.failureType === "subtestsFailed"
    if (fail) var open = " open"

    const icon = skip ? icons.skip : todo ? icons.todo : icons[type] ?? icons[!fail]

    return body + render(name, detailsFrom(subtests), icon, open)
  }, "")

const annotate = events => events
  .filter(e => ["pass", "fail"].includes(e.type))
  .forEach(({ type, name: title, error, todo, file, line, column }) => {
    let {cause} = error ?? {}
    const location = {
      file: relative(cwd, file),
      startLine: line,
      startColumn: column,
    }
    if (type === "fail") core.error(cause, { title, ...location })
    if (todo == null || INPUT_ANNOTATE_TODO === "false") return

    const severity = error ? "warning" : "notice"
    cause ??= "‎‎ "
    return core[severity](cause, { title: `TODO: ${title}`, ...location })
  })

function render(summary, content, icon, open = "") {
  icon = `<img src="${src}/${icon}.svg"/>`
  summary = `${icon}&ensp;${summary}`

  const body = content
    ? `<details${open}>
        <summary>${summary}</summary>
        <blockquote>
          ${content}
        </blockquote>
      </details>`
    : `<span>${summary}</span><br>`

  return body.replace(/`(.+)`/g, "<code>$1</code>")
}

function preview(body) {
  const cdn = "https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown.css"
  const style = `
    max-width: 980px;
    margin: 0 auto;
    padding: 1em`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="${cdn}"/>
      </head>
      <body class="markdown-body" style="${style}">
        ${body}
      </body>
    </html>`
}

export default async function* reporter(report) {
  const { events, tests, diagnostics } = await parse(report)

  const h = 2
  const table = Object
    .entries(diagnostics)
    .reduce(toTable, [ [], [] ])

  const details  = detailsFrom(tests)
  const coverage = coverageFrom(events)

  GITHUB_ACTIONS ? annotate(events) : await core.summary.clear()

  core.summary
    .addHeading("Test Results", h)
    .addTable(table)
    .addHeading("Details", h + 1)
    .addRaw(details)

  if (coverage) core.summary
    .addHeading("Coverage", h + 1)
    .addTable(coverage)

  if (!GITHUB_ACTIONS) {
    const body = core.summary.stringify()
    const html = preview(body)
    core.summary.emptyBuffer()
    core.summary.addRaw(html)
  }
  core.summary.write()
}
