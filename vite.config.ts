import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { extname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function normalizeBasePath(value: string | undefined): string {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return '/'
  if (trimmed === '/') return '/'
  const withoutTrailingSlashes = trimmed.replace(/\/+$/, '')
  const withLeadingSlash = withoutTrailingSlashes.startsWith('/') ? withoutTrailingSlashes : `/${withoutTrailingSlashes}`
  return `${withLeadingSlash}/`
}

const CONFIG_DIR = fileURLToPath(new URL('.', import.meta.url))
const BILDER_DIR = resolve(CONFIG_DIR, '..', 'Bilder')

const MODEL_FOLDER_TO_ID: Record<string, string> = {
  'flux2 pro': 'flux2pro',
  'gpt image-1 5': 'gpt-image-1-5',
  'nano bana': 'nanobana',
}

const FIELD_OPTIONS = {
  gender: new Set(['female', 'male', 'ambiguous']),
  hairColor: new Set(['black', 'brown', 'blond', 'red', 'gray', 'white', 'bald', 'covered', 'other', 'unclear']),
  skinTone: new Set(['light', 'medium', 'dark', 'unclear']),
  age: new Set(['20-29', '30-39', '40-49', '50-59', '60+', 'unclear']),
  glasses: new Set(['yes', 'no', 'unclear']),
  clothing: new Set(['formal-business', 'smart-casual', 'casual', 'sport', 'creative-workwear', 'traditional', 'labwear', 'unclear']),
  background: new Set([
    'classroom-board',
    'classroom-digital',
    'computer-lab',
    'art-studio',
    'music-room',
    'science-lab',
    'gym-indoor',
    'sports-field',
    'outdoor-school',
    'historical-classroom',
    'other',
    'unclear',
  ]),
}

const UTENSIL_OPTIONS = new Set([
  'book',
  'worksheet',
  'chalk-marker',
  'laptop-tablet',
  'code-screen',
  'math-formula-board',
  'physics-lab-equipment',
  'instrument',
  'sports-equipment',
  'art-tools',
  'language-symbols',
  'classical-symbols',
  'none',
  'other',
])

const OUTFIT_TAG_OPTIONS = new Set([
  'krawatte',
  'halstuch',
  'schuerze',
  'blazer',
  'jackett',
  'strickjacke',
  'hoodie',
  'rock',
  'sportshirt',
  'trainingshose',
])

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

interface ReviewAttributes {
  gender: string
  hairColor: string
  skinTone: string
  age: string
  glasses: string
  clothing: string
  utensils: string[]
  outfitTags?: string[]
  background: string
}

interface ReviewImage {
  filename: string
  index: number
  attributes: ReviewAttributes
}

interface ReviewMetadata {
  seriesId: string
  prompt: string
  model: string
  modelId: string
  count: number
  images: ReviewImage[]
}

interface ReviewSeriesEntry {
  id: string
  subjectSlug: string
  subjectFolder: string
  modelId: string
  modelFolder: string
  modelLabel: string
  count: number
  metadataPath: string
  modelPath: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function readJson(filePath: string): unknown {
  const raw = readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '')
  return JSON.parse(raw)
}

function writeJson(filePath: string, value: unknown): void {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf-8')
}

function toMetadata(raw: unknown): ReviewMetadata | null {
  if (!isRecord(raw) || !Array.isArray(raw.images)) return null
  return raw as unknown as ReviewMetadata
}

function readMetadata(filePath: string): ReviewMetadata | null {
  return toMetadata(readJson(filePath))
}

function loadSeriesEntries(): ReviewSeriesEntry[] {
  if (!existsSync(BILDER_DIR)) return []

  const entries: ReviewSeriesEntry[] = []
  const subjectDirs = readdirSync(BILDER_DIR, { withFileTypes: true })
    .filter(dir => dir.isDirectory() && dir.name.toLowerCase().includes('lehrkraft'))

  for (const subjectDir of subjectDirs) {
    const subjectFolder = subjectDir.name
    const subjectSlug = slugify(subjectFolder)
    const subjectPath = join(BILDER_DIR, subjectFolder)
    const modelDirs = readdirSync(subjectPath, { withFileTypes: true }).filter(dir => dir.isDirectory())

    for (const modelDir of modelDirs) {
      const modelFolder = modelDir.name
      const modelPath = join(subjectPath, modelFolder)
      const metadataPath = join(modelPath, 'metadata.json')
      if (!existsSync(metadataPath)) continue

      const metadata = readMetadata(metadataPath)
      if (!metadata) continue

      const normalizedModelFolder = modelFolder.toLowerCase().replace(/\s+/g, ' ').trim()
      const resolvedModelId = metadata.modelId || MODEL_FOLDER_TO_ID[normalizedModelFolder] || slugify(modelFolder)
      const id = `${subjectSlug}__${resolvedModelId}`

      entries.push({
        id,
        subjectSlug,
        subjectFolder,
        modelId: resolvedModelId,
        modelFolder,
        modelLabel: metadata.model || modelFolder,
        count: metadata.images.length,
        metadataPath,
        modelPath,
      })
    }
  }

  return entries.sort((a, b) => {
    if (a.subjectSlug === b.subjectSlug) return a.modelId.localeCompare(b.modelId)
    return a.subjectSlug.localeCompare(b.subjectSlug)
  })
}

function findSeriesEntry(seriesId: string): ReviewSeriesEntry | null {
  return loadSeriesEntries().find(entry => entry.id === seriesId) ?? null
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function sendError(res: ServerResponse, statusCode: number, message: string): void {
  sendJson(res, statusCode, { error: message })
}

function parseEnum(raw: unknown, allowed: Set<string>): string | null {
  if (typeof raw !== 'string') return null
  return allowed.has(raw) ? raw : null
}

function normalizeList(raw: unknown, allowed: Set<string>): string[] | null {
  if (!Array.isArray(raw)) return null
  return [...new Set(raw.filter((item): item is string => typeof item === 'string' && allowed.has(item)))]
}

function normalizeUtensils(raw: unknown): string[] | null {
  const cleaned = normalizeList(raw, UTENSIL_OPTIONS)
  if (!cleaned) return null
  if (cleaned.length === 0) return ['none']
  if (cleaned.includes('none') && cleaned.length > 1) {
    return cleaned.filter(item => item !== 'none')
  }
  return cleaned
}

function normalizeOutfitTags(raw: unknown): string[] | null {
  return normalizeList(raw, OUTFIT_TAG_OPTIONS)
}

function parseAttributes(raw: unknown): ReviewAttributes | null {
  if (!isRecord(raw)) return null

  const gender = parseEnum(raw.gender, FIELD_OPTIONS.gender)
  const hairColor = parseEnum(raw.hairColor, FIELD_OPTIONS.hairColor)
  const skinTone = parseEnum(raw.skinTone, FIELD_OPTIONS.skinTone)
  const age = parseEnum(raw.age, FIELD_OPTIONS.age)
  const glasses = parseEnum(raw.glasses, FIELD_OPTIONS.glasses)
  const clothing = parseEnum(raw.clothing, FIELD_OPTIONS.clothing)
  const background = parseEnum(raw.background, FIELD_OPTIONS.background)
  const utensils = normalizeUtensils(raw.utensils)
  const hasOutfitTags = Object.prototype.hasOwnProperty.call(raw, 'outfitTags')
  let outfitTags: string[] | undefined
  if (hasOutfitTags) {
    const parsedOutfitTags = normalizeOutfitTags(raw.outfitTags)
    if (!parsedOutfitTags) return null
    outfitTags = parsedOutfitTags
  }

  if (!gender || !hairColor || !skinTone || !age || !glasses || !clothing || !background || !utensils) {
    return null
  }

  return {
    gender,
    hairColor,
    skinTone,
    age,
    glasses,
    clothing,
    background,
    utensils,
    ...(hasOutfitTags ? { outfitTags: outfitTags as string[] } : {}),
  }
}

function ensureBackup(metadataPath: string): void {
  const backupPath = `${metadataPath}.backup`
  if (!existsSync(backupPath)) {
    copyFileSync(metadataPath, backupPath)
  }
}

function getImageContentType(filename: string): string {
  const extension = extname(filename).toLowerCase()
  return CONTENT_TYPES[extension] ?? 'application/octet-stream'
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, rejectBody) => {
    const chunks: Buffer[] = []
    req.on('data', chunk => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', rejectBody)
  })
}

function reviewApiPlugin(): Plugin {
  return {
    name: 'review-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) {
          next()
          return
        }

        const requestUrl = new URL(req.url, 'http://localhost')
        const pathname = requestUrl.pathname

        if (req.method === 'GET' && pathname === '/api/review/series') {
          const series = loadSeriesEntries().map(entry => ({
            id: entry.id,
            subjectSlug: entry.subjectSlug,
            subjectFolder: entry.subjectFolder,
            modelId: entry.modelId,
            modelFolder: entry.modelFolder,
            modelLabel: entry.modelLabel,
            count: entry.count,
          }))
          sendJson(res, 200, { series })
          return
        }

        const seriesMatch = pathname.match(/^\/api\/review\/series\/([^/]+)$/)
        if (req.method === 'GET' && seriesMatch) {
          const seriesId = decodeURIComponent(seriesMatch[1])
          const entry = findSeriesEntry(seriesId)
          if (!entry) {
            sendError(res, 404, 'Serie nicht gefunden')
            return
          }

          const metadata = readMetadata(entry.metadataPath)
          if (!metadata) {
            sendError(res, 500, 'metadata.json ist ungueltig')
            return
          }

          const images = metadata.images.map((image, idx) => ({
            ...image,
            filename: image.filename.replace(/\.(jpg|jpeg)$/i, '.webp'),
            reviewIndex: idx,
            imageUrl: `/api/review/series/${encodeURIComponent(entry.id)}/images/${idx}/file`,
          }))

          sendJson(res, 200, {
            series: {
              id: entry.id,
              subjectSlug: entry.subjectSlug,
              subjectFolder: entry.subjectFolder,
              modelId: entry.modelId,
              modelFolder: entry.modelFolder,
              modelLabel: entry.modelLabel,
              count: entry.count,
            },
            metadata: {
              seriesId: metadata.seriesId,
              prompt: metadata.prompt,
              model: metadata.model,
              modelId: metadata.modelId,
              count: metadata.count,
              images,
            },
          })
          return
        }

        const imageFileMatch = pathname.match(/^\/api\/review\/series\/([^/]+)\/images\/(\d+)\/file$/)
        if (req.method === 'GET' && imageFileMatch) {
          const seriesId = decodeURIComponent(imageFileMatch[1])
          const imageIndex = Number(imageFileMatch[2])
          const entry = findSeriesEntry(seriesId)
          if (!entry) {
            sendError(res, 404, 'Serie nicht gefunden')
            return
          }

          const metadata = readMetadata(entry.metadataPath)
          if (!metadata) {
            sendError(res, 500, 'metadata.json ist ungueltig')
            return
          }

          const image = metadata.images[imageIndex]
          if (!image) {
            sendError(res, 404, 'Bild nicht gefunden')
            return
          }

          const imagePath = join(entry.modelPath, image.filename)
          if (!existsSync(imagePath)) {
            sendError(res, 404, 'Bilddatei nicht gefunden')
            return
          }

          const bytes = readFileSync(imagePath)
          res.statusCode = 200
          res.setHeader('Content-Type', getImageContentType(image.filename))
          res.setHeader('Cache-Control', 'no-store')
          res.end(bytes)
          return
        }

        const updateMatch = pathname.match(/^\/api\/review\/series\/([^/]+)\/images\/(\d+)$/)
        if (req.method === 'PATCH' && updateMatch) {
          const seriesId = decodeURIComponent(updateMatch[1])
          const imageIndex = Number(updateMatch[2])
          const entry = findSeriesEntry(seriesId)
          if (!entry) {
            sendError(res, 404, 'Serie nicht gefunden')
            return
          }

          const metadata = readMetadata(entry.metadataPath)
          if (!metadata) {
            sendError(res, 500, 'metadata.json ist ungueltig')
            return
          }

          const image = metadata.images[imageIndex]
          if (!image) {
            sendError(res, 404, 'Bild nicht gefunden')
            return
          }

          const rawBody = await readBody(req)
          let parsedBody: unknown
          try {
            parsedBody = JSON.parse(rawBody || '{}')
          } catch {
            sendError(res, 400, 'Ungueltiges JSON')
            return
          }

          const attributes = isRecord(parsedBody) ? parseAttributes(parsedBody.attributes) : null
          if (!attributes) {
            sendError(res, 400, 'Ungueltige Attributdaten')
            return
          }

          const existingAttributes = isRecord(image.attributes) ? image.attributes : {}
          const mergedAttributes = {
            ...existingAttributes,
            ...attributes,
          }

          ensureBackup(entry.metadataPath)
          metadata.images[imageIndex] = {
            ...image,
            attributes: mergedAttributes as ReviewAttributes,
          }
          writeJson(entry.metadataPath, metadata)

          sendJson(res, 200, {
            ok: true,
            image: metadata.images[imageIndex],
            updatedAt: new Date().toISOString(),
          })
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  base: normalizeBasePath(process.env.VITE_BASE_PATH),
  plugins: [react(), tailwindcss(), reviewApiPlugin()],
})
