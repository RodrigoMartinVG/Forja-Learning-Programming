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

Salida: el lector abre el repo en el devcontainer declarado, ejecuta `verify-setup.sh`, distingue imagen, contenedor, workspace y toolchain, y diagnostica un fallo de entorno sin confundirlo con un bug del código de un nivel posterior.

Prerrequisitos: ninguno; se asume conocimiento previo de programación general.

Materialidad típica: salida de `verify-setup.sh`, contraste entre toolchain declarada por el repo y herramientas efectivamente disponibles en el contenedor, diff entre estado esperado y observado.

Temas centrales:

- devcontainer y laboratorio Linux
- verificación de toolchain C/Rust
- sanity checks de debugging y observabilidad
- estructura del repo

Proyectos asociados: `devcontainer-setup`.

#### L1 — Modelo mental de una computadora

Foco: entender CPU, memoria, registros y proceso antes de escribir sistemas.

Salida: el lector describe un programa en ejecución como una máquina de estado mínima (CPU, registros, memoria, `pc`), traza el ciclo `fetch → decode → execute` paso a paso y distingue rol e interpretación de un mismo bloque de memoria como instrucción o como dato.

Prerrequisitos: L0.

Materialidad típica: trazas tabulares de estado sobre un ISA de juguete (`LOAD`, `STORE`, `MOV`, `ADD`, `JNZ`); evolución del `pc` y de registros frente a saltos.

Temas centrales:

- modelo de von Neumann
- ciclo fetch-decode-execute
- direcciones y registros
- código vs datos en memoria

Proyectos asociados hoy en repo: ninguno; unidad conceptual base.

#### L2 — Representación de la información

Foco: cómo viven los datos en hardware.

Salida: el lector mira un dump de bytes y, dada una convención de lectura (entero sin signo, complemento a dos, ASCII, UTF-8, little-endian, IEEE 754), explica qué valor representa y qué cambiaría si la convención cambiara.

Prerrequisitos: L0, L1.

Materialidad típica: hexdump, mismo patrón leído bajo distintas convenciones, comparación LE vs BE del mismo entero, ejemplo de overflow al operar en ancho fijo.

Temas centrales:

- bits, bytes, enteros y complemento a dos
- overflow con signo y sin signo
- hexadecimal y endianness
- intuición de floating point

Proyectos asociados hoy en repo: ninguno. La inspección binaria y la práctica de endianness siguen viviendo como ejercicios internos del nivel, no como proyectos canónicos separados.

#### L3 — El pipeline de compilación en C

Foco: dejar de tratar al compilador como caja negra.

Salida: el lector toma un `.c` simple, ejecuta el pipeline paso a paso (`.c → .i → .s → .o → ejecutable`), inspecciona cada artefacto intermedio, distingue linking estático y dinámico, y diagnostica un error ubicándolo en la etapa correcta.

Prerrequisitos: L0, L1, L2.

Materialidad típica: `gcc -E`, `gcc -S`, `gcc -c`, invocación manual del linker, `nm`, `objdump`, `file`, `readelf`, `make` sobre un pequeño proyecto multi-archivo.

Temas centrales:

- preprocesador, compilador, assembler y linker
- artefactos `.i`, `.s`, `.o` y ejecutable
- linking estático vs dinámico
- flags básicas y `make`

Proyectos asociados hoy en repo: ninguno. La compilación manual de `hello.c` se trabaja acá como práctica interna del nivel, no como proyecto canónico independiente.

#### L4 — El sistema de build de Rust

Foco: entender `cargo` como herramienta de build, test y dependencias.

Salida: el lector crea un crate con dependencia y tests, y explica el rol de `Cargo.toml`, `Cargo.lock` y `target/`.

Prerrequisitos: L3.

Materialidad típica: salida de `cargo build -v`, inspección de `target/`, diff de `Cargo.lock` antes y después de actualizar una dependencia.

Temas centrales:

- `cargo new`, `build`, `run`, `test`, `doc`
- `Cargo.toml` y `Cargo.lock`
- crates, workspaces y toolchains
- comparación explícita con el flujo de C

Proyectos asociados hoy en repo: ninguno. El crate mínimo con dependencia y tests funciona como práctica guiada del nivel, no como proyecto canónico aparte.

#### L5 — Herramientas de observabilidad I

Foco: leer warnings y usar debugger como herramienta permanente.

Salida: el lector usa `gdb` para inspeccionar memoria y variables, y lee críticamente un warning del compilador en lugar de silenciarlo.

Prerrequisitos: L3, L4.

Materialidad típica: sesión `gdb` con breakpoints, output de `clippy`, advertencia de `gcc -Wall -Wextra` antes y después de corregirla.

Temas centrales:

- `gdb` básico
- lectura de warnings
- memoria desde debugger
- `rust-analyzer`, `rustfmt`, `clang-format`, `clippy`

Proyectos asociados hoy en repo: ninguno. El debugging en C y Rust se ejercita dentro del nivel y reaparece más adelante como criterio de trabajo, no como proyecto propio.

#### L6 — Herramientas de observabilidad II

Foco: sanitizers, valgrind y strace como parte del flujo normal.

Salida: el lector reproduce errores de memoria con sanitizers o valgrind y rastrea syscalls relevantes con `strace`.

Prerrequisitos: L5.

Materialidad típica: salida de ASan ante un use-after-free, `valgrind` reportando una fuga, traza `strace` de un programa simple.

Temas centrales:

- ASan, UBSan, MSan y ThreadSanitizer
- valgrind memcheck
- `strace`
- preview de `perf` y flamegraphs

Proyectos asociados hoy en repo: ninguno. Sanitizers, valgrind y `strace` se practican aquí como diagnóstico guiado del nivel, no como proyecto canónico separado.

#### L7 — Alfabetización assembly

Foco: leer assembly generado por el compilador.

Salida: el lector lee el `.s` de una función simple, reconoce prólogo y epílogo, y explica la calling convention System V para sus argumentos.

Prerrequisitos: L1, L3.

Materialidad típica: `gcc -S` de una función con argumentos, comparación `-O0` vs `-O2`, stepping en `gdb` instrucción a instrucción.

Temas centrales:

- registros x86-64 y calling convention System V
- stack frame, `call` y `ret`
- instrucciones mínimas para leer código compilado
- comparación `-O0` vs `-O2`

Proyectos asociados hoy en repo: ninguno. La lectura de `.s`, el stepping en `gdb` y la conexión con syscalls siguen siendo práctica interna del nivel.

### Bloque 1 — C como lenguaje

#### L8 — C: primer contacto

Foco: sintaxis, tipos básicos, control flow, arrays, strings e I/O.

Salida: el lector escribe programas C con I/O, control flow y manipulación de strings sin confundir array y puntero.

Prerrequisitos: L3.

Materialidad típica: programas C compilados con `-Wall -Wextra` sin warnings, lectura comentada de `<stdio.h>` y `<string.h>`.

Temas centrales:

- compilación básica con `gcc`
- tipos primitivos y scope
- funciones, arrays y strings terminados en `\0`
- I/O estándar

Proyectos asociados: `hello-c`, `caesar-cipher`, `word-count`.

#### L9 — C: punteros

Foco: punteros como aritmética de memoria.

Salida: el lector razona sobre direcciones, aritmética de punteros y la equivalencia y diferencia entre arrays y punteros.

Prerrequisitos: L8, L2.

Materialidad típica: impresión de direcciones con `%p`, `gdb` inspeccionando memoria por dirección, sanitizer disparando ante un acceso fuera de rango.

Temas centrales:

- direcciones y desreferenciación
- aritmética de punteros
- relación entre arrays y punteros
- `void *`, `NULL`, punteros a punteros y a función

Proyectos asociados: `stringlib`.

#### L10 — C: estructuras, alineación y tipos compuestos

Foco: layout de datos en memoria.

Salida: el lector predice el layout en memoria de un `struct` con padding y verifica el tamaño real con `sizeof` y `offsetof`.

Prerrequisitos: L9.

Materialidad típica: hexdump de un `struct`, salida de `offsetof` para cada campo, `pahole` opcional sobre el `.o`.

Temas centrales:

- `struct`, `union` y `enum`
- padding, alineación y `offsetof`
- `const` correctness
- `restrict` como hint de no-aliasing

Proyectos asociados: `dynamic-array`.

#### L11 — C: preprocesador, linkage y undefined behavior

Foco: las capas invisibles que explican gran parte de la complejidad de C.

Salida: el lector explica la diferencia entre `static`, `inline` y `extern` aplicada a un caso real, y reconoce un caso clásico de UB.

Prerrequisitos: L10, L3.

Materialidad típica: `gcc -E` mostrando expansión de macro, error real de `undefined reference` resuelto, UBSan disparando sobre overflow con signo.

Temas centrales:

- macros y guards de inclusión
- `static`, `inline` y `extern`
- internal vs external linkage
- UB como contrato roto con el compilador

Proyectos asociados: `elf-explorer`.

#### L12 — C: memoria y gestión manual

Foco: stack, heap, ciclo de vida y errores clásicos de memoria.

Salida: el lector implementa programas con `malloc`/`free` correctos y diagnostica use-after-free, double-free y leaks con sanitizers.

Prerrequisitos: L9, L6.

Materialidad típica: ASan reportando UAF con stack del culprit, `valgrind --leak-check=full`, layout de proceso leído desde `/proc/self/maps`.

Temas centrales:

- layout de un proceso
- `malloc`, `free`, `realloc`, `calloc`
- use-after-free, double-free y buffer overflow
- ownership convencional en C

Proyectos asociados: `getopt-impl`.

#### L13 — C: modelo de errores y testing

Foco: cómo se reportan fallos y cómo se testea código de sistemas en C.

Salida: el lector escribe código C con manejo de errores explícito y una suite de tests con sanitizers activos.

Prerrequisitos: L12.

Materialidad típica: diff de golden files, suite corriendo bajo ASan/UBSan, fuzzing básico con libFuzzer o AFL sobre una función pequeña.

Temas centrales:

- `errno`, `perror`, `strerror`
- patrones `NULL`, `-1` y `goto cleanup`
- `assert()` vs manejo real de errores
- golden files, fuzzing y sanitizers como suite

Proyectos asociados hoy en repo: ninguno. El nivel endurece `stringlib` y `dynamic-array` con testing explícito, pero sin abrir todavía un proyecto propio.

### Bloque 2 — Rust como lenguaje

#### L14 — Rust: primer contacto

Foco: Rust antes del borrow checker.

Salida: el lector escribe programas Rust idiomáticos con tipos algebraicos y `Option`/`match`, sin necesidad todavía de pelear con ownership.

Prerrequisitos: L4.

Materialidad típica: `cargo run` y `cargo test` sobre programas pequeños, errores de tipo del compilador leídos como guía.

Temas centrales:

- `let`, mutabilidad y shadowing
- tipos básicos e inferencia
- `if`, `loop`, `for`, `match`
- `struct`, `enum`, `Option`, módulos

Proyectos asociados: `hello-rust`, `fizzbuzz-rust`, `mini-calculator`.

#### L15 — Rust: ownership y borrowing

Foco: el sistema que hace a Rust distinto de C.

Salida: el lector explica por qué el compilador rechaza un programa concreto y lo reescribe respetando ownership.

Prerrequisitos: L14, L9.

Materialidad típica: errores `E0382`, `E0502` reproducidos y resueltos; comparación del mismo problema en C con use-after-free reproducible.

Temas centrales:

- ownership y moves
- `Copy`, `Clone` y `Drop`
- borrowing compartido y exclusivo
- lifetimes, `String`, `&str` y slices

Proyectos asociados: `data-structures-rust`.

#### L16 — Rust: sistema de tipos y traits

Foco: traits, genéricos, dispatch y macros.

Salida: el lector diseña una API con traits, decide entre dispatch estático y `dyn Trait`, y explica el impacto sobre monomorphization.

Prerrequisitos: L15.

Materialidad típica: tamaño de binario antes y después de pasar a `dyn Trait`, errores de coherencia de traits, `cargo expand` de una macro derive.

Temas centrales:

- traits estándar y propios
- monomorphization vs `dyn Trait`
- `Result<T, E>` como tipo del sistema
- `newtype`, `PhantomData` y macros

Proyectos asociados: `custom-iterator`, `parser-combinators`.

#### L17 — Rust: manejo de errores y testing

Foco: ergonomía idiomática de errores y testing en Rust.

Salida: el lector diseña un tipo de error propagable con `?` y escribe tests unitarios, de integración y property-based.

Prerrequisitos: L16.

Materialidad típica: salida de `cargo test`, `proptest` shrinkando un caso fallido, error tipado propagado a través de varias capas.

Temas centrales:

- `Result`, errores tipados y `Box<dyn Error>`
- `thiserror` y `anyhow`
- tests unitarios e integración
- property-based testing con `proptest`

Proyectos asociados hoy en repo: ninguno. El objetivo es consolidar manejo de errores y testing antes de abrir `ffi-demo`; las reaperturas posteriores no cuentan aquí como proyecto propio.

#### L18 — Rust: FFI, unsafe y el sistema operativo

Foco: el puente entre Rust, C y las APIs del sistema.

Salida: el lector llama desde Rust a una librería C, escribe un wrapper seguro y justifica cada bloque `unsafe` con su invariante.

Prerrequisitos: L17, L11.

Materialidad típica: `bindgen` generando bindings, `cargo expand` sobre el wrapper, `miri` ejecutando un test del lado seguro.

Temas centrales:

- `extern "C"`, `bindgen` y `cbindgen`
- punteros crudos y `unsafe`
- wrappers seguros sobre APIs inseguras
- `std::fs`, `Path`, `OsStr`, `RawFd`, `nix` y `libc`

Proyectos asociados: `ffi-demo`.

#### L19 — Rust systems avanzado

Foco: consolidar el tramo de Rust que aparece en librerías y runtimes reales antes de salir al bloque POSIX.

Salida: el lector decide entre `Rc`, `Arc`, `RefCell`, `Mutex`, `Pin` para un caso dado, y construye un wrapper seguro sobre una primitiva insegura.

Prerrequisitos: L18.

Materialidad típica: tests con `loom`, errores reales de `Send`/`Sync` resueltos, ejemplo de `Pin` en una struct self-referential.

Temas centrales:

- `Rc`, `Arc`, `Weak` e interior mutability
- `Cell`, `RefCell`, `Mutex` y `RwLock`
- `Pin`, invariantes de memoria y `Send`/`Sync`
- wrappers seguros sobre primitivas y APIs inseguras

Proyectos asociados hoy en repo: ninguno. Es un nivel puente para consolidar Rust systems antes de POSIX y de las reaperturas posteriores en runtimes, async y concurrencia.

### Bloque 3 — Sistemas POSIX

#### L20 — POSIX: archivos, metadatos y el filesystem

Foco: la abstracción central de Unix.

Salida: el lector navega el filesystem por syscalls, distingue inode, path y file descriptor, y observa eventos con `inotify`.

Prerrequisitos: L13 o L17.

Materialidad típica: `strace` de `cat`, salida comparada de `stat()` y `lstat()`, contenido de `/proc/self/fd/`.

Temas centrales:

- inode, pathname y file descriptor
- permisos y links
- VFS y `/proc`
- monitoreo con `inotify`

Proyectos asociados: `spl_stat`, `spl_ls`, `spl_du`, `file-monitor`.

#### L21 — Procesos y señales

Foco: procesos, `fork`, `exec`, `wait` y señales.

Salida: el lector implementa el patrón `fork`+`exec`+`wait` y maneja `SIGCHLD` y `SIGINT` con `sigaction` correctamente.

Prerrequisitos: L20.

Materialidad típica: `pstree` durante un `fork`, `strace -f` siguiendo `fork`+`exec`, reproducción de procesos zombie y huérfanos.

Temas centrales:

- proceso como contexto de ejecución
- copy-on-write
- `sigaction` y señales importantes
- `ptrace` y frontera userspace/kernel

Proyectos asociados: `spl_pstree`, `impl_abort`, `impl_alarm`, inicio de `mish`, inicio de `mini-debugger`.

#### L22 — POSIX fino y Unix real

Foco: bajar a las APIs y patrones de Unix real que no cabían en el recorrido POSIX base.

Salida: el lector configura redirecciones, abre archivos relativos a un fd con `openat`, y explica por qué `poll`/`select` no escalan en cargas grandes.

Prerrequisitos: L21.

Materialidad típica: `strace` de un shell con redirecciones, PTY abierto con `openpty`, comparación de benchmarks `poll` vs `epoll` con muchos fds inactivos.

Temas centrales:

- PTY/TTY, redirecciones y descriptores heredados
- `openat`, `dup2`, `fcntl`, `pipe2` y variantes modernas
- `poll`, `select` y transición conceptual hacia `epoll`
- contratos finos entre procesos, shell, terminal y kernel

Proyectos asociados hoy en repo: ninguno. Funciona como capa de APIs y patrones de Unix real antes de sus reaperturas prácticas posteriores, pero sin proyecto directo propio en el catálogo actual.

#### L23 — Scheduling

Foco: cómo decide el kernel qué corre y cuándo.

Salida: el lector explica una traza de scheduling con FIFO, RR y MLFQ, y describe cómo CFS reparte CPU entre procesos.

Prerrequisitos: L21.

Materialidad típica: `schedtool`, `chrt`, `/proc/<pid>/sched`, simulador de scheduler propio del nivel.

Temas centrales:

- FIFO, Round-Robin y MLFQ
- fairness, turnaround y response time
- CFS como scheduler real de Linux
- relación entre política y mecanismo

Proyectos asociados: `scheduler-sim`.

#### L24 — Memoria virtual

Foco: paginación, `mmap`, VMAs y copy-on-write.

Salida: el lector lee `/proc/<pid>/maps`, explica un page fault concreto y usa `mmap` con `MAP_PRIVATE` y `MAP_SHARED` con criterio.

Prerrequisitos: L21, L9.

Materialidad típica: `/proc/<pid>/maps`, `pmap`, traza de `mmap`+escribir+`fork` mostrando COW disparando un page fault.

Temas centrales:

- MMU y tablas de páginas
- page faults y demand paging
- `mmap`, `MAP_PRIVATE`, `MAP_SHARED`
- overcommit y OOM killer

Proyectos asociados: `vma-explorer`, `cow-demo`, `spl_cp`, continuación de `mini-debugger`.

#### L25 — Formato ELF y linking

Foco: qué vive dentro de un ejecutable y cómo se enlaza.

Salida: el lector identifica headers, secciones y segmentos en un ELF y traza una llamada dinámica vía PLT/GOT.

Prerrequisitos: L11, L7.

Materialidad típica: `readelf -a`, `objdump -d`, `nm`, `ldd`, `LD_DEBUG=bindings` mostrando una resolución dinámica.

Temas centrales:

- ELF64, headers, secciones y segmentos
- símbolos y relocations
- linking estático y dinámico
- PLT, GOT y loader dinámico

Proyectos asociados: `mini-linker`.

#### L26 — Allocators

Foco: implementar `malloc` y `free` desde cero.

Salida: el lector implementa un allocator con free list y coalescencia, y explica las decisiones de fit y de división de bloques.

Prerrequisitos: L24, L12.

Materialidad típica: traza de `malloc`/`free` interceptada con `LD_PRELOAD`, benchmarks contra glibc malloc, layout interno del heap visualizado.

Temas centrales:

- `sbrk()` vs `mmap()`
- free lists y boundary tags
- first-fit, best-fit, next-fit
- segregated bins y thread-safety

Proyectos asociados: `custom-malloc`.

### Bloque 4 — Concurrencia

#### L27 — Concurrencia I: threads y primitivas de sincronización

Foco: usar concurrencia basada en memoria compartida.

Salida: el lector escribe un productor-consumidor correcto con mutex y condvar y reproduce un data race controlado para luego corregirlo.

Prerrequisitos: L21, L17.

Materialidad típica: ThreadSanitizer disparando en un data race, `strace` mostrando llamadas a `futex`, traza de bloqueo y desbloqueo.

Temas centrales:

- `pthread_create`, `join`, `detach`
- mutex, condvar y semáforos
- data races y deadlocks
- `futex(2)` como primitiva subyacente

Proyectos asociados: `thread-pool`, `prod-cons`, `rwlock-impl`.

#### L28 — Concurrencia II: el hardware debajo de las primitivas

Foco: entender por qué existen los modelos de memoria.

Salida: el lector explica qué reordena el compilador, qué reordena la CPU y cómo MESI sostiene la semántica de un mutex.

Prerrequisitos: L27, L7.

Materialidad típica: comparación entre `volatile` y `atomic`, `perf c2c` o equivalente para detectar false sharing, ejemplo reproducible de reordenamiento.

Temas centrales:

- reordenamiento por compilador y CPU
- store buffers y load buffers
- x86-64 TSO vs ARM/POWER
- MESI y coherencia de cache

Proyectos asociados: `impl_arc`.

#### L29 — Concurrencia práctica: channels, colas y dispatch

Foco: resolver coordinación práctica y paso de mensajes antes del salto a lock-free completo.

Salida: el lector diseña un dispatch con channels y backpressure y razona por qué ese caso no necesita lock-free todavía.

Prerrequisitos: L27.

Materialidad típica: implementación de channel bounded con condvar, traza de overflow disparando backpressure, comparación con un diseño sin límite.

Temas centrales:

- channels bounded y unbounded
- work queues, thread pools y backpressure
- event loops, ownership de mensajes y dispatch
- separación entre coordinación práctica y diseño lock-free

Proyectos asociados hoy en repo: ninguno. Ordena patrones de coordinación práctica antes de reaparecer en proyectos posteriores, pero no abre todavía un proyecto canónico propio.

#### L30 — Concurrencia III: lock-free y concurrencia avanzada

Foco: diseñar primitivas y estructuras concurrentes con atomics.

Salida: el lector implementa una Treiber stack y explica los memory orders elegidos en cada CAS.

Prerrequisitos: L28, L29.

Materialidad típica: tests con `loom` o `relacy`, ejemplo reproducible de ABA, hazard pointer dentro de una cola Michael-Scott.

Temas centrales:

- CAS, `fetch_add`, `swap`
- memory ordering para diseño
- Treiber stack y Michael-Scott queue
- hazard pointers, ABA y RCU

Proyectos asociados: `lock-free-queue`, `rcu-demo`.

### Bloque 5 — IPC

#### L31 — IPC y comunicación entre procesos

Foco: cómo hablan entre sí procesos distintos.

Salida: el lector elige entre pipes, FIFOs, shared memory o sockets para un caso dado y diseña el wire format correspondiente.

Prerrequisitos: L21, L20.

Materialidad típica: salida de `ipcs`, hexdump de un mensaje sobre shared memory, `strace` cruzado entre dos procesos comunicándose.

Temas centrales:

- pipes y FIFOs
- POSIX shared memory y semáforos POSIX
- System V IPC
- diseño de wire formats

Proyectos asociados: `named-pipe-sem`, `ipc-explorer`, cierre de `mish`, inicio de `miniqueue`.

### Bloque 6 — Puente sistemas → compiladores

#### L32 — El parser de mish no escala

Foco: construir la motivación concreta del arco de compiladores.

Salida: el lector identifica al menos tres casos concretos donde el parser artesanal de `mish` falla, y argumenta la necesidad de gramática formal.

Prerrequisitos: L31, fases previas de `mish`.

Materialidad típica: input de shell que rompe el parser actual, traza del estado fallido, gramática parcial en notación BNF para el mismo lenguaje.

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

Salida: el lector traduce una expresión regular a NFA y luego a DFA, y explica por qué backtracking puede ser exponencial en algunos motores.

Prerrequisitos: L17 o L13.

Materialidad típica: dibujo de NFA y DFA equivalentes, benchmark de regex catastrófica que dispara backtracking.

Temas centrales:

- DFA y NFA
- Thompson construction
- subset construction y minimización
- por qué algunos motores regex son exponenciales y otros no

Proyectos asociados: `regex-engine`.

#### L34 — Parsers y gramáticas

Foco: transformar tokens en estructura.

Salida: el lector escribe un recursive descent o un Pratt parser que respeta precedencia y produce un AST navegable.

Prerrequisitos: L33, L16.

Materialidad típica: AST impreso para una expresión con precedencias mezcladas, error de parse reportado con posición exacta.

Temas centrales:

- gramáticas CFG, BNF y EBNF
- ambigüedad y precedencia
- recursive descent y Pratt parsing
- AST y visitor pattern

Proyectos asociados: `expr-parser`, `Semtex` Fase 1, `Lógico` Fase 1, cierre de `mish` Fase 5.

#### L35 — Intérpretes y evaluadores

Foco: ejecutar un AST.

Salida: el lector implementa un evaluador con entornos léxicos correctos y closures que cierran sobre las variables vivas.

Prerrequisitos: L34.

Materialidad típica: REPL con closures funcionando, ejemplo comparado de scoping léxico vs dinámico, traza de evaluación.

Temas centrales:

- REPL
- evaluación recursiva
- entornos léxicos y closures
- CPS y tail calls

Proyectos asociados: `Lógico` v1, `Semtex` Fases 2-3.

#### L36 — Sistemas de tipos: práctica antes del algoritmo

Foco: resolver tipos a mano antes de formalizar HM.

Salida: el lector resuelve a mano un sistema de constraints con union-find y explica cada paso de unificación.

Prerrequisitos: L35.

Materialidad típica: árbol de constraints generado a partir de un programa pequeño, traza de `unify` y union-find sobre el mismo problema.

Temas centrales:

- tipos simples
- variables de tipo
- constraints y unificación manual
- union-find como estructura de apoyo

Proyectos asociados: `logico`, `semtex`. Aun así, el corazón del nivel sigue viviendo en práctica manual y ejercicios previos a la implementación completa del algoritmo.

#### L37 — Inferencia de tipos: el algoritmo W

Foco: Hindley-Milner formalizado e implementado.

Salida: el lector implementa el algoritmo W con generalización y aplica inferencia a un programa Lisp simple.

Prerrequisitos: L36.

Materialidad típica: derivación de tipos paso a paso de un programa, error de unificación reportado con posición y tipos involucrados.

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

Salida: el lector diseña un wire format binario con versionado backward y forward compatible y lo evoluciona sin romper consumidores existentes.

Prerrequisitos: L17, L10, L31.

Materialidad típica: hexdump del formato definido, prueba cruzada entre dos versiones del mismo lector, checksum verificado tras corrupción inducida.

Temas centrales:

- wire formats binarios y de texto
- versionado backward y forward compatible
- checksums, corrupción y límites de confianza
- endianness, layout estable y compatibilidad entre procesos

Proyectos asociados hoy en repo: ninguno. Este nivel explicita una capa del canon que todavía no tiene proyecto focalizado propio dentro del catálogo estructural.

#### L39 — GC fundamental

Foco: estudiar GC como problema propio antes de esconderlo dentro de un intérprete o VM.

Salida: el lector implementa mark-sweep sobre un grafo de objetos y explica los tradeoffs de pausas y throughput frente a copying.

Prerrequisitos: L26, L35.

Materialidad típica: traza de roots, snapshot del heap antes y después del marcado, medición de pausa para distintos tamaños de heap.

Temas centrales:

- roots, reachability y tracing
- mark-sweep, copying y compactación
- pausas, throughput y tradeoffs de diseño
- relación entre allocators, object graphs y collectors

Proyectos asociados hoy en repo: ninguno. La capa de GC queda incorporada al canon antes de reaparecer dentro de runtimes e intérpretes, pero todavía sin proyecto propio materializado.

#### L40 — Runtimes, object layout y VMs

Foco: explicar cómo se organiza la ejecución más allá del AST antes de llegar al async runtime.

Salida: el lector diseña el object layout de una VM mínima y ejecuta bytecode con un dispatch loop coherente.

Prerrequisitos: L39, L37.

Materialidad típica: hexdump del bytecode emitido, traza del dispatch loop ejecutando un programa, layout del objeto en memoria.

Temas centrales:

- object layout, tagging y representación en heap
- stacks, frames, heaps y entornos de ejecución
- bytecode, dispatch loops y VMs sencillas
- organización interna de un runtime local y de un executor cooperativo

Proyectos asociados hoy en repo: ninguno. El nivel formaliza la capa runtime/VM antes del async runtime, aunque los proyectos dedicados a bytecode y runtime sigan fuera del catálogo estructural.

#### L41 — Persistencia I: durabilidad y B-Trees

Foco: durabilidad y storage engines basados en árbol.

Salida: el lector explica cómo `fsync` y un WAL garantizan durabilidad ante crash y construye un B-Tree on-disk simple.

Prerrequisitos: L24, L12.

Materialidad típica: hexdump de páginas B-Tree, simulación de crash y recovery con WAL, `strace` mostrando los `fsync` críticos.

Temas centrales:

- `fsync()` y crash recovery
- WAL
- B-Tree y fan-out
- tradeoffs de lectura y escritura

Proyectos asociados: `KVolt` Fases 1-2.

#### L42 — Persistencia II: LSM-Trees, MVCC y SQL

Foco: storage engines orientados a escritura y bases de datos con lenguaje propio.

Salida: el lector compara LSM-Tree y B-Tree para una carga dada y razona MVCC sobre un caso concreto de transacciones concurrentes.

Prerrequisitos: L41.

Materialidad típica: archivos SST de un LSM, plan SQL impreso por `EXPLAIN`, traza de versiones MVCC bajo lectura concurrente.

Temas centrales:

- LSM-Tree y compactación
- MVCC básico
- SQL como unidad explícita del plan
- planner y joins

Proyectos asociados: `KVolt` Fases 3-4, `MiniSQL`.

#### L43 — Persistencia III: cachés en memoria y políticas de evicción

Foco: memoria volátil, límites físicos del hardware y diseño de motores de caché antes de envolverlos en red.

Salida: el lector implementa una caché con TTL y evicción LRU/LFU correcta y razona snapshot por `fork()` aprovechando COW.

Prerrequisitos: L24, L29.

Materialidad típica: traza de hits y misses, snapshot de memoria pre y post `fork`, benchmark comparando políticas de evicción bajo la misma carga.

Temas centrales:

- hash tables concurrentes y particionado interno
- políticas de evicción LRU y LFU
- TTL con limpieza pasiva y activa
- snapshots por `fork()` aprovechando copy-on-write

Proyectos asociados: `mem-cache`.

#### L44 — Persistencia IV: event logs y brokers durables

Foco: convertir un WAL en un log de eventos y construir mensajería durable antes de entrar al stack de red.

Salida: el lector implementa un broker durable con offsets de consumidor, replay y backpressure ante consumidor lento.

Prerrequisitos: L41, L29.

Materialidad típica: log on-disk con offsets reales, traza de un consumidor lento provocando backpressure, replay desde un offset arbitrario.

Temas centrales:

- log-structured storage como event log inmutable
- semánticas at-most-once y at-least-once
- offsets de consumidor y replay
- backpressure y protección del sistema bajo desbalance productor/consumidor

Proyectos asociados: `mini-broker`.

#### L45 — Performance Engineering

Foco: medir antes de optimizar.

Salida: el lector formula una hipótesis, mide, cambia y vuelve a medir, y produce un flamegraph que justifica la decisión.

Prerrequisitos: L28, L24.

Materialidad típica: flamegraph de `perf`, salida de `perf stat`, benchmark con confianza estadística antes y después del cambio.

Temas centrales:

- metodología hipótesis → medición → cambio → re-medición
- benchmarking correcto
- flamegraphs y `perf`
- caches, branch prediction y false sharing
- optimización de I/O, alineación y zero-copy donde aplique

Proyectos asociados: `perf-benchmarks`, `flamegraph-lab`, `cache-locality-exp`, `false-sharing-exp`, optimización de `KVolt`, `mem-cache` o `mini-broker`.

#### L46 — Observabilidad distribuida

Foco: instrumentar servicios y flujos distribuidos antes de pasar a redes modernas, seguridad y runtimes async.

Salida: el lector instrumenta un servicio con structured logging, métricas y trazas correlacionadas, y diagnostica una falla a partir de esas señales.

Prerrequisitos: L45, L31.

Materialidad típica: log JSON con correlation ID coherente entre servicios, traza distribuida visualizada, dashboard mínimo con SLO definido.

Temas centrales:

- structured logging y correlation IDs
- métricas, tracing y relaciones causales entre servicios
- SLOs, debugging de fallas y señales de salud
- observabilidad como insumo de diseño, no solo de operación

Proyectos asociados hoy en repo: ninguno. La observabilidad distribuida queda como capa transversal del canon antes de reaparecer en servicios y sistemas distribuidos, pero sin proyecto propio hoy.

#### L47 — Redes I: fundamentos TCP y HTTP

Foco: sockets, TCP y HTTP/1.1.

Salida: el lector implementa un servidor TCP concurrente y explica la máquina de estados de TCP sobre una conexión real capturada.

Prerrequisitos: L31, L27.

Materialidad típica: captura `tcpdump` de un handshake, salida de `ss -tan`, intercambio HTTP/1.1 hecho a mano por `nc`.

Temas centrales:

- `socket`, `bind`, `listen`, `accept`, `connect`
- ciclo de vida de TCP
- HTTP/1.1 como protocolo de texto
- modelos de servidor concurrente

Proyectos asociados: `HTTP server` Fases 1-3, `shell remoto TCP`, `minisync`.

#### L48 — Redes II: protocolos modernos

Foco: lo que aparece encima de TCP en sistemas reales.

Salida: el lector explica el wire format de DNS y la estructura de un frame HTTP/2 leyendo bytes reales de una captura.

Prerrequisitos: L47.

Materialidad típica: captura `tcpdump` o Wireshark de DNS, frames HTTP/2 anotados, handshake TLS observado en bytes.

Temas centrales:

- TLS como capa separada
- DNS wire format
- HTTP/2, QUIC y WebSockets
- zero-copy networking

Proyectos asociados: `HTTP server` Fase 4, `mini-dns-resolver`, `mini-tcpdump`, `websocket-server`, `http2-server`, `minisync`, `TCP/IP stack`.

#### L49 — Seguridad y criptografía

Foco: criptografía aplicada y protocolos seguros.

Salida: el lector explica AEAD, intercambio Curve25519 y autenticación SSH-2 leyendo bytes de una sesión real.

Prerrequisitos: L48.

Materialidad típica: trazas SSH y TLS comentadas, vector de prueba AEAD, ejemplo real de criptografía mal usada y su consecuencia observable.

Temas centrales:

- AEAD, Curve25519 y Ed25519
- SSH-2
- TLS 1.3 en mayor profundidad
- modelo de amenaza

Proyectos asociados: `tinyssh`, `impl_script`.

#### L50 — I/O asíncrono y runtimes

Foco: readiness, completion y runtimes async.

Salida: el lector implementa un executor sobre `epoll` y explica las diferencias entre el modelo readiness y el modelo completion (`io_uring`).

Prerrequisitos: L29, L19.

Materialidad típica: trazas `strace` de `epoll_wait` y `io_uring_enter`, ejecución manual de un `Future` paso a paso, comparación de throughput entre ambos backends.

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

Salida: el lector construye un contenedor mínimo con namespaces, cgroups, OverlayFS y seccomp sin Docker.

Prerrequisitos: L24, L21, L31.

Materialidad típica: `unshare`, `nsenter`, jerarquía de cgroups en `/sys/fs/cgroup`, política seccomp aplicada y verificada.

Temas centrales:

- namespaces
- cgroups v2
- `pivot_root` y OverlayFS
- seccomp y capabilities

Proyectos asociados: `minidocker`.

#### L52 — Orquestación de contenedores

Foco: coordinar múltiples contenedores como sistema, todavía con un control plane único.

Salida: el lector implementa un reconciliation loop que mantiene estado deseado contra estado observado entre múltiples nodos.

Prerrequisitos: L51, L46.

Materialidad típica: traza del loop de reconciliación, gRPC entre control plane y worker, healthcheck fallando y disparando reconciliación.

Temas centrales:

- reconciliation loop
- scheduling de tareas
- networking entre contenedores
- gRPC, service discovery y healthchecks

Proyectos asociados: `orquestador`, continuación de `TCP/IP stack`.

#### L53 — Replicación y consenso

Foco: lograr que varias instancias se comporten como una sola unidad confiable.

Salida: el lector implementa elección de líder Raft y replicación de log con quórum, y razona CAP/PACELC sobre el diseño resultante.

Prerrequisitos: L52.

Materialidad típica: traza de elección con timeouts exponenciales, partición simulada y comportamiento observado, log replicado entre nodos.

Temas centrales:

- CAP y PACELC como marco conceptual
- elección de líder y replicación de log con Raft
- heartbeats, timeouts exponenciales y split-brain
- stores de configuración replicados y quórum

Proyectos asociados: `raft-lite`, replicación opcional de `mem-cache`, `mini-broker` o `KVolt`.

### Bloque 10 — Compiladores avanzados

#### L54 — Generación de código y JIT

Foco: emitir código ejecutable en runtime.

Salida: el lector emite código x86-64 a páginas ejecutables, integra register allocation simple y mide el resultado contra el intérprete equivalente.

Prerrequisitos: L40, L7, L25.

Materialidad típica: hexdump del código emitido, `mprotect` aplicado a la página, benchmark JIT vs interpretado.

Temas centrales:

- IR y SSA
- liveness y register allocation
- selección de instrucciones x86-64
- páginas ejecutables y WASM como extensión

Proyectos asociados: `JIT-Brain`.

#### L55 — Frontera user/kernel

Foco: explicitar el contrato entre userspace y kernel antes de entrar a módulos, drivers y subsistemas internos.

Salida: el lector explica el ABI de syscall, configura `seccomp` y `capabilities`, y razona la frontera concreta en JIT, contenedores y eBPF.

Prerrequisitos: L51, L25.

Materialidad típica: salida de `strace`, política seccomp aplicada, comparación de capacidades entre un proceso privilegiado y uno restringido.

Temas centrales:

- syscall ABI y convenciones de llamada
- `seccomp`, `capabilities`, `prctl` y `setrlimit`
- fronteras de privilegio, sandboxing y memoria compartida con kernel
- por qué contenedores, JIT, eBPF y drivers rozan esta frontera de formas distintas

Proyectos asociados hoy en repo: ninguno. Es el puente conceptual hacia `char-driver`, `ram-filesystem`, `kvm-mini-hypervisor` y `ebpf-tracer`, no un nivel con proyecto directo propio por ahora.

### Bloque 11 — Kernel space

#### L56 — Kernel space I: módulos y drivers

Foco: entrar al kernel por módulos, drivers y eBPF.

Salida: el lector escribe un módulo kernel con `file_operations` propio y maneja correctamente `copy_to_user` y `copy_from_user`.

Prerrequisitos: L55.

Materialidad típica: `dmesg` con prints del módulo, ciclo `insmod`/`rmmod`, archivo `/dev/` propio funcionando.

Temas centrales:

- Linux Kernel Modules
- `file_operations`
- `copy_to_user` y `copy_from_user`
- sincronización en kernel

Proyectos asociados: `char-driver`.

#### L57 — Kernel space II: VFS, allocators del kernel, CFS y virtualización

Foco: recorrer las grandes subsistemas internos del kernel que conectan con el resto del plan.

Salida: el lector ubica un filesystem en VFS, distingue buddy y slab allocator, y explica la API mínima de KVM para arrancar una VM.

Prerrequisitos: L56.

Materialidad típica: módulo de filesystem simple registrado en VFS, traza de un programa eBPF, ioctl real contra `/dev/kvm`.

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
