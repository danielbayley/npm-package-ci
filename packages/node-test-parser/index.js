import { fileURLToPath } from "node:url"
import { arrayFrom } from "utils"

const stack = []
export const parse = async report => arrayFrom(report)
  .then(events => events
  .reduce((report, { type, data }) => {
    if (data == null) return report

    const { details, message, summary } = data
    type = type.replace(/^test:/, "")

    report.events ??= []
    const  event = { type, ...data, ...details, ...summary }
    delete event.details
    delete event.summary
    if (event.file?.startsWith("file:")) event.file = fileURLToPath(event.file)
    report.events.push(event)

    switch (type) {
      case "start":
        stack.push({ subtests: [] })
        break

      case "pass":
      case "fail":
        report.tests ??= []
        const test  = {...event, ...stack.pop() }
        const last  = stack.at(-1)
        const tests = last ? last.subtests : report.tests
        tests.push(test)
        if (test.subtests?.length === 0) delete test.subtests

      case "diagnostic":
        if (message == null) break
        const [tally, n] = message.split(" ")
        report.diagnostics ??= {}
        report.diagnostics[tally] = parseFloat(n)
    }
    return report
  }, {}))

export default parse
