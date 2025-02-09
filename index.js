import fs from "node:fs/promises"
import * as metadata from "#metadata"
import { toINI, newline } from "utils"

const { INPUT_REPORTER, GITHUB_OUTPUT } = process.env
const { packageManager,  dependencies } = metadata.package
const [pm] = packageManager.split("@")
let [dependency] = Object.keys(dependencies ?? {}) ?? []
dependency ??= "node-test-reporter-github"

let {ini} = metadata
const install = {
  pnpm: "pnpm install",
  yarn: "yarn install --immutable",
  npm:  "npm ci",
}[pm]

const test = pm === "yarn" ? "yarn test" : `${pm} run --if-present test`

let add, options, reporter = INPUT_REPORTER
if (reporter !== "false") {
  reporter ||= `${import.meta.dirname}/${dependency}/index.js`
  add = {
    pnpm: `pnpm add ${reporter}`,
    yarn: `yarn add ${reporter}`,
    npm:  `npm  add ${reporter} --no-save`,
  }[pm]

  options = `--test-reporter=${reporter} --test-reporter-destination=$GITHUB_STEP_SUMMARY`
}

ini += newline + toINI({ install, test, add, options })
if (GITHUB_OUTPUT) await fs.appendFile(GITHUB_OUTPUT, ini)
