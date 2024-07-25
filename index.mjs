import { readdir, readFile } from "node:fs/promises"

const packageJSON = "package.json"
const files = {
  "package-lock.json":    "npm",
  "npm-shrinkwrap.json":  "npm",
  [packageJSON]:      undefined,
  "package.yaml":        "pnpm",
  "pnpm-lock.yaml":      "pnpm",
  "yarn.lock":           "yarn",
}

const ls = await readdir(".")
const path = ls.find(path => files[path])
const content = await readFile(packageJSON, "utf8").catch(error => "{}")
const { engines, packageManager } = JSON.parse(content)
const engine = engines
  ? Object.values(files).find(pm => pm in engines)
  : packageManager?.split("@").at(0)

const pm = files[path] ?? engine ?? "npm"
console.log(`package-manager=${pm}`)
