import { lazy, Suspense, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { levels, projects } from 'virtual:forja-content'
import { introContent, levelContent, projectContent } from 'virtual:forja-content-body'
import type { LevelMeta, ProjectMeta } from 'virtual:forja-content'
import { getProgress } from '../lib/progress'
import { getLevelProjects, getProjectLevels } from '../lib/curriculum'

const MdRenderer = lazy(() => import('./MdRenderer'))

// ─── Domain display names ─────────────────────────────────────────────────────

const DOMAIN_NAME: Record<string, string> = {
  languages: 'Lenguajes',
  systems:   'Sistemas',
  compilers: 'Compiladores',
  advanced:  'Sistemas Avanzados',
}

const INTRO_META: Record<string, {
  crumb: string
  sectionLabel: string
  tags: string[]
  topbarLabel: string
  topbarTarget: { type: 'intro' | 'level'; id: string }
  footerLabel: string
  footerTarget: { type: 'intro' | 'level'; id: string }
}> = {
  forja: {
    crumb: 'que es forja',
    sectionLabel: 'panorama general',
    tags: ['plataforma', 'sistemas desde cero'],
    topbarLabel: 'Workspace',
    topbarTarget: { type: 'intro', id: 'workspace' },
    footerLabel: 'Ver introduccion al Workspace →',
    footerTarget: { type: 'intro', id: 'workspace' },
  },
  workspace: {
    crumb: 'workspace',
    sectionLabel: 'antes de L0',
    tags: ['introduccion editorial', 'no cuenta como nivel'],
    topbarLabel: 'L0',
    topbarTarget: { type: 'level', id: 'L0' },
    footerLabel: 'Entrar por L0 →',
    footerTarget: { type: 'level', id: 'L0' },
  },
  theory: {
    crumb: 'workspace',
    sectionLabel: 'antes de L0',
    tags: ['introduccion editorial', 'no cuenta como nivel'],
    topbarLabel: 'L0',
    topbarTarget: { type: 'level', id: 'L0' },
    footerLabel: 'Entrar por L0 →',
    footerTarget: { type: 'level', id: 'L0' },
  },
}

// ─── Entry point ─────────────────────────────────────────────────────────────

interface Props {
  contentType: 'level' | 'project' | 'intro'
  contentId: string
}

function isSeededPlaceholder(body?: string): boolean {
  if (!body) return false

  return body.includes('queda sembrado en Base 2')
    || body.includes('se siembra en Base 2')
    || body.includes('Proyecto focalizado sembrado en Base 2')
    || body.includes('Proyecto integrador sembrado en Base 2')
    || body.includes('unidad canonica independiente')
}

function MarkdownContent({ children }: { children: string }) {
  return (
    <Suspense fallback={null}>
      <MdRenderer>{children}</MdRenderer>
    </Suspense>
  )
}

export default function ContentView({ contentType, contentId }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const onBack = () => navigate('/workspace')
  const onHome = () => navigate('/')

  if (contentType === 'intro') {
    return <IntroView introId={contentId} onBack={onBack} onHome={onHome} />
  }

  if (contentType === 'level') {
    const level = levels.find(l => l.id === contentId)
    if (!level) return <NotFound id={contentId} onBack={onBack} />
    return <LevelView level={level} onBack={onBack} onHome={onHome} />
  }

  const project = projects.find(p => p.id === contentId || p.codename === contentId)
  const fromLevel = (location.state as { fromLevel?: string } | null)?.fromLevel ?? null
  return <ProjectView project={project ?? null} onBack={onBack} onHome={onHome} fromLevel={fromLevel} />
}

function IntroView({ introId, onBack, onHome }: { introId: string; onBack: () => void; onHome: () => void }) {
  const navigate = useNavigate()
  const body = introContent[introId] ?? ''
  const meta = INTRO_META[introId] ?? INTRO_META.workspace

  const openTarget = (target: { type: 'intro' | 'level'; id: string }) => {
    if (target.type === 'intro') {
      navigate(`/workspace/intro/${target.id}`)
      return
    }

    navigate(`/workspace/level/${target.id}`)
  }

  if (!body) {
    return (
      <div className="content-view">
        <header className="content-topbar">
          <div className="content-topbar__left">
            <button className="ws-header__logo" onClick={onHome}>Forja</button>
            <div className="content-topbar__left-sep" />
            <button className="content-tab" onClick={onBack}>Mapa</button>
          </div>
          <div className="content-topbar__crumb">
            <span className="content-topbar__crumb-seg content-topbar__crumb-seg--active">introducción no encontrada</span>
          </div>
          <div className="content-topbar__right" />
        </header>
        <div className="content-body">
          <Pending label="no encontrada" message="Esta introducción editorial no existe en el contenido actual." />
        </div>
      </div>
    )
  }

  return (
    <div className="content-view anim-fade-up">
      <header className="content-topbar">
        <div className="content-topbar__left">
          <button className="ws-header__logo" onClick={onHome}>Forja</button>
          <div className="content-topbar__left-sep" />
          <button className="content-tab" onClick={onBack}>Mapa</button>
        </div>
        <div className="content-topbar__crumb">
          <span className="content-topbar__crumb-seg">introducción</span>
          <span className="content-topbar__crumb-sep">/</span>
          <span className="content-topbar__crumb-seg content-topbar__crumb-seg--active">{meta.crumb}</span>
        </div>
        <div className="content-topbar__right">
          <button className="content-tab" onClick={() => openTarget(meta.topbarTarget)}>{meta.topbarLabel}</button>
        </div>
      </header>

      <div className="content-body">
        <div className="content-body__inner">
          <div className="section-lbl">{meta.sectionLabel}</div>
          <div className="prereq-list prereq-list--spaced intro-actions">
            {meta.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
            <button className="ghost-btn" onClick={() => openTarget(meta.topbarTarget)}>
              {meta.topbarLabel === 'L0' ? 'seguir con L0' : 'ver el workspace'}
            </button>
          </div>

          <MarkdownContent>{body}</MarkdownContent>

          <div className="section-pager">
            <div className="section-pager__spacer" />
            <button
              className="section-pager__btn section-pager__btn--next"
              onClick={() => openTarget(meta.footerTarget)}
            >
              {meta.footerLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Level view ───────────────────────────────────────────────────────────────

type Tab = 'teoria' | 'ejercicios' | 'proyectos'

function LevelView({ level, onBack, onHome }: { level: LevelMeta; onBack: () => void; onHome: () => void }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('teoria')
  const [activeChapterIdx, setActiveChapterIdx] = useState(0)
  const [selectedProject, setSelectedProject] = useState<ProjectMeta | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const scrollTop = () => bodyRef.current?.scrollTo({ top: 0, behavior: 'instant' })

  const content      = levelContent[level.id]
  const hasChapters  = (content?.chapters?.length ?? 0) > 0
  const hasReadme    = !!content?.readme && !isSeededPlaceholder(content.readme)
  const hasContent   = hasChapters || hasReadme
  const hasExercises = !!content?.exercises && !isSeededPlaceholder(content.exercises)
  const levelProjs   = getLevelProjects(level, projects)
  const { completed } = getProgress()

  const chapters = content?.chapters ?? []
  const activeChapter = chapters[activeChapterIdx]
  const selectedProjectReadme = selectedProject ? projectContent[selectedProject.id]?.readme ?? '' : ''

  return (
    <div className="content-view anim-fade-up">

      {/* ── Topbar: left (Forja + Mapa) | center (breadcrumb) | right (tabs + prog) ── */}
      <header className="content-topbar">

        <div className="content-topbar__left">
          <button className="ws-header__logo" onClick={onHome}>Forja</button>
          <div className="content-topbar__left-sep" />
          <button className="content-tab" onClick={onBack}>Mapa</button>
        </div>

        <div className="content-topbar__crumb">
          <span className="content-topbar__crumb-seg">
            {DOMAIN_NAME[level.domain] ?? level.domain}
          </span>
          <span className="content-topbar__crumb-sep">/</span>
          <span className="content-topbar__crumb-seg content-topbar__crumb-seg--active">
            {level.id}
          </span>
          <span className="content-topbar__crumb-sep content-topbar__crumb-sep--title">—</span>
          <span className="content-topbar__crumb-title">{level.title}</span>
        </div>

        <div className="content-topbar__right">
          <TabBtn id="teoria"     active={tab} label="teoría"           onClick={t => { setTab(t); setSelectedProject(null) }} />
          {hasExercises && (
            <TabBtn id="ejercicios" active={tab} label="ejercicios"     onClick={t => { setTab(t); setSelectedProject(null) }} />
          )}
          {levelProjs.length > 0 && (
            <TabBtn id="proyectos"  active={tab} label={`proyectos\u00a0(${levelProjs.length})`} onClick={t => { setTab(t); setSelectedProject(null) }} />
          )}
          <div className="prog-pill content-topbar__prog">
            <span className={`prog-pill__dot prog-pill__dot--${completed.length > 0 ? 'reading' : 'todo'}`} />
            {completed.length}/{levels.length}
          </div>
        </div>

      </header>

      {/* ── Body layout: optional chapters sidebar + content ── */}
      <div className="content-layout">

        {/* Chapters sidebar — only when in teoría tab and we have chapters */}
        {tab === 'teoria' && hasChapters && (
          <aside className="chapters-nav">
            {chapters.map((s, i) => (
              <button
                key={s.slug}
                className={`chapters-nav__item ${i === activeChapterIdx ? 'chapters-nav__item--active' : ''}`}
                onClick={() => { setActiveChapterIdx(i); scrollTop() }}
              >
                <span className="chapters-nav__num">{s.slug.match(/^(\d+)/)?.[1] ?? String(i + 1).padStart(2, '0')}</span>
                <span className="chapters-nav__title">{s.title}</span>
              </button>
            ))}
          </aside>
        )}

        {/* Scrollable content */}
        <div ref={bodyRef} className="content-body">
          <div className="content-body__inner">

            {/* Hero */}
            <div className="content-hero">
              <div className={`content-hero__id content-hero__id--${level.domain}`}>
                {level.id}
              </div>
              <div className="content-hero__info">
                <h1 className="content-hero__title">{level.title}</h1>
                <div className="content-hero__meta">
                  <span className={`badge badge--${level.domain}`}>
                    {level.domain}
                  </span>
                  {level.prerequisites.length > 0 && (
                    <div className="prereq-list">
                      {level.prerequisites.map(p => (
                        <button
                          key={p}
                          className="tag"
                          onClick={() => navigate(`/workspace/level/${p}`)}
                          title={`Ir a ${p}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Teoría tab ── */}
            {tab === 'teoria' && (
              hasContent ? (
                hasChapters && activeChapter ? (
                  <>
                    <MarkdownContent>{activeChapter.body}</MarkdownContent>
                    {/* Prev / Next navigation */}
                    <div className="section-pager">
                      {activeChapterIdx > 0 && (
                        <button
                          className="section-pager__btn section-pager__btn--prev"
                          onClick={() => { setActiveChapterIdx(activeChapterIdx - 1); scrollTop() }}
                        >
                          ← {chapters[activeChapterIdx - 1].title}
                        </button>
                      )}
                      <div className="section-pager__spacer" />
                      {activeChapterIdx < chapters.length - 1 && (
                        <button
                          className="section-pager__btn section-pager__btn--next"
                          onClick={() => { setActiveChapterIdx(activeChapterIdx + 1); scrollTop() }}
                        >
                          {chapters[activeChapterIdx + 1].title} →
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <MarkdownContent>{content.readme}</MarkdownContent>
                )
              ) : (
                <Pending label="pendiente" message="El contenido teórico de este nivel aún no fue producido." />
              )
            )}

            {/* ── Ejercicios tab ── */}
            {tab === 'ejercicios' && (
              hasExercises ? (
                <MarkdownContent>{content.exercises}</MarkdownContent>
              ) : (
                <Pending label="pendiente" message="Los ejercicios de este nivel aún no fueron producidos." />
              )
            )}

            {/* ── Proyectos tab ── */}
            {tab === 'proyectos' && (
              selectedProject ? (
                <>
                  <button
                    className="section-pager__btn section-pager__btn--prev section-pager__btn--spaced"
                    onClick={() => { setSelectedProject(null); scrollTop() }}
                  >
                    ← proyectos
                  </button>
                  <h2 className="content-section-title">{selectedProject.title}</h2>
                  {selectedProjectReadme
                    ? <MarkdownContent>{selectedProjectReadme}</MarkdownContent>
                    : <Pending label="en construcción" message="El contenido de este proyecto estará disponible pronto." />
                  }
                </>
              ) : (
                <>
                  <div className="section-lbl">proyectos asociados</div>
                  <div className="proj-list">
                    {levelProjs.map(p => (
                      <ProjectRow
                        key={p.id}
                        project={p}
                        onClick={() => { setSelectedProject(p); scrollTop() }}
                      />
                    ))}
                  </div>
                </>
              )
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Project view ─────────────────────────────────────────────────────────────

function ProjectView({ project, onBack, onHome, fromLevel }: { project: ProjectMeta | null; onBack: () => void; onHome: () => void; fromLevel: string | null }) {
  const navigate = useNavigate()
  const relatedLevels = project ? getProjectLevels(project, levels) : []
  const projectReadme = project ? projectContent[project.id]?.readme ?? '' : ''
  const hasProjectReadme = !!projectReadme && !isSeededPlaceholder(projectReadme)
  const handleBack = fromLevel
    ? () => navigate(`/workspace/level/${fromLevel}`)
    : onBack

  if (!project) {
    return (
      <div className="content-view">
        <header className="content-topbar">
          <div className="content-topbar__left">
            <button className="ws-header__logo" onClick={onHome}>Forja</button>
            <div className="content-topbar__left-sep" />
            <button className="content-tab" onClick={handleBack}>{fromLevel ? `← ${fromLevel}` : 'Mapa'}</button>
          </div>
          <div className="content-topbar__crumb">
            <span className="content-topbar__crumb-seg content-topbar__crumb-seg--active">proyecto no encontrado</span>
          </div>
          <div className="content-topbar__right" />
        </header>
        <div className="content-body">
          <Pending label="no encontrado" message="Este proyecto no existe en el plan." />
        </div>
      </div>
    )
  }

  return (
    <div className="content-view anim-fade-up">
      <header className="content-topbar">
        <div className="content-topbar__left">
          <button className="ws-header__logo" onClick={onHome}>Forja</button>
          <div className="content-topbar__left-sep" />
          <button className="content-tab" onClick={handleBack}>{fromLevel ? `← ${fromLevel}` : 'Mapa'}</button>
        </div>
        <div className="content-topbar__crumb">
          <span className="content-topbar__crumb-seg">
            {project.type === 'integrating' ? 'integrador' : 'focalizado'}
          </span>
          <span className="content-topbar__crumb-sep">/</span>
          <span className="content-topbar__crumb-seg content-topbar__crumb-seg--active">
            {project.title}
          </span>
        </div>
        <div className="content-topbar__right" />
      </header>

      <div className="content-body">
        <div className="content-body__inner">
          <div className="content-hero">
            <div className="content-hero__info">
              <h1 className="content-hero__title">{project.title}</h1>
              <div className="content-hero__meta">
                <span className={`proj-row__type proj-row__type--${project.type}`}>
                  {project.type}
                </span>
                {project.equivalent && (
                  <span className="proj-row__equiv">
                    equivalente: <em>{project.equivalent}</em>
                  </span>
                )}
                {project.languages.map(lang => (
                  <span key={lang} className="tag">{lang}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Levels that unlock this project */}
          {relatedLevels.length > 0 && (
            <>
              <div className="section-lbl">niveles relacionados</div>
              <div className="prereq-list prereq-list--spaced">
                {relatedLevels.map(level => (
                  <button
                    key={level.id}
                    className="tag"
                    onClick={() => navigate(`/workspace/level/${level.id}`)}
                  >
                    {level.id}
                  </button>
                ))}
              </div>
            </>
          )}

          {hasProjectReadme
            ? <MarkdownContent>{projectReadme}</MarkdownContent>
            : <Pending label="en construcción" message="El contenido de este proyecto estará disponible pronto." />
          }
        </div>
      </div>
    </div>
  )
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function TabBtn({
  id, active, label, onClick,
}: {
  id: Tab
  active: Tab
  label: string
  onClick: (id: Tab) => void
}) {
  return (
    <button
      className={`content-tab ${active === id ? 'content-tab--active' : ''}`}
      onClick={() => onClick(id)}
    >
      {label}
    </button>
  )
}

function ProjectRow({ project, onClick }: { project: ProjectMeta; onClick: () => void }) {
  return (
    <div className="proj-row" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <span className={`proj-row__type proj-row__type--${project.type}`}>
        {project.type}
      </span>
      <div className="proj-row__info">
        <div className="proj-row__name">{project.codename}</div>
        {project.equivalent && (
          <div className="proj-row__desc">
            equivalente: <em className="proj-row__desc-emphasis">{project.equivalent}</em>
          </div>
        )}
        <div className="proj-row__meta">
          {project.languages.map(lang => (
            <span key={lang} className="tag">{lang}</span>
          ))}
        </div>
      </div>
      <span className="proj-row__chevron">›</span>
    </div>
  )
}

function NotFound({ id, onBack }: { id: string; onBack: () => void }) {
  return (
    <div className="content-view">
      <nav className="content-nav">
        <button className="content-nav__back" onClick={onBack}>← mapa</button>
        <div className="content-nav__crumb">
          <span className="content-nav__crumb-item content-nav__crumb-item--active">{id}</span>
        </div>
      </nav>
      <div className="content-body">
        <Pending label="no encontrado" message={`El nivel "${id}" no existe en el plan.`} />
      </div>
    </div>
  )
}

function Pending({ label, message }: { label: string; message: string }) {
  return (
    <div className="empty-state">
      <span className="empty-state__tag">{label}</span>
      <p className="empty-state__msg">{message}</p>
    </div>
  )
}
