import { mkdir, readFile, writeFile } from "node:fs/promises"
import path, { dirname, resolve }     from "node:path"
import { JSDOM } from "jsdom"

export const { encoding } = new TextDecoder()
const blank = ""
const space = " "

export const relative = (from, to) => path.relative(from, resolve(from, to))

export const read = file => readFile(file, { encoding })

export async function write(path, content = blank) {
  const parent = dirname(path)
  await mkdir(parent, { recursive: true })
  await writeFile(path, content)
  return path
}

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

export const toDOM = html => new JSDOM(html).window.document
