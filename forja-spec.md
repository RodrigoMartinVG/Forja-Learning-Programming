# Forja — Especificación de Diseño
## Plataforma de aprendizaje de programación de sistemas: C y Rust

> Este documento es una especificación de diseño y arquitectura. No contiene contenido curricular ni código. Describe qué existe en el proyecto, cómo se organiza, cómo se relaciona, y qué decisiones de diseño hay que tomar. Es un documento vivo: va a cambiar a medida que el proyecto evolucione.

---

## 1. Qué es Forja

Forja es una plataforma de aprendizaje de programación de bajo nivel centrada en C, Rust y sistemas operativos. No es un curso. No es una colección de ejercicios. No es una IDE en el navegador.

Es una experiencia de formación construida sobre tres pilares:

**Proyectos reales** que se implementan por fases, con código generado como punto de partida para estudiar, depurar y mejorar.

**Unidades teóricas** que cubren los fundamentos conceptuales de sistemas, lenguajes y compiladores, con ejemplos y código pero sin ser proyectos en sí mismos.

**Una narrativa de conexión** que da sentido al recorrido completo y relaciona los proyectos con la teoría y entre sí.

El resultado esperado no es "aprender a programar". Es construir una comprensión profunda de cómo funcionan los sistemas reales y ser capaz de implementar partes de ellos.

---

## 2. La persona que usa Forja

Quien se embarca en este proyecto sabe programar — tiene experiencia en algún lenguaje, entiende estructuras de control, funciones y tipos básicos. Pero no tiene experiencia profunda en sistemas, no conoce bien C ni Rust, no ha escrito un allocator ni un shell ni un parser.

Le interesa entender cómo funciona el mundo debajo de los frameworks. Quiere hacer cosas reales, no resolver puzzles abstractos. Está dispuesto a invertir tiempo: esto no es un curso de fin de semana.

No necesita saber de antemano cuánto tiempo le va a llevar. El mapa de progresión le permite entrar en cualquier punto, volver atrás cuando hace falta, y elegir qué tan profundo quiere ir en cada tema.

---

## 3. Los dos tracks principales

Forja tiene dos tipos de contenido que coexisten, se complementan y se referencian mutuamente, pero son estructuralmente distintos.

### 3.1 Track Teórico — Unidades conceptuales

Las unidades teóricas cubren conceptos, modelos mentales, fundamentos de lenguaje y teoría de sistemas. Tienen código, tienen ejemplos, tienen ejercicios cortos. Pero no son proyectos: no se construye un sistema completo en una unidad teórica.

Cada unidad teórica tiene una estructura fija:

- **Tema y motivación**: por qué esto importa, en qué contexto aparece
- **Desarrollo conceptual**: explicación del modelo, diagrama si aplica, analogías
- **Código de ilustración**: fragmentos que demuestran el concepto, no que construyen un sistema
- **Ejercicios puntuales**: preguntas de comprensión, modificaciones pequeñas al código de ejemplo
- **Referencias cruzadas**: qué proyectos usan este concepto, qué otras unidades lo complementan
- **Lectura adicional**: capítulos específicos de Kerrisk, Weiss u otras fuentes

Las unidades teóricas se organizan en tres dominios:

**Dominio de Lenguajes**: cubre C y Rust como lenguajes — sintaxis, semántica, herramientas, convenciones, errores típicos, patrones idiomáticos. No es teoría de compiladores; es aprender el lenguaje en profundidad.

**Dominio de Sistemas**: cubre teoría de sistemas operativos — procesos, memoria, scheduling, filesystems, redes, seguridad, virtualización. Responde al "por qué" de lo que los proyectos implementan.

**Dominio de Compiladores**: cubre teoría de lenguajes formales, autómatas, gramáticas, semántica, representaciones intermedias, análisis de tipos. Acompaña a los proyectos de compiladores e intérpretes que están distribuidos a lo largo del plan.

### 3.2 Track Práctico — Proyectos

Los proyectos son sistemas concretos construidos por fases. Cada proyecto tiene:

- **Descripción y objetivo**: qué se construye, por qué es interesante
- **Equivalente industrial**: qué herramienta o sistema real hace esto en producción
- **Dependencias**: qué proyectos o unidades teóricas conviene tener antes
- **Fases de implementación**: entre 3 y 5 fases, de menor a mayor complejidad
- **Código base por fase**: generado con IA como punto de partida, bien estructurado y documentado
- **Guía de estudio del código**: documento separado que acompaña al código de cada fase (ver sección 5)
- **Tests y fixtures**: lo necesario para verificar que el código funciona
- **Mejoras propuestas**: lista de extensiones no implementadas para que el usuario las construya
- **Referencias cruzadas**: qué unidades teóricas sustentan las decisiones de diseño del proyecto

Los proyectos se implementan en C y en Rust de forma independiente. No es traducción: en C se toman decisiones que en Rust serían distintas, y viceversa. Esas diferencias son parte del aprendizaje.

### 3.3 Cómo se relacionan los dos tracks

La relación no es "primero teoría, después práctica". Es una red de referencias bidireccionales.

Una unidad teórica puede decir: "este concepto aparece en la Fase 2 del proyecto KVolt y en la Fase 3 del proyecto MiniSQL."

Un proyecto puede decir: "para entender por qué diseñamos el allocator así, la unidad de Memoria Virtual es esencial. Para entender los tradeoffs de first-fit vs best-fit, ver la unidad de Algoritmos de Allocación."

El usuario elige su camino:
- Puede leer la teoría antes del proyecto (máxima comprensión antes de construir)
- Puede hacer el proyecto primero y consultar la teoría cuando aparece algo confuso (aprendizaje orientado a problemas)
- Puede ir y venir entre ambos (lo más común en la práctica)

Ningún camino está "mal". El mapa muestra las relaciones; el usuario navega.

---

## 4. Niveles y estructura del plan

El plan se organiza en 19 niveles (L0 a L18). Cada nivel tiene un foco temático claro y acotado. Los niveles no son obligatorios en orden estricto: tienen dependencias entre sí, pero el grafo de dependencias permite varios caminos válidos.

Dentro de cada nivel conviven unidades teóricas y proyectos del tipo correspondiente. Algunos proyectos atraviesan varios niveles (son multi-nivel); se anclan en el nivel donde empieza su fase más básica y se referencian desde los niveles que cubre su complejidad creciente.

### L0 — Entorno y Toolchain

**Foco**: Hacerse dueño del ambiente de trabajo antes de escribir una línea de sistema. No se aprende a programar aquí; se aprende a usar las herramientas que van a estar presentes en todo el plan.

**Unidades teóricas**: el modelo de compilación de C (preprocesador → compilador → assembler → linker); el sistema de tipos de Cargo y cómo cargo resuelve dependencias; qué es un sanitizer y cuándo usar cada uno; cómo leer output de valgrind y de ASan; qué hace perf y cómo interpretar un flamegraph; qué es strace y cómo se usa para entender syscalls de un programa desconocido.

**Proyectos**: setup del laboratorio Linux con devcontainer. No es un proyecto de sistemas, es un proyecto de configuración. El resultado es un ambiente reproducible con todas las herramientas instaladas y verificadas.

**Equivalente industrial**: Docker Desktop, Nix, distrobox, dev containers de VSCode.

**Nota sobre el ambiente**: el laboratorio vive en un contenedor Linux. Esto sirve tanto para usuarios que tienen Linux nativo (evitar romper el sistema con módulos de kernel o experimentos de cgroups) como para usuarios en macOS o Windows. La variante Windows usa devcontainers con WSL2. Esto también tiene la virtud de ser reproducible: el mismo devcontainer funciona en cualquier máquina.

---

### L1 — C como lenguaje: fundamentos

**Foco**: C como lenguaje, no como herramienta de sistemas. Sintaxis, tipos, structs, unions, enums, funciones, scope, linkage. El modelo de compilación ya se vio en L0.

**Unidades teóricas**: tipos enteros y su tamaño real (`int` no es siempre 32 bits; `stdint.h` existe por eso); punteros como valores numéricos — aritmética de punteros, punteros a punteros, punteros a función; structs y alineación — padding, `__attribute__((packed))`; el preprocesador como sustitución textual y por qué eso es peligroso; `const` correctness; `restrict`; undefined behavior como categoría formal — por qué no es "comportamiento aleatorio" sino un contrato roto.

**Herramientas de lenguaje**: make y cmake básico; flags de compilación importantes; clang-format y clang-tidy; cppcheck.

**Proyectos de nivel L1** (pequeños, focalizados): reimplementación de funciones de `<string.h>` (memcpy, strlen, strtok); un lexer de tokens muy simple que tokeniza texto plano.

**Errores típicos a documentar**: `=` vs `==` en condiciones; olvidar el `break` en switch; confundir `sizeof(array)` en un puntero vs en el array real; comparar `char *` con `==`; olvidar `\0`; modificar un string literal.

---

### L2 — C como lenguaje: memoria y gestión manual

**Foco**: El modelo de memoria de C. Stack, heap, segmento de datos. malloc/free. El ciclo de vida de la memoria y los errores que surgen cuando se rompe.

**Unidades teóricas**: layout de memoria de un proceso (text, data, bss, heap, stack); stack frames y cómo crece el stack en cada llamada; `malloc`/`free`/`realloc`/`calloc` — qué garantizan, qué no; por qué free no devuelve memoria al SO inmediatamente; las tres categorías de error de memoria (use-after-free, double-free, buffer overflow) y cómo ASan los detecta; valgrind memcheck — cómo interpretar cada tipo de error; el modelo de ownership conceptual (antes de Rust): "quien lo alloca, lo libera".

**Proyectos de nivel L2**: un parser de argumentos de línea de comando desde cero (tipo `getopt`); un vector dinámico genérico con `void *` y punteros a función.

**Herramientas**: valgrind memcheck, ASan, UBSan. Se usan en cada proyecto de aquí en adelante.

---

### L3 — Rust como lenguaje: ownership y borrowing

**Foco**: Rust como lenguaje, empezando por el concepto que lo diferencia de todo lo demás. El borrow checker no es un obstáculo: es un sistema de tipos que captura en tiempo de compilación los errores que C detecta en runtime (con suerte) o no detecta (muchas veces).

**Unidades teóricas**: ownership como invariante — una sola variable es dueña de un valor a la vez; move semantics vs copy semantics; borrowing — referencias compartidas (`&T`) y exclusivas (`&mut T`); lifetimes como región de validez de una referencia; por qué el borrow checker rechaza algunas cosas que "parecen seguras"; `Clone` vs `Copy`; `Drop` como destructor garantizado.

**Herramientas**: rustup, cargo, clippy, rustfmt, rust-analyzer. cargo test, cargo bench, cargo doc.

**Proyectos de nivel L3**: reimplementación de estructuras de datos básicas en Rust — linked list (el clásico que enseña lifetimes), binary search tree, hash map simple.

**Errores típicos a documentar**: mover un valor y seguir usándolo; borrow inmutable mientras existe borrow mutable; retornar referencia a variable local; usar `clone()` cuando no hace falta (señal de no entender ownership).

---

### L4 — Rust como lenguaje: tipos, traits y manejo de errores

**Foco**: El sistema de tipos de Rust más allá del borrow checker. Traits como contratos, genéricos, tipos algebraicos, y la filosofía de manejo de errores.

**Unidades teóricas**: traits — `Display`, `Debug`, `From`, `Into`, `Iterator`, `Deref`; genéricos y monomorphization vs dynamic dispatch (`impl Trait` vs `dyn Trait`); `Option<T>` y `Result<T, E>` como tipos, no como convenciones; el operador `?` y cómo propaga errores; tipos `newtype` para encapsular invariantes; `PhantomData` y tipos fantasma; macros declarativas (`macro_rules!`) vs procedurales — cuándo usar cada una; `unsafe` — qué deshabilita, cuándo es necesario, cómo contenerlo.

**Proyectos de nivel L4**: un iterador personalizado con estado; una librería de parsing combinadores minimal (tipo `nom` simplificado).

---

### L5 — POSIX: archivos, metadatos y el filesystem

**Foco**: La abstracción central de Unix — todo es un archivo. Inodos, descriptores, permisos, metadatos y traversal de directorios.

**Unidades teóricas**: el inode como estructura del filesystem — qué contiene, qué no; file descriptors como enteros que indexan la tabla de archivos del proceso; la distinción entre pathname, inode y file descriptor; permisos POSIX — bits rwx, suid/sgid/sticky, umask; hard links vs symbolic links — por qué un archivo puede tener muchos nombres; el filesystem virtual de Linux — cómo ext4, tmpfs y /proc comparten la misma interfaz; `/proc` como filesystem — qué expone y cómo se construye dinámicamente.

**Proyectos focalizados**: `spl_stat` (metadatos de archivos); `spl_ls` (listado de directorio); `spl_du` (uso de disco recursivo); `file-monitor` (vigilancia de cambios con inotify).

**Equivalentes industriales**: `stat(1)`, `ls(1)`, `du(1)`, `find(1)`, `inotifywait`, `watchman`, `entr`.

---

### L6 — Procesos y señales

**Foco**: El proceso como unidad de ejecución. Cómo se crean, cómo se terminan, cómo se comunican a través de señales, y cómo el kernel registra su existencia.

**Unidades teóricas**: el proceso como contexto de ejecución — espacio de memoria, tabla de FDs, señales pendientes, credenciales; `fork()` y copy-on-write — qué se comparte y qué se copia; la familia `exec` — cómo se reemplaza el image del proceso; `wait()` y `waitpid()` — por qué los zombies existen y cómo evitarlos; señales como interrupciones asíncronas — `sigaction`, máscaras, `SA_RESTART`; `SIGCHLD`, `SIGPIPE`, `SIGSEGV` — qué significan en la práctica; `/proc` como vista del árbol de procesos.

**Proyectos focalizados**: `spl_pstree` (árbol de procesos desde /proc); `impl_abort` (reimplementación de abort()); `impl_alarm` (reimplementación de alarm() con setitimer).

**Proyectos integradores que empiezan aquí**: `mish` (el shell — ver más abajo).

---

### L7 — Memoria virtual

**Foco**: Cómo el kernel gestiona la memoria — no desde el punto de vista del allocator (eso es L8) sino desde el punto de vista del sistema operativo. MMU, paginación, espacios de direcciones, mmap.

**Unidades teóricas**: la MMU y la traducción de direcciones virtuales a físicas; la page table y sus niveles (x86_64 usa 4 niveles); page faults — cuándo ocurren y cómo los maneja el kernel; demand paging y copy-on-write; `mmap()` — mapear archivos o memoria anónima; `MAP_PRIVATE` vs `MAP_SHARED`; VMA (Virtual Memory Areas) y cómo `/proc/PID/maps` las expone; overcommit — por qué Linux te deja reservar más memoria de la que tiene; el OOM killer.

**Proyectos focalizados**: explorador de VMAs (`/proc/self/maps`); demostración de copy-on-write con fork(); implementación de `spl_cp` usando mmap + memcpy.

---

### L8 — Allocators

**Foco**: Implementar `malloc` y `free` desde cero, entender fragmentación, y diseñar allocators más sofisticados. Es el nivel donde la teoría de memoria virtual se convierte en código de bajo nivel real.

**Unidades teóricas**: el heap como región de memoria creciente — `sbrk()` vs `mmap()`; el header de bloque y cómo compactar size + free bit; algoritmos de ajuste (first-fit, best-fit, next-fit) y sus tradeoffs de velocidad y fragmentación; coalescencia de bloques adyacentes — boundary tags (Knuth); segregated free lists — bins por tamaño; thread-safety — mutex global vs arenas por thread; por qué jemalloc y mimalloc son tan distintos de ptmalloc2.

**Proyectos**: `custom-malloc v1` (sbrk + free list + first-fit + coalescencia); `custom-malloc v2` (segregated bins + thread-safety + benchmarks vs glibc); el GC mark-and-sweep para el intérprete Lógico (se conecta con L13).

**Equivalentes industriales**: jemalloc, mimalloc, tcmalloc, snmalloc, Hoard, ptmalloc2 (glibc).

---

### L9 — Concurrencia: threads y primitivas

**Foco**: Threads POSIX, sincronización y los problemas clásicos de concurrencia. No es concurrencia asíncrona (eso es L16); es concurrencia basada en threads con memoria compartida.

**Unidades teóricas**: thread como flujo de ejecución dentro de un proceso — qué comparte, qué no; `pthread_create`, `pthread_join`, `pthread_detach`; data race como UB en C y como error de compilación en Rust; mutex — acquire/release, el invariante que protege; condition variables — espera sin busy-wait, el patrón `while(!cond) wait()`; semáforos — `sem_post` y `sem_wait`; deadlock — las cuatro condiciones de Coffman; `futex(2)` como primitiva subyacente; el modelo de memoria de C11/C++11 — `atomic_t`, ordering (sequentially consistent, acquire/release, relaxed).

**Proyectos**: thread pool con queue de trabajo y condition variable; productor-consumidor con buffer acotado; implementación de un rwlock desde cero sobre mutex + condvar.

**Equivalentes industriales**: OpenMP, Intel TBB, rayon (Rust), Java ExecutorService.

---

### L10 — IPC y comunicación entre procesos

**Foco**: Cómo se comunican procesos distintos. Pipes, FIFOs, shared memory, message queues. La diferencia entre threads (memoria compartida) y procesos (memoria aislada, necesitan IPC explícito).

**Unidades teóricas**: pipes anónimas — `pipe(2)`, heredar FDs en fork, cerrar el extremo no usado; FIFOs nombradas — `mkfifo`, apertura bloqueante; POSIX shared memory — `shm_open`, `ftruncate`, `mmap`; semáforos POSIX nombrados vs de memoria compartida; System V IPC — msgsnd/msgrcv, shmget/shmat, semop — por qué existe y por qué POSIX IPC es preferible hoy; diseño de un protocolo de wire format — header + payload, serialización, framing.

**Proyectos focalizados**: semáforo binario sobre named pipes; explorador de objetos IPC del sistema (tipo `ipcs(1)`).

**Proyectos integradores que empiezan aquí**: `miniqueue` (message queue tipo RabbitMQ — ver más abajo).

---

### L11 — Lexers y parsers

**Foco**: Primer arco de compiladores. Cómo se transforma texto en estructura. Autómatas finitos, gramáticas, recursive descent parsing. Este nivel aparece antes de lo que sería "esperable" porque los proyectos de compiladores son los más formativos del plan y conviene empezarlos pronto.

**Unidades teóricas**: el problema del parsing — por qué es más difícil que "buscar con regex"; autómatas finitos deterministas (DFA) y no deterministas (NFA) como modelos de lexers; construcción de subconjuntos — conversión NFA → DFA; gramáticas libres de contexto (CFG) en notación BNF/EBNF; conjuntos FIRST y FOLLOW para parsers LL(1); parsing recursive descent — una función por regla de gramática; Pratt parsing para precedencia de operadores — el algoritmo correcto para expresiones; Abstract Syntax Tree (AST) — qué nodos tiene, cómo se construye; el patrón visitor para recorrer y transformar un AST.

**Proyectos focalizados**: lexer de un lenguaje de marcado simple (proyecto Semtex, Fase 1); parser de expresiones aritméticas con precedencia correcta.

**Proyectos integradores que empiezan aquí**: `Semtex` (parser semántico — ver más abajo); `Lógico` (intérprete Lisp — ver más abajo, empieza el lexer/reader aquí).

**Equivalentes industriales**: flex, re2c, logos (Rust), nom, pest, tree-sitter, ANTLR.

---

### L12 — Intérpretes y evaluadores

**Foco**: Darle vida a un AST. Evaluación de expresiones, entornos léxicos, closures, recursión. Este nivel transforma el parser de L11 en un lenguaje que puede ejecutar código.

**Unidades teóricas**: el ciclo read-eval-print (REPL) como estructura de un intérprete; evaluación por recursión sobre el AST — el modelo de árbol sintáctico como programa; entornos como estructuras de datos — tablas de símbolos encadenadas (frame → parent); scope léxico vs dinámico — por qué el scope léxico es más fácil de razonar; closures — capturar el entorno en tiempo de definición, no de ejecución; tail call optimization — por qué importa en lenguajes funcionales; el modelo de evaluación de SICP capítulo 4 como referencia canónica.

**Proyectos**: `Lógico v1` (intérprete Lisp completo con closures y recursión); `Semtex` Fase 2 (AST completo) y Fase 3 (validación semántica).

**Nota**: el garbage collector de Lógico (mark-and-sweep) se implementa usando el allocator de L8 — primera conexión explícita entre proyectos de distintos dominios.

---

### L13 — Sistemas de tipos e inferencia

**Foco**: Cómo un compilador deduce tipos sin que el programador los anote. El algoritmo de Hindley-Milner y su implementación. Este nivel es teóricamente exigente pero el proyecto resultante (un type checker real) vale el esfuerzo.

**Unidades teóricas**: tipos simples — tau ::= Int | Bool | tau → tau; variables de tipo como incógnitas; constraints de tipo — ecuaciones entre tipos generadas durante el análisis; el algoritmo de unificación de Robinson — cómo se resuelven ecuaciones de tipos; union-find (Tarjan) como estructura eficiente para unificación; el algoritmo W de Damas-Milner para inferencia con polimorfismo; let-generalización y cuantificación universal; por qué Rust no tiene HM completo (las implicaciones de traits); polimorfismo de subtipos vs polimorfismo paramétrico.

**Proyectos**: `Lógico v2` — agregar inferencia de tipos HM al intérprete; `Semtex` Fase 3 — validación semántica de tipos en el AST.

---

### L14 — Persistencia y almacenamiento

**Foco**: Durabilidad de datos. Cómo se pasa de "archivos" a "bases de datos". B-Trees, LSM-Trees, WAL, crash recovery. El nivel que separa los sistemas que sobreviven un apagado de los que no.

**Unidades teóricas**: durabilidad como propiedad formal — qué garantiza fsync(); el Write-Ahead Log (WAL) como patrón — log primero, estructura después; B-Tree — estructura de nodo, inserción con split, búsqueda y delete con merge; por qué B-Tree es bueno para lecturas y mediocre para escrituras intensas; LSM-Tree — MemTable + SSTables + compactación; B-Tree vs LSM-Tree — el tradeoff fundamental de bases de datos; MVCC básico — snapshot isolation y versiones de filas; SQL como lenguaje — gramática, planner, joins, transacciones.

**Proyectos**: `KVolt v1` (hash map + append-only log + crash recovery); `KVolt v2` (B-Tree o LSM-Tree + compactación + índices persistentes); `MiniSQL` (motor SQL con parser, joins y MVCC básico).

**Equivalentes industriales**: Redis, LevelDB, RocksDB, SQLite, DuckDB, LMDB, sled (Rust).

---

### L15 — Redes y protocolos

**Foco**: Sockets TCP, el protocolo HTTP, sincronización remota de archivos. La plomería que conecta procesos en máquinas distintas.

**Unidades teóricas**: el modelo de capas — por qué existe la separación entre transporte y aplicación; sockets como abstracciones — `socket/bind/listen/accept/connect`; TCP como protocolo orientado a conexión — handshake, flow control, congestion control; el ciclo de vida de una conexión TCP y los estados de la máquina de estados; HTTP/1.1 como protocolo de texto — request line, headers case-insensitive, body con Content-Length; keep-alive y chunked encoding; el problema de los servidores concurrentes — iterativo vs fork-per-client vs thread pool vs event loop; `epoll` y event-driven I/O — edge-triggered vs level-triggered.

**Proyectos**: `HTTP server` (cuatro fases: secuencial → thread pool → epoll → HTTP/1.1 completo); `shell remoto TCP` (ejecutar comandos sobre una conexión TCP — base del SSH); `minisync` (sincronización de directorios tipo rsync con rolling checksum y deltas).

**Equivalentes industriales**: nginx, Apache, hyper (Rust), axum, actix-web, rsync, rclone, syncthing.

---

### L16 — Seguridad y criptografía

**Foco**: Criptografía aplicada, no teoría de números. Qué primitivas existen, cuándo usar cada una, y cómo construir un protocolo seguro encima. El proyecto integrador es tinyssh.

**Unidades teóricas**: criptografía simétrica vs asimétrica — cuándo usar cada una; AEAD (Authenticated Encryption with Associated Data) — qué garantiza y qué no; ChaCha20-Poly1305 vs AES-256-GCM — tradeoffs de rendimiento (hardware AES-NI); ECDH con Curve25519 — intercambio de clave sin transmitir la clave; Ed25519 para firmas digitales — generación, firma, verificación; el protocolo SSH-2 — formato de paquete, negociación de algoritmos, multiplexación de canales; por qué no inventar primitivas criptográficas propias; el modelo de amenaza — qué protege SSH y qué no protege.

**Proyectos**: `tinyssh v1` (TCP + ECDH + framing SSH-2); `tinyssh v2` (AEAD + Ed25519 + autenticación por clave pública); `impl_script` (pseudoterminales para grabar sesiones de terminal — conecta con tinyssh para sesiones remotas).

**Equivalentes industriales**: OpenSSH, rustls, ring (BoringSSL bindings), openssl.

---

### L17 — Aislamiento y contenedores

**Foco**: Cómo Linux implementa el aislamiento de procesos. Namespaces, cgroups, OverlayFS. Construir un runtime de contenedores desde cero usando las primitivas del kernel.

**Unidades teóricas**: namespaces de Linux — los siete tipos (PID, NET, MNT, UTS, IPC, USER, TIME) y qué aisla cada uno; cgroups v2 — jerarquía unificada, controllers (memory, cpu, pids), cómo escribir en `/sys/fs/cgroup/`; `pivot_root(2)` vs `chroot(2)` — por qué pivot_root es más seguro; OverlayFS — lowerdir (imagen de lectura), upperdir (capa de escritura), merged; el OCI Image Spec y el OCI Runtime Spec — los estándares que definen qué es un contenedor; seccomp — filtrar syscalls permitidas; capabilities — por qué los contenedores no deben correr como root real.

**Proyectos**: `minidocker` (runtime de contenedores completo con namespaces + cgroups v2 + pivot_root + OverlayFS + seccomp).

**Nota sobre herramientas**: minidocker usa las primitivas del kernel directamente pero también usa librerías industriales donde corresponde (libseccomp para seccomp, nix crate para las syscalls POSIX en Rust). No se reinventa lo que ya existe de forma robusta.

**Equivalentes industriales**: Docker Engine, podman, containerd, runc, youki, crun.

---

### L18 — Orquestación y sistemas distribuidos

**Foco**: Coordinar múltiples contenedores como unidad. Scheduling, networking entre contenedores, reconciliation loop, API. El nivel más complejo del plan en términos de arquitectura de sistema.

**Unidades teóricas**: el modelo de computación distribuida — qué es diferente cuando los procesos no comparten memoria; el problema de la consistencia — CAP theorem como marco conceptual; el reconciliation loop como patrón de control — estado deseado vs estado actual, apply del diff; scheduling de tareas — bin-packing, round-robin, constraints de recursos; networking entre contenedores — veth pairs, Linux bridge, iptables para NAT y routing; service discovery — cómo un contenedor encuentra a otro; healthchecks — diferencia entre liveness y readiness.

**Proyectos**: `orquestador` (scheduler + red via veth pairs + API HTTP REST + reconciliation loop + healthchecks).

**Nota**: este proyecto usa minidocker (o un runtime compatible OCI) como dependencia. La decisión es usar el runtime propio para entender el flujo completo, pero la API del orquestador puede hablar con cualquier runtime que implemente OCI.

**Equivalentes industriales**: Kubernetes, Nomad, Docker Swarm, Fly.io, Mesos.

---

### L19 — Generación de código y JIT

**Foco**: El último arco de compiladores. Emitir código máquina en tiempo de ejecución. Representaciones intermedias, asignación de registros, páginas ejecutables. El proyecto JIT-Brain cierra el ciclo que empezó en L11.

**Unidades teóricas**: representación intermedia (IR) — qué es SSA (Static Single Assignment) y por qué facilita optimizaciones; selección de instrucciones x86_64 — encodings de opcode, ModRM byte, prefijos REX; asignación de registros — linear scan como algoritmo práctico, spilling al stack; mmap con `PROT_READ|PROT_WRITE|PROT_EXEC` para páginas ejecutables — y por qué W^X existe como protección de seguridad; calling convention x86_64 System V ABI — cómo se pasan argumentos y se devuelven valores; JIT vs AOT — cuándo conviene compilar en tiempo de ejecución.

**Proyectos**: `JIT-Brain` (IR + emisión de opcodes x86_64 + páginas PROT_EXEC + compilación de Lógico a código nativo).

**Equivalentes industriales**: LLVM, Cranelift (Wasmtime), libgccjit, QBE, MIR (GCC).

---

### L20 — Kernel space

**Foco**: El límite del user space. Módulos de kernel Linux, un filesystem propio registrado en VFS, y virtualización por hardware con la API KVM. Es el nivel más técnico del plan y el único que no tiene equivalente en Rust puro (los módulos de kernel son C por definición, aunque existen proyectos experimentales en Rust).

**Unidades teóricas**: la frontera kernel/user — por qué los errores en kernel space son fatales; Linux Kernel Module — estructura básica, `module_init`/`module_exit`, `MODULE_LICENSE`; `file_operations` como tabla de callbacks — qué implementa un driver de carácter; `copy_to_user`/`copy_from_user` — la frontera de seguridad; spinlocks vs mutex de kernel — contexto de interrupción vs contexto de proceso; la capa VFS — las cuatro estructuras centrales (`super_block`, `inode`, `dentry`, `file`); la API KVM — `/dev/kvm`, `ioctl KVM_CREATE_VM`, `KVM_CREATE_VCPU`, la struct `kvm_run` y los tipos de exit.

**Proyectos**: `char-driver` (módulo de kernel con lectura/escritura/ioctl en `/dev/`); `RAM-FileSystem` (filesystem montable registrado en VFS); `KVM mini-hypervisor` (VCPU + carga de código en modo real + manejo de VM exits).

**Equivalentes industriales**: Linux kernel, FUSE (user-space filesystem), QEMU/KVM, Firecracker, Cloud Hypervisor, seL4.

---

## 5. La guía de estudio del código

Cada fase de cada proyecto viene con dos artefactos separados:

**El código**: bien estructurado, documentado con comentarios que explican decisiones no obvias. Generado por IA como punto de partida, revisado para ser correcto y pedagógico.

**La guía de estudio**: un documento separado del código que acompaña la lectura. No es documentación del código (eso ya lo tienen los comentarios). Es un guía de lectura que:

- Propone un orden de lectura de los archivos — no siempre el orden alfabético es el más pedagógico
- Explica las decisiones de diseño y por qué se tomaron
- Señala los puntos del código donde conviene pausar y pensar antes de seguir
- Propone experimentos: qué pasa si cambio este parámetro, si cometo este error, si uso esta otra estructura
- Conecta lo que se ve en el código con la teoría del nivel correspondiente
- Anticipa preguntas frecuentes

La guía de estudio no reemplaza leer el código. Es un acompañante para esa lectura.

---

## 6. Taxonomía de proyectos

Los proyectos se clasifican en dos categorías que no son excluyentes sino graduales:

### Proyectos focalizados

Pequeños, autocontenidos, apuntan a demostrar un concepto o syscall específico. Se pueden completar en pocas horas. Son buenos para confirmar que se entendió algo antes de seguir. Ejemplos: `spl_stat`, `impl_abort`, `file-monitor`, `atomic_append`, `pipe_bandwidth`.

### Proyectos integradores

Multi-fase, combinan conceptos de varios niveles, construyen un sistema completo. Son los proyectos de "referencia" del plan — los que dan nombre a lo que uno sabe hacer. Se completan en días o semanas. Ejemplos: `mish` (shell), `KVolt` (base de datos KV), `minidocker`, `tinyssh`, `Lógico` (intérprete Lisp), `MiniSQL`, `TCP/IP stack`, `orquestador`.

Los proyectos integradores tienen una propiedad importante: sus fases son incrementales y cada fase es un sistema funcionando. No hay una fase que sea "trabajo de plomería sin resultado visible". Cada fase agrega capacidad observable.

---

## 7. Los proyectos integradores — descripción de alto nivel

Esta sección describe brevemente los proyectos más grandes del plan para tener una visión de conjunto. No es la especificación completa de cada proyecto.

### `mish` — Mini Shell
Niveles: L6, L10. Equivalente: bash, zsh, dash.
El shell como integrador de procesos, señales y file descriptors. Cuatro fases: REPL + comandos internos → fork+exec → pipes y redirecciones → job control y señales. En Rust: usar `nix` crate para las syscalls no cubiertas por `std`.

### `miniqueue` — Message Queue
Niveles: L10. Equivalente: RabbitMQ, NATS, ZeroMQ.
Un broker de mensajes sobre IPC POSIX. Fases: protocolo de wire format + shared memory producer-consumer → routing por topic → persistencia en disco → ACK y redelivery para garantía at-least-once. En Rust: aprovechar channels de tokio como contraste con la implementación manual.

### `custom-malloc` — Allocator
Niveles: L8. Equivalente: jemalloc, mimalloc.
Implementar malloc desde sbrk hasta segregated bins con thread-safety. La fase final incluye benchmarks contra glibc malloc con mimalloc-bench.

### `KVolt` — Base de Datos Key-Value
Niveles: L14. Equivalente: RocksDB, LevelDB, Redis.
Fase 1: hash map + append-only log. Fase 2: WAL + crash recovery. Fase 3: B-Tree o LSM-Tree con compactación. Fase 4: índices persistentes con mmap y concurrencia.

### `MiniSQL` — Motor SQL
Niveles: L14. Equivalente: SQLite, DuckDB.
Parser SQL (recursive descent) → planner con estimación de costo → joins (nested-loop y hash join) → transacciones con MVCC básico. Usa KVolt como storage engine.

### `Semtex` — Parser de Marcado
Niveles: L11, L12, L13. Equivalente: pandoc, pulldown-cmark, tree-sitter.
Lexer → AST → validación semántica → emitter HTML/MathML. Es el proyecto que enseña el pipeline completo de compilación sin la complejidad de un lenguaje de propósito general.

### `Lógico` — Intérprete Lisp
Niveles: L11, L12, L13, L8, L19. Equivalente: Guile, Chicken Scheme, Janet.
Reader de S-expressions → evaluador con entornos y closures → garbage collector mark-and-sweep (usa el allocator de L8) → inferencia de tipos HM → compilación JIT (usa JIT-Brain de L19). Es el proyecto que atraviesa más niveles del plan.

### `HTTP Server` — Servidor HTTP Asíncrono
Niveles: L15. Equivalente: nginx, hyper.
Cuatro fases de arquitectura creciente: iterativo → thread pool → epoll event loop → HTTP/1.1 completo con keep-alive y chunked encoding.

### `minisync` — Motor de Sincronización
Niveles: L15. Equivalente: rsync, rclone.
Rolling checksum (Adler-32) → deltas a nivel bloque → protocolo TCP para transferencia → HMAC para verificar integridad.

### `tinyssh` — Implementación SSH
Niveles: L15, L16. Equivalente: OpenSSH, libssh.
TCP mux + framing SSH-2 → ECDH Curve25519 → ChaCha20-Poly1305 / AES-GCM → Ed25519 + autenticación por clave pública. Usa el shell remoto TCP de L15 como base.

### `minidocker` — Runtime de Contenedores
Niveles: L17. Equivalente: runc, youki.
pivot_root + namespaces → cgroups v2 → OverlayFS → seccomp + capabilities. Implementación de un subconjunto del OCI Runtime Spec.

### `orquestador` — Orquestador de Contenedores
Niveles: L18. Equivalente: Kubernetes, Nomad.
Modelo de datos (Pod/Container/Node) → scheduler → red via veth pairs → reconciliation loop + API HTTP → healthchecks + service discovery.

### `JIT-Brain` — Compilador JIT
Niveles: L19. Equivalente: Cranelift, libgccjit.
IR simplificado → selección de instrucciones x86_64 → páginas PROT_EXEC → compilación de un subconjunto de Lógico a código nativo.

### `TCP/IP Stack` — Pila TCP/IP en User Space
Niveles: L15, L18. Equivalente: smoltcp, lwIP.
Interfaz TUN/TAP → decodificación Ethernet + ARP → IPv4 con checksums → máquina de estados TCP completa.

### `char-driver` + `RAM-FS` + `KVM hypervisor`
Niveles: L20. Los tres proyectos de kernel space, en C exclusivamente.

---

## 8. C y Rust como ciudadanos de primera clase

C y Rust no son "el mismo proyecto traducido". Cada implementación toma las decisiones propias de cada lenguaje.

**En C**: gestión manual de memoria, structs sin métodos, punteros explícitos, Makefile o CMake, valgrind y ASan como compañeros permanentes. Los errores son fatales en runtime si uno no tiene cuidado.

**En Rust**: ownership y borrow checker como guías de diseño, tipos algebraicos, Result para errores, cargo como build system, clippy como linter. Los errores que en C son UB en runtime, en Rust no compilan.

Las diferencias de diseño entre las dos implementaciones son material pedagógico en sí mismas. La guía de estudio de cada proyecto señala explícitamente dónde C y Rust divergen y por qué.

**Herramientas de C que se aprenden en el camino**:
`gcc` y `clang` y sus flags; `make` y `cmake`; `gdb`; `valgrind` (memcheck, callgrind, massif); ASan, UBSan, MSan; `perf`; `strace`; `ltrace`; `gprof`; `nm`, `objdump`, `readelf`; `ar` y `ranlib` para librerías estáticas; `ldd` para ver dependencias dinámicas.

**Herramientas de Rust que se aprenden en el camino**:
`rustup` y toolchains; `cargo` (build, test, bench, doc, clippy, fmt, expand, flamegraph); `rust-analyzer`; `miri`; `cargo-audit`; `cargo-deny`; `cbindgen` para exponer Rust a C; `bindgen` para usar C desde Rust.

---

## 9. El principio de herramientas industriales en proyectos avanzados

Para los proyectos simples y focalizados, la política es construir todo desde cero — es el punto. Para los proyectos integradores avanzados, la política es usar librerías industriales donde corresponda.

**Por qué**: si alguien está construyendo minidocker, el objetivo de aprendizaje es entender namespaces y cgroups, no re-implementar `libseccomp`. Usar `libseccomp` directamente enseña la API industrial que se usa en producción y hace el proyecto más robusto. Mismo razonamiento para `ring` en tinyssh (no se reinventa AES-GCM) o `libunwind` en un debugger.

**La regla práctica**: si un componente es infraestructura de plomería bien conocida que ya tiene librerías auditadas y estables, se usa la librería. Si el componente es el foco pedagógico del nivel, se implementa desde cero.

Esto tiene un beneficio adicional: los proyectos avanzados quedan más robustos y potencialmente útiles más allá del aprendizaje. Un minidocker que usa libseccomp correctamente es un runtime de contenedores real.

---

## 10. Equivalentes industriales — el propósito de esta información

Cada proyecto menciona su equivalente industrial por una razón específica: mostrar que lo que se está construyendo no es un ejercicio artificial sino una versión simplificada de sistemas que existen y se usan.

Esto tiene dos efectos. Primero, da contexto y motivación — uno sabe que está tocando algo real. Segundo, invita a comparar — después de implementar el allocator propio, leer el código fuente de jemalloc o mimalloc tiene un sentido completamente diferente al de intentar leerlo sin ese fondo.

La mención del equivalente industrial también abre la pregunta "¿por qué el industrial es tan más complejo?" — y esa pregunta tiene respuestas que enseñan mucho sobre las limitaciones del propio diseño.

---

## 11. Estructura del repositorio

```text
forja/
├── README.md                          # Punto de entrada del repo
├── ROADMAP.md                         # Grafo de dependencias del plan completo
│
├── theory/                            # Track teórico
│   ├── languages/
│   │   ├── c/
│   │   │   ├── L1-fundamentals/
│   │   │   ├── L2-memory/
│   │   │   └── ...
│   │   └── rust/
│   │       ├── L3-ownership/
│   │       ├── L4-types-traits/
│   │       └── ...
│   ├── systems/
│   │   ├── L5-posix-files/
│   │   ├── L6-processes/
│   │   ├── L7-virtual-memory/
│   │   └── ...
│   └── compilers/
│       ├── L11-lexers-parsers/
│       ├── L12-interpreters/
│       ├── L13-type-systems/
│       └── L19-codegen-jit/
│
├── projects/                          # Track práctico
│   ├── focused/                       # Proyectos focalizados
│   │   ├── spl_stat/
│   │   │   ├── c/
│   │   │   │   ├── phase-1/
│   │   │   │   │   ├── src/
│   │   │   │   │   ├── tests/
│   │   │   │   │   ├── README.md
│   │   │   │   │   └── STUDY_GUIDE.md
│   │   │   │   └── ...
│   │   │   └── rust/
│   │   │       └── ...
│   │   ├── impl_abort/
│   │   ├── file-monitor/
│   │   └── ...
│   └── integrating/                   # Proyectos integradores
│       ├── mish/
│       ├── kvolt/
│       ├── minisql/
│       ├── miniqueue/
│       ├── semtex/
│       ├── logico/
│       ├── http-server/
│       ├── minisync/
│       ├── tinyssh/
│       ├── minidocker/
│       ├── orchestrator/
│       ├── jit-brain/
│       ├── tcp-ip-stack/
│       └── kernel/
│           ├── char-driver/
│           ├── ram-fs/
│           └── kvm-hypervisor/
│
├── shared/                            # Recursos compartidos
│   ├── diagrams/                      # Diagramas reutilizables
│   ├── snippets/                      # Fragmentos de código transversales
│   └── glossary/                      # Glosario de términos
│
├── metadata/                          # Estructura lógica del plan
│   ├── levels.yaml                    # Definición de los 20 niveles
│   ├── projects.yaml                  # Metadata de todos los proyectos
│   ├── dependencies.yaml              # Grafo de dependencias
│   └── cross-references.yaml         # Referencias entre teoría y proyectos
│
├── devcontainer/                      # Ambiente de laboratorio Linux
│   ├── .devcontainer/
│   │   ├── devcontainer.json
│   │   └── Dockerfile
│   └── README.md                      # Instrucciones de setup
│
└── web/                               # Aplicación web (TypeScript + Vite)
    ├── src/
    ├── public/
    ├── index.html
    └── vite.config.ts
```

### Qué vive en cada parte

**`theory/`**: unidades teóricas organizadas por dominio y nivel. Cada unidad es un directorio con al menos un `README.md` de contenido, ejemplos de código en `src/`, y un archivo de referencias cruzadas. No tienen tests porque no construyen sistemas.

**`projects/focused/`** y **`projects/integrating/`**: cada proyecto es un directorio con subdirectorios por lenguaje y por fase. Cada fase tiene código, tests, README y guía de estudio. La separación C/Rust en el proyecto permite comparar implementaciones.

**`metadata/`**: los archivos YAML son la fuente de verdad del grafo de dependencias y las relaciones entre contenidos. La web los lee para construir el mapa de navegación.

**`devcontainer/`**: el ambiente de laboratorio. Un `devcontainer.json` que configura VSCode Remote o GitHub Codespaces, con todas las herramientas preinstaladas: `gcc`, `clang`, `gdb`, `valgrind`, `perf`, `strace`, `rustup` con stable y nightly, `cargo` con extensiones esenciales, `cmake`, `ninja`, `linux-headers` para proyectos de kernel.

---

## 12. La web

La web es la capa de presentación y navegación. Su función es convertir la estructura del repo en una experiencia de lectura y exploración que no se puede tener solo con un README.

### Qué hace la web que el repo solo no puede hacer

- **Mapa visual del plan**: el grafo de dependencias entre proyectos y unidades, navegable e interactivo
- **Referencias cruzadas clickeables**: desde una unidad teórica, ir directamente a los proyectos que la usan
- **Progreso del usuario**: qué completó, qué tiene desbloqueado, qué puede hacer después
- **Animaciones y diagramas interactivos**: cosas que no se pueden hacer en Markdown plano
- **Búsqueda**: buscar un concepto y ver en qué unidades y proyectos aparece

### Qué no hace la web

- No tiene IDE integrada
- No ejecuta código
- No evalúa si el proyecto del usuario está correcto
- No reemplaza leer el código en el editor real del usuario

### Stack técnico

TypeScript + Vite + React (o Svelte, la decisión queda abierta). La web lee los archivos YAML de `metadata/` en build time y genera el grafo de contenidos. Los archivos Markdown de teoría y proyectos se procesan en build time (con remark/rehype o mdx) y se sirven como páginas estáticas.

### Acceso al contenido del repo desde la web

El navegador no puede leer el filesystem directamente. Las opciones son:

**Build-time processing** (recomendado como punto de partida): Vite importa los Markdown y YAML en tiempo de build. El resultado es un sitio estático que se puede servir desde Vercel, Netlify o GitHub Pages sin servidor.

**Dev server local**: en desarrollo, Vite sirve los archivos del repo directamente. El usuario puede editar la teoría, un proyecto, y ver los cambios reflejados sin rebuild completo.

**Opción futura**: una CLI de Forja que sirve la web localmente leyendo el repo del usuario, permitiendo personalización del contenido y tracking de progreso en local.

---

## 13. Caminos posibles de navegación

Hay al menos tres caminos coherentes para recorrer Forja. Ninguno es el único correcto.

**Camino del sistemista**: L0 → L1 → L2 → L5 → L6 → L7 → L8 → L9 → L10 → L15 → L17 → L18 → L20. Prioriza sistemas sobre compiladores. Hace los proyectos de compiladores al final o los omite.

**Camino del compiladorista**: L0 → L1 → L2 → L3 → L4 → L11 → L12 → L13 → L19 → (luego sistemas). Entra directo al arco de compiladores después de tener el lenguaje. Puede hacer Lógico completo antes de tocar procesos o redes.

**Camino integrador**: L0 → L1/L3 en paralelo → L5/L6 → L11 (primer contacto con compiladores) → L8 → L9/L10 → L14 → L15 → L16 → L17 → L19 → L20. Mezcla sistemas y compiladores según aparecen las dependencias.

La web muestra estos caminos como rutas sugeridas, pero el usuario puede trazar el suyo propio respetando el grafo de dependencias.

---

## 14. El modelo de aprendizaje con código dado

Una de las decisiones más importantes del diseño es que el código de cada fase se da como punto de partida, no se construye desde cero.

**Por qué**: construir 34 proyectos de cero requeriría años incluso para alguien dedicado. El objetivo no es sufrir el tiempo de construcción; es entender los sistemas. El código dado hace posible llegar a proyectos de la complejidad de tinyssh o minidocker sin pasar cinco años en fases previas.

**Cómo se aprende con código dado**:
1. La guía de estudio propone un recorrido de lectura
2. El usuario lee, pausa en los puntos indicados, experimenta modificaciones pequeñas
3. Corre los tests para verificar que el código funciona
4. Introduce errores deliberados para ver qué pasa (esta es una de las formas más poderosas de aprender)
5. Debuggea con gdb o lldb, con strace, con valgrind
6. Una vez que comprende la fase completa, implementa las mejoras propuestas

**Las mejoras propuestas** son el momento de construcción real. Son extensiones no triviales que requieren aplicar lo aprendido. No son opcionales: son la forma de confirmar que el aprendizaje fue real y no superficial.

---

## 15. Preguntas de diseño abiertas

Estas preguntas no tienen respuesta en este documento. Son decisiones que hay que tomar antes de comenzar el desarrollo del repo y la web.

**Sobre el contenido**:
- ¿Qué nivel de completitud mínima debe tener el código de cada fase? ¿Tests cubriendo qué porcentaje de casos?
- ¿Las guías de estudio tienen una longitud máxima? ¿Un formato fijo o libre?
- ¿Las mejoras propuestas son opcionales o hay alguna que sea "requerida" para desbloquear el siguiente nivel?
- ¿El GC de Lógico usa el allocator custom o malloc de glibc? (Si usa el propio, es la conexión inter-proyecto más poderosa del plan, pero aumenta la dependencia entre proyectos.)

**Sobre la web**:
- ¿React o Svelte como framework? ¿O se empieza con un generador estático (Astro, Hugo) y se agrega interactividad después?
- ¿El tracking de progreso es local (localStorage) o requiere un backend con auth desde el principio?
- ¿La web se diseña primero como experiencia de lectura (blog de alta calidad) o como aplicación con navegación (mapa, dashboard)?

**Sobre el repo y el modelo de distribución**:
- ¿El repo es público desde el día uno? ¿O se construye en privado y se abre cuando hay masa crítica de contenido?
- ¿Los proyectos tienen ramas por fase (como soluciones) o cada fase vive en su propio directorio?
- ¿Cómo se gestiona el hecho de que el "código dado" puede tener bugs? ¿Hay un proceso de revisión?

**Sobre el alcance del MVP**:
- ¿Cuántos proyectos completos (código + guía + mejoras) necesita el plan para ser lanzable?
- ¿Cuántas unidades teóricas son necesarias para que los primeros proyectos sean autocontenidos?
- ¿La web del MVP es solo navegación o ya incluye tracking de progreso?

---

## 16. MVP recomendado

El MVP mínimo que hace el plan coherente y utilizable:

**Contenido**: L0 completo (devcontainer funcionando). L1 y L2 (C) con sus unidades teóricas. L5 y L6 con sus proyectos focalizados (spl_stat, spl_ls, spl_du, spl_pstree). Un proyecto integrador completo: `mish` (el shell) con sus cuatro fases en C, sus tests, guías de estudio y mejoras propuestas. L11 con su unidad teórica y la Fase 1 de Semtex.

**Web**: un sitio estático construido en Vite que renderiza las unidades teóricas como páginas, muestra el mapa de proyectos con dependencias, y tiene navegación entre contenidos. Sin tracking de progreso en el MVP.

**Repo**: monorepo con la estructura completa aunque vacía — las carpetas están ahí, los README dicen qué viene. Esto da una imagen clara del plan completo incluso antes de que el contenido esté escrito.

Lo que esto excluye del MVP: Rust (viene después), proyectos de L8 en adelante, la web dinámica con progreso, la CLI.

---

## 17. Criterio de calidad del plan completo

El plan cumple su objetivo si logra tres cosas simultáneamente:

Que quien lo recorre pueda **leer código de sistemas reales** — kernel, compiladores, bases de datos — y entender por qué está escrito así.

Que haya **construido piezas concretas** que puede mostrar, describir y defender en una conversación técnica.

Que el recorrido completo tenga **coherencia narrativa** — que cada pieza tenga sentido en relación con las anteriores y las siguientes, no como ejercicios sueltos sino como el aprendizaje acumulativo de alguien que se metió a fondo en el mundo de los sistemas.
