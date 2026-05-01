# Forja — Análisis de contenido: puntos ciegos, mejoras y recursos
## Evaluación crítica por dominio + bibliografía ampliada

> Este documento analiza el plan propuesto (forja-spec.md) por dominio, identifica qué falta, qué podría mejorarse, y propone recursos concretos. No reemplaza la spec; la complementa.

---

## Resumen ejecutivo

El plan propuesto es sólido en su arquitectura general y cubre bien el territorio "clásico" de systems programming. Los puntos más débiles son cuatro: (1) la concurrencia de bajo nivel está subrepresentada respecto a su importancia real; (2) faltan las interfaces modernas de I/O (io_uring, eBPF/XDP) que son la frontera actual del campo; (3) el arco de compiladores no cubre el backend en suficiente profundidad; (4) falta un nivel dedicado a performance engineering — profiling, tracing, benchmarking como disciplina, no solo como herramienta auxiliar. Hay además varios proyectos de alto valor pedagógico que el plan no menciona: un linker, un async runtime, un debugger con ptrace, y un regex engine.

---

## 1. Dominio de Compiladores e Intérpretes

### 1.1 Lo que el plan cubre bien
El arco Semtex → Lógico → JIT-Brain es pedagógicamente coherente. Empezar con un lexer de marcado antes de un Lisp completo es correcto. La inferencia HM en L13 es ambiciosa pero valiosa. Llevar Lógico hasta JIT en L19 cierra el arco narrativo de forma satisfactoria.

### 1.2 Puntos ciegos

**El regex engine — ausencia injustificada**
El motor de expresiones regulares es quizás el proyecto de compiladores más pedagógico que existe por densidad de conceptos/tamaño. Cubre NFA construction (Thompson), conversión NFA→DFA (subset construction), minimización de DFA (Hopcroft), y backtracking engines (como los de Python/Ruby). Es pequeño, autosuficiente, y da intuición sobre autómatas que el lexer de Semtex solo toca superficialmente. Debería ser un proyecto focalizado en L11, antes de Semtex.

**El linker — gran ausente**
Los programas se compilan y se linkean, pero el plan no toca el linker. Entender ELF (Executable and Linkable Format), tablas de símbolos, relocation entries, y cómo el linker resuelve referencias entre archivos objeto es esencial para entender shared libraries, position-independent code y el comportamiento de linking estático vs dinámico. Un mini-linker que procese archivos `.o` sencillos sería un proyecto focalizado de alto valor en L1/L2. La referencia canónica es Linkers and Loaders (Levine, 2000) — viejo pero definitivo.

**El backend de compiladores — insuficiente profundidad**
JIT-Brain cubre emisión de x86_64, pero el plan no toca análisis de flujo de datos (liveness analysis, reaching definitions), que es la base de cualquier optimización real. La asignación de registros por linear scan está mencionada pero no el graph coloring (Chaitin-Briggs), que es lo que usa LLVM. El plan también omite completamente LLVM como infraestructura — conocer cómo escribir un compilador que emite LLVM IR en lugar de x86_64 directamente es más práctico para proyectos reales. No reemplaza el JIT hand-rolled pero debería mencionarse como camino paralelo.

**WebAssembly (WASM) como target de compilación**
WASM es el target de compilación más relevante después de x86_64 en el contexto actual — es portable, tiene sandbox de seguridad, y se ejecuta en browsers y servidores (WASI). Agregar una fase al compilador Lógico donde emita WASM binario en lugar de x86_64 haría el proyecto más moderno y abriría conversaciones sobre WASI, wasmtime, y Cranelift como alternativa al JIT propio.

**Continuation-Passing Style (CPS) — transformación no mencionada**
La transformación a CPS es fundamental para optimizaciones de tail calls y para entender cómo los compiladores de lenguajes funcionales representan el control flow. Sería una unidad teórica en L12 o L13, vinculada a Lógico. Sin esto, la "lazy evaluation" mencionada en la spec queda sin base formal.

**Macro systems — no mencionados**
Rust tiene uno de los sistemas de macros más sofisticados que existen (procedural macros, derive macros). El plan usa macros pero no las explica. Una unidad teórica sobre hygienic macros, macro_rules! vs proc_macros, y la diferencia entre macros y templates sería valiosa en L4.

**Operational semantics — falta el sustento formal**
El plan implementa un intérprete pero sin el vocabulario formal de semántica operacional (big-step vs small-step, rule-based evaluation). Esta formalización no es académica por sí misma — es la herramienta que permite razonar sobre si la implementación es correcta. Una unidad teórica mínima sobre esto apoyaría L12 y L13.

### 1.3 Recursos no mencionados en el plan

| Recurso | Por qué es esencial |
|---|---|
| **Crafting Interpreters** — Robert Nystrom (gratis online) | El mejor libro práctico de intérpretes existente. Construye dos intérpretes completos (tree-walking y bytecode VM) de un lenguaje real. Es la referencia directa para el proyecto Lógico. |
| **Engineering a Compiler** — Cooper & Torczon (2ed, 2011) | El mejor libro moderno de compiladores. Más accesible y actual que el Dragon Book. Cubre SSA, register allocation por graph coloring, dataflow analysis. |
| **Modern Compiler Implementation in ML** — Andrew Appel | El proyecto Tiger es un referente pedagógico — construye un compilador completo en un semestre. La variante en C existe también. |
| **Write a Regex Engine** — Russ Cox (series de artículos, gratis) | Los artículos de Russ Cox sobre implementación de NFA y DFA son la referencia canónica para entender por qué los regex de Python son lentos y los de Go son rápidos. |
| **CS 6120 — Advanced Compilers** — Cornell (Adrian Sampson, gratis) | El mejor curso de compiladores avanzados disponible online. Cubre LLVM IR, SSA, análisis de flujo de datos, optimizaciones. |
| **LLVM Tutorial** — LLVM.org (gratis) | Tutorial oficial de LLVM para escribir un compilador de un lenguaje de juguete que emite LLVM IR. Kaleidoscope es el ejemplo canónico. |
| **Nand2Tetris** — Nisan & Schocken (gratis) | Construir una computadora desde compuertas lógicas hasta un OS y un compilador. El nivel de integración vertical es único. |

### 1.4 Proyectos adicionales sugeridos

**`regex-engine`** (focalizado, L11): NFA construction por Thompson + subset construction + DFA + backtracking opcional. Implementación dual C/Rust. El equivalente industrial es PCRE2, RE2, regex crate.

**`mini-linker`** (focalizado, L1): Lee archivos `.o` ELF sencillos, resuelve símbolos, produce un ejecutable. Enseña ELF, tablas de símbolos y relocation. El equivalente industrial es lld (LLVM), GNU ld, mold.

**`mini-debugger`** (integrador, L6 + nuevo nivel): Usa ptrace para interceptar syscalls, poner breakpoints, leer registros. Versión simplificada de gdb/lldb. El plan de Weiss menciona ptrace como tema avanzado pero el plan actual no lo incluye como proyecto. Es uno de los proyectos más formativos posibles porque obliga a entender procesos, señales, y representación binaria al mismo tiempo. El equivalente industrial es gdb, lldb, rr (Mozilla).

---

## 2. Dominio de Sistemas Operativos

### 2.1 Lo que el plan cubre bien
Los niveles L5–L10 son sólidos. La progresión files → processes → memory → allocators → concurrency → IPC es la correcta. El proyecto mish como integrador de procesos/señales/pipes es el correcto. El devcontainer en L0 es una decisión excelente que muchos planes omiten.

### 2.2 Puntos ciegos

**io_uring — la omisión más importante del plan**
io_uring fue agregado al kernel Linux en 2019 (versión 5.1) y representa la mayor revolución en I/O asíncrono desde epoll. El plan menciona epoll en el HTTP server (L15) pero no io_uring. La diferencia es fundamental: epoll notifica cuándo un fd está listo (readiness), io_uring completa operaciones I/O de forma asíncrona sin syscalls por operación. Un servidor TCP con io_uring puede tener hasta 60% menos CPU overhead que con epoll. Para el contexto de 2025, no cubrir io_uring es como enseñar redes sin mencionar TCP — no es incorrecto, pero está desactualizado. Debería aparecer como extensión del nivel L15 (HTTP server con io_uring como fase 5) y como unidad teórica propia.

**eBPF — la tecnología que cambió el kernel**
eBPF permite ejecutar código seguro en el kernel sin escribir módulos. Es la alternativa moderna a los módulos de L20 para observabilidad, networking y seguridad. El plan lo menciona de pasada en minidocker (seccomp usa eBPF internamente) pero no lo enseña como tecnología. eBPF merece al menos una unidad teórica y un proyecto focalizado: un programa XDP que cuenta paquetes, otro que implementa un filtro de firewall, otro que hace tracing de syscalls. El equivalente industrial es Cilium, Falco, bcc tools, BPFTrace.

**Concurrencia II — lock-free data structures — subrepresentado**
El plan tiene L9 (threads + mutex) pero el nivel L10 que menciona "lock-free y atomics" está integrado dentro de IPC, no como nivel propio. Los datos lock-free (atomic queues, lock-free stacks, hazard pointers) son un tema con suficiente profundidad para un nivel propio. El libro de Mara Bos "Rust Atomics and Locks" (2023) cubre exactamente este territorio desde Rust, y es el recurso de referencia que falta en el plan. Implementar un `Arc<T>` desde cero, un spinlock, un canal one-shot sin mutex — estos son proyectos que enseñan memory ordering de forma irreemplazable.

**Performance engineering — nivel ausente**
El plan menciona perf y valgrind en L0 como herramientas de setup. Pero performance engineering como disciplina no tiene nivel propio. ¿Cómo se escribe un benchmark correcto? ¿Qué es el criterion crate en Rust y por qué es mejor que medir con time? ¿Cómo se interpreta un flamegraph? ¿Qué son las cache misses y cómo se detectan con perf stat? ¿Cómo funciona el branch predictor y por qué importa? Brendan Gregg es la referencia canónica aquí (BPF Performance Tools, Systems Performance). Este nivel debería existir en algún punto entre L7 (memoria virtual) y L9 (concurrencia), porque el contexto técnico ya está disponible y las herramientas se vuelven inmediatamente aplicables a los proyectos anteriores.

**El scheduler — no hay proyecto propio**
El plan implementa un mini-kernel en L20 con "planificador round-robin". Pero el scheduling merece tratamiento propio antes de llegar al kernel space. Un simulador de schedulers en user space (implementar round-robin, FIFO, MLFQ, CFS simplificado) sería un proyecto focalizado excelente en L6, antes de hacer el shell. OSTEP dedica varios capítulos a scheduling y tiene simuladores en Python que se pueden portar a C/Rust.

**El modelo de memoria de hardware — falta la perspectiva de CPU**
El plan cubre el modelo de memoria de C11/Rust en L9 (atomics, ordering). Pero falta la perspectiva de hardware: ¿por qué los procesadores modernos necesitan barreras de memoria? ¿Qué es store buffer y load buffer? ¿Cómo funciona el protocolo MESI de coherencia de cache? Sin este sustento, memory ordering parece magia. El libro de Mara Bos tiene un capítulo sobre esto (Chapter 7: Understanding the Processor). La unidad teórica correspondiente debería estar en L9.

**ptrace — no existe en el plan**
`ptrace(2)` es la syscall que hace posible gdb, strace, ltrace, rr, y los sanitizers. El plan usa todas estas herramientas en L0 pero nunca enseña cómo están hechas por dentro. Un proyecto `mini-debugger` usando ptrace es uno de los proyectos más formativos posibles porque cruza procesos (L6), señales (L6), memoria virtual (L7), y representación binaria (L1). El libro de referencia es "The Art of Debugging with GDB, DDD, and Eclipse" (Matloff & Salzman) para la perspectiva de usuario, y el código fuente de strace para la perspectiva de implementador.

**Async runtime — no existe en el plan**
El plan tiene un HTTP server que evoluciona de iterativo a epoll. Pero en Rust, la forma idiomática de hacer esto es con async/await y tokio. El plan no enseña cómo funciona un async runtime por dentro: Futures como máquinas de estado, el trait Poll, el Waker/RawWaker, el executor y el reactor. Construir un async runtime mínimo (similar a lo que hace async-std o smol) es el proyecto que conecta el model de polling con epoll y con io_uring. Sin esto, alguien que aprende Rust systems programming tiene un agujero fundamental.

### 2.3 Recursos no mencionados en el plan

| Recurso | Por qué es esencial |
|---|---|
| **OSTEP** — Arpaci-Dusseau (gratis online) | La referencia canónica moderna de teoría de OS. Libre, con simuladores, mejor que el Dinosaur Book para aprendizaje autodirigido. Cada capítulo es corto y tiene ejercicios de simulación. Debería ser la referencia principal del dominio de sistemas. |
| **CS:APP** — Bryant & O'Hallaron (Computer Systems: A Programmer's Perspective) | El libro de CMU 15-213. Cubre linking, assembly, memoria, procesos, y redes desde la perspectiva del programador. Los labs (bomblab, attacklab, malloclab, shelllab, proxylab) son proyectos de referencia para Forja. |
| **Rust Atomics and Locks** — Mara Bos (O'Reilly, 2023) | La referencia de concurrencia de bajo nivel en Rust. Construye mutex, spinlock, canales, Arc desde cero. Imprescindible para L9. Disponible con preview gratuito. |
| **BPF Performance Tools** — Brendan Gregg (2019) | La biblia de observabilidad y performance en Linux. Cubre BPFTrace, bcc, perf, flamegraphs, y metodología de diagnóstico. La referencia para el nivel de performance engineering. |
| **Systems Performance** — Brendan Gregg (2da ed., 2020) | El libro de performance engineering de sistemas. CPUs, memoria, I/O, redes — cómo medir y mejorar. |
| **Linux Kernel Development** — Robert Love (3ra ed., 2010) | El mejor libro de internals del kernel Linux desde la perspectiva del desarrollador (no del usuario). Cubre scheduling (CFS), memory subsystem, VFS, device drivers. |
| **The Art of Writing Efficient Programs** — Fedor Pikus (2021) | Profiling, benchmarking, CPU caches, branch prediction, SIMD. El libro de performance engineering a nivel de código. |

### 2.4 Proyectos adicionales sugeridos

**`mini-debugger`** (integrador, L6): ptrace para poner breakpoints, single-step, leer/escribir registros y memoria. Implementar `break`, `continue`, `next`, `print` de forma básica. El equivalente industrial es gdb, lldb, rr.

**`async-runtime`** (integrador, nuevo nivel entre L9 y L15): Future trait manual, Waker/RawWaker, un executor de single-thread con queue de tareas, reactor sobre epoll, y soporte para timers. El equivalente industrial es tokio, async-std, smol, glommio.

**`scheduler-sim`** (focalizado, L6): Simulador de políticas de scheduling (round-robin, MLFQ, MLFQ con aging) en user space, con métricas de turnaround y response time. Sin kernel space. Referencia: simuladores de OSTEP.

**`io_uring-echo`** (focalizado, L17 o extensión de L15): Servidor TCP de echo usando io_uring directamente, comparando throughput y latencia contra la versión epoll. En C con liburing, en Rust con tokio-uring. Enseña submission queues, completion queues, y el modelo de operaciones registradas.

**`ebpf-tracer`** (focalizado, nuevo nivel o extensión de L20): Un programa XDP que filtra paquetes, más un programa kprobe que traza syscalls de un proceso por PID. En C con libbpf, en Rust con aya. El equivalente industrial es BPFTrace, Cilium, bcc tools.

---

## 3. Dominio de Networking

### 3.1 Lo que el plan cubre bien
La progresión sockets → HTTP → minisync → shell remoto → tinyssh es coherente y correcta. Hacer el shell remoto TCP antes de SSH hace que SSH sea comprensible en lugar de mágico. El proyecto TCP/IP stack en user space es excelente para entender el protocolo desde adentro.

### 3.2 Puntos ciegos

**TLS como tema propio — no solo como parte de SSH**
El plan mete TLS dentro de tinyssh (como "cifrado"). Pero TLS es un protocolo mucho más amplio que aparece en HTTPS, gRPC, bases de datos, y casi cualquier comunicación moderna. Mereceería tratamiento propio: handshake TLS 1.3, certificate chain, ALPN, SNI, session resumption. Entender rustls internamente es un objetivo pedagógico valioso en sí mismo. La referencia es "The Illustrated TLS 1.3 Connection" (tls13.xargs.org — gratis, interactivo).

**DNS — protocolo no mencionado**
DNS es el protocolo que más toca cualquier programador de sistemas, y su implementación está sorprendentemente al alcance: wire format compacto, tipos de registro, queries recursivas vs iterativas, caching con TTL. Un resolver DNS simple (cliente, no servidor autoritative) sería un proyecto focalizado excelente que enseña UDP, parsing de wire formats binarios, y timeouts. La referencia es RFC 1035 y el libro "DNS and BIND" (Albitz & Liu).

**HTTP/2 y QUIC — protocolos modernos ausentes**
El plan cubre HTTP/1.1 completo pero el mundo productivo usa HTTP/2 y QUIC. HTTP/2 introduce multiplexing de streams, compresión de headers (HPACK), server push — cambios arquitecturales significativos respecto a HTTP/1.1. QUIC (HTTP/3) corre sobre UDP y combina transporte con cifrado, eliminando el handshake de TCP. No es necesario implementarlos desde cero, pero sí entender su diseño y por qué existen. Una unidad teórica y un proyecto focalizado que use quinn (QUIC en Rust) o h2 (HTTP/2) sería suficiente.

**Zero-copy networking — no mencionado**
`sendfile(2)`, `splice(2)`, y io_uring con buffer registration son formas de evitar copias innecesarias entre kernel y user space. El plan menciona mmap para archivos pero no para networking. Un proyecto que compare el throughput de un servidor de archivos estáticos con read+write vs sendfile vs io_uring es uno de los mejores experimentos de performance posibles.

**High-performance networking: XDP/eBPF/DPDK — ausentes**
La TCP/IP stack del plan usa TUN/TAP, que está en el user space. Pero la frontera actual del networking de alto rendimiento son XDP (procesar paquetes en el driver antes del kernel stack), AF_XDP (shared memory entre NIC y user space sin kernel bypass completo), y DPDK (bypass total del kernel). El plan debería mencionar estos como extensiones avanzadas del nivel L15 o como un nivel L21 opcional. El equivalente de aprender networking sin saber que XDP existe es como aprender sistemas sin saber que existe mmap.

**gRPC y Protocol Buffers — ausentes**
gRPC es el protocolo de comunicación entre servicios más usado en sistemas distribuidos. Protocol Buffers (protobuf) como formato de wire encoding eficiente está en todas partes. El orquestador del plan (L18) debería comunicarse internamente vía gRPC — eso sería más realista que JSON sobre HTTP. Una unidad teórica sobre encoding binario eficiente (protobuf, capnproto, flatbuffers) y un proyecto focalizado de cliente/servidor gRPC sería valiosa.

**WebSockets — no mencionados**
El protocolo WebSocket es un upgrade de HTTP para comunicación bidireccional. Implementar un WebSocket server desde HTTP/1.1 enseña mucho sobre framing binario, handshake, y masking. Es un proyecto focalizado pequeño con mucho valor práctico.

**Network observability — ausente**
¿Cómo funciona tcpdump internamente? ¿Qué es AF_PACKET y cómo se usa para captura de paquetes raw? ¿Cómo se usa Wireshark como herramienta de debugging de protocolos? El plan usa las herramientas pero no las enseña. Un proyecto `mini-tcpdump` usando AF_PACKET o AF_XDP sería un excelente cierre del dominio de networking.

### 3.3 Recursos no mencionados en el plan

| Recurso | Por qué es esencial |
|---|---|
| **UNIX Network Programming** — W. Richard Stevens (Vol. 1 y 2) | La biblia de socket programming en Unix. El más citado, el más completo. Vol 1 cubre sockets, Vol 2 cubre IPC. La referencia canónica para L15. |
| **Computer Networks: A Top-Down Approach** — Kurose & Ross | El mejor libro introductorio de redes con perspectiva de protocolo. Cada capa tiene contexto claro. |
| **High Performance Browser Networking** — Ilya Grigorik (gratis online) | TCP, UDP, TLS, HTTP/1.1, HTTP/2, QUIC/HTTP/3, WebSockets, WebRTC. Escrito desde la perspectiva de rendimiento. Excelente para entender por qué los protocolos modernos existen. |
| **The Illustrated TLS 1.3** — tls13.xargs.org (interactivo, gratis) | Cada byte de una conexión TLS 1.3 explicado visualmente. La mejor manera de entender TLS antes de implementarlo. |
| **RFC 9000** — QUIC (IETF, gratis) | El RFC de QUIC es sorprendentemente legible. Para quien quiere entender HTTP/3 desde la spec. |
| **Beej's Guide to Network Programming** — Brian Hall (gratis) | El tutorial de sockets más leído. Cubre todo lo básico con ejemplos en C. Referencia de L15. |

### 3.4 Proyectos adicionales sugeridos

**`mini-dns-resolver`** (focalizado, L15): Cliente DNS sobre UDP. Parsear wire format, tipos A/AAAA/CNAME/MX, timeout/retry, cache básico. El equivalente industrial es dnsmasq, Unbound, trust-dns (Rust).

**`mini-tcpdump`** (focalizado, L15 o extensión de L20): Captura paquetes con AF_PACKET, parsea Ethernet + IP + TCP/UDP headers, filtra por protocolo/puerto. El equivalente industrial es tcpdump, Wireshark, libpcap.

**`http2-server`** (focalizado, extensión de L15): HTTP/2 sobre TLS usando h2 crate en Rust. Demuestra multiplexing de streams y HPACK. Contrasta con el HTTP/1.1 del proyecto anterior.

**`async-runtime`** (ya mencionado en OS — pero también es un proyecto de networking: el reactor sobre epoll que notifica al executor cuando un socket está listo).

---

## 4. Dominio Kernel

### 4.1 Lo que el plan cubre bien
La progresión char driver → VFS → KVM es sólida y ambiciosa. Separar kernel space como el último nivel es correcto — tiene sentido no llegar ahí sin todo el fondo previo. La mención de FUSE como alternativa a los módulos de kernel es una buena decisión pedagógica.

### 4.2 Puntos ciegos

**eBPF como alternativa moderna a los módulos de kernel**
El plan menciona eBPF de pasada. Pero eBPF es exactamente la respuesta del kernel a "quiero hacer algo en kernel space sin escribir un módulo". En producción en 2025, nadie escribe un módulo de kernel para tracing — usa eBPF. El plan debería tratar eBPF como un nivel o subnivel dentro del dominio Kernel, paralelo (no sucesor) a los módulos. Un programa eBPF de kprobe + mapa BPF + lector en user space es más accesible que un módulo de kernel y tiene aplicaciones inmediatas. La referencia es `libbpf` (C) y `aya` (Rust). El libro es "BPF Performance Tools" de Brendan Gregg.

**Rust en el kernel Linux — mencionarlo es obligatorio**
Desde Linux 6.1 (2022), Rust es un lenguaje oficial del kernel Linux. Hay drivers escritos en Rust en producción. El plan dice "los módulos de kernel son C por definición" — esto ya no es del todo cierto. No es necesario cubrir los Rust kernel bindings en profundidad, pero no mencionarlos es dejar un punto ciego importante del estado actual del campo.

**El memory allocator del kernel — no mencionado**
El plan cubre allocators en user space (L8) pero no toca el buddy system (cómo el kernel asigna páginas físicas) ni el slab allocator (cómo el kernel asigna objetos de tamaño fijo). Entender por qué el kernel tiene dos allocators distintos (uno para páginas, otro para objetos del kernel) profundiza la comprensión de L7 y L8. No requiere un proyecto propio — bastaría una unidad teórica en L20 que conecte con el allocator de L8.

**Scheduling del kernel — CFS no mencionado**
El plan tiene un "scheduler round-robin" en el mini-kernel de L20. Pero el CFS (Completely Fair Scheduler) de Linux, basado en un árbol rojo-negro con virtual runtime, es un ejemplo brillante de uso de estructuras de datos en código de producción. Una unidad teórica sobre CFS, control groups y CPU quotas conectaría con minidocker (cgroups) y aportaría contexto real al mini-scheduler.

**Interrupciones y softirqs — mencionados solo en KVM**
La IDT y las excepciones se mencionan en el proyecto KVM/microkernel. Pero el manejo de interrupciones en Linux (top half vs bottom half, hardirq vs softirq vs tasklet vs workqueue) es un tema que debería aparecer antes, como unidad teórica en L20, para que el proyecto del char driver tenga más contexto (los drivers se ejecutan en contexto de interrupción o de proceso, con implicaciones distintas para qué primitivas de sincronización se pueden usar).

**DKMS y distribución de módulos — omitido**
Escribir un módulo es una cosa; distribuirlo para que funcione en distintas versiones de kernel es otra. DKMS (Dynamic Kernel Module Support) es la herramienta estándar. Una mención en el proyecto char-driver de cómo se empaquetaría para distribución es realista.

**Secure boot y firmware — no mencionados**
El microkernel de L20 arranca en modo real y pasa a modo protegido. En hardware real en 2025, Secure Boot está habilitado y UEFI reemplazó a BIOS. No hace falta implementarlo (el laboratorio usa QEMU donde se puede deshabilitar Secure Boot), pero mencionarlo como contexto real es importante para que el estudiante no piense que el bootloader que escribió funcionaría en su laptop sin modificaciones.

### 4.3 Recursos no mencionados en el plan

| Recurso | Por qué es esencial |
|---|---|
| **Linux Kernel Development** — Robert Love (3ra ed., 2010) | El libro más accesible de internals del kernel Linux. Cubre scheduling, memory management, VFS, drivers. No tan profundo como "Understanding the Linux Kernel" (Bovet & Cesati) pero mucho más legible. |
| **Understanding the Linux Kernel** — Bovet & Cesati (3ra ed., 2005) | El libro de internals del kernel más completo. Detalla las estructuras internas de procesos, memoria, VFS y dispositivos. Referencia densa para el nivel L20. |
| **Linux Device Drivers** — Corbet, Rubini, Kroah-Hartman (3ra ed., 2005, gratis online) | La referencia canónica de drivers en Linux. Cubre char drivers, block drivers, USB, PCI. La 3ra edición es del kernel 2.6 pero los conceptos fundamentales aplican. |
| **BPF Performance Tools** — Brendan Gregg (2019) | (Ya mencionado en OS) También es el libro de eBPF como tecnología de kernel. |
| **The Linux Kernel Module Programming Guide** — Peter Jay Salzman (gratis) | Introducción práctica a LKM. Más accesible y actual que LDD en algunos aspectos. |
| **Writing an OS in Rust** — Philipp Oppermann (gratis, blog series) | Una serie de posts que construyen un OS bare-metal en Rust. El mejor recurso existente para el nivel L20 desde Rust. |
| **Little Book of OS Development** — Erik Helin & Adam Renberg (gratis) | Guía práctica para escribir un OS x86 básico. Bootloader, paginación, scheduling, filesystem. |

### 4.4 Proyectos adicionales sugeridos

**`ebpf-tracer`** (ya mencionado en OS): Un programa kprobe + un programa XDP + lectura de mapas BPF desde user space. En C con libbpf, en Rust con aya. El equivalente industrial es BPFTrace, bcc tools, Cilium.

**`mini-debugger`** (ya mencionado en compiladores pero también es un proyecto de kernel/ptrace): Usa ptrace que es una syscall de interacción entre procesos con implicaciones en el scheduler y en el manejo de señales del kernel.

---

## 5. Dominio de Concurrencia (nivel propio propuesto)

El plan tiene L9 (threads + mutex) y mezcla atomics/lock-free dentro de IPC en L10. Esta mezcla es un punto ciego estructural. La concurrencia de bajo nivel merece un nivel propio entre L9 y L11.

**Contenido propuesto para un nuevo L10 — Concurrencia Avanzada:**

- Memory ordering: sequentially consistent, acquire/release, relaxed — qué garantiza cada uno
- La arquitectura x86-64 es TSO (Total Store Order) — por qué los programas C/Rust necesitan barreras si la arquitectura ya ordena mucho
- ARM es más débil — por qué el código portable necesita barreras explícitas
- Algoritmos lock-free clásicos: Treiber stack, Michael-Scott queue
- Hazard pointers como alternativa a GC para gestionar memoria en estructuras lock-free
- El problema de ABA: qué es, por qué es peligroso, cómo evitarlo (tagged pointers)
- RCU (Read-Copy-Update): el patrón de sincronización del kernel Linux para datos de lectura intensiva
- Implementar desde cero: spinlock, rwlock, semáforo, canal one-shot (sin mutex), Arc<T>

**Proyectos de este nivel:**
- `impl_arc` (focalizado): implementar `Arc<T>` con atomics y weak references. Referencia: capítulo 6 de Rust Atomics and Locks.
- `lock-free-queue` (focalizado): Michael-Scott queue con hazard pointers. En C y Rust.
- `rcu-demo` (focalizado): demostración de RCU para una lista enlazada con lectores concurrentes.

**Recursos:**
- Rust Atomics and Locks (Mara Bos) — capítulos 2, 3, 5, 6, 7
- "Is Parallel Programming Hard?" — Paul McKenney (gratis, el libro de RCU)
- "The Art of Multiprocessor Programming" — Herlihy & Shavit (el libro de referencia de algoritmos concurrentes)

---

## 6. Nuevos niveles propuestos

Basado en el análisis, el plan podría enriquecerse con dos niveles adicionales y una reorganización de uno existente:

### Nuevo L10 — Concurrencia Avanzada
Memory ordering, atomics, lock-free, hazard pointers, RCU. Actualmente mezclado con IPC. Merece nivel propio.

### Nuevo L16 — Performance Engineering
Profiling con perf, flamegraphs, benchmarking correcto con criterion/hyperfine, cache misses y branch mispredictions, profilers de heap (heaptrack, massif). Este nivel convierte las herramientas de L0 en una disciplina. Sin él, los proyectos de los niveles anteriores no tienen el contexto para optimizarse.

### Nuevo L17 — I/O Avanzado y Runtimes Asincrónicos
io_uring como modelo de completion, diferencia con epoll (readiness vs completion), construcción de un async runtime mínimo (Future, Waker, executor, reactor). Proyecto integrador: refactorizar el HTTP server de L15 para usar io_uring y comparar benchmarks.

### Reorganización de L15 (Networking)
Agregar como unidad teórica: TLS 1.3 propio (separado de SSH), DNS wire format, HTTP/2 motivación. El proyecto DNS resolver y el mini-tcpdump como proyectos focalizados de este nivel.

---

## 7. Tabla de recursos bibliográficos completa (todos los dominios)

### Referencia principal (obligatoria)
| Libro | Dominio | Acceso |
|---|---|---|
| **OSTEP** — Arpaci-Dusseau | Sistemas | Gratis (ostep.org) |
| **CS:APP** — Bryant & O'Hallaron | Sistemas + Arquitectura | Pago |
| **TLPI** — Kerrisk | Syscalls POSIX | Pago (ya en el plan) |
| **SPL** — Weiss | Proyectos guiados | Pago (ya en el plan) |
| **Crafting Interpreters** — Nystrom | Compiladores | Gratis (craftinginterpreters.com) |
| **Engineering a Compiler** — Cooper & Torczon | Compiladores | Pago |
| **Rust Atomics and Locks** — Bos | Concurrencia Rust | Pago (preview gratis) |
| **Programming Rust** — Blandy, Orendorff, Tindall | Rust lenguaje | Pago |
| **UNIX Network Programming** — Stevens | Networking | Pago |

### Referencia secundaria (por nivel)
| Libro | Dominio | Acceso |
|---|---|---|
| **Linux Kernel Development** — Love | Kernel | Pago |
| **Linux Device Drivers** — Corbet et al. | Kernel (drivers) | Gratis (lwn.net) |
| **BPF Performance Tools** — Gregg | Performance + eBPF | Pago |
| **Systems Performance** — Gregg | Performance | Pago |
| **High Performance Browser Networking** — Grigorik | Networking moderno | Gratis (hpbn.co) |
| **Designing Data-Intensive Applications** — Kleppmann | Storage + distribuido | Pago |
| **Modern Compiler Implementation in C** — Appel | Compiladores | Pago |
| **The Art of Multiprocessor Programming** — Herlihy & Shavit | Concurrencia | Pago |
| **Writing an OS in Rust** — Oppermann | Kernel en Rust | Gratis (os.phil-opp.com) |

### Recursos online gratuitos de alta calidad
| Recurso | Dominio |
|---|---|
| Teach Yourself CS (teachyourselfcs.com) | Mapa curricular |
| Write an OS in Rust — Philipp Oppermann | Kernel |
| Regex Theory — Russ Cox (swtch.com) | Compiladores |
| The Illustrated TLS 1.3 — tls13.xargs.org | Networking/Seguridad |
| CS 6120 Advanced Compilers — Cornell (adrian.sampsonian.org) | Compiladores |
| LLVM Kaleidoscope Tutorial — llvm.org | Compiladores + JIT |
| Beej's Guide to Network Programming | Networking |
| Is Parallel Programming Hard? — Paul McKenney | Concurrencia |
| The Linux Kernel Module Programming Guide | Kernel |
| Nand2Tetris — nand2tetris.org | Arquitectura + Compiladores |

---

## 8. Proyectos adicionales resumen

| Proyecto | Tipo | Nivel sugerido | Dominio |
|---|---|---|---|
| `regex-engine` | Focalizado | L11 | Compiladores I |
| `mini-linker` | Focalizado | L1/L2 | C + Arquitectura |
| `mini-debugger` | Integrador | L6 + ptrace | Procesos + Kernel |
| `scheduler-sim` | Focalizado | L6 | Procesos |
| `impl_arc` | Focalizado | L10 nuevo | Concurrencia |
| `lock-free-queue` | Focalizado | L10 nuevo | Concurrencia |
| `async-runtime` | Integrador | L17 nuevo | I/O + Networking |
| `io_uring-echo` | Focalizado | L17 nuevo | I/O |
| `ebpf-tracer` | Focalizado | L20 extensión | Kernel + eBPF |
| `mini-dns-resolver` | Focalizado | L15 | Networking |
| `mini-tcpdump` | Focalizado | L15 | Networking |
| `http2-server` | Focalizado | L15 extensión | Networking |

---

## 9. Cinco puntos ciegos estructurales que deben resolverse

Independientemente del detalle de cada dominio, hay cinco decisiones de diseño de nivel superior que la spec debería revisar:

**1. L10 (Concurrencia II) no existe como nivel — está diluido**
El plan menciona "lock-free y atomics" como parte de IPC. Esto es un error. Atomics y memory ordering son un tema con suficiente profundidad para un nivel propio, con su libro de referencia propio (Rust Atomics and Locks). Sin un nivel explícito, no hay dónde anclar proyectos como impl_arc o lock-free-queue.

**2. io_uring no puede ser solo una "extensión" de epoll**
io_uring es un paradigma distinto (completion vs readiness) con implicaciones arquitecturales para cómo se construyen servidores y runtimes. El plan lo debería tratar como un nivel o subnivel propio, no como un footnote del HTTP server.

**3. eBPF es la alternativa moderna a los módulos de kernel — no mencionarla es dejar un punto ciego de 5 años**
eBPF lleva desde 2016 cambiando cómo se hace observabilidad, networking y seguridad en Linux. No incluirlo en L20 (o como nivel propio) sería como enseñar Rust sin mencionar el borrow checker.

**4. Performance engineering como disciplina — no como herramienta de L0**
El plan menciona perf, valgrind, flamegraph en el setup. Pero la disciplina de benchmarking correcto, profiling dirigido por hipótesis, e interpretación de resultados merece un nivel propio con proyectos que midan los proyectos anteriores.

**5. El mini-debugger (ptrace) es más formativo que varios proyectos del plan**
Implementar un debugger mínimo con ptrace es uno de los proyectos más densos en términos de conceptos que combina — procesos, señales, memoria virtual, representación binaria, parsing de DWARF/ELF. Que el plan use gdb intensamente pero nunca lo explique por dentro es una oportunidad perdida.
