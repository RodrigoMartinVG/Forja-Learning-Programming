/// <reference types="vite/client" />

// ─── Virtual module: forja-content ───────────────────────────────────────────

declare module 'virtual:forja-content' {
  export type Domain = 'languages' | 'systems' | 'compilers' | 'advanced'

  export interface LevelMeta {
    id: string
    title: string
    slug: string
    domain: Domain
    group?: string
    sublevel_order?: number
    order: number
    theory_dir: string
    projects: string[]
    prerequisites: string[]
  }

  export interface ProjectStage {
    id: string
    label: string
    kind: string
    required_levels: string[]
    unlock_level: string
    covers_impl_phases: { c?: number[]; rust?: number[] }
  }

  export interface ProjectMeta {
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
    stages: ProjectStage[]
    readme: string
  }

  export interface ForjaPath {
    id: string
    title: string
    description: string
    levels: string[]
  }

  export const levels: LevelMeta[]
  export const projects: ProjectMeta[]
  export const paths: ForjaPath[]
  export const levelContent: Record<string, {
    readme: string
    exercises: string
    chapters: { slug: string; title: string; body: string }[]
  }>
}
