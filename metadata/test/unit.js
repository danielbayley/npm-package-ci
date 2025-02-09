import fs from "node:fs/promises"
import { parse } from "node:path"
import { assert, describe, it } from "utils/test"
import { parseFile } from "utils"

const fixtures = `${import.meta.dirname}/fixtures`
const packageFile = `${fixtures}/package.yaml`
process.env.GITHUB_WORKSPACE = fixtures

const namespace = await import("#index")
const { default: metadata, ini } = namespace

describe("namespace `import *`", () => {
  it("`export`s `metadata` by `default`", () =>
    assert.deepEqual(namespace.metadata, metadata))

  it("`export`s a `package` property", async () => {
    const pkg = await parseFile(packageFile)
    assert.deepEqual(namespace.package, pkg)
  })
})

describe("`metadata`", () => {
  it("`export`s a `packageFile` property with the `package.*` file path", () =>
    assert.equal(metadata.packageFile, packageFile))

  it("along with a `path` `Object` representation", () => {
    const  path = parse(packageFile)
    delete path.root
    assert.deepMatch(metadata.path, path)
  })

  it("includes pnpm `workspace` configuration", () =>
    assert.true(metadata.workspace.packages.length > 0))

  it("includes npm or yarn `workspaces` config", () =>
    assert.true(metadata.workspaces.length > 0))

  it("`export`s an `ls` property with an array of paths in the working directory", async () => {
    const files = await fs.readdir(fixtures)
    assert.deepEqual(metadata.ls, files)
  })

  it("`export`s `process.versions` as `versions`", () =>
    assert.deepEqual(metadata.versions, process.versions))

  it("ignores custom properties by `default`", () =>
    assert.undefined(metadata.custom))
})

describe("`ini`", () =>
  it("`export`s an `ini` property, with `metadata` as INI format `key=value` pairs", () => {
    const prop = "package-file"
    const path = ini
      .split("\n")
      .find(line => line.includes(prop))
      .split("=")
      .at(-1)

    assert.equal(packageFile, path)
  }))
