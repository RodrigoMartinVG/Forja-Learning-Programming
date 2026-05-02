// ─── Progress tracking (localStorage) ───────────────────────────────────────

const KEY = 'forja:progress'

export interface Progress {
  completed: string[]
  reading: string[]
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { completed: [], reading: [] }
    return JSON.parse(raw) as Progress
  } catch {
    return { completed: [], reading: [] }
  }
}

function save(p: Progress): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /**/ }
}

export function getProgress(): Progress { return load() }

export function setLevelStatus(id: string, status: 'reading' | 'done' | 'todo'): void {
  const p = load()
  p.completed = p.completed.filter(x => x !== id)
  p.reading   = p.reading.filter(x => x !== id)
  if (status === 'done')    p.completed.push(id)
  if (status === 'reading') p.reading.push(id)
  save(p)
}

export function getLevelStatus(id: string): 'todo' | 'reading' | 'done' {
  const p = load()
  if (p.completed.includes(id)) return 'done'
  if (p.reading.includes(id))   return 'reading'
  return 'todo'
}
