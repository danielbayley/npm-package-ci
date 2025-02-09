import fs from "node:fs/promises"

const version = "0.3.0"
const yaml = `https://esm.sh/yamljs@${version}/es2022/yamljs.mjs`

export const blank = ""

async function esm(cdn) {
  const js = await fetch(cdn)
    .then(response => response.ok ? response.text() : blank)

  const data = encodeURIComponent(js)
  const { default: exports } = await import(`data:text/javascript,${data}`)
    .catch(() => ({ default: {}}))
  return exports
}

export async function parseFile(path) {
  const content = await fs.readFile(path, new TextDecoder)
  const {parse} = path.endsWith(".yaml") ? await esm(yaml) : JSON
  return parse(content) ?? {}
}
