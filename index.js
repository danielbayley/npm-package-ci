import fs   from "node:fs/promises"
import path from "node:path"
import { load } from "utils"

let { INPUT_REPORTER: reporter, GITHUB_WORKSPACE } = process.env
const { dirname } = import.meta
const { dependencies } = await load(`${dirname}/package.json`)
  .catch(console.error)

const [dependency] = Object.keys(dependencies)
const files = {
  "package.json":          null,
  "package.yaml":        "pnpm",
  "pnpm-lock.yaml":      "pnpm",
  "shrinkwrap.yaml":     "pnpm",
  "yarn.lock":           "yarn",
  "package-lock.json":    "npm",
  "npm-shrinkwrap.json":  "npm",
}
const ls = await fs.readdir(GITHUB_WORKSPACE)
const order = Object.keys(files)
const by = (a, b) => order.indexOf(a) - order.indexOf(b)
const sorted = ls.filter(path => path in files).sort(by)
const match  = sorted.find(path => files[path])
const pkg    = path.join(GITHUB_WORKSPACE, order.slice(0, 2)
  .find(path => sorted.includes(path)))

console.log(`package-file=${pkg}`)

const { packageManager, devEngines, engines } = await load(pkg)
  .catch(Object.create)

let { name, version } = devEngines?.packageManager ?? {}
let [pm, v] = packageManager?.split("@") ?? []

pm ??= Object.values(files).find(pm => engines?.[pm])
pm ??= name ?? files[match] ?? "npm"
version ??= v ?? "latest"

console.log(`package-manager=${pm}`)
console.log(`version=${version}`)

const install = {
  pnpm: "pnpm install",
  yarn: "yarn install --immutable",
  npm:  "npm ci",
}
console.log(`install=${install[pm]}`)

const test = pm === "yarn" ? "yarn test" : `${pm} run --if-present test`
console.log(`test=${test}`)

if (reporter !== "false") {
  reporter ||= `${dirname}/packages/${dependency}/index.js`
  const add = {
    pnpm: `pnpm add ${reporter}`,
    yarn: `yarn add ${reporter}`,
    npm:  `npm  add ${reporter} --no-save`,
  }
  console.log(`add=${add[pm]}`)

  const options = `--test-reporter=${reporter} --test-reporter-destination=$GITHUB_STEP_SUMMARY`
  console.log(`options=${options}`)
}
