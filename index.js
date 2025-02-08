import { readdir } from "node:fs/promises"
import { read } from "utils"

let { INPUT_REPORTER: reporter } = process.env
const { dirname } = import.meta
const { dependencies } = await read(`${dirname}/package.json`)
  .then(JSON.parse)
  .catch(console.error)

const [name] = Object.keys(dependencies)
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
const json = await read(packageJSON).catch(() => "{}")
const { packageManager, engines } = JSON.parse(json)

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
console.log(`test=${test}`)

if (reporter !== "false") {
  reporter ||= `${dirname}/packages/${name}/index.js`
  const add = {
    pnpm: `pnpm add ${reporter}`,
    yarn: `yarn add ${reporter}`,
    npm:  `npm  add ${reporter} --no-save`,
  }
  console.log(`add=${add[pm]}`)

  const options = `--test-reporter=${reporter} --test-reporter-destination=$GITHUB_STEP_SUMMARY`
  console.log(`options=${options}`)
}
