# Forja — Proyectos

> Este documento consolida el track práctico de Forja: taxonomía, tabla completa de proyectos, arcos integradores, criterio de implementación y ampliaciones de proyectos ya aprobadas a nivel documental.
>
> El mapa curricular humano de niveles vive en `forja-contenido.md`. La arquitectura del repo y de la web vive en `forja-arquitectura.md`.

---

## Índice

- [1. Rol de los proyectos en Forja](#1-rol-de-los-proyectos-en-forja)
- [2. Taxonomía de proyectos](#2-taxonomía-de-proyectos)
- [3. Tabla completa de proyectos](#3-tabla-completa-de-proyectos)
- [4. Los proyectos integradores](#4-los-proyectos-integradores)
- [5. El principio de herramientas industriales](#5-el-principio-de-herramientas-industriales)
- [6. El modelo de aprendizaje con código dado](#6-el-modelo-de-aprendizaje-con-código-dado)
- [7. Cobertura respecto del plan anterior](#7-cobertura-respecto-del-plan-anterior)

---

## 1. Rol de los proyectos en Forja

Los proyectos no son ejercicios de aplicación al final de una teoría ya cerrada. Son una segunda mitad del currículo. Forja está diseñada para que la teoría prepare el terreno y los proyectos la vuelvan concreta.

Cada proyecto aporta una o más de estas funciones:

- fijar una syscall, una estructura de datos o una técnica de implementación en un artefacto real
- conectar niveles distintos del plan dentro de un mismo sistema
- dar un equivalente industrial reconocible a lo que se estudia
- abrir fases de mejora una vez comprendida la implementación base

El track práctico existe en dos escalas:

- proyectos focalizados, para aislar un concepto o mecanismo
- proyectos integradores, para construir sistemas multi-fase que reabren contenido de varios bloques

El canon visible del track práctico sigue siendo el catálogo actual. Las ampliaciones que todavía no tienen numeración, `project.yaml` definitivo o carpeta desarrollada en `content/projects/**` se registran acá como candidatos documentales. Su presencia en este documento no obliga a crear contenido real por adelantado.

### 1.1 Estado editorial actual del track practico

Hoy solo `devcontainer-setup` tiene un `README.md` de proyecto escrito como documento real de recorrido, entregable y criterio de terminado.

El resto de los `README.md` en `content/projects/**` se consideran placeholders estructurales. Sirven para hacer visible el proyecto en el arbol del repo, pero no deben leerse como documentacion completa de arco, fases o implementacion.

Mientras un proyecto siga en ese estado, `project.yaml` manda sobre niveles visibles, lenguajes y reaperturas.

---

## 2. Taxonomía de proyectos

### 2.1 Proyectos focalizados

Son pequeños, autocontenidos y de cierre rápido. Sirven para fijar una idea antes de pasar a una construcción mayor.

Ejemplos:

- `stringlib`
- `ffi-demo`
- `spl_stat`
- `regex-engine`
- `mini-dns-resolver`
- `ebpf-tracer`

### 2.2 Proyectos integradores

Son proyectos multi-fase que atraviesan varios niveles y obligan a combinar conceptos. Cada fase tiene que producir un sistema funcionando, no solo plomería interna.

Ejemplos:

- `mish`
- `mini-debugger`
- `custom-malloc`
- `KVolt`
- `MiniSQL`
- `Lógico`
- `tinyssh`
- `minidocker`
- `orquestador`

---

## 3. Tabla completa de proyectos

La tabla siguiente describe el catálogo visible actual. Los candidatos de ampliación ya aceptados documentalmente aparecen después, separados del canon activo para no confundir plan con contenido ya implementado.

| Proyecto | Tipo | Nivel(es) | Dominio |
|---|---|---|---|
| `devcontainer-setup` | Focalizado | L0 | Entorno |
| `hello-c` | Focalizado | L8 | C lenguaje |
| `caesar-cipher` | Focalizado | L8 | C lenguaje |
| `word-count` | Focalizado | L8 | C lenguaje |
| `stringlib` | Focalizado | L9 | C lenguaje |
| `dynamic-array` | Focalizado | L10 | C lenguaje |
| `elf-explorer` | Focalizado | L11 | C + arquitectura |
| `getopt-impl` | Focalizado | L12 | C lenguaje |
| `hello-rust` | Focalizado | L14 | Rust lenguaje |
| `fizzbuzz-rust` | Focalizado | L14 | Rust lenguaje |
| `mini-calculator` | Focalizado | L14 | Rust lenguaje |
| `data-structures-rust` | Focalizado | L15 | Rust lenguaje |
| `custom-iterator` | Focalizado | L16 | Rust lenguaje |
| `parser-combinators` | Focalizado | L16 | Rust lenguaje |
| `ffi-demo` | Focalizado | L18 | FFI C/Rust |
| `spl_stat` | Focalizado | L20 | POSIX archivos |
| `spl_ls` | Focalizado | L20 | POSIX archivos |
| `spl_du` | Focalizado | L20 | POSIX archivos |
| `file-monitor` | Focalizado | L20 | POSIX archivos |
| `spl_pstree` | Focalizado | L21 | Procesos |
| `impl_abort` | Focalizado | L21 | Procesos |
| `impl_alarm` | Focalizado | L21 | Procesos |
| `scheduler-sim` | Focalizado | L23 | Scheduling |
| `vma-explorer` | Focalizado | L24 | Memoria virtual |
| `cow-demo` | Focalizado | L24 | Memoria virtual |
| `spl_cp` | Focalizado | L24 | Memoria virtual |
| `mini-linker` | Focalizado | L25 | ELF y linking |
| `custom-malloc` | Integrador | L26 | Allocators |
| `thread-pool` | Focalizado | L27 | Concurrencia |
| `prod-cons` | Focalizado | L27 | Concurrencia |
| `rwlock-impl` | Focalizado | L27 | Concurrencia |
| `impl_arc` | Focalizado | L28 | Concurrencia avanzada |
| `lock-free-queue` | Focalizado | L30 | Concurrencia avanzada |
| `rcu-demo` | Focalizado | L30 | Concurrencia avanzada |
| `named-pipe-sem` | Focalizado | L31 | IPC |
| `ipc-explorer` | Focalizado | L31 | IPC |
| `miniqueue` | Integrador | L31 | IPC |
| `mish` | Integrador | L21, L31, L32 | Shell |
| `mini-debugger` | Integrador | L21, L24 | Procesos + memoria |
| `regex-engine` | Focalizado | L33 | Autómatas |
| `expr-parser` | Focalizado | L34 | Parsers |
| `Semtex` | Integrador | L34, L35, L36, L37 | Compiladores |
| `Logico` | Integrador | L34, L35, L36, L37, L54 | Intérpretes + JIT |
| `KVolt` | Integrador | L41, L45, L53 | Persistencia |
| `MiniSQL` | Integrador | L42 | Persistencia |
| `mem-cache` | Integrador | L43 | Persistencia en memoria |
| `mini-broker` | Integrador | L44 | Event logs y mensajería |
| `perf-benchmarks` | Focalizado | L45 | Performance |
| `flamegraph-lab` | Focalizado | L45 | Performance |
| `cache-locality-exp` | Focalizado | L45 | Performance |
| `false-sharing-exp` | Focalizado | L45 | Performance |
| `HTTP server` | Integrador | L47 | Redes |
| `shell remoto TCP` | Focalizado | L47 | Redes |
| `minisync` | Integrador | L47 | Redes |
| `mini-dns-resolver` | Focalizado | L47 | Redes |
| `mini-tcpdump` | Focalizado | L47 | Redes |
| `websocket-server` | Focalizado | L48 | Redes |
| `http2-server` | Focalizado | L48 | Redes |
| `tinyssh` | Integrador | L49 | Seguridad |
| `impl_script` | Focalizado | L49 | Seguridad |
| `async-runtime` | Integrador | L50 | I/O asíncrono |
| `io_uring-echo` | Focalizado | L50 | I/O asíncrono |
| `minidocker` | Integrador | L51 | Contenedores |
| `orquestador` | Integrador | L52 | Sistemas distribuidos |
| `TCP/IP stack` | Integrador | L48, L52 | Redes + distribuido |
| `raft-lite` | Integrador | L53 | Consenso distribuido |
| `JIT-Brain` | Integrador | L54 | Compiladores avanzados |
| `char-driver` | Focalizado | L56 | Kernel |
| `ebpf-tracer` | Focalizado | L57 | Kernel + eBPF |
| `RAM-FileSystem` | Focalizado | L57 | Kernel |
| `KVM mini-hypervisor` | Integrador | L57 | Kernel |

### 3.1 Proyectos candidatos en consolidación documental

| Proyecto candidato | Rol previsto | Acople curricular | Estado documental |
|---|---|---|---|
| `format-lab` | Laboratorio focalizado | Capa explícita de formatos y serialización | Aprobado como candidato canónico |
| `gc-lab` | Integrador corto | GC fundamental y reapertura de `custom-malloc`/`Logico` | Aprobado como candidato canónico |
| `bytecode-vm` | Integrador | Runtimes, VMs y ejecución por bytecode | Aprobado como candidato canónico |
| `mini-runtime` | Integrador | Object layout, heap y organización interna de runtime | Aprobado como candidato canónico |
| `coroutine-executor` | Integrador corto | Puente entre runtimes generales y async runtime | Aprobado como candidato canónico |
| proyecto de task queues tipadas | Integrador multi-fase | Concurrencia práctica, persistencia, prioridades y dispatch asíncrono | Aprobado como candidato experimental; slug definitivo pendiente |

Estos candidatos entran primero en documentación. Su incorporación futura a `metadata/` y a `content/projects/**` vendrá recién cuando les llegue turno real de diseño y authoring.

---

## 4. Los proyectos integradores

Las descripciones de arco de esta sección fijan la historia multi-fase que Forja quiere contar, aunque una carpeta concreta todavía siga dummy o con placeholders. El objetivo acá es dejar explícito qué reabre cada proyecto y cómo se conecta con el resto del plan.

### `mish` — Mini Shell

Niveles: L21, L31, L32.

Arco:

- Fase 1: REPL y comandos internos
- Fase 2: `fork` + `exec` + comandos externos
- Fase 3: pipes y redirecciones
- Fase 4: job control y señales
- Fase 5: reemplazo del parser artesanal por lexer y parser formales

Equivalentes industriales: `bash`, `zsh`, `dash`.

Nota de arco: `mish` pasa a ser el integrador de referencia para justificar `L32`. Su última fase no es una mejora cosmética; es el punto donde el plan explica por qué un parser artesanal deja de escalar y obliga a abrir el bloque de compiladores.

### `mini-debugger` — Debugger con ptrace

Niveles: L21, L24.

Arco:

- breakpoints con `INT3`
- single-step
- lectura y escritura de registros
- lectura y escritura de memoria del proceso objetivo

Equivalentes industriales: `gdb`, `lldb`, `rr`.

### `miniqueue` — Message Queue

Nivel principal: L31.

Arco:

- wire format + shared memory producer/consumer
- routing básico por canal o topic
- persistencia opcional en disco
- ACK y redelivery como mejora avanzada

Equivalentes industriales: RabbitMQ, NATS, ZeroMQ.

### `custom-malloc` — Allocator

Niveles: L26.

Arco:

- versión inicial con free list y coalescencia
- versión avanzada con segregated bins y thread-safety
- benchmarks contra allocators industriales

Equivalentes industriales: jemalloc, mimalloc, ptmalloc2.

Nota de arco: `custom-malloc` deja de ser solo el cierre de allocators. Queda documentado además como sustrato natural para `gc-lab` y como dependencia pedagógica posible para reaperturas de `Logico`.

### `KVolt` — Base de datos key-value

Niveles: L41, L45, L53.

Arco:

- append-only log
- WAL y crash recovery
- B-Tree o LSM-Tree
- compactación, índices y concurrencia
- optimización y medición bajo carga en L45
- replicación opcional sobre consenso en L53

Equivalentes industriales: LevelDB, RocksDB, LMDB.

Nota de arco: `KVolt` es el ejemplo más claro de proyecto multi-fase que cambia de pregunta sin cambiar de sistema. Empieza como motor local, se reabre para medición y vuelve a abrirse para replicación; esa continuidad debe seguir explícita en toda la documentación del plan.

### `MiniSQL` — Motor SQL

Nivel principal: L42.

Arco:

- parser SQL
- planner y joins
- transacciones y MVCC básico
- uso de `KVolt` como storage engine

Equivalentes industriales: SQLite, DuckDB.

### `mem-cache` — Motor de caché en memoria

Niveles: L43.

Arco:

- motor en memoria con TTL y políticas de evicción configurables
- snapshots con `fork()` y copy-on-write
- envoltura posterior como servicio de alto rendimiento
- replicación como extensión posterior si el proyecto vuelve a abrirse en metadata

Equivalentes industriales: Redis, Memcached, Dragonfly.

Nota de diseño: en Forja arranca como motor primero, no como servidor primero. La interfaz de red solo pasa a ser tramo macro si aparece como reapertura explícita en `project.yaml`.

### `mini-broker` — Broker durable sobre event log

Niveles: L44.

Arco:

- append-only log durable con múltiples consumidores
- offsets y replay de eventos
- semánticas de entrega y backpressure
- envoltura posterior como servicio de alto rendimiento y replicación solo si el proyecto vuelve a abrirse en metadata

Equivalentes industriales: Kafka, RabbitMQ, Redpanda.

Nota de arco: `mini-broker` es uno de los candidatos naturales para reabrirse junto con el futuro proyecto de task queues tipadas, prioridades y dispatch asíncrono. La documentación debe tratarlos como piezas compatibles, no como ideas aisladas.

### `Semtex` — Parser de marcado

Niveles: L34, L35, L36, L37.

Arco:

- lexer
- AST completo
- validación semántica estructural
- inferencia de tipos y emitter HTML/MathML

Equivalentes industriales: pandoc, pulldown-cmark, tree-sitter.

### `Logico` — Intérprete Lisp

Niveles: L34, L35, L36, L37, L54.

Arco:

- reader de S-expressions
- evaluador con entornos y closures
- garbage collector mark-and-sweep usando `custom-malloc`
- inferencia HM
- compilación JIT con `JIT-Brain`

Equivalentes industriales: Guile, Chicken Scheme, Janet.

Nota de arco: `Logico` deja de leerse solo como intérprete + tipos + JIT. También pasa a ser consumidor directo de las capas nuevas de GC, object layout, runtime y eventualmente bytecode/VM.

### `HTTP server` — Servidor HTTP

Niveles: L47.

Arco:

- secuencial
- thread pool
- `epoll`
- HTTP/1.1 completo
- revisita opcional con `io_uring`

Equivalentes industriales: nginx, Apache, hyper.

Nota de arco: `HTTP server` queda como candidato natural a reapertura cuando Forja haga explícita la capa de observabilidad distribuida y el puente de runtimes previos a `L50`.

### `minisync` — Sincronización de directorios

Niveles: L47.

Arco:

- rolling checksum y comparación por bloques
- protocolo TCP de transferencia
- deltas sobre archivos grandes
- verificación de integridad como mejora avanzada

Equivalentes industriales: `rsync`, `rclone`, Syncthing.

Nota: este proyecto existía en el plan anterior y se preserva explícitamente en el rediseño, aunque no estuviera nombrado en el borrador v2.

### `tinyssh` — Implementación SSH

Niveles: L49.

Arco:

- framing SSH-2 sobre TCP
- intercambio de claves con Curve25519
- AEAD y autenticación de clave pública
- reutilización de shell remoto y pseudoterminales

Equivalentes industriales: OpenSSH, libssh.

### `async-runtime` — Runtime asíncrono

Nivel principal: L50.

Arco:

- `Future` manual
- `Waker` y `RawWaker`
- executor single-thread
- reactor sobre `epoll`
- timers y comparación conceptual con Tokio y libuv

Equivalentes industriales: Tokio, async-std, smol, libuv.

Nota de arco: `async-runtime` sigue siendo el proyecto de llegada del bloque async, pero ya no debe cargar en soledad toda la teoría de runtimes. A partir de la ampliación documental pasa a consumirse mejor si antes existen capas explícitas de runtime general, object layout y ejecutores cooperativos.

### `minidocker` — Runtime de contenedores

Nivel principal: L51.

Arco:

- namespaces y cambio de root
- cgroups v2
- OverlayFS
- seccomp y capabilities

Equivalentes industriales: runc, youki, crun.

### `orquestador` — Orquestador de contenedores

Nivel principal: L52.

Arco:

- modelo de estado deseado
- scheduler
- red entre contenedores
- API, service discovery y healthchecks

Equivalentes industriales: Kubernetes, Nomad, Docker Swarm.

Nota de diseño: en esta versión del plan `orquestador` queda separado del consenso. Primero hay control plane único; la replicación llega después.

### `raft-lite` — Replicación y consenso

Nivel principal: L53.

Arco:

- elección de líder
- replicación de log por quórum
- heartbeats y timeouts
- adaptación opcional para replicar `KVolt`, `mem-cache` o `mini-broker`

Equivalentes industriales: etcd, Consul, ZooKeeper.

### `TCP/IP stack` — Pila TCP/IP en user space

Niveles: L48, L52.

Arco:

- Ethernet y ARP
- IPv4 y checksums
- máquina de estados TCP
- integración con la red del orquestador

Equivalentes industriales: smoltcp, lwIP.

### `JIT-Brain` — Compilador JIT

Nivel principal: L54.

Arco:

- IR simplificado
- selección de instrucciones
- páginas ejecutables
- backend nativo y extensión opcional WASM

Equivalentes industriales: LLVM, Cranelift, libgccjit.

### `char-driver`, `RAM-FileSystem`, `KVM mini-hypervisor`

Niveles: L56 y L57.

Arco:

- driver de carácter con `ioctl`
- filesystem registrado en VFS
- VM mínima sobre `/dev/kvm`

Equivalentes industriales: Linux kernel, QEMU/KVM, Firecracker.

---

## 5. El principio de herramientas industriales

La regla de Forja es esta:

- si el componente es el foco pedagógico del nivel, se implementa desde cero
- si el componente es infraestructura estable, compleja y auditada, se usa una librería industrial

Ejemplos:

- `tinyssh` usa `ring` o libsodium: el foco es entender SSH, no reimplementar AES-GCM
- `minidocker` usa `libseccomp`: el foco es entender namespaces y cgroups, no escribir filtros de syscalls desde cero
- un debugger puede apoyarse en bibliotecas de unwinding si el foco es `ptrace`, no el unwind mismo

Esto hace que los proyectos avanzados sean más realistas y también más útiles como artefactos de aprendizaje serio.

---

## 6. El modelo de aprendizaje con código dado

Cada fase de proyecto entrega dos artefactos:

- el código base de la fase
- la guía de estudio del código

La guía de estudio no reemplaza al código. Lo acompaña. Su función es:

- proponer un orden de lectura
- explicar decisiones de diseño
- marcar puntos donde conviene pausar y experimentar
- conectar el código con los niveles del plan
- señalar divergencias entre C y Rust

El ciclo de trabajo esperado es:

1. leer
2. ejecutar
3. medir o depurar
4. modificar
5. verificar
6. extender

---

## 7. Cobertura respecto del plan anterior

Se preservan explícitamente los proyectos y arcos centrales del plan anterior:

- `mish`
- `mini-debugger`
- `miniqueue`
- `custom-malloc`
- `KVolt`
- `MiniSQL`
- `mem-cache`
- `mini-broker`
- `Semtex`
- `Logico`
- `HTTP server`
- `minisync`
- `tinyssh`
- `async-runtime`
- `minidocker`
- `orquestador`
- `raft-lite`
- `TCP/IP stack`
- `JIT-Brain`
- `char-driver`
- `RAM-FileSystem`
- `KVM mini-hypervisor`
- `ebpf-tracer`

Al contrastar el borrador v2 contra `forja-contenido.md` anterior no quedó ninguna omisión pendiente: `minisync` ya quedó preservado. Sobre esa base, la siguiente ola documental agrega como candidatos explícitos `format-lab`, `gc-lab`, `bytecode-vm`, `mini-runtime`, `coroutine-executor` y un proyecto de task queues tipadas todavía sin slug definitivo.
