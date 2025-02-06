import core from "@actions/core"
import { relative, capitalize, rangesFrom } from "utils"
import * as html from "#lib/html"

const {
  GITHUB_WORKSPACE = `${import.meta.dirname}/../../..`,
  INPUT_TODO_ANNOTATE,
  INPUT_TODO_FAIL_WARN,
} = process.env

// https://primer.style/foundations/icons
const icons = {
  pass: "check-circle-fill-16",
  fail: "x-circle-fill-16",
  warn: "alert-16",
  skip: "skip-16",
}
icons.todo = icons.skip

export function toTable(entries, [data, n]) {
  var [data, unit = ""] = capitalize(data).split("_")
  entries[0].push({ data, header: true })
  entries[1].push(Math.round(n) + unit)
  return entries
}

export const { render, preview } = html
export const detailsFrom = tests =>
  tests?.reduce((body, { type, name, error, skip, todo, subtests }) => {
    const fail = type === "fail" || error?.failureType === "subtestsFailed"
    if (fail) var open = " open"

    const status = fail ? "fail" : "pass"
    const icon = skip
      ? icons.skip
      : todo && fail && INPUT_TODO_FAIL_WARN !== "false"
      ? icons.warn
      : todo
      ? icons.todo
      : icons[status]

    return body + render(name, detailsFrom(subtests), icon, status, open)
  }, "")

export function coverageFrom(events) {
  const { files, totals } = events.find(e => e.type === "coverage") ?? {}
  if (totals == null) return

  const headers = ["File", "Line (%)", "Branch (%)", "Functions (%)", "Uncovered lines"]
    .map(data => ({ data, header: true }))

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
      relative(GITHUB_WORKSPACE, path),
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

export const annotate = events => events
  .filter(({ type, skip }) => ["pass", "fail"].includes(type) && !skip)
  .forEach(({ type, name: title, error, todo, file, line, column }) => {
    let { cause } = error ?? {}
    const location = { file, startLine: line, startColumn: column }

    if (type === "fail" && !todo) return core.error(cause, { title, ...location })
    if (!todo || INPUT_TODO_ANNOTATE === "false") return

    const severity = error && INPUT_TODO_FAIL_WARN !== "false" ? "warning" : "notice"
    cause ??= "‎‎ "
    core[severity](cause, { title: `TODO: ${title}`, ...location })
  })
