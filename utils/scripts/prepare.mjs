import fs from "node:fs/promises"
import { parseFile, writeFile } from "../index.mjs"

const { env, argv } = process
const indent = parseInt(env.TABSIZE) || 2

let [packageFile] = argv.slice(2)
packageFile ??= env["INPUT_PACKAGE-FILE"]
let cwd       = env["INPUT_WORKING-DIRECTORY"] ?? process.cwd()

const ls = await fs.readdir(cwd)
packageFile ??= ls.find(file => /package\.(json|yaml)$/.test(file))

const metadata = await parseFile(packageFile)
const json = JSON.stringify(metadata, null, indent)

await writeFile("package.json", json)
process.exit(0)
