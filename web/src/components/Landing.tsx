import { useNavigate } from 'react-router-dom'
import { levels, paths, projects as allProjects } from 'virtual:forja-content'

// ─── Editorial content ────────────────────────────────────────────────────────

const PILLARS = [
  {
    num: '01',
    title: 'La toolchain como objeto de estudio',
    desc: 'gcc -E, -S, -c y el linker no son comandos para invocar: son etapas para mirar por dentro. L3 desarma el pipeline pieza por pieza, con preprocesado, asm y ELF a la vista.',
  },
  {
    num: '02',
    title: 'C y Rust en serio, contrastados a propósito',
    desc: 'Dos modelos de memoria, dos ergonomías, dos clases distintas de error de novato. No es C primero y Rust como traducción. Son dos mentalidades que se aprenden juntas porque iluminan cosas distintas.',
  },
  {
    num: '03',
    title: 'Mapa explícito, no track corto',
    desc: 'Del laboratorio al borde de kernel space. Cada nivel cubre una sola distinción fuerte y la cita cuando reaparece más adelante. Nada queda colgado: si un tema entra parcial, se declara dónde se cierra.',
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

  const previewProjs = PREVIEW_IDS.map(id => {
    const found = allProjects.find(p => p.id === id || p.codename === id)
    return { id, codename: id, type: found?.type ?? 'focused' }
  })

  return (
    <div className="landing">
      {/* ─── Sticky top bar ─────────────────────────── */}
      <div className="landing__topbar">
        <button className="landing__topbar-logo">Forja</button>
        <div className="landing__topbar-actions">
          <span className="landing__topbar-hint">ver el mapa</span>
          <button className="landing__topbar-cta" onClick={() => navigate('/workspace')}>
            Entrar al workspace
            <span className="landing__topbar-cta-arrow">→</span>
          </button>
        </div>
      </div>

      <div className="landing__inner anim-fade-up">

        {/* ─── Hero ─────────────────────────────────── */}
        <div className="landing__brand">
          <h1 className="landing__name">Forja</h1>
          <span className="landing__tag">// programación de sistemas, sin atajos</span>
        </div>

        <p className="landing__desc">
          Construir un shell, un allocator, un debugger, un linker, un runtime async, un stack TCP/IP,
          un mini-hipervisor. <strong>En C y en Rust</strong>, con el repositorio abierto, la toolchain
          visible y un mapa de {levelCount} niveles teóricos que abre cada pieza antes de pedir que se
          escriba. El proyecto no entra como bonus al final: entra como la otra mitad del plan.
        </p>

        <p className="landing__desc landing__desc--secondary">
          Forja es un repo, no una plataforma cerrada. Cada nivel es texto navegable. Cada proyecto
          declara qué niveles requiere y cuáles reabre. Hoy hay {focusedCount} proyectos focalizados y {' '}
          {integratingCount} integradores en el catálogo, y un workspace para recorrer dependencias
          reales sin esconder el sistema detrás de una IDE ficticia.
        </p>

        <div className="landing__hero-actions">
          <button
            className="landing__cta-link landing__cta-link--lg"
            onClick={() => navigate('/workspace/intro/forja')}
          >
            ¿Qué es Forja? →
          </button>
        </div>

        {/* ─── Low-level snippets ─────────────────── */}
        <div className="landing__snippets-label">// piezas del mapa, sin caja negra</div>
        <p className="landing__snippets-intro">
          Cuatro vistazos a niveles distintos del recorrido, en el mismo idioma con el que se
          trabaja en el repo: comandos reales, output real, archivos reales.
        </p>

        <div className="landing__snippets">

          <article className="snippet-card">
            <header className="snippet-card__head">
              <span className="snippet-card__title">del .c al ELF</span>
              <span className="snippet-card__level">L3 · pipeline en C</span>
            </header>
            <pre className="snippet-card__code">{`$ cat hello.c
int main(void) { return 42; }

$ gcc -O0 -S hello.c -o -
main:
        pushq   %rbp
        movq    %rsp, %rbp
        movl    $42, %eax
        popq    %rbp
        ret

$ objdump -d a.out | grep -A4 '<main>:'
0000000000001129 <main>:
   1129: 55                  push   %rbp
   112a: 48 89 e5            mov    %rsp,%rbp
   112d: b8 2a 00 00 00      mov    $0x2a,%eax
   1132: 5d                  pop    %rbp
   1133: c3                  ret`}</pre>
            <p className="snippet-card__note">
              La misma función como C, como ensamblador y como bytes en el ELF.
              <strong> L3</strong> desarma cada etapa del pipeline.
            </p>
          </article>

          <article className="snippet-card">
            <header className="snippet-card__head">
              <span className="snippet-card__title">una syscall, observada</span>
              <span className="snippet-card__level">L20–L21 · POSIX</span>
            </header>
            <pre className="snippet-card__code">{`$ strace -e trace=openat,read,write,close ./cat hola.txt
openat(AT_FDCWD, "hola.txt", O_RDONLY)  = 3
read(3, "hola, mundo\\n", 4096)         = 12
write(1, "hola, mundo\\n", 12)          = 12
close(3)                                = 0
+++ exited with 0 +++

$ ./cat hola.txt
hola, mundo`}</pre>
            <p className="snippet-card__note">
              Lo que un programa <em>realmente</em> le pide al kernel para abrir, leer y escribir un
              archivo. <strong>L20–L21</strong> trabajan archivos, procesos y señales como objetos
              observables.
            </p>
          </article>

          <article className="snippet-card">
            <header className="snippet-card__head">
              <span className="snippet-card__title">lexer y parser, a mano</span>
              <span className="snippet-card__level">L32–L33 · compiladores</span>
            </header>
            <pre className="snippet-card__code">{`fuente   →   let x = 40 + 2;

tokens   →   [LET] [IDENT "x"] [EQ] [NUM 40] [PLUS] [NUM 2] [SEMI]

ast      →   Let {
                 name: "x",
                 expr: BinOp {
                   op:  Plus,
                   lhs: Num(40),
                   rhs: Num(2),
                 },
             }`}</pre>
            <p className="snippet-card__note">
              De un texto plano a un árbol de sintaxis. <strong>L32–L33</strong> abren autómatas,
              gramáticas y la transición desde el parser hardcodeado de <code>mish</code> hacia un
              compilador real.
            </p>
          </article>

          <article className="snippet-card">
            <header className="snippet-card__head">
              <span className="snippet-card__title">aislamiento desde cero</span>
              <span className="snippet-card__level">L51 · contenedores</span>
            </header>
            <pre className="snippet-card__code">{`$ unshare --pid --mount --uts --net --fork \\
          --mount-proc bash

# hostname mini-lab
# ps -ef
UID    PID  PPID  C STIME TTY      TIME CMD
root     1     0  0 18:42 pts/0    00:00 bash
root     7     1  0 18:42 pts/0    00:00 ps -ef

# ip link
1: lo: <LOOPBACK> mtu 65536 state DOWN`}</pre>
            <p className="snippet-card__note">
              Un proceso con su propio PID 1, su propio hostname y su propia red, montado a mano con
              namespaces de Linux. <strong>L51</strong> es la base teórica del proyecto{' '}
              <code>minidocker</code>.
            </p>
          </article>

        </div>

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
          El catálogo cruza debugging, memoria, parsers, toolchains, concurrencia, networking,
          virtualización y kernel. Estos nombres son una muestra del tipo de piezas que aparecen
          en el mapa.
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

        {/* ─── CTA final ──────────────────────────────── */}
        <div className="landing__footer-actions">
          <button
            className="landing__cta-link landing__cta-link--lg"
            onClick={() => navigate('/workspace/intro/workspace')}
          >
            Cómo está armado el workspace →
          </button>
        </div>
      </div>
    </div>
  )
}
