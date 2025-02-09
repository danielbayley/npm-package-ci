import core from "@actions/core"
import { parse } from "@danielbayley/node-test-parser"
import { toTable, detailsFrom, coverageFrom, annotate, preview } from "#lib"

const { GITHUB_ACTIONS } = process.env

export default reporter
export async function* reporter(report) {
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

  const body = core.summary.stringify()
  const html = GITHUB_ACTIONS ? body : preview(body)
  core.summary.emptyBuffer()
  core.summary.addRaw(html.replace(/<th>/g, '<th align="left">'))
  core.summary.write({ overwrite: true })
}
