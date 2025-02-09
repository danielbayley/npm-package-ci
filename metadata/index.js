import fs   from "node:fs/promises"
import path from "node:path"
import { parseFile } from "#utils" //, blank }

const { GITHUB_WORKSPACE, GITHUB_OUTPUT } = process.env
const cwd =  process.env["INPUT_WORKING-DIRECTORY"] || GITHUB_WORKSPACE
let packageFile = process.env["INPUT_PACKAGE-FILE"]

const rootFiles = {
  "package.json":          null,
  "package.yaml":        "pnpm",
  "pnpm-lock.yaml":      "pnpm",
  "shrinkwrap.yaml":     "pnpm",
  "yarn.lock":           "yarn",
  "package-lock.json":    "npm",
  "npm-shrinkwrap.json":  "npm",
}
const ls = await fs.readdir(cwd)
const order = Object.keys(rootFiles)
const by = (a, b) => order.indexOf(a) - order.indexOf(b)
const sorted = ls.filter(path => path in rootFiles).sort(by)
const match  = sorted.find(path => rootFiles[path])

packageFile ||= order.slice(0, 2).find(path => sorted.includes(path))
packageFile = path.resolve(cwd, packageFile)

const metadata = await parseFile(packageFile)
const json = JSON.stringify(metadata)

const { packageManager, devEngines, engines } = metadata
let { name, version } = devEngines?.packageManager ?? {}
let [pm, v] = packageManager?.split("@") ?? []

pm ??= Object.values(rootFiles).find(pm => engines?.[pm])
pm ??= name ?? rootFiles[match] ?? "npm"
version ??= v ?? "latest"

const {runtime} = devEngines ?? {}
let nv = engines?.node
nv ??= runtime?.name === "node" ? runtime?.version : "latest"

let {
  description,
  keywords,
  homepage,
  repository,
  bugs,
  author,
  license,
  type,
  imports,
  exports,
  main,
  bin,
  files,
  directories,
  publishConfig,
  dependencies,
  optionalDependencies,
  peerDependencies,
  peerDependenciesMeta,
  devDependencies,
  config,
  scripts,
} = metadata

const { name: authorName, email, url } = author ?? {}

keywords             &&= JSON.stringify(keywords)
author               &&= JSON.stringify(author)
imports              &&= JSON.stringify(imports)
exports              &&= JSON.stringify(exports)
bin                  &&= JSON.stringify(bin)
files                &&= JSON.stringify(files)
directories          &&= JSON.stringify(directories)
publishConfig        &&= JSON.stringify(publishConfig)
dependencies         &&= JSON.stringify(dependencies)
optionalDependencies &&= JSON.stringify(optionalDependencies)
peerDependencies     &&= JSON.stringify(peerDependencies)
peerDependenciesMeta &&= JSON.stringify(peerDependenciesMeta)
devDependencies      &&= JSON.stringify(devDependencies)
config               &&= JSON.stringify(config)
scripts              &&= JSON.stringify(scripts)

const output = `
package-file=${packageFile}
package-manager=${pm}
package-manager-version=${version}
node-version=${nv}
metadata=${json}
version=${metadata.version}
name=${metadata.name}
description=${description}
keywords=${keywords}
homepage=${homepage}
repository=${repository}
bugs=${bugs}
author=${author}
author-name=${authorName}
author-email=${email}
email=${email}
blog=${url}
license=${license}
type=${type}
imports=${imports}
exports=${exports}
main=${main}
bin=${bin}
files=${files}
directories=${directories}
publish-config=${publishConfig}
publishConfig=${publishConfig}
packageManager=${packageManager}
dependencies=${dependencies}
optionalDependencies=${optionalDependencies}
peerDependencies=${peerDependencies}
peerDependenciesMeta=${peerDependenciesMeta}
devDependencies=${devDependencies}
config=${config}
scripts=${scripts}
`
await fs.appendFile(GITHUB_OUTPUT, output)
