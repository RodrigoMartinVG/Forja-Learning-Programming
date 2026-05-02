# Forja — Dinámica de Construcción

> Este documento define cómo se construye Forja en la práctica. No describe el contenido curricular en sí ni la arquitectura técnica detallada de la web o del repo: describe el orden de trabajo, la unidad de avance, cómo se verifica cada paso y cómo se usa el propio curso como mecanismo de betatesting mientras nace.

---

## 1. Enfoque adoptado

El enfoque de construcción de Forja debe ser simple de explicar, simple de verificar y simple de ejecutar.

La regla base es esta:

- primero existen unas pocas fases previas para dejar listas las bases del proyecto
- después se construyen los niveles uno por uno
- después de cada nivel, se construyen los proyectos que ese nivel deja efectivamente habilitados
- si un proyecto vuelve a abrirse más adelante por depender de otro nivel, eso aparece como una nueva fase de proyecto en el punto correspondiente

La unidad de avance pasa a ser una **fase lineal** con foco explícito.

La separación correcta de fuentes es esta:

- `docs/forja-contenido.md` fija el orden humano del plan: niveles, foco curricular y tabla de proyectos como mapa legible.
- `meta.yaml` y `project.yaml` fijan el orden operativo: prerequisitos reales, niveles visibles, tramos y reaperturas de proyecto.

Con esas dos capas, el orden maestro de construcción puede fijarse desde ahora mismo sin depender de prose suelta ni de decisiones tomadas a ojo.

---

## 2. Tipos de fase

Hay tres tipos de fase:

- **fase base**: prepara la infraestructura general del proyecto
- **fase de nivel**: el foco principal es un nivel del plan
- **fase de proyecto**: el foco principal es un proyecto concreto

### 2.1 Fase base

Una fase base no está centrada ni en un nivel ni en un proyecto del currículo. Su función es dejar listas las condiciones de posibilidad del trabajo posterior.

Incluye cosas como:

- estructura del repo
- devcontainer
- plantillas de contenido
- metadata base
- web mínima

Son pocas y van al comienzo.

La más importante para el orden del plan es la fase base que deja sembrada la metadata local del contenido: `meta.yaml` en cada nivel y `project.yaml` en cada proyecto, incluso si el contenido completo todavía no fue producido.

### 2.2 Fase de nivel

Una fase de nivel toma un nivel completo del plan y lo deja utilizable.

Incluye:

- teoría del nivel
- ejemplos de código de la unidad
- ejercicios
- `meta.yaml`
- integración del nivel con la web y la metadata global

Una fase de nivel se considera cerrada cuando un usuario puede leer el nivel completo y entender con claridad qué proyectos quedan habilitados después de ese nivel.

### 2.3 Fase de proyecto

Una fase de proyecto toma un proyecto concreto y lo construye en el punto exacto en que ya tiene sentido hacerlo.

Incluye:

- código de la fase o del tramo del proyecto
- tests y fixtures
- `README.md`
- `STUDY_GUIDE.md`
- `IMPROVEMENTS.md`
- `project.yaml`
- links desde los niveles que preparan esa fase

Una fase de proyecto se abre solo cuando el conjunto de niveles ya construidos la hace pedagógica y técnicamente razonable.

---

## 3. Regla general de orden

El orden de las fases sigue esta lógica fija:

1. primero se ejecutan las fases base
2. después se recorren los niveles en orden canónico: `L0`, `L1a`, `L1b`, `L2`, `L3a`, `L3b`, `L4`, `L5`, `L6`, `L7`, `L8`, `L9`, `L10`, `L11`, `L12`, `L13`, `L14`, `L15`, `L16`, `L17`, `L18`, `L19`, `L20`, `L21`, `L22`, `L23`
3. después de cerrar cada fase de nivel, se ejecutan todas las fases de proyecto que ese nivel deja habilitadas
4. no se abre una fase nueva mientras la fase actual no esté cerrada y verificada

Para evitar ambigüedad, `L1a` y `L1b` cuentan como dos fases de nivel distintas; lo mismo vale para `L3a` y `L3b`.

### 3.1 Qué significa “queda habilitado”

Un proyecto queda habilitado cuando, con los niveles ya construidos, ya tiene sentido producirlo como pieza del curso.

Eso no se decide a ojo ni leyendo prose suelta: se decide leyendo `project.yaml` del proyecto correspondiente.

En los casos simples, esto coincide con su nivel de anclaje:

- `spl_stat` queda habilitado después de `L5`
- `thread-pool` queda habilitado después de `L9`
- `minidocker` queda habilitado después de `L20`

En los proyectos multi-nivel, la construcción vuelve a abrir una fase de proyecto cuando aparece un nuevo tramo claramente asociado a un nivel posterior. En la especificación actual, eso ocurre así:

- `mini-debugger`: tramo `L6`, luego tramo `L7`
- `mish`: tramo `L6`, luego tramo `L11`
- `Semtex`: tramo `L12`, luego `L13`, luego `L14`
- `Lógico`: tramo `L12`, luego `L13`, luego `L14`, luego `L22`
- `TCP/IP stack`: tramo `L16`, luego `L21`

No toda mención de un proyecto a otro nivel implica una fase nueva de construcción. A veces ese nivel solo aporta prerequisitos o contexto. El ejemplo más claro es `Lógico`: `L8` aporta el allocator que después usa el GC, pero no obliga a abrir una fase de proyecto `Lógico` antes de que exista el propio intérprete.

---

## 4. Qué se entrega en cada fase

### 4.1 En una fase base

Cada fase base debe entregar una mejora real en la infraestructura común:

- repo más estable
- tooling más completo
- plantillas más claras
- metadata base o navegación base funcionando

### 4.2 En una fase de nivel

Cada fase de nivel debe entregar:

- `README.md` del nivel terminado
- ejemplos de `src/`
- ejercicios del nivel
- `meta.yaml`
- rutas y links del nivel funcionando en la web

### 4.3 En una fase de proyecto

Cada fase de proyecto debe entregar:

- fase ejecutable del proyecto o del tramo del proyecto
- tests razonables
- guía de estudio
- mejoras propuestas
- integración del proyecto con la web y con los niveles relacionados

### 4.4 En todos los casos

Toda fase, sea base, de nivel o de proyecto, debe cerrar además:

- metadata coherente
- navegación web sin enlaces rotos
- comandos documentados que realmente funcionen
- un pequeño betatest del recorrido real

---

## 5. Orden maestro de fases

Con las reglas actuales, el plan macro queda así:

- **3 fases base**
- **26 fases de nivel** (`L0`, `L1a`, `L1b`, `L2`, `L3a`, `L3b`, `L4`, `L5`, `L6`, `L7`, `L8`, `L9`, `L10`, `L11`, `L12`, `L13`, `L14`, `L15`, `L16`, `L17`, `L18`, `L19`, `L20`, `L21`, `L22`, `L23`)
- **76 fases de proyecto**

Eso da un total de **105 fases de construcción** a nivel maestro. Las subfases internas de cada proyecto no cuentan acá: pertenecen a la implementación del proyecto, no al orden macro de construcción del repositorio.

### 5.1 Fases base

**Base 0** — estructura inicial del repo y convenciones de contenido.

**Base 1** — devcontainer, script de verificación y tooling común.

**Base 2** — metadata base, plantillas y web mínima capaz de renderizar y navegar contenido.

El alcance concreto de `Base 2` debería incluir:

- crear `meta.yaml` en cada carpeta de nivel
- crear `project.yaml` en cada carpeta de proyecto
- dejar cargados, al menos, estos campos en cada `project.yaml`: `anchor_level`, `display_levels`, `required_levels`, `expansion_levels`, `stages`
- dejar la web preparada para leer esos archivos aunque todavía haya proyectos sin implementación completa

### 5.2 Orden maestro por nivel

Después de las fases base, el orden queda fijado así:

| Después de construir este nivel | Se construyen estas fases de proyecto |
|---|---|
| `L0` | `devcontainer-setup` |
| `L1a` | `hello-c`, `caesar-cipher`, `word-count` |
| `L1b` | `stringlib`, `elf-explorer` |
| `L2` | `getopt-impl`, `dynamic-array` |
| `L3a` | `hello-rust`, `fizzbuzz-rust`, `mini-calculator` |
| `L3b` | `data-structures-rust` |
| `L4` | `custom-iterator`, `parser-combinators`, `ffi-demo` |
| `L5` | `spl_stat`, `spl_ls`, `spl_du`, `file-monitor` |
| `L6` | `spl_pstree`, `impl_abort`, `impl_alarm`, `scheduler-sim`, `mini-debugger` (tramo `L6`), `mish` (tramo `L6`) |
| `L7` | `vma-explorer`, `cow-demo`, `spl_cp`, `mini-linker`, `mini-debugger` (tramo `L7`) |
| `L8` | `custom-malloc` |
| `L9` | `thread-pool`, `prod-cons`, `rwlock-impl` |
| `L10` | `impl_arc`, `lock-free-queue`, `rcu-demo` |
| `L11` | `named-pipe-sem`, `ipc-explorer`, `miniqueue`, `mish` (tramo `L11`) |
| `L12` | `regex-engine`, `expr-parser`, `Semtex` (tramo `L12`), `Lógico` (tramo `L12`) |
| `L13` | `Semtex` (tramo `L13`), `Lógico` (tramo `L13`) |
| `L14` | `Semtex` (tramo `L14`), `Lógico` (tramo `L14`) |
| `L15` | `KVolt`, `MiniSQL` |
| `L16` | `HTTP server`, `shell remoto TCP`, `minisync`, `mini-dns-resolver`, `mini-tcpdump`, `http2-server`, `websocket-server`, `TCP/IP stack` (tramo `L16`) |
| `L17` | `perf-benchmarks`, `flamegraph-lab`, `cache-locality-exp`, `false-sharing-exp` |
| `L18` | `tinyssh`, `impl_script` |
| `L19` | `async-runtime`, `io_uring-echo` |
| `L20` | `minidocker` |
| `L21` | `orquestador`, `TCP/IP stack` (tramo `L21`) |
| `L22` | `JIT-Brain`, `Lógico` (tramo `L22`) |
| `L23` | `char-driver`, `RAM-FileSystem`, `KVM mini-hypervisor`, `ebpf-tracer` |

### 5.3 Notas sobre el orden maestro

- La tabla anterior fija el orden macro de construcción.
- Las subfases internas de proyectos como `custom-malloc`, `KVolt`, `MiniSQL`, `tinyssh` o `async-runtime` existen, pero viven dentro de su fase de proyecto correspondiente.
- El revisit opcional del `HTTP server` en `L19` para `io_uring` no está contado como fase macro obligatoria. Si se decide hacerlo, se agrega como fase opcional posterior a `io_uring-echo`.
- La resolución de dependencias no sale de la tabla humana del documento curricular sino del `project.yaml` guardado dentro de cada proyecto. La tabla sirve para lectura; la metadata local sirve para construir y navegar.

Este es el orden maestro de trabajo. Si se respeta, la construcción siempre puede describirse de forma sencilla: nivel recién cerrado, proyectos recién habilitados, y siguiente fase claramente visible.

---

## 6. Cómo se trabaja cada fase

Cada fase, sea base, de nivel o de proyecto, debería construirse con la misma secuencia operativa.

### Paso 1 — Definir el foco de la fase

La fase debe declarar una sola cosa como foco principal:

- o una base
- o un nivel
- o un proyecto

Si la fase intenta cerrar demasiadas cosas a la vez, ya se volvió difícil de verificar.

### Paso 2 — Preparar el esqueleto

Se crean o actualizan carpetas, `meta.yaml`, `project.yaml`, `README.md` y rutas mínimas. La idea es que el contenido nuevo exista pronto en el repo y pueda conectarse temprano con la web.

En proyectos, esto incluye mantener actualizado el `project.yaml` con las dependencias reales de niveles y con los tramos del proyecto que el orden maestro usa para habilitarlo.

### Paso 3 — Terminar el contenido principal

Si es una fase base, se termina la pieza de infraestructura correspondiente.

Si es una fase de nivel, se termina solo el nivel: teoría, ejemplos, ejercicios, metadata y su presencia correcta en la web.

Si es una fase de proyecto, se termina la pieza ejecutable del proyecto y luego su guía, mejoras y tests.

### Paso 4 — Integrar metadata y web

Con el contenido ya presente, se actualiza lo necesario para que el nuevo material aparezca correctamente en navegación, paths y referencias cruzadas.

### Paso 5 — Betatestear la fase

Se recorre la fase como usuario real:

1. entrar por el README principal o por la web
2. leer el nivel o la documentación de la fase del proyecto
3. ir al código correcto sin ambigüedad
4. correr tests o comandos de validación
5. seguir la guía de estudio
6. comprobar que el siguiente paso del recorrido es obvio

### Paso 6 — Cerrar observaciones

No se abre la fase siguiente hasta cerrar las observaciones de la fase actual. Si no, la secuencia deja de ser fácil de verificar.

---

## 7. Qué significa que una fase está terminada

Una fase se considera terminada solo si cumple todo esto:

- el foco de la fase quedó realmente cerrado
- el contenido principal está escrito
- el código asociado compila o corre correctamente
- hay tests razonables
- la guía de estudio existe donde corresponde
- la web y la metadata reflejan ese contenido sin enlaces rotos
- la fase fue betatesteada como recorrido real

Si falta cualquiera de esas piezas, la fase no está terminada: a lo sumo está avanzada parcialmente.

---

## 8. Qué se betatestea en cada iteración

El betatesting no debe limitarse a “ver si el código corre”. Hay que revisar cuatro cosas:

### 8.1 Claridad pedagógica

- ¿El orden de lectura tiene sentido?
- ¿La teoría realmente prepara para el proyecto?
- ¿La guía de estudio ayuda o repite lo obvio?

### 8.2 Calidad técnica

- ¿El código compila y pasa tests?
- ¿Los comandos documentados funcionan tal como están escritos?
- ¿Las dependencias del entorno están completas?

### 8.3 Coherencia de navegación

- ¿La web y el repo cuentan la misma historia?
- ¿Los links entre nivel, proyecto y fase son obvios?
- ¿Hay metadata faltante o inconsistente?

### 8.4 Calidad de la experiencia real

- ¿El usuario sabe siempre cuál es el siguiente paso?
- ¿Hay demasiada fricción entre leer, correr y modificar código?
- ¿La fase se siente como un pedazo real de curso o como piezas sueltas?

---

## 9. Cómo conviven repo y web durante la construcción

El repo es el sistema fuente. La web es la interfaz de lectura y navegación.

Eso implica estas reglas:

- primero existe el contenido en el repo
- la web nunca inventa contenido que no exista en archivos reales
- la metadata no duplica información si puede derivarse del contenido local
- las features de la web se agregan cuando sirven para recorrer fases ya existentes, no como desarrollo aislado

La web debe crecer empujada por necesidades del contenido, no por una agenda separada de frontend.

---

## 10. Qué no conviene hacer

- No abrir varias fases en paralelo si después no se pueden cerrar y verificar
- No acumular niveles sin construir después los proyectos que dejaron habilitados
- No abrir fases de proyectos antes de que sus niveles previos estén realmente listos
- No invertir demasiado temprano en features de web que todavía no ayudan a recorrer fases reales
- No considerar “avance” a la mera creación de placeholders sin betatesting posterior

---

## 11. Criterio práctico de MVP

Forja tiene MVP cuando se cumplen estas tres condiciones al mismo tiempo:

1. Existe una secuencia corta pero completa de fases que un usuario puede recorrer de punta a punta
2. Esa secuencia incluye niveles, proyectos asociados y un integrador útil
3. Repo, web y laboratorio funcionan juntos como un único sistema de aprendizaje

En la estrategia actual, el primer candidato serio a MVP es completar esta primera secuencia del orden maestro:

`Base 0 → Base 1 → Base 2 → L0 → devcontainer-setup → L1a → hello-c → caesar-cipher → word-count → L1b → stringlib → elf-explorer → L2 → getopt-impl → dynamic-array → L5 → spl_stat → spl_ls → spl_du → file-monitor → L6 → spl_pstree → impl_abort → impl_alarm → scheduler-sim → mini-debugger (tramo L6) → mish (tramo L6) → L7 → vma-explorer → cow-demo → spl_cp → mini-linker → mini-debugger (tramo L7) → L11 → named-pipe-sem → ipc-explorer → miniqueue → mish (tramo L11)`

Eso equivale, en contenido, a esta primera ruta:

`L0 → L1a → L1b → L2 → L5 → L6 → L7 → L11`, con `mish` y `mini-debugger` abiertos en sus puntos naturales.

No porque sea la única posible, sino porque es la primera que produce una experiencia de Forja claramente defendible como producto y, además, es fácil de verificar fase por fase siguiendo el orden maestro.

---

## 12. Qué pasa después del primer MVP

Una vez que exista esa primera ruta completa, hay tres opciones sanas de expansión:

- seguir con el orden maestro ya fijado y continuar por `L8`, `L9`, `L10`, `L12`, `L13`, `L14`, ...
- o, si se decide un corte de MVP antes, congelar publicación y retomar después exactamente donde el orden maestro quedó pausado
- o priorizar un subconjunto del orden maestro para acelerar una primera publicación, sin cambiar la regla general de construcción

La decisión correcta dependerá menos de preferencia teórica y más de qué tan bien haya funcionado la primera secuencia en el betatesting real.