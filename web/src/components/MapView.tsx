import { useNavigate, useSearchParams } from 'react-router-dom'
import { levels, projects } from 'virtual:forja-content'
import type { LevelMeta, ProjectMeta } from 'virtual:forja-content'
import { getLevelProjects, getProjectLevels } from '../lib/curriculum'

const DOMAINS = [
  { id: 'languages', label: 'Base y Lenguajes' },
  { id: 'systems',   label: 'Sistemas' },
  { id: 'compilers', label: 'Compiladores' },
  { id: 'advanced',  label: 'Sistemas Avanzados' },
] as const

const PROJECT_GROUPS = [
  { id: 'focused', label: 'Proyectos Focalizados' },
  { id: 'integrating', label: 'Proyectos Integradores' },
] as const

type MapMode = 'levels' | 'projects'

function withWorkspaceSearch(pathname: string, searchParams: URLSearchParams): string {
  const search = searchParams.toString()
  return search ? `${pathname}?${search}` : pathname
}

export default function MapView() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const mapMode: MapMode = searchParams.get('view') === 'projects' ? 'projects' : 'levels'
  const workspacePath = (pathname: string) => withWorkspaceSearch(pathname, searchParams)
  const openForjaIntro = () => navigate(workspacePath('/workspace/intro/forja'))
  const openWorkspaceIntro = () => navigate(workspacePath('/workspace/intro/workspace'))

  const domains = DOMAINS.map(d => ({
    ...d,
    items: levels.filter(l => l.domain === d.id),
  })).filter(d => d.items.length > 0)

  const projectSections = PROJECT_GROUPS.map(group => ({
    ...group,
    items: projects
      .filter(project => project.type === group.id)
      .map(project => ({ project, relatedLevels: getProjectLevels(project, levels) }))
      .sort((left, right) => {
        const leftOrder = left.relatedLevels[0]?.order ?? 999
        const rightOrder = right.relatedLevels[0]?.order ?? 999
        return leftOrder - rightOrder || left.project.title.localeCompare(right.project.title)
      }),
  })).filter(group => group.items.length > 0)

  const subtitle = mapMode === 'levels'
    ? 'Selecciona un nivel del plan canonico para ver su teoria, ejercicios y proyectos asociados.'
    : 'Selecciona un proyecto del plan canonico para ver su ficha y los niveles en los que aparece.'

  const setMapMode = (nextMode: MapMode) => {
    const nextSearch = new URLSearchParams(searchParams)

    if (nextMode === 'levels') {
      nextSearch.delete('view')
    } else {
      nextSearch.set('view', nextMode)
    }

    setSearchParams(nextSearch, { replace: true })
  }

  return (
    <div className="map-view anim-fade-up">
      {/* Header */}
      <div className="map-view__header">
        <div className="map-view__header-copy">
          <h2 className="map-view__title">Mapa de contenido</h2>
          <p className="map-view__subtitle">{subtitle}</p>
        </div>

        <div className="map-view__toggle" role="tablist" aria-label="Modo del mapa">
          <button
            className={`content-tab ${mapMode === 'levels' ? 'content-tab--active' : ''}`}
            onClick={() => setMapMode('levels')}
            aria-pressed={mapMode === 'levels'}
          >
            Niveles → proyectos
          </button>
          <button
            className={`content-tab ${mapMode === 'projects' ? 'content-tab--active' : ''}`}
            onClick={() => setMapMode('projects')}
            aria-pressed={mapMode === 'projects'}
          >
            Proyectos → niveles
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="map-stats">
        <div className="stat-chip">
          <div className="stat-chip__n">{levels.length}</div>
          <div className="stat-chip__label">niveles</div>
        </div>
        <div className="stat-chip">
          <div className="stat-chip__n">{projects.length}</div>
          <div className="stat-chip__label">proyectos</div>
        </div>
        <div className="stat-chip">
          <div className="stat-chip__n">{projects.filter(p => p.type === 'integrating').length}</div>
          <div className="stat-chip__label">integradores</div>
        </div>
        <div className="stat-chip">
          <div className="stat-chip__n">{DOMAINS.length}</div>
          <div className="stat-chip__label">dominios</div>
        </div>
      </div>

      <div className="map-intro-row domain-section__levels">
        <IntroCard eyebrow="Panorama" title="Que es Forja?" onSelect={openForjaIntro} />
        <IntroCard eyebrow="Antes de L0" title="Introduccion al Workspace" onSelect={openWorkspaceIntro} />
      </div>

      <div className="map-domains">
        {mapMode === 'levels'
          ? domains.map(domain => (
              <section key={domain.id} className="domain-section">
                <div className="domain-section__head">
                  <span className={`badge badge--${domain.id}`}>{domain.id}</span>
                  <span className="domain-section__name">{domain.label}</span>
                  <span className="domain-section__count">{domain.items.length} niveles</span>
                </div>
                <div className="domain-section__levels">
                  {domain.items.map(level => (
                    <LevelCard
                      key={level.id}
                      level={level}
                      onSelect={() => navigate(workspacePath(`/workspace/level/${level.id}`))}
                    />
                  ))}
                </div>
              </section>
            ))
          : projectSections.map(section => (
              <section key={section.id} className="domain-section">
                <div className="domain-section__head">
                  <span className={`proj-row__type proj-row__type--${section.id}`}>
                    {section.id === 'integrating' ? 'integradores' : 'focalizados'}
                  </span>
                  <span className="domain-section__name">{section.label}</span>
                  <span className="domain-section__count">{section.items.length} proyectos</span>
                </div>
                <div className="domain-section__levels project-section__grid">
                  {section.items.map(({ project, relatedLevels }) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      relatedLevels={relatedLevels}
                      onSelect={() => navigate(workspacePath(`/workspace/project/${project.id}`))}
                    />
                  ))}
                </div>
              </section>
            ))}
      </div>
    </div>
  )
}

// ─── Level Card ───────────────────────────────────────────────────────────────

function IntroCard({ eyebrow, title, onSelect }: { eyebrow: string; title: string; onSelect: () => void }) {
  return (
    <div
      className="map-intro-card"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="map-intro-card__eyebrow">{eyebrow}</div>
      <div className="map-intro-card__title">{title}</div>
    </div>
  )
}

function LevelCard({ level, onSelect }: { level: LevelMeta; onSelect: () => void }) {
  const linkedProjects = getLevelProjects(level, projects)

  return (
    <div
      className={`level-card level-card--${level.domain}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
    >
      <div className={`level-card__id level-card__id--${level.domain}`}>
        {level.id}
      </div>
      <div className="level-card__title">{level.title}</div>

      {linkedProjects.length > 0 && (
        <div className="level-card__projs">
          {linkedProjects.slice(0, 5).map(project => (
            <span
              key={project.id}
              className={`proj-chip ${project.type === 'integrating' ? 'proj-chip--integrating' : ''}`}
            >
              {project.codename}
            </span>
          ))}
          {linkedProjects.length > 5 && (
            <span className="proj-chip">+{linkedProjects.length - 5}</span>
          )}
        </div>
      )}
    </div>
  )
}

function ProjectCard({
  project,
  relatedLevels,
  onSelect,
}: {
  project: ProjectMeta
  relatedLevels: LevelMeta[]
  onSelect: () => void
}) {
  return (
    <div
      className={`project-card project-card--${project.type}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="project-card__top">
        <span className={`proj-row__type proj-row__type--${project.type}`}>
          {project.type === 'integrating' ? 'integrador' : 'focalizado'}
        </span>
        {project.languages.length > 0 && (
          <span className="project-card__langs">{project.languages.join(' / ')}</span>
        )}
      </div>

      <div className="project-card__codename">{project.codename}</div>
      <div className="project-card__title">{project.title}</div>

      {relatedLevels.length > 0 && (
        <div className="project-card__levels">
          {relatedLevels.slice(0, 6).map(level => (
            <span key={level.id} className="tag">{level.id}</span>
          ))}
          {relatedLevels.length > 6 && (
            <span className="tag">+{relatedLevels.length - 6}</span>
          )}
        </div>
      )}
    </div>
  )
}
