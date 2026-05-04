import { useNavigate } from 'react-router-dom'
import { levels, paths, projects as allProjects } from 'virtual:forja-content'

// ─── Editorial content ────────────────────────────────────────────────────────

const PILLARS = [
  {
    num: '01',
    title: 'Código real como punto de partida',
    desc: 'Cada proyecto arranca con una implementación generada para estudiar y mejorar. No se arranca de cero ni se recibe la solución. Estudiar código es una habilidad y Forja la trabaja.',
  },
  {
    num: '02',
    title: 'C y Rust, los dos en serio',
    desc: 'No es C primero y Rust como traducción. Son dos mentalidades distintas que se aprenden juntas y se contrastan a propósito. El mundo real los usa a los dos.',
  },
  {
    num: '03',
    title: 'Del toolchain al kernel',
    desc: '58 niveles, desde fijar el laboratorio hasta escribir módulos de kernel. El mapa sigue siendo no lineal: hay cuatro caminos de entrada y un plan canónico común.',
  },
]

// Muestra el alcance del plan sin inventar nada fuera del repo
const PREVIEW_IDS = [
  'mish', 'mini-debugger', 'custom-malloc', 'logico',
  'kvolt', 'async-runtime', 'minidocker', 'kvm-mini-hypervisor',
  'tcp-ip-stack', 'elf-explorer', 'mini-linker', 'thread-pool',
  'lock-free-queue', 'regex-engine', 'tinyssh', 'mini-tcpdump',
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate()
  const levelCount = levels.length
  const projectCount = allProjects.length
  const integratingCount = allProjects.filter(project => project.type === 'integrating').length
  const focusedCount = projectCount - integratingCount
  const domainCount = new Set(levels.map(level => level.domain)).size

  const previewProjs = PREVIEW_IDS.map(id => {
    const found = allProjects.find(p => p.id === id || p.codename === id)
    return { id, codename: id, type: found?.type ?? 'focused' }
  })

  return (
    <div className="landing">
      {/* ─── Sticky top bar ─────────────────────────── */}
      <div className="landing__topbar">
        <button className="landing__topbar-logo">Forja</button>
        <button className="landing__topbar-cta" onClick={() => navigate('/workspace')}>
          Entrar al workspace
          <span className="landing__topbar-cta-arrow">→</span>
        </button>
      </div>

      <div className="landing__inner anim-fade-up">

        {/* ─── Hero ─────────────────────────────────── */}
        <div className="landing__brand">
          <h1 className="landing__name">Forja</h1>
          <span className="landing__tag">// sistemas desde la base</span>
        </div>

        <p className="landing__desc">
          Forja es una plataforma de programación de sistemas construida para estudiar y construir
          piezas reales con el repositorio abierto, la toolchain visible y una progresión explícita
          entre teoría, ejercicios y proyectos. <strong>No es una colección de lecciones aisladas</strong>:
          es un mapa largo donde laboratorio, máquina, representación, compilación, lenguajes,
          concurrencia, persistencia, redes, runtimes, contenedores y frontera con kernel se van
          apoyando unos en otros.
        </p>

        <p className="landing__desc landing__desc--secondary">
          La entrada combina niveles teóricos con capítulos y ejercicios, proyectos focalizados e
          integradores, y un workspace para recorrer dependencias reales sin esconder el sistema
          detrás de una IDE ficticia. Acá entran shells, allocators, parsers, mini-linkers,
          runtimes async, contenedores, stacks de red, hipervisores pequeños y más, en C y en Rust.
        </p>

        <section className="landing__overview">
          <div className="landing__overview-copy">
            <div className="landing__section-label">qué ofrece la plataforma</div>
            <h2 className="landing__section-title">
              Un mapa teórico amplio, proyectos serios y un workspace pensado para recorrerlos.
            </h2>
            <p className="landing__section-desc">
              La idea no es mostrar una lista larga por volumen. La idea es dejar claro que Forja ya
              tiene una arquitectura de aprendizaje completa: una base canónica, rutas de entrada,
              teoría con foco único y proyectos donde esas distinciones reaparecen como decisiones
              concretas de implementación.
            </p>
          </div>

          <div className="landing__offer-grid">
            <article className="offer-card">
              <div className="offer-card__metric">{levelCount}</div>
              <div className="offer-card__title">niveles teóricos</div>
              <p className="offer-card__desc">
                Desde `L0` hasta el borde de kernel space. La teoría abre laboratorio, modelo de
                máquina, compilación, C, Rust, POSIX, concurrencia, compiladores, persistencia,
                redes, runtimes y sistemas avanzados con capítulos y ejercicios visibles.
              </p>
            </article>

            <article className="offer-card">
              <div className="offer-card__metric">{projectCount}</div>
              <div className="offer-card__title">proyectos del catálogo</div>
              <p className="offer-card__desc">
                {focusedCount} focalizados para aislar una pieza y {integratingCount} integradores
                para componer varias capas del mapa. El proyecto no entra como bonus: entra como la
                otra mitad del plan.
              </p>
            </article>

            <article className="offer-card">
              <div className="offer-card__metric">{paths.length}</div>
              <div className="offer-card__title">caminos de entrada</div>
              <p className="offer-card__desc">
                La plataforma deja entrar por distintos recorridos sin perder el plan común. La
                landing, las intros y el workspace existen justamente para que el mapa grande no se
                sienta opaco ni arbitrario.
              </p>
            </article>

            <article className="offer-card">
              <div className="offer-card__metric">{domainCount}</div>
              <div className="offer-card__title">dominios conectados</div>
              <p className="offer-card__desc">
                Base y lenguajes, sistemas, compiladores y sistemas avanzados. La plataforma no se
                agota en una tecnología: muestra cómo esas capas se enlazan cuando el software deja
                de ser un ejercicio de pizarra.
              </p>
            </article>
          </div>
        </section>

        {/* ─── Pillars ────────────────────────────────── */}
        <div className="landing__pillars">
          {PILLARS.map(p => (
            <div key={p.num} className="pillar">
              <div className="pillar__num">{p.num}</div>
              <div className="pillar__title">{p.title}</div>
              <p className="pillar__desc">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* ─── Projects preview ───────────────────────── */}
        <div className="landing__projs-label">algunos proyectos del plan</div>
        <p className="landing__projs-note">
          El catálogo práctico ya cruza debugging, memoria, parsers, toolchains, concurrencia,
          networking, virtualización y kernel. Estos nombres son apenas una muestra del tipo de
          piezas que aparecen en el mapa.
        </p>
        <div className="landing__projs-grid">
          {previewProjs.map(p => (
            <span
              key={p.id}
              className={`proj-pill${p.type === 'integrating' ? ' proj-pill--integrating' : ''}`}
            >
              {p.codename}
            </span>
          ))}
        </div>

        {/* ─── Paths ──────────────────────────────────── */}
        <div className="landing__paths-label">cuatro caminos de entrada</div>
        <div className="landing__paths">
          {paths.map((path, i) => (
            <div
              key={path.id}
              className="path-card"
              onClick={() => navigate('/workspace')}
            >
              <div className="path-card__num">0{i + 1}</div>
              <div className="path-card__title">{path.title}</div>
              <div className="path-card__desc">{path.description}</div>
            </div>
          ))}
        </div>

        {/* ─── CTA ────────────────────────────────────── */}
        <button className="landing__cta" onClick={() => navigate('/workspace')}>
          Entrar al workspace
          <span className="landing__cta-arrow">→</span>
        </button>
      </div>
    </div>
  )
}
