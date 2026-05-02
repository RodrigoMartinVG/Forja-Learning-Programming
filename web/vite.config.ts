/// <reference types="node" />

import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, join, dirname } from 'path'
import { readdirSync, readFileSync, existsSync, statSync } from 'fs'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')

// ─── Types matching meta.yaml / project.yaml ──────────────────────────────────

interface LevelMeta {
  id: string
  title: string
  slug: string
  domain: string
  group?: string
  sublevel_order?: number
  order: number
  theory_dir: string
  projects: string[]
  prerequisites: string[]
}

interface ProjectMeta {
  id: string
  codename: string
  title: string
  type: 'focused' | 'integrating'
  anchor_level: string
  display_levels: string[]
  required_levels: string[]
  expansion_levels: string[]
  languages: string[]
  equivalent?: string
  dir: string
  stages: unknown[]
}

interface ForjaPath {
  id: string
  title: string
  description: string
  levels: string[]
}

// ─── Readers ─────────────────────────────────────────────────────────────────

function isDir(p: string): boolean {
  try { return statSync(p).isDirectory() } catch { return false }
}

function readLevels(): LevelMeta[] {
  const levelsFile = join(repoRoot, 'metadata', 'levels.yaml')
  if (existsSync(levelsFile)) {
    try {
      const data = yaml.load(readFileSync(levelsFile, 'utf-8')) as { levels: LevelMeta[] }
      return (data?.levels ?? []).sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    } catch { /* fall back to legacy per-directory metadata */ }
  }

  const theoryDir = join(repoRoot, 'content', 'theory')
  if (!existsSync(theoryDir)) return []

  const levels: LevelMeta[] = []
  for (const dir of readdirSync(theoryDir)) {
    if (!isDir(join(theoryDir, dir))) continue
    const metaPath = join(theoryDir, dir, 'meta.yaml')
    if (!existsSync(metaPath)) continue
    try {
      const parsed = yaml.load(readFileSync(metaPath, 'utf-8')) as LevelMeta
      if (parsed?.id) levels.push(parsed)
    } catch { /* skip malformed */ }
  }
  return levels.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
}

function readProjects(): ProjectMeta[] {
  const projectsDir = join(repoRoot, 'content', 'projects')
  if (!existsSync(projectsDir)) return []

  const projects: ProjectMeta[] = []
  const scan = (dir: string) => {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir)) {
      const entryPath = join(dir, entry)
      if (!isDir(entryPath)) continue
      const yamlPath = join(entryPath, 'project.yaml')
      if (existsSync(yamlPath)) {
        try {
          const parsed = yaml.load(readFileSync(yamlPath, 'utf-8')) as ProjectMeta
          if (parsed?.id) {
            projects.push(parsed)
          }
        } catch { /* skip */ }
      } else {
        scan(entryPath)
      }
    }
  }
  scan(projectsDir)
  return projects
}

function readPaths(): ForjaPath[] {
  const pathsFile = join(repoRoot, 'metadata', 'paths.yaml')
  if (!existsSync(pathsFile)) return []
  try {
    const data = yaml.load(readFileSync(pathsFile, 'utf-8')) as { paths: ForjaPath[] }
    return data?.paths ?? []
  } catch { return [] }
}

// Extracts a title from the first # heading in a markdown string
function extractMdTitle(md: string, fallback: string): string {
  const match = md.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : fallback
}

function readLevelContent(theoryDir: string): {
  readme: string
  exercises: string
  chapters: { slug: string; title: string; body: string }[]
} {
  if (!theoryDir) {
    return { readme: '', exercises: '', chapters: [] }
  }

  const base = join(repoRoot, theoryDir)
  const readFile = (name: string) => {
    const p = join(base, name)
    return existsSync(p) ? readFileSync(p, 'utf-8') : ''
  }

  // Read chapters/ subdirectory if it exists
  const chaptersDir = join(base, 'chapters')
  const chapters: { slug: string; title: string; body: string }[] = []

  if (existsSync(chaptersDir) && isDir(chaptersDir)) {
    const files = readdirSync(chaptersDir)
      .filter((file: string) => file.endsWith('.md'))
      .sort() // lexicographic: 01-, 02-, …

    for (const file of files) {
      const body = readFileSync(join(chaptersDir, file), 'utf-8')
      const slug = file.replace(/\.md$/, '')
      const title = extractMdTitle(body, slug)
      chapters.push({ slug, title, body })
    }
  }

  return {
    readme: readFile('README.md'),
    exercises: readFile('exercises.md'),
    chapters,
  }
}

// ─── Virtual module plugin ────────────────────────────────────────────────────

const CONTENT_INDEX_ID = 'virtual:forja-content'
const CONTENT_INDEX_RESOLVED_ID = '\0' + CONTENT_INDEX_ID
const CONTENT_BODY_ID = 'virtual:forja-content-body'
const CONTENT_BODY_RESOLVED_ID = '\0' + CONTENT_BODY_ID

function readProjectContent(projects: ProjectMeta[]): Record<string, { readme: string }> {
  const projectContent: Record<string, { readme: string }> = {}

  for (const project of projects) {
    const readmePath = join(repoRoot, project.dir, 'README.md')
    projectContent[project.id] = {
      readme: existsSync(readmePath) ? readFileSync(readmePath, 'utf-8') : '',
    }
  }

  return projectContent
}

function readIntroContent(): Record<string, string> {
  const introSources = {
    forja: join(repoRoot, 'content', 'theory', 'forja.md'),
    workspace: join(repoRoot, 'content', 'theory', 'README.md'),
    theory: join(repoRoot, 'content', 'theory', 'README.md'),
  }

  return Object.fromEntries(
    Object.entries(introSources).map(([id, filePath]) => [
      id,
      existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '',
    ]),
  )
}

function forjaContentPlugin(): Plugin {
  return {
    name: 'forja-content',

    resolveId(id) {
      if (id === CONTENT_INDEX_ID) return CONTENT_INDEX_RESOLVED_ID
      if (id === CONTENT_BODY_ID) return CONTENT_BODY_RESOLVED_ID
    },

    load(id) {
      const levels = readLevels()

      if (id === CONTENT_INDEX_RESOLVED_ID) {
        const projects = readProjects()
        const paths = readPaths()

        return [
          `export const levels = ${JSON.stringify(levels)};`,
          `export const projects = ${JSON.stringify(projects)};`,
          `export const paths = ${JSON.stringify(paths)};`,
        ].join('\n')
      }

      if (id === CONTENT_BODY_RESOLVED_ID) {
        const projects = readProjects()
        const levelContent: Record<string, ReturnType<typeof readLevelContent>> = {}

        for (const level of levels) {
          if (level.theory_dir) {
            levelContent[level.id] = readLevelContent(level.theory_dir)
          }
        }

        const projectContent = readProjectContent(projects)
        const introContent = readIntroContent()

        return [
          `export const levelContent = ${JSON.stringify(levelContent)};`,
          `export const projectContent = ${JSON.stringify(projectContent)};`,
          `export const introContent = ${JSON.stringify(introContent)};`,
        ].join('\n')
      }
    },

    configureServer(server) {
      // Watch content/metadata dirs so changes trigger HMR
      const watchDirs = [
        join(repoRoot, 'content'),
        join(repoRoot, 'metadata'),
      ]
      watchDirs.forEach(d => { if (existsSync(d)) server.watcher.add(d) })

      server.watcher.on('change', (file) => {
        if (file.includes('content') || file.includes('metadata')) {
          for (const id of [CONTENT_INDEX_RESOLVED_ID, CONTENT_BODY_RESOLVED_ID]) {
            const mod = server.moduleGraph.getModuleById(id)
            if (mod) server.moduleGraph.invalidateModule(mod)
          }
          server.ws.send({ type: 'full-reload' })
        }
      })
    },
  }
}

// ─── Vite config ──────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [react(), forjaContentPlugin()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    chunkSizeWarningLimit: 650,
  },
})
