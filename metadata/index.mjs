import fs from "node:fs/promises"
import { pathFrom, parseFile, filterKeys, assign, toINI } from "../utils/index.mjs"

const { versions, env } = process
const { GITHUB_WORKSPACE, GITHUB_OUTPUT } = env
let packageFile = env["INPUT_PACKAGE-FILE"]
let cwd         = env["INPUT_WORKING-DIRECTORY"]
cwd ||= GITHUB_WORKSPACE || process.cwd()

const rootFiles = {
  "package.json":         null,
  "package.yaml":       "pnpm",
  "pnpm-lock.yaml":     "pnpm",
  "shrinkwrap.yaml":    "pnpm",
  "yarn.lock":          "yarn",
  "package-lock.json":   "npm",
  "npm-shrinkwrap.json": "npm",
}
const ls = await fs.readdir(cwd)
const order = Object.keys(rootFiles)
const by = (a, b) => order.indexOf(a) - order.indexOf(b)
const sorted = ls.filter(path => path in rootFiles).sort(by)
const match  = sorted.find(path => rootFiles[path])

packageFile ||= order.slice(0, 2).find(path => sorted.includes(path))
packageFile ??= order.at(0)
const path  = pathFrom(packageFile, cwd)
packageFile = path.absolute

const pkg = await parseFile(packageFile)
export { pkg as package }

const { packageManager, devEngines, engines } = pkg
let { name, version: pmv } = devEngines?.packageManager ?? {}
const pms = Object.values(rootFiles)
let [pm, v] = [packageManager].flat()
  .find(pm => pm?.name in pms)?.split("@") ?? []

pm  ??= pms.find(pm => engines?.[pm])
pm  ??= name ?? rootFiles[match] ?? "npm"
pmv ??= v ?? "latest"

let nv = engines?.node
const {runtime} = devEngines ?? {}
nv ??= runtime?.name === "node" ? runtime?.version : versions?.node

// https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#node-version-file
let nvm = ls.find(file => file.endsWith(".nvmrc"))
nvm ??= packageFile.replace(/\.yaml$/, ".json")

// https://docs.npmjs.com/cli/configuring-npm/package-json
export let metadata = filterKeys(pkg, [
  "version",
  "name",
  "description",
  "keywords",
  "homepage",
  "repository",
  "bugs",
  "author",
  "license",
  "type",
  "imports",
  "exports",
  "main",
  "bin",
  "files",
  "directories",
  "publishConfig",
  "engines",
  "devEngines",
  "packageManager",
  // https://docs.npmjs.com/cli/using-npm/workspaces
  "workspaces", // https://yarnpkg.com/features/workspaces
  "dependencies",
  "optionalDependencies",
  "peerDependencies",
  "peerDependenciesMeta",
  "devDependencies",
  "config",
  "scripts",
])

// https://pnpm.io/pnpm-workspace_yaml
const yaml = ls.find(file => file.endsWith("pnpm-workspace.yaml"))
if (yaml) var workspace = await parseFile(`${cwd}/${yaml}`)

export default metadata
assign(metadata, {
  packageFile,
  path,
  workspace,
  ls,
  versions,
})

export const ini = toINI({
  ...metadata,
  package: pkg,
  "package-file": packageFile,
  "package-manager": pm,
  "package-manager-version": pmv,
  "node-version": nv,
  "node-version-file": nvm,
})
delete ini.packageFile

if (GITHUB_OUTPUT) await fs.appendFile(GITHUB_OUTPUT, ini)
