import { useNavigate } from 'react-router-dom'
import { paths, projects as allProjects } from 'virtual:forja-content'

// ─── Editorial content ────────────────────────────────────────────────────────

const PILLARS = [
  {
    num: '01',
    title: 'Código real como punto de partida',
    desc: 'Cada proyecto arranca con una implementación generada para estudiar y mejorar. No arrancás de cero ni recibís la solución. Estudiar código es una habilidad y Forja la trabaja.',
  },
  {
    num: '02',
    title: 'C y Rust, los dos en serio',
    desc: 'No es C primero y Rust como traducción. Son dos mentalidades distintas que se aprenden juntas y se contrastan a propósito. El mundo real los usa a los dos.',
  },
  {
    num: '03',
    title: 'Del toolchain al kernel',
    desc: '50 niveles desde configurar el ambiente hasta escribir módulos de kernel. El mapa sigue siendo no lineal: hay cuatro caminos de entrada y un plan canonico comun.',
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
          <span className="landing__tag">// sistemas desde cero</span>
        </div>

        <p className="landing__desc">
          Un laboratorio de programación de bajo nivel construido sobre una idea simple:{' '}
          <strong>se aprende construyendo cosas reales</strong>, no resolviendo puzzles.
          Shells, allocators, parsers, compiladores y piezas de kernel — en C y en Rust.
          Sin frameworks que te oculten lo que importa.
        </p>

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
