import type { LevelMeta, ProjectMeta } from 'virtual:forja-content'

function uniqueProjects(items: Array<ProjectMeta | undefined>): ProjectMeta[] {
  const seen = new Set<string>()
  const result: ProjectMeta[] = []

  for (const item of items) {
    if (!item || seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }

  return result
}

function sortLevels(items: LevelMeta[]): LevelMeta[] {
  return [...items].sort((left, right) => (left.order ?? 999) - (right.order ?? 999))
}

export function getLevelProjects(level: LevelMeta, projects: ProjectMeta[]): ProjectMeta[] {
  if (level.projects.length > 0) {
    const explicit = uniqueProjects(
      level.projects.map(id => projects.find(project => project.id === id || project.codename === id)),
    )
    if (explicit.length > 0) return explicit
  }

  return uniqueProjects(
    projects.filter(project =>
      project.anchor_level === level.id
      || project.display_levels.includes(level.id)
      || project.required_levels.includes(level.id)
      || project.expansion_levels.includes(level.id)
    ),
  )
}

export function getProjectLevels(project: ProjectMeta, levels: LevelMeta[]): LevelMeta[] {
  const explicit = sortLevels(
    levels.filter(level => level.projects.includes(project.id) || level.projects.includes(project.codename)),
  )

  if (explicit.length > 0) return explicit

  const related = new Set<string>([
    project.anchor_level,
    ...project.display_levels,
    ...project.required_levels,
    ...project.expansion_levels,
  ])

  return sortLevels(levels.filter(level => related.has(level.id)))
}