const stack = []
//export async function(report) {
export const parse = async report => Array
  .fromAsync(report)
  .then(tests => tests
  .reduce((report, { type, data }) => {
    const { details, message } = data
    type = type.replace(/^test:/, "")

    report.events ??= []
    const event = { type, ...data, ...details }
    delete event.details
    report.events.push(event)

    switch (type) {
      case "start":
        stack.push({ subtests: [] }) //tests: []
        break

      case "pass":
        //if (data.skip) type = "skip"
        //if (data.todo) type = "todo"
      case "fail":
        report.tests ??= []
        const test = {...event, ...stack.pop() }
        const last = stack.at(-1)
        const tests = last ? last.subtests : report.tests
        tests.push(test)
        if (test.subtests.length === 0) delete test.subtests

      case "diagnostic":
        if (message == null) break
        const [tally, n] = message.split(" ")
        report.diagnostics ??= {}
        report.diagnostics[tally] = parseFloat(n)  //.toFixed(2)
    }
    return report
  }, {}))

export default parse
