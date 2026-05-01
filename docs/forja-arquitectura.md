# Forja — Arquitectura de la Plataforma

> Este documento describe cómo se construye Forja: la estructura del repositorio, la arquitectura de la web, el modelo de contenido, el devcontainer y el alcance del MVP. No contiene contenido curricular — eso está en `forja-contenido.md`.
>
> La dinámica operativa de construcción — orden de trabajo, fases, betatesting y criterio de avance — vive en `forja-construccion.md`.

---

## Decisiones adoptadas

| Decisión | Elección |
|---|---|
| Tipo de repositorio | Monorepo público en GitHub desde el día uno |
| Framework web | React + TypeScript + Vite |
| Despliegue | Sitio estático — Vercel, Netlify o GitHub Pages |
| Backend / auth | Ninguno en el MVP ni en el futuro próximo |
| Tracking de progreso | `localStorage` exclusivamente |
| Acceso al contenido | Doble: web como interfaz de navegación + repo como fuente directa |
| Organización de fases | Directorios por fase dentro de cada proyecto |
| Fuente de verdad de metadata | Local al contenido: `meta.yaml` por nivel y `project.yaml` por proyecto |

---

## Estructura del repositorio

```text
forja/
├── README.md                          # Punto de entrada — qué es Forja, cómo empezar
├── .gitignore
├── .gitattributes
├── .editorconfig
├── CONVENTIONS.md
├── docs/                              # Documentación fuente del proyecto
│   ├── README.md
│   ├── forja-contenido.md
│   ├── forja-arquitectura.md
│   └── forja-construccion.md
├── verify-setup.sh                    # Verificación común del entorno
├── .devcontainer/                     # Laboratorio Linux reproducible
│   ├── devcontainer.json
│   └── Dockerfile
│
├── content/                           # Todo el contenido curricular
│   ├── theory/                        # Track teórico — unidades conceptuales
│   │   ├── L0-environment/
│   │   ├── L1a-c-first-contact/
│   │   ├── L1b-c-deep-fundamentals/
│   │   ├── L2-c-memory/
│   │   ├── L3a-rust-first-contact/
│   │   ├── L3b-rust-ownership/
│   │   ├── L4-rust-types-traits-ffi/
│   │   ├── L5-posix-files/
│   │   ├── L6-processes-signals/
│   │   ├── L7-virtual-memory-elf/
│   │   ├── L8-allocators/
│   │   ├── L9-concurrency/
│   │   ├── L10-advanced-concurrency/
│   │   ├── L11-ipc/
│   │   ├── L12-lexers-parsers/
│   │   ├── L13-interpreters/
│   │   ├── L14-type-systems/
│   │   ├── L15-persistence/
│   │   ├── L16-networking/
│   │   ├── L17-performance/
│   │   ├── L18-security/
│   │   ├── L19-async-io/
│   │   ├── L20-containers/
│   │   ├── L21-orchestration/
│   │   ├── L22-codegen-jit/
│   │   └── L23-kernel/
│   │
│   └── projects/                      # Track práctico — proyectos
│       ├── focused/                   # Proyectos focalizados
│       │   ├── devcontainer-setup/
│       │   ├── hello-c/
│       │   ├── caesar-cipher/
│       │   ├── word-count/
│       │   ├── stringlib/
│       │   ├── elf-explorer/
│       │   ├── getopt-impl/
│       │   ├── dynamic-array/
│       │   ├── hello-rust/
│       │   ├── fizzbuzz-rust/
│       │   ├── mini-calculator/
│       │   ├── data-structures-rust/
│       │   ├── custom-iterator/
│       │   ├── parser-combinators/
│       │   ├── ffi-demo/
│       │   ├── spl_stat/
│       │   ├── spl_ls/
│       │   ├── spl_du/
│       │   ├── file-monitor/
│       │   ├── spl_pstree/
│       │   ├── impl_abort/
│       │   ├── impl_alarm/
│       │   ├── scheduler-sim/
│       │   ├── vma-explorer/
│       │   ├── cow-demo/
│       │   ├── spl_cp/
│       │   ├── mini-linker/
│       │   ├── thread-pool/
│       │   ├── prod-cons/
│       │   ├── rwlock-impl/
│       │   ├── impl_arc/
│       │   ├── lock-free-queue/
│       │   ├── rcu-demo/
│       │   ├── named-pipe-sem/
│       │   ├── ipc-explorer/
│       │   ├── regex-engine/
│       │   ├── expr-parser/
│       │   ├── shell-remoto-tcp/
│       │   ├── mini-dns-resolver/
│       │   ├── mini-tcpdump/
│       │   ├── http2-server/
│       │   ├── websocket-server/
│       │   ├── perf-benchmarks/
│       │   ├── flamegraph-lab/
│       │   ├── cache-locality-exp/
│       │   ├── false-sharing-exp/
│       │   ├── impl_script/
│       │   ├── io_uring-echo/
│       │   ├── char-driver/
│       │   ├── ram-filesystem/
│       │   └── ebpf-tracer/
│       │
│       └── integrating/               # Proyectos integradores
│           ├── mish/
│           ├── mini-debugger/
│           ├── custom-malloc/
│           ├── miniqueue/
│           ├── semtex/
│           ├── logico/
│           ├── kvolt/
│           ├── minisql/
│           ├── http-server/
│           ├── minisync/
│           ├── tcp-ip-stack/
│           ├── tinyssh/
│           ├── async-runtime/
│           ├── minidocker/
│           ├── orquestador/
│           ├── jit-brain/
│           └── kvm-mini-hypervisor/
│
├── metadata/                          # Relaciones globales no derivables del contenido local
│   ├── paths.yaml                     # Los 4 caminos de navegación
│   └── cross-refs.yaml                # Relaciones teoría ↔ proyectos y notas transversales
│
└── web/                               # Aplicación React
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── lib/                       # Parsing de YAML, carga de MD, grafo
    │   └── store/                     # Estado de progreso (localStorage)
    ├── public/
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## Estructura de una unidad teórica

Cada nivel de `theory/` tiene esta estructura interna:

```text
L6-processes-signals/
├── README.md               # Contenido principal de la unidad
├── src/                    # Fragmentos de código ilustrativos
│   ├── fork-demo.c
│   ├── sigaction-demo.c
│   └── scheduler-sim.rs
├── exercises.md            # Ejercicios puntuales (preguntas + modificaciones)
└── meta.yaml               # Metadatos de la unidad (ver sección Metadata)
```

`README.md` es el documento principal. Sigue la estructura definida en `forja-contenido.md` — tema y motivación, desarrollo conceptual, código de ilustración, errores típicos, referencias cruzadas, lectura adicional.

Los archivos de `src/` se referencian desde `README.md`. No son proyectos — son fragmentos que demuestran un concepto puntual.

---

## Estructura de un proyecto

### Proyecto focalizado

```text
projects/focused/spl_stat/
├── project.yaml            # Metadatos del proyecto
├── c/
│   ├── phase-1/
│   │   ├── src/
│   │   │   ├── main.c
│   │   │   └── stat_helpers.c
│   │   ├── tests/
│   │   │   ├── test_stat.c
│   │   │   └── fixtures/
│   │   ├── Makefile
│   │   ├── README.md       # Descripción de esta fase
│   │   ├── STUDY_GUIDE.md  # Guía de lectura del código
│   │   └── IMPROVEMENTS.md # Extensiones propuestas
│   └── phase-2/
│       └── ...
└── rust/
    ├── phase-1/
    │   ├── src/
    │   │   └── main.rs
    │   ├── tests/
    │   ├── Cargo.toml
    │   ├── README.md
    │   ├── STUDY_GUIDE.md
    │   └── IMPROVEMENTS.md
    └── phase-2/
        └── ...
```

### Proyecto integrador

Misma estructura, con más fases. Los proyectos que solo tienen implementación en C (L23: char-driver, RAM-FileSystem, KVM mini-hypervisor) solo tienen el directorio `c/`. Los proyectos que tienen implementación dual tienen ambos.

### Proyectos single-language

Algunos proyectos son single-language por naturaleza del dominio:
- Proyectos de L23 (kernel space): solo `c/`
- `hello-rust`, `fizzbuzz-rust`, `mini-calculator`, `data-structures-rust`, `custom-iterator`, `parser-combinators`: solo `rust/`
- `hello-c`, `caesar-cipher`, `word-count`, `stringlib`, `elf-explorer`: solo `c/`

---

## Modelo de metadata YAML

### `meta.yaml` dentro de cada unidad teórica

```yaml
id: L1a
title: "C: primer contacto"
slug: "l1a-c-first-contact"
domain: languages
group: L1
sublevel_order: 1
order: 2
theory_dir: content/theory/L1a-c-first-contact
projects: [hello-c, caesar-cipher, word-count]
prerequisites: [L0]

---

id: L6
title: "Procesos y señales"
slug: "l6-processes-signals"
domain: systems
order: 9
theory_dir: content/theory/L6-processes-signals
projects: [spl_pstree, impl_abort, impl_alarm, scheduler-sim, mish, mini-debugger]
prerequisites: [L5]
```

Los niveles navegables del sistema son nodos planos: `L0`, `L1a`, `L1b`, `L2`, ..., `L23`. Los casos como `L1a/L1b` y `L3a/L3b` no se modelan como árboles de subniveles dentro del grafo, sino como niveles normales con un campo opcional `group` para presentación y orden visual. Esto evita complejidad innecesaria en dependencias, rutas, progreso y paths, pero mantiene la agrupación cuando hace falta en la UI.

### `project.yaml` dentro de cada proyecto

```yaml
id: mish
codename: mish
title: "Mini Shell"
type: integrating
anchor_level: L6
display_levels: [L6, L11]
required_levels: [L6]
expansion_levels: [L11]
languages: [c, rust]
equivalent: "bash, zsh, dash"
dir: content/projects/integrating/mish
stages:
  - id: mish-l6
    label: "Tramo L6"
    kind: project-stage
    required_levels: [L6]
    unlock_level: L6
    covers_impl_phases:
      c: [1, 2]
      rust: [1, 2]

  - id: mish-l11
    label: "Tramo L11"
    kind: project-stage
    required_levels: [L6, L11]
    unlock_level: L11
    covers_impl_phases:
      c: [3, 4]
      rust: [3, 4]

---

id: spl_stat
codename: spl_stat
title: "spl_stat"
type: focused
anchor_level: L5
display_levels: [L5]
required_levels: [L5]
expansion_levels: []
languages: [c, rust]
equivalent: "stat(1)"
dir: content/projects/focused/spl_stat
stages:
  - id: spl-stat-main
    label: "Fase única"
    kind: project-stage
    required_levels: [L5]
    unlock_level: L5
    covers_impl_phases:
      c: [1]
      rust: [1]
```

Campos recomendados de `project.yaml`:

- `anchor_level`: nivel donde el proyecto aparece por primera vez
- `display_levels`: niveles con los que el proyecto se muestra asociado en la UI y en documentos
- `required_levels`: prerequisitos reales para abrir el proyecto por primera vez
- `expansion_levels`: niveles donde el proyecto vuelve a abrirse con un tramo nuevo
- `stages`: tramos macro del proyecto usados por el plan de construcción

La distinción clave es esta: `display_levels` no reemplaza a `required_levels`. La primera sirve para representar el proyecto en el mapa del plan; la segunda resuelve dependencias reales de construcción.

Para proyectos focalizados, `stages` suele tener un solo elemento. Para proyectos integradores, `stages` modela los reaparecidos del proyecto a lo largo del plan.

### `metadata/paths.yaml`

```yaml
paths:
  - id: path-1
    title: "Sistemas primero"
    description: "Base completa en C y Rust antes de profundizar en sistemas, redes, runtime y kernel."
    levels: [L0, L1a, L1b, L2, L3a, L3b, L4, L5, L6, L7, L8, L9, L10, L11, L16, L17, L18, L19, L20, L21, L23]

  - id: path-2
    title: "Plan completo"
    description: "El recorrido curricular entero. Recomendado como vista canonica del mapa."
    levels: [L0, L1a, L1b, L2, L3a, L3b, L4, L5, L6, L7, L8, L9, L10, L11, L12, L13, L14, L15, L16, L17, L18, L19, L20, L21, L22, L23]

  - id: path-3
    title: "Compiladores primero"
    description: "C y Rust completos al inicio, y desvio temprano al arco de compiladores."
    levels: [L0, L1a, L1b, L2, L3a, L3b, L4, L12, L13, L14, L22]

  - id: path-4
    title: "Integracion vertical"
    description: "Sistemas y compiladores entrelazados, priorizando proyectos que cruzan varios dominios."
    levels: [L0, L1a, L1b, L2, L3a, L3b, L4, L5, L6, L12, L7, L8, L9, L10, L11, L13, L14, L15, L16, L17, L18, L19, L20, L22, L23]
```

### `metadata/cross-refs.yaml`

```yaml
cross_refs:
  - theory: L7-virtual-memory-elf
    projects: [mini-linker, vma-explorer, cow-demo, spl_cp, mini-debugger]

  - theory: L8-allocators
    projects: [custom-malloc, logico]
    note: "El GC de Lógico usa custom-malloc"
```

### Índices generados en build time

La web no edita ni mantiene índices globales a mano. En build time, escanea todos los `content/theory/*/meta.yaml` y `content/projects/**/project.yaml`, construye un índice en memoria, y con eso genera navegación, paths, búsqueda y vistas del grafo. Si en algún momento conviene materializar ese índice en JSON para acelerar el build, ese archivo debe ser generado y no editado manualmente.

La resolución de dependencias de proyectos respecto a niveles sale de `project.yaml`, no de inferir prose ni de parsear la tabla de `forja-contenido.md`. La tabla sirve como documento humano del plan; `project.yaml` sirve como contrato estructurado para repo y web.

---

## La web — React + TypeScript + Vite

### Rol de la web

La web convierte la estructura del repo en una experiencia de navegación. El usuario puede usar el repo directamente desde GitHub — la web no es requisito. Lo que la web agrega:

- Mapa visual interactivo del grafo de dependencias
- Referencias cruzadas clickeables entre teoría y proyectos
- Tracking de progreso local (qué completó, qué tiene desbloqueado)
- Renderizado de Markdown con syntax highlighting y diagramas
- Búsqueda de conceptos a través de todos los contenidos

### Lo que la web no hace

- No tiene IDE integrada
- No ejecuta código
- No evalúa el trabajo del usuario
- No tiene login ni servidor

### Procesamiento en build time

Vite procesa el contenido en build time — los archivos Markdown y YAML se importan durante el build y el resultado es un sitio estático. El servidor no hace nada en runtime. La web trata `meta.yaml` y `project.yaml` como la fuente de verdad del contenido; `metadata/paths.yaml` y `metadata/cross-refs.yaml` complementan solo la parte relacional global.

```ts
// vite.config.ts — importar todos los README.md de theory/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import rehypeShiki from 'rehype-shiki'

export default defineConfig({
  plugins: [
    mdx({ remarkPlugins: [remarkGfm], rehypePlugins: [rehypeShiki] }),
    react(),
  ],
})
```

### Páginas de la web

| Ruta | Descripción |
|---|---|
| `/` | Home — qué es Forja, cómo empezar, atajos a los 4 caminos |
| `/map` | Mapa visual del grafo de niveles y proyectos |
| `/levels/:slug` | Página de un nivel — teoría + lista de proyectos del nivel |
| `/projects/:id` | Página de un proyecto — descripción, fases, equivalente industrial |
| `/projects/:id/:lang/:phase` | Página de una fase específica — README + STUDY_GUIDE |
| `/paths` | Los 4 caminos de navegación con comparación |
| `/search` | Búsqueda full-text |

### Routing

React Router v6 con rutas definidas en código. El build genera páginas estáticas vía `react-router`'s static data APIs o una prerender step con Vite SSG.

**Decisión abierta**: evaluar `TanStack Router` vs `React Router v6` — TanStack tiene mejor TypeScript safety y loaders tipados.

### Tracking de progreso en localStorage

El estado de progreso se almacena en localStorage con la siguiente estructura:

```ts
interface ForjaProgress {
  version: number                        // para migraciones futuras
  lastUpdated: string                    // ISO timestamp
  levels: Record<string, LevelProgress>
  projects: Record<string, ProjectProgress>
}

interface LevelProgress {
  theoryRead: boolean
  exercisesCompleted: boolean
}

interface ProjectProgress {
  phases: Record<string, PhaseProgress>  // key: "c/phase-1", "rust/phase-2", etc.
}

interface PhaseProgress {
  status: 'not-started' | 'in-progress' | 'completed'
  improvements: string[]                 // lista de mejoras marcadas como hechas
  notes: string                          // notas personales del usuario
}
```

El estado vive en un React Context expuesto por un hook `useProgress()`. Se persiste automáticamente en `localStorage` en cada cambio.

### Visualización del grafo

La página `/map` renderiza el grafo de dependencias del plan. Los nodos son niveles; las aristas son dependencias. Los nodos se colorean según el estado de progreso del usuario.

**Decisión abierta**: evaluar `reactflow` (más features, más peso) vs `d3-force` (más control, más código) vs algo más simple (tabla visual con conexiones CSS) para el MVP.

Para el MVP, una representación visual simplificada (no force-directed, sino un layout en capas vertical con las dependencias como líneas) es suficiente y más fácil de implementar correctamente.

---

## El devcontainer

Vive en `.devcontainer/` en la raíz del repo. Compatible con VS Code Remote Containers y GitHub Codespaces.

### Herramientas preinstaladas

**C/sistemas**:
- `gcc` y `clang` (versiones recientes)
- `gdb`, `lldb`
- `valgrind` (memcheck, callgrind, massif)
- ASan, UBSan, MSan (flags de compilación — no paquetes separados)
- `make`, `cmake`, `ninja`
- `strace`, `ltrace`
- `perf` (linux-tools)
- `binutils` completo (`nm`, `objdump`, `readelf`, `ar`, `ranlib`, `ldd`)
- `linux-headers` (para proyectos de L23)
- `liburing-dev` (para L19 io_uring)
- `libseccomp-dev` (para L20 minidocker)

**Rust**:
- `rustup` con toolchain stable por defecto; nightly opcional para labs avanzados
- `cargo` con extensiones: `clippy`, `rustfmt`, `cargo-expand`, `cargo-flamegraph`, `cargo-audit`
- `miri` (detección de UB, cuando se habilita nightly)
- `cbindgen`, `bindgen`

**Utilidades**:
- `git`, `gh` (GitHub CLI)
- `python3` (para scripts de análisis y el visualizador de flamegraphs)
- `jq`, `yq` (para inspeccionar los YAML de metadata)
- `hyperfine` (benchmarking estadísticamente correcto)

### Verificación del setup

El proyecto `devcontainer-setup` (L0) incluye un script de verificación que comprueba que todas las herramientas están disponibles y en versión correcta:

```bash
./verify-setup.sh
# gcc --version ✓
# cargo --version ✓
# valgrind --version ✓
# perf --version ✓
# ...
```

---

## Cómo coexisten repo y web

El repo es la fuente de verdad. La web es un lector del repo.

| Aspecto | Repo (GitHub) | Web |
|---|---|---|
| Contenido teórico | Markdown en `content/theory/` | Renderizado como páginas |
| Código de proyectos | Directorios en `content/projects/` | Listado con links a GitHub |
| Grafo de dependencias | YAML local (`meta.yaml` y `project.yaml`) + relaciones globales en `metadata/` | Visualización interactiva |
| Progreso del usuario | No existe | localStorage |
| Uso sin conexión | Clonar el repo y leer con el editor | No aplicable |
| Contribuciones | Pull requests al repo | — |

Un usuario puede clonar el repo y usarlo completamente sin la web — los `README.md`, `STUDY_GUIDE.md` y `IMPROVEMENTS.md` de cada fase son legibles directamente en GitHub o en cualquier editor. La web mejora la experiencia pero no la hace posible.

---

## Estrategia de construcción y MVP

La arquitectura no redefine la unidad de avance: esa unidad ya está fijada en `forja-construccion.md` y es la fase lineal del orden maestro. Este documento solo fija cómo repo, metadata y web acompañan cada fase para que el sistema siga navegable mientras crece.

### Regla de alineación

Cada fase que se da por terminada debe dejar cuatro cosas coherentes:

- El contenido de la fase existe y es navegable en el repo
- La metadata local (`meta.yaml` y `project.yaml`) y la metadata global mínima quedan actualizadas
- La web puede renderizar esa fase sin rutas rotas ni referencias huérfanas
- El recorrido real desde el nivel que la habilita hasta el proyecto correspondiente sigue siendo claro

### Ruta piloto para betatesting

La estrategia recomendada sigue siendo priorizar un camino natural que permita probar Forja mientras nace. La primera ruta piloto razonable es el arco inicial del Camino 1 (`Sistemas primero`), ejecutado según el orden maestro de fases:

1. `Base 0`, `Base 1`, `Base 2`
2. `L0` + `devcontainer-setup`, luego `L1a`, `L1b`, `L2`, `L3a`, `L3b` y `L4` con sus proyectos focalizados
3. `L5` y `L6` con sus proyectos focalizados
4. `mish` (tramo `L6`) como primer integrador usable
5. `L11` + `mish` (tramo `L11`) para cerrar pipes, redirecciones y job control

Este orden permite betatestear el curso real sin apartarse de la secuencia de `forja-construccion.md`. Cada bloque nuevo se valida recorriéndolo como usuario, no solo leyéndolo como autor.

### MVP como criterio, no como lista cerrada

El MVP no queda fijado todavía como un conjunto definitivo de niveles. El criterio correcto es este: Forja tiene MVP cuando las fases base y una ruta corta, coherente y autocontenida de fases de nivel y de proyecto pueden recorrerse end-to-end desde `L0` hasta un primer proyecto integrador útil, con repo, web y laboratorio funcionando como sistema único.

### Web del MVP

La web del MVP sí debería resolver lo esencial de lectura y navegación:

- Home page con qué es Forja y cómo empezar
- Navegación por niveles y proyectos renderizados desde Markdown
- Links claros entre teoría, proyectos y fases
- Lista de caminos sugeridos
- Deploy estático en GitHub Pages o Vercel

El mapa interactivo, la búsqueda full-text y el tracking de progreso pueden existir después. Arquitectónicamente están contemplados desde el principio, pero no son requisito de la primera versión usable.

---

## Preguntas de diseño abiertas

| Pregunta | Opciones | Impacto |
|---|---|---|
| Router React | React Router v6 vs TanStack Router | Bajo — decisión reversible |
| Visualización del grafo en `/map` | reactflow vs d3-force vs layout CSS simple | Medio — afecta el MVP si se incluye |
| Markdown rendering | MDX vs remark/rehype plano | Bajo — ambos funcionan bien con Vite |
| Design system / UI | Tailwind + Radix UI vs shadcn/ui vs CSS modules custom | Medio — afecta velocidad de desarrollo |
| Despliegue inicial | GitHub Pages vs Vercel | Bajo — ambos son gratuitos para este caso |
| ¿Qué proyectos de L23 quedan solo en C? | `char-driver`, `RAM-FileSystem` y `KVM mini-hypervisor` solo C; `ebpf-tracer` tiene implementación dual C/Rust | Bajo — ya cerrado en forja-contenido.md |
| ¿Las mejoras propuestas de una fase desbloquean la siguiente? | Opcionales vs requeridas | Alto — afecta el modelo pedagógico completo |
