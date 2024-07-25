import { readdir, readFile } from "node:fs/promises"

let { INPUT_REPORTER: reporter, INPUT_COVERAGE } = process.env
const { dirname } = import.meta
const packageJSON = "package.json"
const files = {
  [packageJSON]:      undefined,
  "package.yaml":        "pnpm",
  "pnpm-lock.yaml":      "pnpm",
  "shrinkwrap.yaml":     "pnpm",
  "yarn.lock":           "yarn",
  "package-lock.json":    "npm",
  "npm-shrinkwrap.json":  "npm",
}
const ls = await readdir(".")
const path = ls.find(path => files[path])
const content = await readFile(packageJSON, "utf8").catch(error => "{}")
const { packageManager, engines } = JSON.parse(content)

let [pm] = packageManager?.split("@") ?? Object
  .values(files)
  .filter(pm => engines?.[pm])

pm ??= files[path] ?? "npm"
console.log(`package-manager=${pm}`)

const install = {
  pnpm: "pnpm install",
  yarn: "yarn install --immutable",
  npm:  "npm ci",
}
console.log(`install=${install[pm]}`)

const test = pm === "yarn" ? "yarn test" : `${pm} run --if-present test`
//if (INPUT_COVERAGE !== "false") test += " --experimental-test-coverage"
console.log(`test=${test}`)

if (reporter !== "false") {
  reporter ||= `${dirname}/reporter.mjs`

  const add = {
    pnpm: `pnpm add ${reporter}`,
    yarn: `yarn add ${reporter}`,
    npm:  `npm  add ${reporter} --no-save`,
  }
  console.log(`add=${add[pm]}`)

  const options = `--test-reporter=${reporter} --test-reporter-destination=$GITHUB_STEP_SUMMARY`
  console.log(`options=${options}`)
}
