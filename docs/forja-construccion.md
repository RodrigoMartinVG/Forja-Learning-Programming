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

- `docs/forja-contenido.md` fija el orden humano del plan: niveles, bloques, foco curricular y caminos de navegación.
- `docs/forja-proyectos.md` consolida la taxonomía, la tabla completa de proyectos y sus arcos multi-fase.
- `metadata/levels.yaml` y `project.yaml` fijan el orden operativo: prerequisitos reales, niveles visibles, tramos y reaperturas de proyecto.
- `meta.yaml` replica por carpeta la metadata estructural de cada nivel para mantener el contenido autocontenido.

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

La más importante para el orden del plan es la fase base que deja sembrada la metadata canónica del contenido: `metadata/levels.yaml` para niveles, `meta.yaml` como espejo local en cada carpeta de nivel y `project.yaml` en cada proyecto, incluso si el contenido completo todavía no fue producido.

### 2.2 Fase de nivel

Una fase de nivel toma un nivel completo del plan y lo deja utilizable.

Incluye:

- teoría del nivel
- ejemplos de código de la unidad
- ejercicios
- `metadata/levels.yaml`
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
2. después se recorren los niveles en orden canónico: `L0` a `L49`
3. después de cerrar cada fase de nivel, se ejecutan todas las fases de proyecto que ese nivel deja habilitadas
4. no se abre una fase nueva mientras la fase actual no esté cerrada y verificada

El rediseño actual ya no usa subniveles como `L1a`/`L1b` o `L3a`/`L3b`: cada nivel del orden maestro es una fase de nivel autónoma.

### 3.1 Qué significa “queda habilitado”

Un proyecto queda habilitado cuando, con los niveles ya construidos, ya tiene sentido producirlo como pieza del curso.

Eso no se decide a ojo ni leyendo prose suelta: se decide leyendo `project.yaml` del proyecto correspondiente.

En los casos simples, esto coincide con su nivel de anclaje:

- `spl_stat` queda habilitado después de `L19`
- `thread-pool` queda habilitado después de `L25`
- `minidocker` queda habilitado después de `L44`

En los proyectos multi-nivel, la construcción vuelve a abrir una fase de proyecto cuando aparece un nuevo tramo claramente asociado a un nivel posterior. En la especificación actual, eso ocurre así:

- `mini-debugger`: tramo `L20`, luego tramo `L22`
- `mish`: tramo `L20`, luego `L28`, luego `L29`, luego `L31`
- `Semtex`: tramo `L31`, luego `L32`, luego `L34`
- `Lógico`: tramo `L31`, luego `L32`, luego `L34`, luego `L47`
- `HTTP server`: tramo `L40`, luego `L41`, y opcionalmente `L43`
- `TCP/IP stack`: tramo `L41`, luego `L45`
- `mem-cache`: proyecto independiente con tramo `L37`, luego `L43`, y opcionalmente `L46`
- `mini-broker`: proyecto independiente con tramo `L38`, luego `L43`, y opcionalmente `L46`

No toda mención de un proyecto a otro nivel implica una fase nueva de construcción. A veces ese nivel solo aporta prerequisitos o contexto. El ejemplo más claro sigue siendo `Lógico`: `L24` aporta el allocator que después usa el GC, pero no obliga a abrir una fase de proyecto `Lógico` antes de que exista el propio intérprete.

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
- **50 fases de nivel** (`L0` a `L49`)
- **fases de proyecto derivadas de `project.yaml`**, con reaperturas explícitas cuando un proyecto tenga `stages` o tramos posteriores

Las subfases internas de cada proyecto no cuentan acá: pertenecen a la implementación del proyecto, no al orden macro de construcción del repositorio. La cifra exacta de fases de proyecto se deja derivada de metadata para evitar que el documento vuelva a desfasarse cuando cambie el número de reaperturas obligatorias u opcionales.

### 5.1 Fases base

**Base 0** — estructura inicial del repo y convenciones de contenido.

**Base 1** — devcontainer, script de verificación y tooling común.

**Base 2** — metadata base, plantillas y web mínima capaz de renderizar y navegar contenido.

El alcance concreto de `Base 2` debería incluir:

- crear `metadata/levels.yaml` con el catálogo canónico `L0-L49`
- crear `meta.yaml` en cada carpeta de nivel
- crear `project.yaml` en cada carpeta de proyecto
- dejar cargados, al menos, estos campos en cada `project.yaml`: `anchor_level`, `display_levels`, `required_levels`, `expansion_levels`, `stages`
- dejar la web preparada para leer esos archivos aunque todavía haya proyectos sin implementación completa

### 5.2 Orden maestro por nivel

Después de las fases base, el orden queda fijado así:

| Después de construir este nivel | Se construyen estas fases de proyecto |
|---|---|
| `L0` | `devcontainer-setup` |
| `L8` | `hello-c`, `caesar-cipher`, `word-count` |
| `L9` | `stringlib` |
| `L10` | `dynamic-array` |
| `L11` | `elf-explorer` |
| `L12` | `getopt-impl` |
| `L14` | `hello-rust`, `fizzbuzz-rust`, `mini-calculator` |
| `L15` | `data-structures-rust` |
| `L16` | `custom-iterator`, `parser-combinators` |
| `L18` | `ffi-demo` |
| `L19` | `spl_stat`, `spl_ls`, `spl_du`, `file-monitor` |
| `L20` | `spl_pstree`, `impl_abort`, `impl_alarm`, `mish` (tramo `L20`), `mini-debugger` (tramo `L20`) |
| `L21` | `scheduler-sim` |
| `L22` | `vma-explorer`, `cow-demo`, `spl_cp`, `mini-debugger` (tramo `L22`) |
| `L23` | `mini-linker` |
| `L24` | `custom-malloc` (tramo `L24`) |
| `L25` | `thread-pool`, `prod-cons`, `rwlock-impl` |
| `L27` | `impl_arc`, `lock-free-queue`, `rcu-demo` |
| `L28` | `named-pipe-sem`, `ipc-explorer`, `miniqueue`, `mish` (tramo `L28`) |
| `L29` | `mish` (tramo `L29`) |
| `L30` | `regex-engine` |
| `L31` | `expr-parser`, `Semtex` (tramo `L31`), `Lógico` (tramo `L31`), `mish` (tramo `L31`) |
| `L32` | `Semtex` (tramo `L32`), `Lógico` (tramo `L32`) |
| `L34` | `Semtex` (tramo `L34`), `Lógico` (tramo `L34`) |
| `L35` | `KVolt` (tramo `L35`) |
| `L36` | `MiniSQL`, `KVolt` (tramo `L36`) |
| `L37` | `mem-cache` (tramo `L37`) |
| `L38` | `mini-broker` (tramo `L38`) |
| `L39` | `perf-benchmarks`, `flamegraph-lab`, `cache-locality-exp`, `false-sharing-exp`, `custom-malloc` (tramo `L39`), `KVolt` (tramo `L39`) |
| `L40` | `HTTP server` (tramo `L40`), `shell remoto TCP`, `minisync` (tramo `L40`), `tinyssh` (tramo `L40`) |
| `L41` | `mini-dns-resolver`, `mini-tcpdump`, `websocket-server`, `http2-server`, `HTTP server` (tramo `L41`), `minisync` (tramo `L41`), `TCP/IP stack` (tramo `L41`) |
| `L42` | `impl_script`, `tinyssh` (tramo `L42`) |
| `L43` | `async-runtime`, `io_uring-echo`, `HTTP server` (tramo opcional `L43`), `mem-cache` (tramo `L43`), `mini-broker` (tramo `L43`) |
| `L44` | `minidocker` |
| `L45` | `orquestador`, `TCP/IP stack` (tramo `L45`) |
| `L46` | `raft-lite`, `KVolt` (tramo opcional `L46`), `mem-cache` (tramo opcional `L46`), `mini-broker` (tramo opcional `L46`) |
| `L47` | `JIT-Brain`, `Lógico` (tramo `L47`) |
| `L48` | `char-driver`, `ebpf-tracer` |
| `L49` | `RAM-FileSystem`, `KVM mini-hypervisor` |

### 5.3 Notas sobre el orden maestro

- La tabla anterior fija el orden macro de construcción.
- `L1-L7`, `L13`, `L17`, `L26` y `L33` no abren una fase macro de proyecto nueva: profundizan base teórica o expanden proyectos ya abiertos.
- `mem-cache`, `mini-broker` y `raft-lite` se tratan como proyectos independientes. No son subfases de `KVolt` ni de `orquestador`, aunque puedan interoperar con ellos en tramos posteriores.
- Las subfases internas de proyectos como `custom-malloc`, `KVolt`, `MiniSQL`, `tinyssh` o `async-runtime` existen, pero viven dentro de su fase de proyecto correspondiente.
- El revisit opcional del `HTTP server` en `L43` para `io_uring` no está contado como fase macro obligatoria. Si se decide hacerlo, se agrega como tramo explícito en `project.yaml` posterior a `io_uring-echo`.
- Del mismo modo, los tramos de replicación en `L46` para `KVolt`, `mem-cache` y `mini-broker` solo cuentan como fases macro si quedan marcados como obligatorios en `project.yaml`.
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

En la estrategia actual, el primer candidato serio a MVP es completar esta primera secuencia editorialmente defendible del plan:

`Base 0 → Base 1 → Base 2 → L0 → devcontainer-setup → L1 → L2 → L3 → L4 → L5 → L6 → L7 → L8 → hello-c → caesar-cipher → word-count → L9 → stringlib → L10 → dynamic-array → L11 → elf-explorer → L12 → getopt-impl → L19 → spl_stat → spl_ls → spl_du → file-monitor → L20 → spl_pstree → impl_abort → impl_alarm → mish (tramo L20) → mini-debugger (tramo L20) → L21 → scheduler-sim → L22 → vma-explorer → cow-demo → spl_cp → mini-debugger (tramo L22) → L23 → mini-linker → L28 → named-pipe-sem → ipc-explorer → miniqueue → mish (tramo L28)`

Eso equivale, en contenido, a esta primera ruta:

`L0 → L1 → L2 → L3 → L4 → L5 → L6 → L7 → L8 → L9 → L10 → L11 → L12 → L19 → L20 → L21 → L22 → L23 → L28`, con `mish` y `mini-debugger` abiertos en sus primeros tramos naturales.

No porque sea la única posible, sino porque es la primera que produce una experiencia de Forja claramente defendible como producto y, además, es fácil de verificar fase por fase siguiendo el orden maestro.

---

## 12. Qué pasa después del primer MVP

Una vez que exista esa primera ruta completa, hay tres opciones sanas de expansión:

- retomar el orden canónico en el primer nivel todavía no construido del plan general; en el recorte de MVP propuesto, eso significa volver a `L13` y continuar desde ahí
- o, si se decide un corte de MVP antes, congelar publicación y retomar después exactamente donde el orden maestro quedó pausado
- o priorizar un subconjunto del orden maestro para acelerar una primera publicación, sin cambiar la regla general de construcción

La decisión correcta dependerá menos de preferencia teórica y más de qué tan bien haya funcionado la primera secuencia en el betatesting real.