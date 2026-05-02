# Forja — Proyectos

> Este documento consolida el track práctico de Forja: taxonomía, tabla completa de proyectos, arcos integradores y criterio de implementación.
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
| `spl_stat` | Focalizado | L19 | POSIX archivos |
| `spl_ls` | Focalizado | L19 | POSIX archivos |
| `spl_du` | Focalizado | L19 | POSIX archivos |
| `file-monitor` | Focalizado | L19 | POSIX archivos |
| `spl_pstree` | Focalizado | L20 | Procesos |
| `impl_abort` | Focalizado | L20 | Procesos |
| `impl_alarm` | Focalizado | L20 | Procesos |
| `scheduler-sim` | Focalizado | L21 | Scheduling |
| `vma-explorer` | Focalizado | L22 | Memoria virtual |
| `cow-demo` | Focalizado | L22 | Memoria virtual |
| `spl_cp` | Focalizado | L22 | Memoria virtual |
| `mini-linker` | Focalizado | L23 | ELF y linking |
| `custom-malloc` | Integrador | L24, L39 | Allocators |
| `thread-pool` | Focalizado | L25 | Concurrencia |
| `prod-cons` | Focalizado | L25 | Concurrencia |
| `rwlock-impl` | Focalizado | L25 | Concurrencia |
| `impl_arc` | Focalizado | L27 | Concurrencia avanzada |
| `lock-free-queue` | Focalizado | L27 | Concurrencia avanzada |
| `rcu-demo` | Focalizado | L27 | Concurrencia avanzada |
| `named-pipe-sem` | Focalizado | L28 | IPC |
| `ipc-explorer` | Focalizado | L28 | IPC |
| `miniqueue` | Integrador | L28 | IPC |
| `mish` | Integrador | L20, L28, L29, L31 | Shell |
| `mini-debugger` | Integrador | L20, L22 | Procesos + memoria |
| `regex-engine` | Focalizado | L30 | Autómatas |
| `expr-parser` | Focalizado | L31 | Parsers |
| `Semtex` | Integrador | L31, L32, L34 | Compiladores |
| `Lógico` | Integrador | L31, L32, L34, L47 | Intérpretes + JIT |
| `KVolt` | Integrador | L35, L36, L39, L46 | Persistencia |
| `MiniSQL` | Integrador | L36 | Persistencia |
| `mem-cache` | Integrador | L37, L43, L46 | Persistencia en memoria |
| `mini-broker` | Integrador | L38, L43, L46 | Event logs y mensajería |
| `perf-benchmarks` | Focalizado | L39 | Performance |
| `flamegraph-lab` | Focalizado | L39, L40 | Performance |
| `cache-locality-exp` | Focalizado | L39 | Performance |
| `false-sharing-exp` | Focalizado | L39 | Performance |
| `HTTP server` | Integrador | L40, L41, L43 | Redes |
| `shell remoto TCP` | Focalizado | L40 | Redes |
| `minisync` | Integrador | L40, L41 | Redes |
| `mini-dns-resolver` | Focalizado | L41 | Redes |
| `mini-tcpdump` | Focalizado | L41 | Redes |
| `websocket-server` | Focalizado | L41 | Redes |
| `http2-server` | Focalizado | L41 | Redes |
| `tinyssh` | Integrador | L40, L42 | Seguridad |
| `impl_script` | Focalizado | L42 | Seguridad |
| `async-runtime` | Integrador | L43 | I/O asíncrono |
| `io_uring-echo` | Focalizado | L43 | I/O asíncrono |
| `minidocker` | Integrador | L44 | Contenedores |
| `orquestador` | Integrador | L45 | Sistemas distribuidos |
| `TCP/IP stack` | Integrador | L41, L45 | Redes + distribuido |
| `raft-lite` | Integrador | L46 | Consenso distribuido |
| `JIT-Brain` | Integrador | L47 | Compiladores avanzados |
| `char-driver` | Focalizado | L48 | Kernel |
| `ebpf-tracer` | Focalizado | L48 | Kernel + eBPF |
| `RAM-FileSystem` | Focalizado | L49 | Kernel |
| `KVM mini-hypervisor` | Integrador | L49 | Kernel |

---

## 4. Los proyectos integradores

### `mish` — Mini Shell

Niveles: L20, L28, L29, L31.

Arco:

- Fase 1: REPL y comandos internos
- Fase 2: `fork` + `exec` + comandos externos
- Fase 3: pipes y redirecciones
- Fase 4: job control y señales
- Fase 5: reemplazo del parser artesanal por lexer y parser formales

Equivalentes industriales: `bash`, `zsh`, `dash`.

### `mini-debugger` — Debugger con ptrace

Niveles: L20, L22.

Arco:

- breakpoints con `INT3`
- single-step
- lectura y escritura de registros
- lectura y escritura de memoria del proceso objetivo

Equivalentes industriales: `gdb`, `lldb`, `rr`.

### `miniqueue` — Message Queue

Nivel principal: L28.

Arco:

- wire format + shared memory producer/consumer
- routing básico por canal o topic
- persistencia opcional en disco
- ACK y redelivery como mejora avanzada

Equivalentes industriales: RabbitMQ, NATS, ZeroMQ.

### `custom-malloc` — Allocator

Niveles: L24, L39.

Arco:

- versión inicial con free list y coalescencia
- versión avanzada con segregated bins y thread-safety
- benchmarks contra allocators industriales

Equivalentes industriales: jemalloc, mimalloc, ptmalloc2.

### `KVolt` — Base de datos key-value

Niveles: L35, L36, L39, L46.

Arco:

- append-only log
- WAL y crash recovery
- B-Tree o LSM-Tree
- compactación, índices y concurrencia
- optimización y medición bajo carga en L39
- replicación opcional sobre consenso en L46

Equivalentes industriales: LevelDB, RocksDB, LMDB.

### `MiniSQL` — Motor SQL

Nivel principal: L36.

Arco:

- parser SQL
- planner y joins
- transacciones y MVCC básico
- uso de `KVolt` como storage engine

Equivalentes industriales: SQLite, DuckDB.

### `mem-cache` — Motor de caché en memoria

Niveles: L37, L43, L46.

Arco:

- motor en memoria con TTL y políticas de evicción configurables
- snapshots con `fork()` y copy-on-write
- envoltura posterior como servicio de alto rendimiento
- replicación opcional en L46

Equivalentes industriales: Redis, Memcached, Dragonfly.

Nota de diseño: en Forja arranca como motor primero, no como servidor primero. La interfaz de red llega después.

### `mini-broker` — Broker durable sobre event log

Niveles: L38, L43, L46.

Arco:

- append-only log durable con múltiples consumidores
- offsets y replay de eventos
- semánticas de entrega y backpressure
- envoltura posterior como servicio de alto rendimiento y replicación opcional en L46

Equivalentes industriales: Kafka, RabbitMQ, Redpanda.

### `Semtex` — Parser de marcado

Niveles: L31, L32, L34.

Arco:

- lexer
- AST completo
- validación semántica estructural
- inferencia de tipos y emitter HTML/MathML

Equivalentes industriales: pandoc, pulldown-cmark, tree-sitter.

### `Lógico` — Intérprete Lisp

Niveles: L31, L32, L34, L47.

Arco:

- reader de S-expressions
- evaluador con entornos y closures
- garbage collector mark-and-sweep usando `custom-malloc`
- inferencia HM
- compilación JIT con `JIT-Brain`

Equivalentes industriales: Guile, Chicken Scheme, Janet.

### `HTTP server` — Servidor HTTP

Niveles: L40, L41, L43.

Arco:

- secuencial
- thread pool
- `epoll`
- HTTP/1.1 completo
- revisita opcional con `io_uring`

Equivalentes industriales: nginx, Apache, hyper.

### `minisync` — Sincronización de directorios

Niveles: L40, L41.

Arco:

- rolling checksum y comparación por bloques
- protocolo TCP de transferencia
- deltas sobre archivos grandes
- verificación de integridad como mejora avanzada

Equivalentes industriales: `rsync`, `rclone`, Syncthing.

Nota: este proyecto existía en el plan anterior y se preserva explícitamente en el rediseño, aunque no estuviera nombrado en el borrador v2.

### `tinyssh` — Implementación SSH

Niveles: L40, L42.

Arco:

- framing SSH-2 sobre TCP
- intercambio de claves con Curve25519
- AEAD y autenticación de clave pública
- reutilización de shell remoto y pseudoterminales

Equivalentes industriales: OpenSSH, libssh.

### `async-runtime` — Runtime asíncrono

Nivel principal: L43.

Arco:

- `Future` manual
- `Waker` y `RawWaker`
- executor single-thread
- reactor sobre `epoll`
- timers y comparación conceptual con Tokio y libuv

Equivalentes industriales: Tokio, async-std, smol, libuv.

### `minidocker` — Runtime de contenedores

Nivel principal: L44.

Arco:

- namespaces y cambio de root
- cgroups v2
- OverlayFS
- seccomp y capabilities

Equivalentes industriales: runc, youki, crun.

### `orquestador` — Orquestador de contenedores

Nivel principal: L45.

Arco:

- modelo de estado deseado
- scheduler
- red entre contenedores
- API, service discovery y healthchecks

Equivalentes industriales: Kubernetes, Nomad, Docker Swarm.

Nota de diseño: en esta versión del plan `orquestador` queda separado del consenso. Primero hay control plane único; la replicación llega después.

### `raft-lite` — Replicación y consenso

Nivel principal: L46.

Arco:

- elección de líder
- replicación de log por quórum
- heartbeats y timeouts
- adaptación opcional para replicar `KVolt`, `mem-cache` o `mini-broker`

Equivalentes industriales: etcd, Consul, ZooKeeper.

### `TCP/IP stack` — Pila TCP/IP en user space

Niveles: L41, L45.

Arco:

- Ethernet y ARP
- IPv4 y checksums
- máquina de estados TCP
- integración con la red del orquestador

Equivalentes industriales: smoltcp, lwIP.

### `JIT-Brain` — Compilador JIT

Nivel principal: L47.

Arco:

- IR simplificado
- selección de instrucciones
- páginas ejecutables
- backend nativo y extensión opcional WASM

Equivalentes industriales: LLVM, Cranelift, libgccjit.

### `char-driver`, `RAM-FileSystem`, `KVM mini-hypervisor`

Niveles: L48 y L49.

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
- `Lógico`
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

Al contrastar el borrador v2 contra `forja-contenido.md` anterior no quedó ninguna omisión pendiente: `minisync` ya quedó preservado. Sobre esa base, esta revisión agrega tres piezas nuevas al arco curricular: `mem-cache`, `mini-broker` y `raft-lite`.
