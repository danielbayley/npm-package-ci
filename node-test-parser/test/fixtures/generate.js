import {arrayFrom} from "utils"

export default async function* generate(report) {
  const events = await arrayFrom(report).catch(() => ({}))
  yield JSON.stringify(events, null, 2)
}
