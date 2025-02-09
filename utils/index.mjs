import fs from "node:fs/promises"
import path, { dirname, resolve, parse, sep } from "node:path"
export { setTimeout as delay } from "node:timers/promises"

const version = "0.3.0"
const yaml = `https://esm.sh/yamljs@${version}/es2022/yamljs.mjs`

export const blank = ""
export const space = " "
export const whitespace = /\s+/
export const newline = "\n"

export const capitalize = text => text[0].toUpperCase() + text.slice(1)

export const rangesFrom = (array, dash = "-", sep = space) => array
  .reduce((string, n, i) => {
    if (array[i - 1] !== n - 1) string += n
    return string += array[i + 1] === n + 1 ? dash : n + sep
  }, blank)
  .replace(/(.)\1+/g, "$1")
  .replace(new RegExp(`${sep}$`), blank)

export async function arrayFrom(asynchronous) {
  const array = []
  for await (const i of asynchronous) array.push(i)
  return array
}

export const filterKeys = (object, include = []) => include
  .filter(key => key in object)
  .reduce((copy, key) => ({...copy, [key]: object[key] }), {})

export const assign = (object, ...objects) => objects
  .map(Object.entries)
  .reduce((_, entries) =>
    entries.reduce((_, [key, value]) => {
      if (value != null) object[key] ??= value
      return object
    }, {}), {})

export const toINI = object => Object
  .entries(object)
  .reduce(toString, blank)
  .trimEnd()

function toString(string, [key, value]) {
  try { value = JSON.rawJSON(value) }
  catch (error) {}
  if (value?.constructor !== String) value = JSON.stringify(value)
  return string += `${key}=${value}\n`
}

export const relative = (from, to) => path.relative(from, resolve(from, to))

export function pathFrom(path, cwd) {
  cwd ??= process.cwd()
  const absolute = resolve(cwd, path)
  const object   = parse(absolute)
  if (object.root === sep) delete object.root
  const rel = relative(cwd, path)
  if (rel !== object.base) object.relative = rel
  return {...object, absolute }
}

export const exists = path => fs.access(path)
  .then(()  => true)
  .catch(() => false)

export function memoize(func, ms) {
  const cache = new Map()
  function apply() {
    const key = JSON.stringify(arguments)
    if (ms) setTimeout(() => cache.delete(key), ms)
    if (!cache.has(key)) cache.set(key, Reflect.apply(...arguments))
    return cache.get(key)
  }
  return new Proxy(func, { apply })
}

export const sanitize = js => js.replace(/\/(\/.*?$|\*.*?\*\/)/gms, blank)

export const fetch = memoize(globalThis.fetch)
export const esm   = memoize(async (cdn) => {
  const js = await fetch(cdn)
    .then(response => response.ok ? response.text() :  blank)
    .then(sanitize)

  const data = encodeURIComponent(js)
  const { default: exports } = await import(`data:text/javascript,${data}`)
  return exports ?? {}
})

export async function parseFile(path) {
  const content = await fs.readFile(path, new TextDecoder)
  const {parse} = path.endsWith(".yaml") ? await esm(yaml) : JSON
  return parse(content) ?? {}
}

export async function writeFile(path, content = blank) {
  const parent = dirname(path)
  await fs.mkdir(parent, { recursive: true })
  await fs.writeFile(path, content)
  return path
}
