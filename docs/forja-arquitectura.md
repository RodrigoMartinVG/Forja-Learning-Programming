# Forja — Arquitectura de la Plataforma

> Este documento describe cómo se construye Forja: la estructura del repositorio, la arquitectura de la web, el modelo de contenido, el devcontainer y el alcance del MVP. No contiene contenido curricular — eso vive en `forja-contenido.md` y `forja-proyectos.md`.
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
| Fuente de verdad de contenido renderizado | Markdown local al contenido (`README.md`, `exercises.md`, `STUDY_GUIDE.md`, `IMPROVEMENTS.md`) |
| Fuente de verdad de metadata | `metadata/levels.yaml` para niveles; `project.yaml` por proyecto; `meta.yaml` como espejo local por nivel |

---

## Estado editorial actual

El canon visible del repo ya cubre `L0-L57` y el catálogo estructural actual de proyectos. Eso no implica authoría real homogénea dentro de `content/`.

- En teoría, el placeholder estructural mínimo canónico es `README.md` + `meta.yaml`. Hoy solo `L0` tiene outline, capítulos y ejercicios escritos como contenido real.
- En proyectos, el placeholder estructural mínimo es `README.md` + `project.yaml` + los directorios de lenguaje pertinentes. Hoy solo `devcontainer-setup` tiene un `README.md` raíz de authoría real.
- `docs/` puede describir candidatos y capas futuras antes de que exista su materialización completa. La web y el build solo consumen lo que ya existe estructuralmente en `metadata/` y `content/`.

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
│   ├── forja-proyectos.md
│   ├── forja-arquitectura.md
│   └── forja-construccion.md
├── verify-setup.sh                    # Verificacion comun del laboratorio/devcontainer
├── .devcontainer/                     # Laboratorio Linux reproducible
│   ├── devcontainer.json
│   └── Dockerfile
│
├── content/                           # Todo el contenido curricular
│   ├── theory/                        # Track teórico — unidades conceptuales
│   │   ├── L0-setup-laboratorio/
│   │   ├── L1-modelo-mental-computadora/
│   │   ├── L2-representacion-informacion/
│   │   ├── ...
│   │   ├── L56-kernel-space-1/
│   │   └── L57-kernel-space-2/
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
├── metadata/                          # Relaciones globales y catálogo canónico
│   ├── README.md
│   ├── levels.yaml                    # Catálogo canónico de niveles
│   ├── paths.yaml                     # Los 4 caminos de navegación
│   └── cross-refs.yaml                # Relaciones teoría ↔ proyectos y notas transversales
│
└── web/                               # Aplicación React
    ├── src/
  │   ├── App.tsx
  │   ├── components/
  │   ├── lib/                       # Parsing de YAML, carga de MD y helpers curriculares
  │   ├── styles/
  │   ├── main.tsx
  │   └── vite-env.d.ts
    ├── index.html
    ├── vite.config.ts
  ├── tsconfig.app.json
    ├── tsconfig.json
    └── package.json
```

---

## Estructura de una unidad teórica

Mientras un nivel siga en placeholder estructural, su mínimo canónico actual es este:

```text
L20-posix-filesystem/
├── README.md               # Placeholder editorial o documento real del nivel
└── meta.yaml               # Metadatos locales del nivel
```

Cuando un nivel entra en authoring real, su estructura puede expandirse a esto:

```text
L20-posix-filesystem/
├── README.md               # Documento principal del nivel
├── meta.yaml               # Metadatos locales del nivel
├── outline.md              # Diseño detallado del nivel
├── chapters/               # Cuerpo real cuando el nivel ya fue escrito
├── exercises.md            # Ejercicios puntuales (preguntas + modificaciones)
└── src/                    # Fragmentos de código ilustrativos
```

`README.md` funciona en ambos estados: como placeholder editorial mínimo o como documento principal del nivel cuando ya hay authoría real. En este segundo caso sigue la estructura definida en `forja-contenido.md` — tema y motivación, desarrollo conceptual, código de ilustración, errores típicos, referencias cruzadas y lectura adicional.

Si un nivel todavía está en placeholder estructural, la ausencia de `outline.md`, `chapters/`, `exercises.md` y `src/` no contradice el plan. Solo indica que su turno editorial no llegó.

Los archivos de `src/` se referencian desde `README.md`. No son proyectos — son fragmentos que demuestran un concepto puntual.

---

## Estructura de un proyecto

Como en teoría, hay dos estados relevantes. Un proyecto ya incorporado al catálogo visible puede existir como placeholder estructural con `README.md`, `project.yaml` y los directorios de lenguaje pertinentes (`c/`, `rust/`) aunque todavía no tenga fases materiales. La estructura siguiente describe el estado objetivo cuando el proyecto ya entró en authoring real.

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

Misma estructura, con más fases. Los proyectos que solo tienen implementación en C (`char-driver`, `ram-filesystem`, `kvm-mini-hypervisor`) solo tienen el directorio `c/`. `ebpf-tracer` mantiene implementación dual C/Rust.

Igual que en teoría, esta es la estructura objetivo cuando el proyecto ya entró en authoring real. Un proyecto ya incorporado al catálogo visible sí debe existir al menos como placeholder estructural. Solo los candidatos que todavía viven exclusivamente en `forja-proyectos.md` pueden no tener todavía carpeta, `project.yaml` ni fases materiales.

### Proyectos single-language

Algunos proyectos son single-language por naturaleza del dominio:
- `char-driver`, `ram-filesystem` y `kvm-mini-hypervisor`: solo `c/`
- `hello-rust`, `fizzbuzz-rust`, `mini-calculator`, `data-structures-rust`, `custom-iterator`, `parser-combinators`: solo `rust/`
- `hello-c`, `caesar-cipher`, `word-count`, `stringlib`, `elf-explorer`: solo `c/`

---

## Modelo de metadata YAML

### `metadata/levels.yaml` y `meta.yaml` por nivel

```yaml
levels:
  - id: L8
    title: "C: primer contacto"
    slug: "l8-c-primer-contacto"
    domain: languages
    order: 9
    theory_dir: content/theory/L8-c-primer-contacto
    projects: [hello-c, caesar-cipher, word-count]
    prerequisites: [L7]

---

id: L8
title: "C: primer contacto"
slug: "l8-c-primer-contacto"
domain: languages
order: 9
theory_dir: content/theory/L8-c-primer-contacto
projects: [hello-c, caesar-cipher, word-count]
prerequisites: [L7]
```

`metadata/levels.yaml` es el catálogo canónico de niveles que consume la web. Cada directorio `content/theory/LN-slug/` replica esos campos esenciales en `meta.yaml` para mantener el contenido autocontenido y habilitar fallbacks locales.

Los niveles navegables del sistema son nodos planos `L0` a `L57`. Cada uno tiene su propio directorio canónico bajo `content/theory/`; ya no hay subniveles tipo `L1a/L1b` ni carpetas compartidas por varios niveles.

### `project.yaml` dentro de cada proyecto

```yaml
id: mish
codename: mish
title: "Mini Shell"
type: integrating
anchor_level: L21
display_levels: [L21, L31, L32]
required_levels: [L21]
expansion_levels: [L31, L32]
languages: [c, rust]
equivalent: "bash, zsh, dash"
dir: content/projects/integrating/mish
stages:
  - id: mish-l21
    label: "Tramo L21"
    kind: project-stage
    required_levels: [L21]
    unlock_level: L21
    covers_impl_phases:
      c: [1, 2]
      rust: [1, 2]

  - id: mish-l31
    label: "Tramo L31"
    kind: project-stage
    required_levels: [L21, L31]
    unlock_level: L31
    covers_impl_phases:
      c: [3, 4]
      rust: [3, 4]

  - id: mish-l32
    label: "Tramo L32"
    kind: project-stage
    required_levels: [L21, L31, L32]
    unlock_level: L32
    covers_impl_phases:
      c: [5]
      rust: [5]

---

id: spl_stat
codename: spl_stat
title: "spl_stat"
type: focused
anchor_level: L20
display_levels: [L20]
required_levels: [L20]
expansion_levels: []
languages: [c, rust]
equivalent: "stat(1)"
dir: content/projects/focused/spl_stat
stages:
  - id: spl-stat-main
    label: "Fase única"
    kind: project-stage
    required_levels: [L20]
    unlock_level: L20
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
    levels: [L0, L1, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11, L12, L13, L14, L15, L16, L17, L18, L19, L20, L21, L22, L23, L24, L25, L26, L27, L28, L29, L30, L31, L38, L39, L40, L41, L42, L43, L44, L45, L46, L47, L48, L49, L50, L52, L53]

  - id: path-2
    title: "Plan completo"
    description: "El recorrido curricular entero. Recomendado como vista canonica del mapa."
    levels: [L0, L1, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11, L12, L13, L14, L15, L16, L17, L18, L19, L20, L21, L22, L23, L24, L25, L26, L27, L28, L29, L30, L31, L32, L33, L34, L35, L36, L37, L38, L39, L40, L41, L42, L43, L44, L45, L46, L47, L48, L49, L50, L51, L52, L53, L54, L55, L56, L57]
```

### `metadata/cross-refs.yaml`

```yaml
cross_refs:
  - theory: L24
    projects: [vma-explorer, cow-demo, spl_cp, mini-debugger]

  - theory: L25
    projects: [mini-linker]

  - theory: L26
    projects: [custom-malloc, logico]
    note: "El GC de Logico usa custom-malloc."
```

### Índices generados en build time

La web no edita ni mantiene índices globales a mano. En build time lee `metadata/levels.yaml`, `metadata/paths.yaml` y `content/projects/**/project.yaml`; para el cuerpo de teoría usa el `theory_dir` de cada nivel y carga `README.md`, `exercises.md` y, si existen, los archivos de `chapters/`. `meta.yaml` queda como espejo local y fallback si alguna vez falta el catálogo canónico.

Los candidatos que todavía viven solo en `docs/forja-contenido.md` o `docs/forja-proyectos.md` no entran en ese circuito hasta que exista su metadata estructural real. `docs/` puede ir por delante del repo materializado; la web y el build no.

La resolución de dependencias de proyectos respecto a niveles sale de `project.yaml`, no de inferir prose ni de parsear tablas de `forja-contenido.md` o `forja-proyectos.md`. Los documentos sirven como mapa humano del plan; `project.yaml` sirve como contrato estructurado para repo y web.

### Reglas de autoría y no duplicación

El modelo correcto de autoría es este:

- `docs/forja-contenido.md` define el plan curricular humano: qué existe, en qué orden cae y qué foco tiene cada nivel.
- `docs/forja-proyectos.md` consolida la taxonomía de proyectos, su ubicación curricular y sus arcos multi-fase.
- `content/theory/*/README.md` puede ser placeholder editorial o cuerpo real; `exercises.md` y `chapters/*.md` aparecen cuando la authoría real del nivel ya empezó.
- `content/projects/**/README.md` puede ser placeholder estructural o README real de proyecto; cada `phase-n/README.md`, `STUDY_GUIDE.md` e `IMPROVEMENTS.md` aparece recién cuando esa authoría ya existe.
- `metadata/levels.yaml`, `meta.yaml` y `project.yaml` contienen la estructura navegable y las dependencias reales. Si una relación importa para repo o web, debe vivir ahí y no solo en prose.
- `metadata/paths.yaml` y `metadata/cross-refs.yaml` contienen solo relaciones globales no derivables del contenido local.
- Cualquier índice agregado para acelerar build o búsqueda debe ser generado. Nunca editado a mano.

De estas reglas salen dos consecuencias prácticas:

- No se duplica el cuerpo de una unidad o de una fase en `docs/`. `docs/` describe el sistema y el plan; `content/` contiene el material que la web renderiza.
- No se duplican dependencias, stages o relaciones como fuente operativa en prose si ya existen en YAML. La prose explica; el YAML resuelve.

Si la web necesita un resumen corto para cards, listados o previews, hay solo dos opciones válidas:

- derivarlo del primer párrafo del Markdown correspondiente
- agregar un campo breve explícito en YAML y tratarlo como dueño único de ese resumen

Lo que no se hace es redactar el mismo resumen en tres lugares distintos.

---

## La web — React + TypeScript + Vite

### Rol de la web

La web convierte la estructura del repo en una experiencia de navegación. El usuario puede usar el repo directamente desde GitHub — la web no es requisito. Lo que la web agrega:

- Workspace navegable con mapa editorial en dos modos: niveles → proyectos y proyectos → niveles
- Navegación clickeable entre introducciones, niveles y proyectos
- Tracking de progreso local simple por nivel (`todo`, `reading`, `done`)
- Renderizado de Markdown/GFM tomado del repo

### Lo que la web no hace

- No tiene IDE integrada
- No ejecuta código
- No evalúa el trabajo del usuario
- No tiene login ni servidor

### Procesamiento en build time

Vite procesa el contenido en build time — los archivos Markdown y YAML se importan durante el build y el resultado es un sitio estático. El servidor no hace nada en runtime.

La separación correcta es esta:

- Markdown (`README.md`, `exercises.md`, `STUDY_GUIDE.md`, `IMPROVEMENTS.md`) es la fuente de verdad del cuerpo renderizado.
- `metadata/levels.yaml` es la fuente de verdad canónica para niveles.
- `meta.yaml` y `project.yaml` son la fuente de verdad estructural local para cada carpeta de nivel o proyecto.
- `metadata/paths.yaml` y `metadata/cross-refs.yaml` complementan solo la parte relacional global.

```ts
// web/vite.config.ts — build-time readers
function readLevels(): LevelMeta[] {
  const levelsFile = join(repoRoot, 'metadata', 'levels.yaml')
  if (existsSync(levelsFile)) {
    const data = yaml.load(readFileSync(levelsFile, 'utf-8')) as { levels: LevelMeta[] }
    return (data?.levels ?? []).sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
  }

  // Fallback legacy si falta el catalogo canonico.
  return []
}
```

El renderer actual de la web es Markdown plano con GFM. Syntax highlighting avanzado, diagramas o includes automáticos de snippets son mejoras futuras del renderer, no una segunda fuente de contenido.

### Páginas y vistas de la web

| Ruta | Descripción |
|---|---|
| `/` | Landing editorial: qué es Forja, cómo empezar, preview de proyectos y caminos |
| `/workspace` | Workspace principal: mapa del canon, intros editoriales y entrada al contenido |
| `/workspace?view=projects` | Mismo workspace con el mapa invertido por proyectos |
| `/workspace/intro/:id` | Introducciones editoriales previas a L0 |
| `/workspace/level/:id` | Vista de un nivel — teoría, ejercicios y proyectos asociados |
| `/workspace/project/:id` | Vista de un proyecto — ficha, README raíz y niveles relacionados |

### Routing

React Router v6 con una landing y un workspace unificado. La navegación interna del workspace preserva el `search` de la URL para no perder contexto liviano; hoy eso se usa, por ejemplo, para persistir el modo del mapa con `?view=projects`.

### Tracking de progreso en localStorage

El estado de progreso se almacena en localStorage con la siguiente estructura:

```ts
interface Progress {
  completed: string[]
  reading: string[]
}
```

Hoy ese estado es deliberadamente simple: solo guarda ids de niveles marcados como `done` o `reading`. No existe todavía progreso fino por proyecto, fase ni mejora propuesta.

### Visualización del mapa

La vista principal de `/workspace` no dibuja hoy un force graph ni aristas explícitas. Usa una representación editorial en cards, derivada de `metadata/levels.yaml` y `project.yaml`.

Los dos modos actuales son:

- niveles → proyectos: cards de nivel agrupadas por dominio
- proyectos → niveles: cards de proyecto agrupadas por tipo

La relación entre teoría y práctica se comunica por asociación estructural y navegación, no por líneas dibujadas en pantalla.

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
- `linux-headers` (para el bloque kernel de `L56-L57`)
- `liburing-dev` (para `L50` y `io_uring-echo`)
- `libseccomp-dev` (para `L51` y `minidocker`)

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

El proyecto `devcontainer-setup` (L0) incluye un script de verificacion pensado para ejecutarse dentro del devcontainer o del laboratorio Linux reproducible. No es un chequeo general del host de Windows.

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
| Plan curricular humano | `docs/forja-contenido.md` + `docs/forja-proyectos.md` | Contexto y navegación, no cuerpo docente renderizado |
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

1. `L0` + `devcontainer-setup`
2. `L1` hasta `L7` para cerrar la base de laboratorio, modelo mental, tooling y assembly
3. `L8` hasta `L21` con los proyectos focalizados que cada nivel ya habilita en el catálogo visible
4. `mish` (tramo `L21`) como primer integrador usable
5. `L31` + `mish` (tramo `L31`) para cerrar pipes, redirecciones y job control

Este orden permite betatestear el curso real sin apartarse de la secuencia de `forja-construccion.md`. Cada bloque nuevo se valida recorriéndolo como usuario, no solo leyéndolo como autor.

### MVP como criterio, no como lista cerrada

El MVP no queda fijado todavía como un conjunto definitivo de niveles. El criterio correcto es este: Forja tiene MVP cuando las fases base y una ruta corta, coherente y autocontenida de fases de nivel y de proyecto pueden recorrerse end-to-end desde `L0` hasta un primer proyecto integrador útil, con repo, web y laboratorio funcionando como sistema único.

### Web del MVP

La web del MVP ya debería resolver, como mínimo, lo esencial de lectura y navegación:

- Home page con qué es Forja y cómo empezar
- Workspace unificado con mapa en dos modos y navegación a intros, niveles y proyectos
- Render de niveles y proyectos desde Markdown local
- Links claros entre teoría y proyectos
- Deploy estático en GitHub Pages o Vercel

La búsqueda full-text, el tracking fino por proyecto/fase y cualquier grafo con aristas explícitas pueden existir después. Arquitectónicamente son extensiones naturales, pero no son requisito de la primera versión usable.

---

## Preguntas de diseño abiertas

| Pregunta | Opciones | Impacto |
|---|---|---|
| Evolución del mapa en `/workspace` | Mantener cards editoriales vs pasar a un grafo con aristas explícitas | Medio — afecta complejidad y legibilidad |
| Router React | Mantener React Router v6 vs migrar si el workspace gana loaders más complejos | Bajo — decisión reversible |
| Markdown rendering | MDX vs remark/rehype plano | Bajo — ambos funcionan bien con Vite |
| Design system / UI | Tailwind + Radix UI vs shadcn/ui vs CSS modules custom | Medio — afecta velocidad de desarrollo |
| Despliegue inicial | GitHub Pages vs Vercel | Bajo — ambos son gratuitos para este caso |
| ¿Conviene modelar progreso por proyecto/fase además del progreso por nivel? | Mantener estado simple vs ampliar localStorage | Alto — afecta UX y persistencia |
| ¿Las mejoras propuestas de una fase desbloquean la siguiente? | Opcionales vs requeridas | Alto — afecta el modelo pedagógico completo |
