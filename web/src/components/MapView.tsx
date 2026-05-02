import { useNavigate } from 'react-router-dom'
import { levels, projects } from 'virtual:forja-content'
import type { LevelMeta } from 'virtual:forja-content'
import { getLevelProjects } from '../lib/curriculum'

const DOMAINS = [
  { id: 'languages', label: 'Base y Lenguajes' },
  { id: 'systems',   label: 'Sistemas' },
  { id: 'compilers', label: 'Compiladores' },
  { id: 'advanced',  label: 'Sistemas Avanzados' },
] as const

export default function MapView() {
  const navigate = useNavigate()

  const domains = DOMAINS.map(d => ({
    ...d,
    items: levels.filter(l => l.domain === d.id),
  })).filter(d => d.items.length > 0)

  return (
    <div className="map-view anim-fade-up">
      {/* Header */}
      <div className="map-view__header">
        <h2 className="map-view__title">Mapa de contenido</h2>
        <p className="map-view__subtitle">
          Selecciona un nivel del plan canonico para ver su teoria, ejercicios y proyectos asociados.
        </p>
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

      {/* Domains */}
      <div className="map-domains">
        {domains.map(domain => (
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
                  onSelect={() => navigate(`/workspace/level/${level.id}`)}
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

function LevelCard({ level, onSelect }: { level: LevelMeta; onSelect: () => void }) {
  const linkedProjects = getLevelProjects(level, projects)
  const fallbackProjs = level.projects.filter(id => !linkedProjects.some(project => project.id === id || project.codename === id)).slice(0, 5)

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

      {(linkedProjects.length > 0 || fallbackProjs.length > 0) && (
        <div className="level-card__projs">
          {linkedProjects.length > 0
            ? linkedProjects.slice(0, 5).map(p => (
                <span
                  key={p.id}
                  className={`proj-chip ${p.type === 'integrating' ? 'proj-chip--integrating' : ''}`}
                >
                  {p.codename}
                </span>
              ))
            : fallbackProjs.map(name => (
                <span key={name} className="proj-chip">{name}</span>
              ))
          }
          {linkedProjects.length > 5 && (
            <span className="proj-chip">+{linkedProjects.length - 5}</span>
          )}
        </div>
      )}
    </div>
  )
}
