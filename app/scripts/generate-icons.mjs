import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const files = [
  { path: 'public/icons/icon-192.png', size: 192 },
  { path: 'public/icons/icon-512.png', size: 512 },
  { path: 'public/icons/icon-512-maskable.png', size: 512, maskable: true },
  { path: 'public/apple-touch-icon.png', size: 180 },
  { path: 'public/favicon.ico', size: 32, ico: true },
]

function crc32(buffer) {
  let crc = 0xffffffff
  for (const value of buffer) {
    crc ^= value
    for (let index = 0; index < 8; index += 1) {
      const mask = -(crc & 1)
      crc = (crc >>> 1) ^ (0xedb88320 & mask)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type)
  const lengthBuffer = Buffer.alloc(4)
  lengthBuffer.writeUInt32BE(data.length, 0)
  const crcBuffer = Buffer.alloc(4)
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0)
  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer])
}

function clamp(value, min = 0, max = 255) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function mix(a, b, amount) {
  return a + (b - a) * amount
}

function setPixel(raw, rowLength, x, y, color) {
  const pixelOffset = y * rowLength + 1 + x * 4
  raw[pixelOffset] = color[0]
  raw[pixelOffset + 1] = color[1]
  raw[pixelOffset + 2] = color[2]
  raw[pixelOffset + 3] = color[3] ?? 255
}

function createPng(size, { maskable = false } = {}) {
  const bytesPerPixel = 4
  const rowLength = size * bytesPerPixel + 1
  const raw = Buffer.alloc(rowLength * size)
  const center = size / 2
  const orbRadius = size * (maskable ? 0.285 : 0.31)
  const seamWidth = size * 0.018

  for (let y = 0; y < size; y += 1) {
    const rowOffset = y * rowLength
    raw[rowOffset] = 0

    for (let x = 0; x < size; x += 1) {
      const nx = (x - center) / size
      const ny = (y - center) / size
      const distance = Math.hypot(nx, ny)
      const angle = Math.atan2(ny, nx)
      const vignette = Math.min(1, distance / 0.72)
      const wave = 0.5 + 0.5 * Math.sin((nx - ny) * 18)

      let color = [
        clamp(mix(38, 12, vignette) + wave * 6),
        clamp(mix(56, 24, vignette) + wave * 4),
        clamp(mix(118, 46, vignette) + wave * 16),
        255,
      ]

      const rim = Math.abs(distance - 0.46)
      if (rim < 0.02) {
        const glow = 1 - rim / 0.02
        color = [
          clamp(mix(color[0], 99, glow * 0.7)),
          clamp(mix(color[1], 102, glow * 0.7)),
          clamp(mix(color[2], 241, glow * 0.9)),
          255,
        ]
      }

      const dx = x - center
      const dy = y - center
      const ballDistance = Math.hypot(dx, dy)
      if (ballDistance <= orbRadius) {
        const highlight = Math.max(0, 1 - Math.hypot(x - size * 0.38, y - size * 0.34) / (size * 0.3))
        const shadow = Math.max(0, 1 - Math.hypot(x - size * 0.66, y - size * 0.7) / (size * 0.36))
        const base = 232 - shadow * 30 + highlight * 18
        color = [clamp(base), clamp(base + 3), clamp(base + 8), 255]

        const arcA = Math.abs(Math.hypot(dx + orbRadius * 0.52, dy) - orbRadius * 1.08)
        const arcB = Math.abs(Math.hypot(dx - orbRadius * 0.52, dy) - orbRadius * 1.08)
        const band = Math.abs(Math.hypot(dx, dy * 1.18) - orbRadius * 0.78)
        const diagonal = Math.abs(dy - Math.sin(angle * 2.2) * orbRadius * 0.16)

        if (arcA < seamWidth || arcB < seamWidth || band < seamWidth || diagonal < seamWidth * 0.7) {
          color = [99, 102, 241, 255]
        }
      }

      setPixel(raw, rowLength, x, y, color)
    }
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8
  header[9] = 6

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function createIco(png) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)

  const directory = Buffer.alloc(16)
  directory[0] = 32
  directory[1] = 32
  directory[2] = 0
  directory[3] = 0
  directory.writeUInt16LE(1, 4)
  directory.writeUInt16LE(32, 6)
  directory.writeUInt32LE(png.length, 8)
  directory.writeUInt32LE(22, 12)

  return Buffer.concat([header, directory, png])
}

for (const file of files) {
  const outputPath = resolve(root, file.path)
  mkdirSync(dirname(outputPath), { recursive: true })
  const png = createPng(file.size, { maskable: file.maskable })
  writeFileSync(outputPath, file.ico ? createIco(png) : png)
  console.log(`Generated ${file.path}`)
}
