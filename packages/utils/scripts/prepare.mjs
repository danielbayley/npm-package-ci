import fs from "node:fs/promises"
import { parseFile, writeFile } from "../index.mjs"

const { env, argv } = process
const indent = parseInt(env.TABSIZE) || 2

let [packageFile] = argv.slice(2)
const ls = await fs.readdir(process.cwd())
packageFile ??= ls.find(file => /package\.(json|yaml)$/.test(file))

console.log(ls)

const metadata = await parseFile(packageFile)
const json = JSON.stringify(metadata, null, indent)

await writeFile("package.json", json)
process.exit(0)
