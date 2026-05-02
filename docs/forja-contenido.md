# Forja — Contenido Curricular

> Este documento define el plan curricular humano de Forja: qué se enseña, en qué orden, con qué foco, y cómo se relacionan los niveles entre sí.
>
> El catálogo consolidado de proyectos vive en `forja-proyectos.md`. La arquitectura técnica del repo y de la web vive en `forja-arquitectura.md`. La dinámica operativa de construcción vive en `forja-construccion.md`.

---

## Índice

- [1. Qué es Forja](#1-qué-es-forja)
- [2. La persona que usa Forja](#2-la-persona-que-usa-forja)
- [3. Cómo se organiza el plan](#3-cómo-se-organiza-el-plan)
- [4. Filosofía del rediseño](#4-filosofía-del-rediseño)
- [5. Mapa general de bloques](#5-mapa-general-de-bloques)
- [6. Los niveles del plan: L0-L49](#6-los-niveles-del-plan-l0-l49)
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
- concurrencia se separa en L25, L26 y L27: usar primitivas, entender el hardware, diseñar primitivas
- el salto a compiladores se suaviza con el puente L29
- Hindley-Milner se divide en L33 y L34: práctica manual antes del algoritmo W
- SQL deja de ser un prerrequisito tácito y pasa a estar dentro de L36
- el arco de persistencia se expande con L37 y L38 para cubrir cachés, evicción, event logs y brokers durables antes de entrar en red
- Performance Engineering se mueve después del arco de persistencia local y antes de Redes para que el HTTP server, `mem-cache` y `mini-broker` se construyan ya con metodología de medición
- orquestación y consenso dejan de convivir en un mismo nivel y se separan en L45 y L46

Este rediseño lleva el plan de 26 niveles efectivos a 50 niveles con foco más fino, menor densidad por unidad y mejor continuidad conceptual.

---

## 5. Mapa general de bloques

| Bloque | Niveles | Contenido |
|---|---|---|
| 0 | L0-L7 | Laboratorio, arquitectura, representación, compilación, observabilidad, assembly |
| 1 | L8-L13 | C como lenguaje |
| 2 | L14-L18 | Rust como lenguaje |
| 3 | L19-L24 | Sistemas POSIX |
| 4 | L25-L27 | Concurrencia |
| 5 | L28 | IPC |
| 6 | L29 | Puente sistemas → compiladores |
| 7 | L30-L34 | Compiladores |
| 8 | L35-L43 | Sistemas avanzados |
| 9 | L44-L46 | Virtualización y distribución |
| 10 | L47 | Compiladores avanzados |
| 11 | L48-L49 | Kernel space |

---

## 6. Los niveles del plan: L0-L49

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

Proyectos asociados: ninguno; unidad conceptual base.

#### L2 — Representación de la información

Foco: cómo viven los datos en hardware.

Temas centrales:

- bits, bytes, enteros y complemento a dos
- overflow con signo y sin signo
- hexadecimal y endianness
- intuición de floating point

Proyectos asociados: mini-labs de inspección binaria y endianness.

#### L3 — El pipeline de compilación en C

Foco: dejar de tratar al compilador como caja negra.

Temas centrales:

- preprocesador, compilador, assembler y linker
- artefactos `.i`, `.s`, `.o` y ejecutable
- linking estático vs dinámico
- flags básicas y `make`

Proyectos asociados: laboratorios de compilación manual de `hello.c`.

#### L4 — El sistema de build de Rust

Foco: entender `cargo` como herramienta de build, test y dependencias.

Temas centrales:

- `cargo new`, `build`, `run`, `test`, `doc`
- `Cargo.toml` y `Cargo.lock`
- crates, workspaces y toolchains
- comparación explícita con el flujo de C

Proyectos asociados: crate mínimo con dependencia y tests.

#### L5 — Herramientas de observabilidad I

Foco: leer warnings y usar debugger como herramienta permanente.

Temas centrales:

- `gdb` básico
- lectura de warnings
- memoria desde debugger
- `rust-analyzer`, `rustfmt`, `clang-format`, `clippy`

Proyectos asociados: mini-labs de debugging en C y Rust.

#### L6 — Herramientas de observabilidad II

Foco: sanitizers, valgrind y strace como parte del flujo normal.

Temas centrales:

- ASan, UBSan, MSan y ThreadSanitizer
- valgrind memcheck
- `strace`
- preview de `perf` y flamegraphs

Proyectos asociados: mini-labs de lectura de diagnósticos de memoria.

#### L7 — Alfabetización assembly

Foco: leer assembly generado por el compilador.

Temas centrales:

- registros x86-64 y calling convention System V
- stack frame, `call` y `ret`
- instrucciones mínimas para leer código compilado
- comparación `-O0` vs `-O2`

Proyectos asociados: mini-labs de lectura de `.s`, stepping en `gdb` y conexión con syscalls.

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

Proyectos asociados: extensión de `stringlib` y `dynamic-array` con testing explícito.

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

Proyectos asociados: extensión de `data-structures-rust` y `parser-combinators`.

#### L18 — Rust: FFI, unsafe y el sistema operativo

Foco: el puente entre Rust, C y las APIs del sistema.

Temas centrales:

- `extern "C"`, `bindgen` y `cbindgen`
- punteros crudos y `unsafe`
- wrappers seguros sobre APIs inseguras
- `std::fs`, `Path`, `OsStr`, `RawFd`, `nix` y `libc`

Proyectos asociados: `ffi-demo`.

### Bloque 3 — Sistemas POSIX

#### L19 — POSIX: archivos, metadatos y el filesystem

Foco: la abstracción central de Unix.

Temas centrales:

- inode, pathname y file descriptor
- permisos y links
- VFS y `/proc`
- monitoreo con `inotify`

Proyectos asociados: `spl_stat`, `spl_ls`, `spl_du`, `file-monitor`.

#### L20 — Procesos y señales

Foco: procesos, `fork`, `exec`, `wait` y señales.

Temas centrales:

- proceso como contexto de ejecución
- copy-on-write
- `sigaction` y señales importantes
- `ptrace` y frontera userspace/kernel

Proyectos asociados: `spl_pstree`, `impl_abort`, `impl_alarm`, inicio de `mish`, inicio de `mini-debugger`.

#### L21 — Scheduling

Foco: cómo decide el kernel qué corre y cuándo.

Temas centrales:

- FIFO, Round-Robin y MLFQ
- fairness, turnaround y response time
- CFS como scheduler real de Linux
- relación entre política y mecanismo

Proyectos asociados: `scheduler-sim`.

#### L22 — Memoria virtual

Foco: paginación, `mmap`, VMAs y copy-on-write.

Temas centrales:

- MMU y tablas de páginas
- page faults y demand paging
- `mmap`, `MAP_PRIVATE`, `MAP_SHARED`
- overcommit y OOM killer

Proyectos asociados: `vma-explorer`, `cow-demo`, `spl_cp`, continuación de `mini-debugger`.

#### L23 — Formato ELF y linking

Foco: qué vive dentro de un ejecutable y cómo se enlaza.

Temas centrales:

- ELF64, headers, secciones y segmentos
- símbolos y relocations
- linking estático y dinámico
- PLT, GOT y loader dinámico

Proyectos asociados: `mini-linker`.

#### L24 — Allocators

Foco: implementar `malloc` y `free` desde cero.

Temas centrales:

- `sbrk()` vs `mmap()`
- free lists y boundary tags
- first-fit, best-fit, next-fit
- segregated bins y thread-safety

Proyectos asociados: `custom-malloc`.

### Bloque 4 — Concurrencia

#### L25 — Concurrencia I: threads y primitivas de sincronización

Foco: usar concurrencia basada en memoria compartida.

Temas centrales:

- `pthread_create`, `join`, `detach`
- mutex, condvar y semáforos
- data races y deadlocks
- `futex(2)` como primitiva subyacente

Proyectos asociados: `thread-pool`, `prod-cons`, `rwlock-impl`.

#### L26 — Concurrencia II: el hardware debajo de las primitivas

Foco: entender por qué existen los modelos de memoria.

Temas centrales:

- reordenamiento por compilador y CPU
- store buffers y load buffers
- x86-64 TSO vs ARM/POWER
- MESI y coherencia de cache

Proyectos asociados: mini-labs de ordering; sin proyecto nuevo.

#### L27 — Concurrencia III: lock-free y concurrencia avanzada

Foco: diseñar primitivas y estructuras concurrentes con atomics.

Temas centrales:

- CAS, `fetch_add`, `swap`
- memory ordering para diseño
- Treiber stack y Michael-Scott queue
- hazard pointers, ABA y RCU

Proyectos asociados: `impl_arc`, `lock-free-queue`, `rcu-demo`.

### Bloque 5 — IPC

#### L28 — IPC y comunicación entre procesos

Foco: cómo hablan entre sí procesos distintos.

Temas centrales:

- pipes y FIFOs
- POSIX shared memory y semáforos POSIX
- System V IPC
- diseño de wire formats

Proyectos asociados: `named-pipe-sem`, `ipc-explorer`, cierre de `mish`, inicio de `miniqueue`.

### Bloque 6 — Puente sistemas → compiladores

#### L29 — El parser de mish no escala

Foco: construir la motivación concreta del arco de compiladores.

Temas centrales:

- límites del parser artesanal de shell
- variables, command substitution y here-docs como casos que rompen el enfoque actual
- gramática explícita como necesidad, no como lujo
- transición conceptual hacia lexer y parser formales

Proyectos asociados: inicio de `mish` Fase 5.

### Bloque 7 — Compiladores

#### L30 — Autómatas y lexers

Foco: transformar texto en tokens con teoría útil.

Temas centrales:

- DFA y NFA
- Thompson construction
- subset construction y minimización
- por qué algunos motores regex son exponenciales y otros no

Proyectos asociados: `regex-engine`.

#### L31 — Parsers y gramáticas

Foco: transformar tokens en estructura.

Temas centrales:

- gramáticas CFG, BNF y EBNF
- ambigüedad y precedencia
- recursive descent y Pratt parsing
- AST y visitor pattern

Proyectos asociados: `expr-parser`, `Semtex` Fase 1, `Lógico` Fase 1, cierre de `mish` Fase 5.

#### L32 — Intérpretes y evaluadores

Foco: ejecutar un AST.

Temas centrales:

- REPL
- evaluación recursiva
- entornos léxicos y closures
- CPS y tail calls

Proyectos asociados: `Lógico` v1, `Semtex` Fases 2-3.

#### L33 — Sistemas de tipos: práctica antes del algoritmo

Foco: resolver tipos a mano antes de formalizar HM.

Temas centrales:

- tipos simples
- variables de tipo
- constraints y unificación manual
- union-find como estructura de apoyo

Proyectos asociados: ejercicios en papel; sin proyecto nuevo.

#### L34 — Inferencia de tipos: el algoritmo W

Foco: Hindley-Milner formalizado e implementado.

Temas centrales:

- algoritmo W
- let-generalización
- cuantificación universal
- HM vs subtipado y HM vs Rust

Proyectos asociados: `Lógico` v2, `Semtex` Fase 4.

### Bloque 8 — Sistemas avanzados

Nota de diseño del bloque 8: **engine first**. Antes de distribuir o envolver por red, Forja prioriza construir motores locales correctos: primero la estructura de datos y la persistencia, luego la medición, después la redificación y finalmente la resiliencia distribuida.

#### L35 — Persistencia I: durabilidad y B-Trees

Foco: durabilidad y storage engines basados en árbol.

Temas centrales:

- `fsync()` y crash recovery
- WAL
- B-Tree y fan-out
- tradeoffs de lectura y escritura

Proyectos asociados: `KVolt` Fases 1-2.

#### L36 — Persistencia II: LSM-Trees, MVCC y SQL

Foco: storage engines orientados a escritura y bases de datos con lenguaje propio.

Temas centrales:

- LSM-Tree y compactación
- MVCC básico
- SQL como unidad explícita del plan
- planner y joins

Proyectos asociados: `KVolt` Fases 3-4, `MiniSQL`.

#### L37 — Persistencia III: cachés en memoria y políticas de evicción

Foco: memoria volátil, límites físicos del hardware y diseño de motores de caché antes de envolverlos en red.

Temas centrales:

- hash tables concurrentes y particionado interno
- políticas de evicción LRU y LFU
- TTL con limpieza pasiva y activa
- snapshots por `fork()` aprovechando copy-on-write

Proyectos asociados: `mem-cache`.

#### L38 — Persistencia IV: event logs y brokers durables

Foco: convertir un WAL en un log de eventos y construir mensajería durable antes de entrar al stack de red.

Temas centrales:

- log-structured storage como event log inmutable
- semánticas at-most-once y at-least-once
- offsets de consumidor y replay
- backpressure y protección del sistema bajo desbalance productor/consumidor

Proyectos asociados: `mini-broker`.

#### L39 — Performance Engineering

Foco: medir antes de optimizar.

Temas centrales:

- metodología hipótesis → medición → cambio → re-medición
- benchmarking correcto
- flamegraphs y `perf`
- caches, branch prediction y false sharing
- optimización de I/O, alineación y zero-copy donde aplique

Proyectos asociados: `perf-benchmarks`, `flamegraph-lab`, `cache-locality-exp`, `false-sharing-exp`, optimización de `KVolt`, `mem-cache` o `mini-broker`.

#### L40 — Redes I: fundamentos TCP y HTTP

Foco: sockets, TCP y HTTP/1.1.

Temas centrales:

- `socket`, `bind`, `listen`, `accept`, `connect`
- ciclo de vida de TCP
- HTTP/1.1 como protocolo de texto
- modelos de servidor concurrente

Proyectos asociados: `HTTP server` Fases 1-3, `shell remoto TCP`, `minisync`.

#### L41 — Redes II: protocolos modernos

Foco: lo que aparece encima de TCP en sistemas reales.

Temas centrales:

- TLS como capa separada
- DNS wire format
- HTTP/2, QUIC y WebSockets
- zero-copy networking

Proyectos asociados: `HTTP server` Fase 4, `mini-dns-resolver`, `mini-tcpdump`, `websocket-server`, `http2-server`, `minisync`, `TCP/IP stack`.

#### L42 — Seguridad y criptografía

Foco: criptografía aplicada y protocolos seguros.

Temas centrales:

- AEAD, Curve25519 y Ed25519
- SSH-2
- TLS 1.3 en mayor profundidad
- modelo de amenaza

Proyectos asociados: `tinyssh`, `impl_script`.

#### L43 — I/O asíncrono y runtimes

Foco: readiness, completion y runtimes async.

Temas centrales:

- `epoll` vs `io_uring`
- `Future`, `Poll`, `Waker` y executor/reactor
- `libuv` como equivalente C
- Tokio idiomático como punto de llegada

Proyectos asociados: `async-runtime`, `io_uring-echo`, revisita opcional del `HTTP server`, `mem-cache` o `mini-broker` como servicios de alto rendimiento.

### Bloque 9 — Virtualización y distribución

#### L44 — Aislamiento y contenedores

Foco: las primitivas del kernel que hacen posible un contenedor.

Temas centrales:

- namespaces
- cgroups v2
- `pivot_root` y OverlayFS
- seccomp y capabilities

Proyectos asociados: `minidocker`.

#### L45 — Orquestación de contenedores

Foco: coordinar múltiples contenedores como sistema, todavía con un control plane único.

Temas centrales:

- reconciliation loop
- scheduling de tareas
- networking entre contenedores
- gRPC, service discovery y healthchecks

Proyectos asociados: `orquestador`, continuación de `TCP/IP stack`.

#### L46 — Replicación y consenso

Foco: lograr que varias instancias se comporten como una sola unidad confiable.

Temas centrales:

- CAP y PACELC como marco conceptual
- elección de líder y replicación de log con Raft
- heartbeats, timeouts exponenciales y split-brain
- stores de configuración replicados y quórum

Proyectos asociados: `raft-lite`, replicación opcional de `mem-cache`, `mini-broker` o `KVolt`.

### Bloque 10 — Compiladores avanzados

#### L47 — Generación de código y JIT

Foco: emitir código ejecutable en runtime.

Temas centrales:

- IR y SSA
- liveness y register allocation
- selección de instrucciones x86-64
- páginas ejecutables y WASM como extensión

Proyectos asociados: `JIT-Brain`.

### Bloque 11 — Kernel space

#### L48 — Kernel space I: módulos y drivers

Foco: entrar al kernel por módulos, drivers y eBPF.

Temas centrales:

- Linux Kernel Modules
- `file_operations`
- `copy_to_user` y `copy_from_user`
- sincronización en kernel y eBPF/XDP

Proyectos asociados: `char-driver`, `ebpf-tracer`.

#### L49 — Kernel space II: VFS, allocators del kernel, CFS y virtualización

Foco: recorrer las grandes subsistemas internos del kernel que conectan con el resto del plan.

Temas centrales:

- VFS: `super_block`, `inode`, `dentry`, `file`
- buddy allocator y slab allocator
- CFS completo y control groups
- API KVM y virtualización

Proyectos asociados: `RAM-FileSystem`, `KVM mini-hypervisor`.

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

El grafo de dependencias admite varios recorridos. Estos son los cuatro caminos explícitos del plan.

### Camino 1 — Sistemas primero

Para quien quiere consolidar primero lenguajes, POSIX, redes, contenedores y kernel.

Recorrido sugerido:

`L0-L18 -> L19-L28 -> L35-L43 -> L45-L46`

Luego puede cerrar compiladores con `L29-L34` y `L47`.

### Camino 2 — Plan completo

Para quien quiere el recorrido canónico del proyecto completo.

Recorrido sugerido:

`L0-L49` en orden, respetando las reaperturas de proyecto.

### Camino 3 — Compiladores primero

Para quien quiere llegar cuanto antes a parsing, intérpretes, tipos y JIT sin saltear la caja de herramientas base.

Recorrido sugerido:

`L0-L18 -> L29-L34 -> L47`

Complemento recomendado después: `L19-L28`, `L35-L46` y finalmente `L48-L49`.

### Camino 4 — Integración vertical

Para quien quiere alternar sistemas y compiladores siguiendo dependencias naturales entre proyectos.

Recorrido sugerido:

`L0-L24 -> L29-L43 -> L44-L49`

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
