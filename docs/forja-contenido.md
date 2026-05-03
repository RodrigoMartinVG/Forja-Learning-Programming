# Forja — Contenido Curricular

> Este documento define el plan curricular humano de Forja: qué se enseña, en qué orden, con qué foco, cómo se relacionan los niveles entre sí y qué densificaciones ya forman parte del canon visible, aunque todavía sigan en placeholder dentro de `content/`.
>
> El catálogo consolidado de proyectos vive en `forja-proyectos.md`. La arquitectura técnica del repo y de la web vive en `forja-arquitectura.md`. La dinámica operativa de construcción vive en `forja-construccion.md`.

---

## Índice

- [1. Qué es Forja](#1-qué-es-forja)
- [2. La persona que usa Forja](#2-la-persona-que-usa-forja)
- [3. Cómo se organiza el plan](#3-cómo-se-organiza-el-plan)
- [4. Filosofía del rediseño](#4-filosofía-del-rediseño)
- [5. Mapa general de bloques](#5-mapa-general-de-bloques)
- [6. Los niveles del plan: L0-L57](#6-los-niveles-del-plan-l0-l57)
- [7. C y Rust como ciudadanos de primera clase](#7-c-y-rust-como-ciudadanos-de-primera-clase)
- [8. El modelo de aprendizaje con código dado](#8-el-modelo-de-aprendizaje-con-código-dado)
- [9. Caminos posibles de navegación](#9-caminos-posibles-de-navegación)
- [10. Bibliografía](#10-bibliografía)

---

## 1. Qué es Forja

Forja es una plataforma de aprendizaje de programación de sistemas centrada en C, Rust, sistemas operativos, compiladores, redes, persistencia, virtualización y herramientas de bajo nivel.

No es un curso lineal de videos. No es una colección de ejercicios sueltos. No es una IDE en el navegador.

Es una experiencia de formación construida sobre tres pilares:

- niveles teóricos con foco único y progresión explícita
- proyectos focalizados e integradores que materializan la teoría
- una narrativa que conecta lenguajes, sistemas, compiladores y herramientas reales

El objetivo no es "aprender a programar" en abstracto. El objetivo es construir una comprensión profunda de cómo funcionan los sistemas reales y llegar a implementar partes reconocibles de ellos.

---

## 2. La persona que usa Forja

Quien entra a Forja ya sabe programar en algún lenguaje. Entiende funciones, tipos básicos, estructuras de control y puede leer código con soltura. Pero todavía no domina programación de sistemas, no conoce C o Rust en profundidad, no ha escrito un shell, un allocator, un parser, un runtime asíncrono o un componente de kernel.

Le interesa entender qué hay debajo de los frameworks. Quiere proyectos reales, no acertijos. Está dispuesto a invertir tiempo y a moverse entre teoría, código, debugging y lectura técnica.

El plan asume familiaridad previa con estructuras de datos y algoritmos fundamentales:

- listas enlazadas
- árboles binarios de búsqueda
- tablas hash
- heaps
- notación asintótica básica

Las estructuras más específicas que el plan necesita y que no se asumen conocidas, como B-Trees, LSM-Trees, skip lists, árboles rojo-negro o union-find, se introducen en el nivel donde hacen falta.

---

## 3. Cómo se organiza el plan

Forja tiene dos tracks que coexisten y se referencian mutuamente:

### 3.1 Track teórico

El track teórico está compuesto por niveles. Cada nivel tiene un foco pedagógico único. La regla del rediseño es simple: una sola cosa importante por nivel. Si un nivel original mezclaba tres cosas de peso comparable, ahora son tres niveles.

Cada nivel incluye:

- tema y motivación
- desarrollo conceptual
- código de ilustración
- errores típicos
- referencias cruzadas
- lectura adicional

### 3.2 Track práctico

El track práctico está compuesto por proyectos focalizados e integradores. En este documento aparecen solo como referencia curricular. El catálogo detallado, la taxonomía y los arcos multi-fase viven en `forja-proyectos.md`.

### 3.3 Relación entre tracks

La relación no es "primero teoría y después práctica". Es una red de referencias bidireccionales:

- una unidad teórica apunta a los proyectos donde el concepto aparece de verdad
- un proyecto remite a los niveles que explican sus decisiones de diseño

El usuario puede recorrer el grafo en distintos órdenes, siempre que respete las dependencias reales.

### 3.4 Estado editorial actual

El mapa curricular completo de Forja ya es `L0-L57`. Esa secuencia es canónica aunque gran parte del contenido todavía no haya entrado en authoría real.

Hoy, dentro del track teórico, solo `L0` tiene outline y capítulos escritos como contenido real. El resto del canon puede seguir como placeholder mínimo sin perder validez curricular.

En el track práctico pasa algo análogo: el catálogo visible ya está fijado, pero solo `devcontainer-setup` tiene por ahora un `README.md` de proyecto escrito como documento real de recorrido y criterio de terminado.

---

## 4. Filosofía del rediseño

La versión nueva conserva lo esencial del plan anterior:

- los proyectos, casi todos
- la ciudadanía dual C/Rust
- la idea de código dado como punto de partida
- la navegación no lineal
- la bibliografía fuerte

Lo que cambia es la granularidad y el orden pedagógico.

Cambios estructurales principales:

- el antiguo L0 se expande a L0-L7 para separar entorno, máquina, representación, compilación, tooling y assembly
- el antiguo L4 se divide en L16, L17 y L18 para separar tipos/traits, errores/testing y FFI/OS
- C gana un nivel explícito de errores y testing en L13
- Rust gana un nivel explícito de errores y testing en L17
- concurrencia deja de comprimirse y pasa a L27-L30: usar primitivas, entender el hardware, resolver coordinación práctica y recién después diseñar lock-free
- el salto a compiladores se suaviza con el puente L32
- Hindley-Milner se divide en L36 y L37: práctica manual antes del algoritmo W
- SQL deja de ser un prerrequisito tácito y pasa a estar dentro de L42
- el arco de persistencia queda explícitamente estirado en L41-L44, con L43 y L44 dedicados a cachés, evicción, event logs y brokers durables antes de entrar en red
- Performance Engineering se mueve después del arco de persistencia local y antes de Redes para que el HTTP server, `mem-cache` y `mini-broker` se construyan ya con metodología de medición
- orquestación y consenso dejan de convivir en un mismo nivel y se separan en L52 y L53

Este rediseño lleva el plan de 26 niveles efectivos a 58 niveles canónicos con foco más fino, menor densidad por unidad y mejor continuidad conceptual.

La columna vertebral curricular visible ya es `L0-L57`. Las densificaciones aprobadas dejaron de vivir solo como notas: Rust systems avanzado, POSIX fino, concurrencia práctica, formatos y serialización, GC, runtimes/object layout/VMs, observabilidad distribuida y frontera user/kernel ya quedaron integrados al canon, aunque sigan en placeholder dentro de `content/`.

Mientras estas piezas no entren en turno de authoring, pueden seguir viviendo como placeholders mínimos. Ya no se tratan como ampliaciones tentativas: forman parte de la historia principal del mapa, pero no obligan a crear `outline.md`, `chapters/` ni contenido final por adelantado.

---

## 5. Mapa general de bloques

| Bloque | Niveles | Contenido |
|---|---|---|
| 0 | L0-L7 | Laboratorio, arquitectura, representación, compilación, observabilidad, assembly |
| 1 | L8-L13 | C como lenguaje |
| 2 | L14-L19 | Rust como lenguaje y Rust systems |
| 3 | L20-L26 | Sistemas POSIX |
| 4 | L27-L30 | Concurrencia |
| 5 | L31 | IPC |
| 6 | L32 | Puente sistemas → compiladores |
| 7 | L33-L37 | Compiladores |
| 8 | L38-L50 | Sistemas avanzados |
| 9 | L51-L53 | Virtualización y distribución |
| 10 | L54 | Compiladores avanzados |
| 11 | L55-L57 | Frontera user/kernel y kernel space |

### Capas y puentes ya integrados en el canon

| Pieza | Estado curricular | Ubicación pedagógica | Motivo principal |
|---|---|---|---|
| Rust systems avanzado | Integrado en el canon | `L19` | Hacer explícitos `Rc`, `Arc`, `Weak`, interior mutability, `Pin`, `Send`, `Sync` y wrappers seguros sobre primitivas inseguras |
| POSIX fino / Unix real | Integrado en el canon | `L22` | Descomprimir APIs avanzadas, PTY/TTY, redirecciones, `openat`/`fcntl` y la continuidad `poll` -> `epoll` |
| Concurrencia práctica intermedia | Integrado en el canon | `L29` | Dar entidad a channels, work queues, event dispatch y patrones no bloqueantes antes de lock-free |
| Formatos y serialización | Integrado en el canon | `L38` | Explicitar wire formats estables, versionado, compatibilidad y corrupción de datos |
| GC fundamental | Integrado en el canon | `L39` | Dar una exposición propia a roots, tracing, pausas y tradeoffs de recolección |
| Runtimes, object layout y VMs | Integrado en el canon | `L40` | Explicar la ejecución más allá del AST antes del async runtime |
| Observabilidad distribuida | Integrado en el canon | `L46` | Incorporar logs estructurados, correlation IDs, trazas y métricas de sistemas distribuidos |
| Frontera user/kernel | Integrado en el canon | `L55` | Explicitar syscall ABI, sandboxing, `seccomp`, `capabilities`, `prctl` y `setrlimit` |

---

## 6. Los niveles del plan: L0-L57

Nota editorial de esta sección: el mapa completo ya es canónico. Eso no implica authoría real nivel por nivel. Hoy solo `L0` existe como nivel escrito con outline y capítulos; el resto puede seguir como placeholder mínimo hasta que le llegue turno real de trabajo.

En cada nivel, la línea `Proyectos asociados` nombra solo asociaciones estructurales que hoy existen en `metadata/` y `content/projects/**`. Si una práctica todavía vive como ejercicio interno del nivel o como candidato documental, se dice explícitamente.

### Bloque 0 — El laboratorio y el modelo mental

#### L0 — Setup del laboratorio

Foco: tener un ambiente reproducible y verificado.

Temas centrales:

- devcontainer y laboratorio Linux
- verificación de toolchain C/Rust
- sanity checks de debugging y observabilidad
- estructura del repo

Proyectos asociados: `devcontainer-setup`.

#### L1 — Modelo mental de una computadora

Foco: entender CPU, memoria, registros y proceso antes de escribir sistemas.

Temas centrales:

- modelo de von Neumann
- ciclo fetch-decode-execute
- direcciones y registros
- código vs datos en memoria

Proyectos asociados hoy en repo: ninguno; unidad conceptual base.

#### L2 — Representación de la información

Foco: cómo viven los datos en hardware.

Temas centrales:

- bits, bytes, enteros y complemento a dos
- overflow con signo y sin signo
- hexadecimal y endianness
- intuición de floating point

Proyectos asociados hoy en repo: ninguno. La inspección binaria y la práctica de endianness siguen viviendo como ejercicios internos del nivel, no como proyectos canónicos separados.

#### L3 — El pipeline de compilación en C

Foco: dejar de tratar al compilador como caja negra.

Temas centrales:

- preprocesador, compilador, assembler y linker
- artefactos `.i`, `.s`, `.o` y ejecutable
- linking estático vs dinámico
- flags básicas y `make`

Proyectos asociados hoy en repo: ninguno. La compilación manual de `hello.c` se trabaja acá como práctica interna del nivel, no como proyecto canónico independiente.

#### L4 — El sistema de build de Rust

Foco: entender `cargo` como herramienta de build, test y dependencias.

Temas centrales:

- `cargo new`, `build`, `run`, `test`, `doc`
- `Cargo.toml` y `Cargo.lock`
- crates, workspaces y toolchains
- comparación explícita con el flujo de C

Proyectos asociados hoy en repo: ninguno. El crate mínimo con dependencia y tests funciona como práctica guiada del nivel, no como proyecto canónico aparte.

#### L5 — Herramientas de observabilidad I

Foco: leer warnings y usar debugger como herramienta permanente.

Temas centrales:

- `gdb` básico
- lectura de warnings
- memoria desde debugger
- `rust-analyzer`, `rustfmt`, `clang-format`, `clippy`

Proyectos asociados hoy en repo: ninguno. El debugging en C y Rust se ejercita dentro del nivel y reaparece más adelante como criterio de trabajo, no como proyecto propio.

#### L6 — Herramientas de observabilidad II

Foco: sanitizers, valgrind y strace como parte del flujo normal.

Temas centrales:

- ASan, UBSan, MSan y ThreadSanitizer
- valgrind memcheck
- `strace`
- preview de `perf` y flamegraphs

Proyectos asociados hoy en repo: ninguno. Sanitizers, valgrind y `strace` se practican aquí como diagnóstico guiado del nivel, no como proyecto canónico separado.

#### L7 — Alfabetización assembly

Foco: leer assembly generado por el compilador.

Temas centrales:

- registros x86-64 y calling convention System V
- stack frame, `call` y `ret`
- instrucciones mínimas para leer código compilado
- comparación `-O0` vs `-O2`

Proyectos asociados hoy en repo: ninguno. La lectura de `.s`, el stepping en `gdb` y la conexión con syscalls siguen siendo práctica interna del nivel.

### Bloque 1 — C como lenguaje

#### L8 — C: primer contacto

Foco: sintaxis, tipos básicos, control flow, arrays, strings e I/O.

Temas centrales:

- compilación básica con `gcc`
- tipos primitivos y scope
- funciones, arrays y strings terminados en `\0`
- I/O estándar

Proyectos asociados: `hello-c`, `caesar-cipher`, `word-count`.

#### L9 — C: punteros

Foco: punteros como aritmética de memoria.

Temas centrales:

- direcciones y desreferenciación
- aritmética de punteros
- relación entre arrays y punteros
- `void *`, `NULL`, punteros a punteros y a función

Proyectos asociados: `stringlib`.

#### L10 — C: estructuras, alineación y tipos compuestos

Foco: layout de datos en memoria.

Temas centrales:

- `struct`, `union` y `enum`
- padding, alineación y `offsetof`
- `const` correctness
- `restrict` como hint de no-aliasing

Proyectos asociados: `dynamic-array`.

#### L11 — C: preprocesador, linkage y undefined behavior

Foco: las capas invisibles que explican gran parte de la complejidad de C.

Temas centrales:

- macros y guards de inclusión
- `static`, `inline` y `extern`
- internal vs external linkage
- UB como contrato roto con el compilador

Proyectos asociados: `elf-explorer`.

#### L12 — C: memoria y gestión manual

Foco: stack, heap, ciclo de vida y errores clásicos de memoria.

Temas centrales:

- layout de un proceso
- `malloc`, `free`, `realloc`, `calloc`
- use-after-free, double-free y buffer overflow
- ownership convencional en C

Proyectos asociados: `getopt-impl`.

#### L13 — C: modelo de errores y testing

Foco: cómo se reportan fallos y cómo se testea código de sistemas en C.

Temas centrales:

- `errno`, `perror`, `strerror`
- patrones `NULL`, `-1` y `goto cleanup`
- `assert()` vs manejo real de errores
- golden files, fuzzing y sanitizers como suite

Proyectos asociados hoy en repo: ninguno. El nivel endurece `stringlib` y `dynamic-array` con testing explícito, pero sin abrir todavía un proyecto propio.

### Bloque 2 — Rust como lenguaje

#### L14 — Rust: primer contacto

Foco: Rust antes del borrow checker.

Temas centrales:

- `let`, mutabilidad y shadowing
- tipos básicos e inferencia
- `if`, `loop`, `for`, `match`
- `struct`, `enum`, `Option`, módulos

Proyectos asociados: `hello-rust`, `fizzbuzz-rust`, `mini-calculator`.

#### L15 — Rust: ownership y borrowing

Foco: el sistema que hace a Rust distinto de C.

Temas centrales:

- ownership y moves
- `Copy`, `Clone` y `Drop`
- borrowing compartido y exclusivo
- lifetimes, `String`, `&str` y slices

Proyectos asociados: `data-structures-rust`.

#### L16 — Rust: sistema de tipos y traits

Foco: traits, genéricos, dispatch y macros.

Temas centrales:

- traits estándar y propios
- monomorphization vs `dyn Trait`
- `Result<T, E>` como tipo del sistema
- `newtype`, `PhantomData` y macros

Proyectos asociados: `custom-iterator`, `parser-combinators`.

#### L17 — Rust: manejo de errores y testing

Foco: ergonomía idiomática de errores y testing en Rust.

Temas centrales:

- `Result`, errores tipados y `Box<dyn Error>`
- `thiserror` y `anyhow`
- tests unitarios e integración
- property-based testing con `proptest`

Proyectos asociados hoy en repo: ninguno. El objetivo es consolidar manejo de errores y testing antes de abrir `ffi-demo`; las reaperturas posteriores no cuentan aquí como proyecto propio.

#### L18 — Rust: FFI, unsafe y el sistema operativo

Foco: el puente entre Rust, C y las APIs del sistema.

Temas centrales:

- `extern "C"`, `bindgen` y `cbindgen`
- punteros crudos y `unsafe`
- wrappers seguros sobre APIs inseguras
- `std::fs`, `Path`, `OsStr`, `RawFd`, `nix` y `libc`

Proyectos asociados: `ffi-demo`.

#### L19 — Rust systems avanzado

Foco: consolidar el tramo de Rust que aparece en librerías y runtimes reales antes de salir al bloque POSIX.

Temas centrales:

- `Rc`, `Arc`, `Weak` e interior mutability
- `Cell`, `RefCell`, `Mutex` y `RwLock`
- `Pin`, invariantes de memoria y `Send`/`Sync`
- wrappers seguros sobre primitivas y APIs inseguras

Proyectos asociados hoy en repo: ninguno. Es un nivel puente para consolidar Rust systems antes de POSIX y de las reaperturas posteriores en runtimes, async y concurrencia.

### Bloque 3 — Sistemas POSIX

#### L20 — POSIX: archivos, metadatos y el filesystem

Foco: la abstracción central de Unix.

Temas centrales:

- inode, pathname y file descriptor
- permisos y links
- VFS y `/proc`
- monitoreo con `inotify`

Proyectos asociados: `spl_stat`, `spl_ls`, `spl_du`, `file-monitor`.

#### L21 — Procesos y señales

Foco: procesos, `fork`, `exec`, `wait` y señales.

Temas centrales:

- proceso como contexto de ejecución
- copy-on-write
- `sigaction` y señales importantes
- `ptrace` y frontera userspace/kernel

Proyectos asociados: `spl_pstree`, `impl_abort`, `impl_alarm`, inicio de `mish`, inicio de `mini-debugger`.

#### L22 — POSIX fino y Unix real

Foco: bajar a las APIs y patrones de Unix real que no cabían en el recorrido POSIX base.

Temas centrales:

- PTY/TTY, redirecciones y descriptores heredados
- `openat`, `dup2`, `fcntl`, `pipe2` y variantes modernas
- `poll`, `select` y transición conceptual hacia `epoll`
- contratos finos entre procesos, shell, terminal y kernel

Proyectos asociados hoy en repo: ninguno. Funciona como capa de APIs y patrones de Unix real antes de sus reaperturas prácticas posteriores, pero sin proyecto directo propio en el catálogo actual.

#### L23 — Scheduling

Foco: cómo decide el kernel qué corre y cuándo.

Temas centrales:

- FIFO, Round-Robin y MLFQ
- fairness, turnaround y response time
- CFS como scheduler real de Linux
- relación entre política y mecanismo

Proyectos asociados: `scheduler-sim`.

#### L24 — Memoria virtual

Foco: paginación, `mmap`, VMAs y copy-on-write.

Temas centrales:

- MMU y tablas de páginas
- page faults y demand paging
- `mmap`, `MAP_PRIVATE`, `MAP_SHARED`
- overcommit y OOM killer

Proyectos asociados: `vma-explorer`, `cow-demo`, `spl_cp`, continuación de `mini-debugger`.

#### L25 — Formato ELF y linking

Foco: qué vive dentro de un ejecutable y cómo se enlaza.

Temas centrales:

- ELF64, headers, secciones y segmentos
- símbolos y relocations
- linking estático y dinámico
- PLT, GOT y loader dinámico

Proyectos asociados: `mini-linker`.

#### L26 — Allocators

Foco: implementar `malloc` y `free` desde cero.

Temas centrales:

- `sbrk()` vs `mmap()`
- free lists y boundary tags
- first-fit, best-fit, next-fit
- segregated bins y thread-safety

Proyectos asociados: `custom-malloc`.

### Bloque 4 — Concurrencia

#### L27 — Concurrencia I: threads y primitivas de sincronización

Foco: usar concurrencia basada en memoria compartida.

Temas centrales:

- `pthread_create`, `join`, `detach`
- mutex, condvar y semáforos
- data races y deadlocks
- `futex(2)` como primitiva subyacente

Proyectos asociados: `thread-pool`, `prod-cons`, `rwlock-impl`.

#### L28 — Concurrencia II: el hardware debajo de las primitivas

Foco: entender por qué existen los modelos de memoria.

Temas centrales:

- reordenamiento por compilador y CPU
- store buffers y load buffers
- x86-64 TSO vs ARM/POWER
- MESI y coherencia de cache

Proyectos asociados: `impl_arc`.

#### L29 — Concurrencia práctica: channels, colas y dispatch

Foco: resolver coordinación práctica y paso de mensajes antes del salto a lock-free completo.

Temas centrales:

- channels bounded y unbounded
- work queues, thread pools y backpressure
- event loops, ownership de mensajes y dispatch
- separación entre coordinación práctica y diseño lock-free

Proyectos asociados hoy en repo: ninguno. Ordena patrones de coordinación práctica antes de reaparecer en proyectos posteriores, pero no abre todavía un proyecto canónico propio.

#### L30 — Concurrencia III: lock-free y concurrencia avanzada

Foco: diseñar primitivas y estructuras concurrentes con atomics.

Temas centrales:

- CAS, `fetch_add`, `swap`
- memory ordering para diseño
- Treiber stack y Michael-Scott queue
- hazard pointers, ABA y RCU

Proyectos asociados: `lock-free-queue`, `rcu-demo`.

### Bloque 5 — IPC

#### L31 — IPC y comunicación entre procesos

Foco: cómo hablan entre sí procesos distintos.

Temas centrales:

- pipes y FIFOs
- POSIX shared memory y semáforos POSIX
- System V IPC
- diseño de wire formats

Proyectos asociados: `named-pipe-sem`, `ipc-explorer`, cierre de `mish`, inicio de `miniqueue`.

### Bloque 6 — Puente sistemas → compiladores

#### L32 — El parser de mish no escala

Foco: construir la motivación concreta del arco de compiladores.

Temas centrales:

- límites del parser artesanal de shell
- variables, command substitution y here-docs como casos que rompen el enfoque actual
- gramática explícita como necesidad, no como lujo
- transición conceptual hacia lexer y parser formales

Proyectos asociados: inicio de `mish` Fase 5.

Nota de diseño curricular: `L32` deja de ser un simple escalón de transición y pasa a tratarse como un puente estructural de alta prioridad dentro de Forja.

### Bloque 7 — Compiladores

#### L33 — Autómatas y lexers

Foco: transformar texto en tokens con teoría útil.

Temas centrales:

- DFA y NFA
- Thompson construction
- subset construction y minimización
- por qué algunos motores regex son exponenciales y otros no

Proyectos asociados: `regex-engine`.

#### L34 — Parsers y gramáticas

Foco: transformar tokens en estructura.

Temas centrales:

- gramáticas CFG, BNF y EBNF
- ambigüedad y precedencia
- recursive descent y Pratt parsing
- AST y visitor pattern

Proyectos asociados: `expr-parser`, `Semtex` Fase 1, `Lógico` Fase 1, cierre de `mish` Fase 5.

#### L35 — Intérpretes y evaluadores

Foco: ejecutar un AST.

Temas centrales:

- REPL
- evaluación recursiva
- entornos léxicos y closures
- CPS y tail calls

Proyectos asociados: `Lógico` v1, `Semtex` Fases 2-3.

#### L36 — Sistemas de tipos: práctica antes del algoritmo

Foco: resolver tipos a mano antes de formalizar HM.

Temas centrales:

- tipos simples
- variables de tipo
- constraints y unificación manual
- union-find como estructura de apoyo

Proyectos asociados: `logico`, `semtex`. Aun así, el corazón del nivel sigue viviendo en práctica manual y ejercicios previos a la implementación completa del algoritmo.

#### L37 — Inferencia de tipos: el algoritmo W

Foco: Hindley-Milner formalizado e implementado.

Temas centrales:

- algoritmo W
- let-generalización
- cuantificación universal
- HM vs subtipado y HM vs Rust

Proyectos asociados: `Lógico` v2, `Semtex` Fase 4.

### Bloque 8 — Sistemas avanzados

Nota de diseño del bloque 8: **engine first**. Antes de distribuir o envolver por red, Forja prioriza construir motores locales correctos: primero la estructura de datos y la persistencia, luego la medición, después la redificación y finalmente la resiliencia distribuida.

Nota de alcance del bloque 8: este tramo ya quedó descomprimido. Antes de persistencia y de la mitad distribuida aparecen ahora tres capas explícitas: formatos y serialización, GC fundamental, y runtimes/object layout/VMs.

#### L38 — Formatos y serialización

Foco: representar datos fuera del proceso de forma estable y evolucionable.

Temas centrales:

- wire formats binarios y de texto
- versionado backward y forward compatible
- checksums, corrupción y límites de confianza
- endianness, layout estable y compatibilidad entre procesos

Proyectos asociados hoy en repo: ninguno. Este nivel explicita una capa del canon que todavía no tiene proyecto focalizado propio dentro del catálogo estructural.

#### L39 — GC fundamental

Foco: estudiar GC como problema propio antes de esconderlo dentro de un intérprete o VM.

Temas centrales:

- roots, reachability y tracing
- mark-sweep, copying y compactación
- pausas, throughput y tradeoffs de diseño
- relación entre allocators, object graphs y collectors

Proyectos asociados hoy en repo: ninguno. La capa de GC queda incorporada al canon antes de reaparecer dentro de runtimes e intérpretes, pero todavía sin proyecto propio materializado.

#### L40 — Runtimes, object layout y VMs

Foco: explicar cómo se organiza la ejecución más allá del AST antes de llegar al async runtime.

Temas centrales:

- object layout, tagging y representación en heap
- stacks, frames, heaps y entornos de ejecución
- bytecode, dispatch loops y VMs sencillas
- organización interna de un runtime local y de un executor cooperativo

Proyectos asociados hoy en repo: ninguno. El nivel formaliza la capa runtime/VM antes del async runtime, aunque los proyectos dedicados a bytecode y runtime sigan fuera del catálogo estructural.

#### L41 — Persistencia I: durabilidad y B-Trees

Foco: durabilidad y storage engines basados en árbol.

Temas centrales:

- `fsync()` y crash recovery
- WAL
- B-Tree y fan-out
- tradeoffs de lectura y escritura

Proyectos asociados: `KVolt` Fases 1-2.

#### L42 — Persistencia II: LSM-Trees, MVCC y SQL

Foco: storage engines orientados a escritura y bases de datos con lenguaje propio.

Temas centrales:

- LSM-Tree y compactación
- MVCC básico
- SQL como unidad explícita del plan
- planner y joins

Proyectos asociados: `KVolt` Fases 3-4, `MiniSQL`.

#### L43 — Persistencia III: cachés en memoria y políticas de evicción

Foco: memoria volátil, límites físicos del hardware y diseño de motores de caché antes de envolverlos en red.

Temas centrales:

- hash tables concurrentes y particionado interno
- políticas de evicción LRU y LFU
- TTL con limpieza pasiva y activa
- snapshots por `fork()` aprovechando copy-on-write

Proyectos asociados: `mem-cache`.

#### L44 — Persistencia IV: event logs y brokers durables

Foco: convertir un WAL en un log de eventos y construir mensajería durable antes de entrar al stack de red.

Temas centrales:

- log-structured storage como event log inmutable
- semánticas at-most-once y at-least-once
- offsets de consumidor y replay
- backpressure y protección del sistema bajo desbalance productor/consumidor

Proyectos asociados: `mini-broker`.

#### L45 — Performance Engineering

Foco: medir antes de optimizar.

Temas centrales:

- metodología hipótesis → medición → cambio → re-medición
- benchmarking correcto
- flamegraphs y `perf`
- caches, branch prediction y false sharing
- optimización de I/O, alineación y zero-copy donde aplique

Proyectos asociados: `perf-benchmarks`, `flamegraph-lab`, `cache-locality-exp`, `false-sharing-exp`, optimización de `KVolt`, `mem-cache` o `mini-broker`.

#### L46 — Observabilidad distribuida

Foco: instrumentar servicios y flujos distribuidos antes de pasar a redes modernas, seguridad y runtimes async.

Temas centrales:

- structured logging y correlation IDs
- métricas, tracing y relaciones causales entre servicios
- SLOs, debugging de fallas y señales de salud
- observabilidad como insumo de diseño, no solo de operación

Proyectos asociados hoy en repo: ninguno. La observabilidad distribuida queda como capa transversal del canon antes de reaparecer en servicios y sistemas distribuidos, pero sin proyecto propio hoy.

#### L47 — Redes I: fundamentos TCP y HTTP

Foco: sockets, TCP y HTTP/1.1.

Temas centrales:

- `socket`, `bind`, `listen`, `accept`, `connect`
- ciclo de vida de TCP
- HTTP/1.1 como protocolo de texto
- modelos de servidor concurrente

Proyectos asociados: `HTTP server` Fases 1-3, `shell remoto TCP`, `minisync`.

#### L48 — Redes II: protocolos modernos

Foco: lo que aparece encima de TCP en sistemas reales.

Temas centrales:

- TLS como capa separada
- DNS wire format
- HTTP/2, QUIC y WebSockets
- zero-copy networking

Proyectos asociados: `HTTP server` Fase 4, `mini-dns-resolver`, `mini-tcpdump`, `websocket-server`, `http2-server`, `minisync`, `TCP/IP stack`.

#### L49 — Seguridad y criptografía

Foco: criptografía aplicada y protocolos seguros.

Temas centrales:

- AEAD, Curve25519 y Ed25519
- SSH-2
- TLS 1.3 en mayor profundidad
- modelo de amenaza

Proyectos asociados: `tinyssh`, `impl_script`.

#### L50 — I/O asíncrono y runtimes

Foco: readiness, completion y runtimes async.

Temas centrales:

- `epoll` vs `io_uring`
- `Future`, `Poll`, `Waker` y executor/reactor
- `libuv` como equivalente C
- Tokio idiomático como punto de llegada

Proyectos asociados: `async-runtime`, `io_uring-echo`, revisita opcional del `HTTP server`, `mem-cache` o `mini-broker` como servicios de alto rendimiento.

Nota de alcance: `L50` sigue siendo la llegada al async runtime y al I/O moderno, pero ya no carga en soledad toda la explicación de runtimes. La infraestructura general de ejecución, layout y VMs aparece antes, en `L40`.

### Bloque 9 — Virtualización y distribución

#### L51 — Aislamiento y contenedores

Foco: las primitivas del kernel que hacen posible un contenedor.

Temas centrales:

- namespaces
- cgroups v2
- `pivot_root` y OverlayFS
- seccomp y capabilities

Proyectos asociados: `minidocker`.

#### L52 — Orquestación de contenedores

Foco: coordinar múltiples contenedores como sistema, todavía con un control plane único.

Temas centrales:

- reconciliation loop
- scheduling de tareas
- networking entre contenedores
- gRPC, service discovery y healthchecks

Proyectos asociados: `orquestador`, continuación de `TCP/IP stack`.

#### L53 — Replicación y consenso

Foco: lograr que varias instancias se comporten como una sola unidad confiable.

Temas centrales:

- CAP y PACELC como marco conceptual
- elección de líder y replicación de log con Raft
- heartbeats, timeouts exponenciales y split-brain
- stores de configuración replicados y quórum

Proyectos asociados: `raft-lite`, replicación opcional de `mem-cache`, `mini-broker` o `KVolt`.

### Bloque 10 — Compiladores avanzados

#### L54 — Generación de código y JIT

Foco: emitir código ejecutable en runtime.

Temas centrales:

- IR y SSA
- liveness y register allocation
- selección de instrucciones x86-64
- páginas ejecutables y WASM como extensión

Proyectos asociados: `JIT-Brain`.

#### L55 — Frontera user/kernel

Foco: explicitar el contrato entre userspace y kernel antes de entrar a módulos, drivers y subsistemas internos.

Temas centrales:

- syscall ABI y convenciones de llamada
- `seccomp`, `capabilities`, `prctl` y `setrlimit`
- fronteras de privilegio, sandboxing y memoria compartida con kernel
- por qué contenedores, JIT, eBPF y drivers rozan esta frontera de formas distintas

Proyectos asociados hoy en repo: ninguno. Es el puente conceptual hacia `char-driver`, `ram-filesystem`, `kvm-mini-hypervisor` y `ebpf-tracer`, no un nivel con proyecto directo propio por ahora.

### Bloque 11 — Kernel space

#### L56 — Kernel space I: módulos y drivers

Foco: entrar al kernel por módulos, drivers y eBPF.

Temas centrales:

- Linux Kernel Modules
- `file_operations`
- `copy_to_user` y `copy_from_user`
- sincronización en kernel

Proyectos asociados: `char-driver`.

#### L57 — Kernel space II: VFS, allocators del kernel, CFS y virtualización

Foco: recorrer las grandes subsistemas internos del kernel que conectan con el resto del plan.

Temas centrales:

- VFS: `super_block`, `inode`, `dentry`, `file`
- buddy allocator y slab allocator
- CFS completo y control groups
- API KVM, eBPF y virtualización

Proyectos asociados: `RAM-FileSystem`, `KVM mini-hypervisor`, `ebpf-tracer`.

---

## 7. C y Rust como ciudadanos de primera clase

C y Rust no son dos versiones del mismo proyecto traducidas mecánicamente. Son dos tradiciones técnicas distintas que Forja pone en diálogo.

En C aparecen explícitamente:

- gestión manual de memoria
- UB y contrato con el compilador
- punteros, layout de datos y syscalls crudas
- valgrind y sanitizers como herramientas permanentes

En Rust aparecen explícitamente:

- ownership y borrowing como sistema de diseño
- tipos algebraicos y traits
- `Result` y propagación tipada de errores
- `cargo`, `clippy`, `miri` y wrappers seguros sobre APIs inseguras

Las divergencias entre implementaciones son parte del material pedagógico. No son ruido.

---

## 8. El modelo de aprendizaje con código dado

Forja no exige construir todo desde cero. Cada fase arranca con código base intencionalmente pedagógico, acompañado por una guía de estudio.

La secuencia esperada es:

1. leer la guía y recorrer el código en el orden sugerido
2. ejecutar tests y fixtures
3. introducir modificaciones pequeñas para entender el comportamiento
4. depurar con las herramientas del nivel
5. recién después, implementar mejoras y extensiones propias

Las mejoras propuestas no son decorativas. Son el momento en que el aprendizaje se valida de verdad.

---

## 9. Caminos posibles de navegación

El canon actual tiene una columna vertebral bastante más lineal que el plan previo. Por eso estos caminos no deben leerse como atajos que ignoran prerrequisitos, sino como vistas de énfasis sobre el mismo grafo.

Cuando un camino resalta un bloque alto, se asume siempre el puente obligatorio que lo habilita. Las densificaciones de Rust systems, POSIX fino, concurrencia práctica, formatos, GC, runtimes, observabilidad distribuida y frontera user/kernel ya forman parte de todos estos recorridos, aunque algunas aparezcan solo como base necesaria y no como foco principal.

### Camino 1 — Sistemas primero

Para quien quiere poner el peso del segundo tramo en POSIX, concurrencia, persistencia, redes y distribución.

Énfasis principal:

`L0-L19 -> L20-L31 -> L38-L50 -> L52-L53`

Puente obligatorio antes del bloque avanzado: `L32-L37`.

Cierre recomendado: `L51` y `L54-L57`.

### Camino 2 — Plan completo

Para quien quiere el recorrido canónico del proyecto completo.

Recorrido sugerido:

`L0-L57` en orden, respetando las reaperturas de proyecto.

### Camino 3 — Compiladores primero

Para quien quiere girar a compiladores tan pronto como el grafo lo permite y tratar JIT como horizonte de largo plazo, no como atajo artificial.

Base obligatoria antes del desvío:

`L0-L31`

Énfasis principal:

`L32-L37`

Para cerrar el arco hasta JIT, después hace falta recorrer `L38-L54`.

Kernel y frontera user/kernel quedan al final: `L55-L57`.

### Camino 4 — Integración vertical

Para quien quiere seguir primero los puntos donde los proyectos integradores reaparecen y cruzan dominios.

Base necesaria:

`L0-L31`

Énfasis principal:

`L32-L37`, `L41-L45`, `L47-L54`

Complemento recomendado para cerrar el mapa sin huecos: `L38-L40`, `L46` y `L55-L57`.

---

## 10. Bibliografía

### Referencia principal

| Libro | Dominio | Acceso |
|---|---|---|
| The C Programming Language — Kernighan & Ritchie | C lenguaje | Pago |
| The Rust Programming Language — Klabnik & Nichols | Rust lenguaje | Gratis |
| Programming Rust — Blandy, Orendorff, Tindall | Rust profundo | Pago |
| Rust in Action — Tim McNamara | Rust aplicado a sistemas | Pago |
| OSTEP — Arpaci-Dusseau | Sistemas operativos | Gratis |
| CS:APP — Bryant & O'Hallaron | Arquitectura y sistemas | Pago |
| The Linux Programming Interface — Kerrisk | POSIX y syscalls | Pago |
| Crafting Interpreters — Nystrom | Compiladores prácticos | Gratis |
| Engineering a Compiler — Cooper & Torczon | Compiladores | Pago |
| Rust Atomics and Locks — Mara Bos | Concurrencia | Pago |
| UNIX Network Programming — Stevens | Redes | Pago |
| Designing Data-Intensive Applications — Kleppmann | Persistencia y distribuido | Pago |

### Referencia complementaria

| Libro o recurso | Dominio |
|---|---|
| Linkers and Loaders — John Levine | ELF y linking |
| Types and Programming Languages — Benjamin Pierce | Teoría de tipos |
| The Art of Multiprocessor Programming — Herlihy & Shavit | Lock-free y concurrencia avanzada |
| Systems Performance — Brendan Gregg | Performance Engineering |
| The Art of Writing Efficient Programs — Fedor Pikus | Optimización a nivel de código |
| Real-World Cryptography — David Wong | Criptografía aplicada |
| Learning eBPF — Liz Rice | eBPF |
| Linux Device Drivers — Corbet, Rubini, Kroah-Hartman | Drivers |
| Linux Kernel Development — Robert Love | Internals del kernel |
| High Performance Browser Networking — Ilya Grigorik | Protocolos modernos |
| Writing an OS in Rust — Philipp Oppermann | Kernel y bare metal en Rust |
| Distributed Systems — van Steen & Tanenbaum | Sistemas distribuidos |

### Recursos online gratuitos de alta calidad

| Recurso | Dominio |
|---|---|
| Beej's Guide to Network Programming | Sockets en C |
| The Illustrated TLS 1.3 | TLS |
| Russ Cox on Regex | Autómatas y motores regex |
| LLVM Kaleidoscope Tutorial | JIT y LLVM |
| CS 6120 Advanced Compilers | Compiladores avanzados |
| Nand2Tetris | Arquitectura y compiladores |
| man pages de Linux | Syscalls y utilidades |

---

Este documento fija el mapa curricular humano. El detalle consolidado de proyectos, fases y arcos vive en `forja-proyectos.md`.
