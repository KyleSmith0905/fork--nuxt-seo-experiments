import { readFile } from 'node:fs/promises'
import fs from 'node:fs'
import type { Head } from '@unhead/schema'
import imageSize from 'image-size'
import { dirname, resolve } from 'pathe'

export function hasLinkRel(input: Head, rel: string) {
  return input.link?.some(link => link.rel === rel)
}

export function hasMetaProperty(input: Head, property: string) {
  return input.meta?.some(meta => meta.property === property)
}

export async function getImageMeta(base: string, path: string) {
  const absolutePath = resolve(base, path)
  const file = absolutePath.split('/').pop()
  const keyword = file.split('.')[0]
  let ext = absolutePath.split('.').pop()
  if (ext === 'jpg')
    ext = 'jpeg'
  const { width, height } = await getImageDimensions(absolutePath)
  const payload = {
    width,
    height,
    sizes: `${width}x${height}`,
    type: `image/${ext}`,
  }
  const altTextPath = resolve(dirname(absolutePath), `${keyword}.alt.txt`)
  if (fs.existsSync(altTextPath)) {
    payload.alt = fs.readFileSync(altTextPath, 'utf8')
    // need to normalise alt for og:image:alt
    payload.alt = payload.alt.replace(/\n/g, ' ').trim()
  }
  return payload
}
export async function getImageDimensions(absolutePath: string) {
  // read the file into a buffer using fs
  const buffer = await readFile(absolutePath)
  return imageSize(buffer)
}

export async function getImageDimensionsToSizes(absolutePath: string) {
  try {
    // read the file into a buffer using fs
    const { width, height } = await getImageDimensions(absolutePath)
    return `${width}x${height}`
  }
  catch {}
  // okay to fail, we fallback to any
  return 'any'
}
