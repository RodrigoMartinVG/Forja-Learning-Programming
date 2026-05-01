# Forja — Contenido Curricular
## Plataforma de aprendizaje de programación de sistemas: C y Rust

> Este documento es la especificación de contenido curricular de Forja. Define qué se enseña, en qué orden, con qué proyectos y mediante qué recursos bibliográficos. No describe la arquitectura técnica de la plataforma ni la estructura del repositorio.
>
> Este documento consolida la especificación original (`forja-spec.md`) con el análisis de contenido posterior (`forja-analisis-contenido.md`). El plan ha sido expandido y refinado en múltiples pasadas: de 21 niveles originales a la estructura actual de **L0 a L23**, con L1 y L3 cada uno dividido en dos sub-niveles (L1a/L1b y L3a/L3b) para separar primer contacto de profundización en cada lenguaje. Se incorporaron además: Concurrencia Avanzada (L10), Performance Engineering (L17), I/O Asíncrono y Runtimes (L19); y nuevas unidades de modelo de errores en C, FFI C↔Rust, Rust para sistemas, y teoría de scheduling explícita.

---

## Índice

- [1. Qué es Forja](#1-qué-es-forja)
- [2. La persona que usa Forja](#2-la-persona-que-usa-forja)
- [3. Los dos tracks principales](#3-los-dos-tracks-principales)
  - [3.1 Track Teórico — Unidades conceptuales](#31-track-teórico--unidades-conceptuales)
  - [3.2 Track Práctico — Proyectos](#32-track-práctico--proyectos)
  - [3.3 Cómo se relacionan los dos tracks](#33-cómo-se-relacionan-los-dos-tracks)
- [4. Los niveles del plan: L0–L23](#4-los-niveles-del-plan-l0l23)
  - **Lenguajes**
  - [L0 — Entorno y Toolchain](#l0--entorno-y-toolchain)
  - [L1a — C: primer contacto](#l1a--c-primer-contacto)
  - [L1b — C: fundamentos profundos](#l1b--c-fundamentos-profundos)
  - [L2 — C como lenguaje: memoria y gestión manual](#l2--c-como-lenguaje-memoria-y-gestión-manual)
  - [L3a — Rust: primer contacto](#l3a--rust-primer-contacto)
  - [L3b — Rust: ownership y borrowing](#l3b--rust-ownership-y-borrowing)
  - [L4 — Rust como lenguaje: tipos, traits, FFI y sistema operativo](#l4--rust-como-lenguaje-tipos-traits-ffi-y-sistema-operativo)
  - **Sistemas**
  - [L5 — POSIX: archivos, metadatos y el filesystem](#l5--posix-archivos-metadatos-y-el-filesystem)
  - [L6 — Procesos y señales](#l6--procesos-y-señales)
  - [L7 — Memoria virtual y formato ELF](#l7--memoria-virtual-y-formato-elf)
  - [L8 — Allocators](#l8--allocators)
  - [L9 — Concurrencia: threads y primitivas de sincronización](#l9--concurrencia-threads-y-primitivas-de-sincronización)
  - [L10 — Concurrencia avanzada: atomics, lock-free y memory ordering](#l10--concurrencia-avanzada-atomics-lock-free-y-memory-ordering)
  - [L11 — IPC y comunicación entre procesos](#l11--ipc-y-comunicación-entre-procesos)
  - **Compiladores**
  - [L12 — Lexers y parsers](#l12--lexers-y-parsers)
  - [L13 — Intérpretes y evaluadores](#l13--intérpretes-y-evaluadores)
  - [L14 — Sistemas de tipos e inferencia](#l14--sistemas-de-tipos-e-inferencia)
  - **Sistemas avanzados**
  - [L15 — Persistencia y almacenamiento](#l15--persistencia-y-almacenamiento)
  - [L16 — Redes y protocolos](#l16--redes-y-protocolos)
  - [L17 — Performance Engineering](#l17--performance-engineering)
  - [L18 — Seguridad y criptografía](#l18--seguridad-y-criptografía)
  - [L19 — I/O asíncrono y runtimes](#l19--io-asíncrono-y-runtimes)
  - [L20 — Aislamiento y contenedores](#l20--aislamiento-y-contenedores)
  - [L21 — Orquestación y sistemas distribuidos](#l21--orquestación-y-sistemas-distribuidos)
  - [L22 — Generación de código y JIT](#l22--generación-de-código-y-jit)
  - [L23 — Kernel space](#l23--kernel-space)
- [5. La guía de estudio del código](#5-la-guía-de-estudio-del-código)
- [6. Taxonomía de proyectos](#6-taxonomía-de-proyectos)
- [7. Los proyectos integradores — descripción de alto nivel](#7-los-proyectos-integradores--descripción-de-alto-nivel)
- [8. C y Rust como ciudadanos de primera clase](#8-c-y-rust-como-ciudadanos-de-primera-clase)
- [9. El principio de herramientas industriales en proyectos avanzados](#9-el-principio-de-herramientas-industriales-en-proyectos-avanzados)
- [10. El modelo de aprendizaje con código dado](#10-el-modelo-de-aprendizaje-con-código-dado)
- [11. Caminos posibles de navegación](#11-caminos-posibles-de-navegación)
- [12. Bibliografía](#12-bibliografía)

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

**Prerrequisito declarado — estructuras de datos y algoritmos**: el plan asume familiaridad con las estructuras fundamentales — listas enlazadas, árboles binarios de búsqueda, tablas hash y heaps, y la notación asintótica básica (O(n), O(log n)). No se hace un curso de algoritmos. Las estructuras más específicas — B-Trees, LSM-Trees, árboles rojo-negro, skip lists — no se asumen conocidas de antemano: se explican en las unidades teóricas del nivel donde aparecen por primera vez, con la motivación y el contexto necesarios para entender por qué esa estructura existe y qué problema resuelve.

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
- **Lectura adicional**: capítulos específicos de las referencias bibliográficas del plan

Las unidades teóricas se organizan en tres dominios:

**Dominio de Lenguajes**: cubre C y Rust como lenguajes — sintaxis, semántica, herramientas, convenciones, errores típicos, patrones idiomáticos. No es teoría de compiladores; es aprender el lenguaje en profundidad.

**Dominio de Sistemas**: cubre teoría de sistemas operativos — procesos, memoria, scheduling, filesystems, redes, seguridad, virtualización, performance. Responde al "por qué" de lo que los proyectos implementan.

**Dominio de Compiladores**: cubre teoría de lenguajes formales, autómatas, gramáticas, semántica, representaciones intermedias, análisis de tipos. Acompaña a los proyectos de compiladores e intérpretes distribuidos a lo largo del plan.

### 3.2 Track Práctico — Proyectos

Los proyectos son sistemas concretos construidos por fases. Cada proyecto tiene:

- **Descripción y objetivo**: qué se construye, por qué es interesante
- **Equivalente industrial**: qué herramienta o sistema real hace esto en producción
- **Dependencias**: qué proyectos o unidades teóricas conviene tener antes
- **Fases de implementación**: entre 3 y 5 fases, de menor a mayor complejidad
- **Código base por fase**: generado con IA como punto de partida, bien estructurado y documentado
- **Guía de estudio del código**: documento separado que acompaña al código de cada fase
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

## 4. Los niveles del plan: L0–L23

El plan se organiza en niveles L0 a L23. Los niveles L1 y L3 están cada uno dividido en dos sub-niveles (L1a/L1b y L3a/L3b) para separar primer contacto de profundización en cada lenguaje. Cada nivel tiene un foco temático claro y acotado. Las posiciones no son obligatorias en orden estricto: tienen dependencias entre sí, pero el grafo de dependencias permite varios caminos válidos.

Dentro de cada nivel conviven unidades teóricas y proyectos del tipo correspondiente. Algunos proyectos atraviesan varios niveles; se anclan en el nivel donde empieza su fase más básica y se referencian desde los niveles que cubre su complejidad creciente.

---

### L0 — Entorno y Toolchain

**Foco**: Hacerse dueño del ambiente de trabajo antes de escribir una línea de sistema. No se aprende a programar aquí; se aprende a usar las herramientas que van a estar presentes en todo el plan.

**Unidades teóricas**: el modelo de compilación de C (preprocesador → compilador → assembler → linker); el sistema de módulos de Cargo y cómo resuelve dependencias; qué es un sanitizer y cuándo usar cada uno; cómo leer output de valgrind y de ASan; qué hace perf y cómo interpretar un flamegraph básico; qué es strace y cómo se usa para entender syscalls de un programa desconocido. Representación de enteros en hardware — complemento a dos (two's complement), por qué los enteros con signo no pueden hacer overflow sin UB en C mientras que los enteros sin signo sí pueden wrappear; qué es un registro de CPU y por qué hay un número fijo de ellos; cómo leer assembly x86-64 básico — no para escribirlo sino para entender lo que el debugger muestra y por qué el compilador toma las decisiones que toma; el stack frame en hardware — cómo `rsp` y `rbp` definen el frame de cada función en la convención de llamada x86-64.

**Proyectos**: setup del laboratorio Linux con devcontainer. El resultado es un ambiente reproducible con todas las herramientas instaladas y verificadas.

**Equivalente industrial**: Docker Desktop, Nix, distrobox, dev containers de VSCode.

**Nota sobre el ambiente**: el laboratorio vive en un contenedor Linux. Esto sirve tanto para usuarios con Linux nativo (evitar romper el sistema con módulos de kernel o experimentos de cgroups) como para usuarios en macOS o Windows (via WSL2). El mismo devcontainer funciona en cualquier máquina.

**Referencia asignada para la unidad de arquitectura**: CS:APP (Bryant & O'Hallaron), capítulos 2 (representación de información) y 3 (assembly x86-64 — lectura). Estos dos capítulos dan el modelo mental de hardware que subyace a todo lo que sigue.

---

### L1a — C: primer contacto

**Foco**: C como primer lenguaje de sistemas para quien viene de Python, JavaScript, Go u otro lenguaje de alto nivel. El objetivo es poder leer y escribir C elemental antes de aprender sus particularidades profundas. Este nivel no asume conocimiento previo de C — solo saber programar en algún lenguaje.

**Unidades teóricas**: hello world en C — compilar con `gcc hello.c -o hello` y entender qué hace cada paso; tipos básicos — `int`, `char`, `float`, `double`, `long`, `unsigned` y sus tamaños dependientes de plataforma; declaración de variables y scope de bloque; control flow — `if/else`, `while`, `for`, `switch/break/continue` y sus diferencias respecto a lenguajes de alto nivel; funciones — declaración, definición, prototipo, por qué el orden importa en C; arrays como bloques contiguos de memoria — `int arr[10]`, indexación sin bounds checking; strings como `char[]` terminado en `\0` — `printf`, `scanf`, `gets` vs `fgets`; I/O estándar — `printf`/`fprintf`, `scanf`/`fscanf`, redirección de stdin/stdout; bibliotecas estándar básicas — qué hay en `stdio.h`, `stdlib.h`, `string.h`; la distinción inicial entre array y puntero (presentada sin profundidad todavía — se desarrolla en L1b).

**Herramientas**: compilación manual con `gcc` y `clang`; flags básicas (`-Wall -Wextra -g -O0`); `make` a nivel introductorio.

**Proyectos focalizados**:
- `hello-c`: hello world, compilación manual, inspección del binario con `file` y `size`
- `caesar-cipher`: cifrado César — arrays, strings, loops, aritmética modular
- `word-count`: contar palabras, líneas y caracteres desde stdin (tipo `wc(1)`) — I/O, strings, estado

**Errores típicos de primer contacto**: `=` vs `==` en condiciones; olvidar `\0` al construir strings manualmente; comparar strings con `==` en lugar de `strcmp`; `scanf("%s")` sin límite de tamaño (buffer overflow clásico); mezclar `int` con `char` en comparaciones sin pensar en el signo.

**Referencia clave**: The C Programming Language (Kernighan & Ritchie, 2da ed.) capítulos 1–4 — la referencia canónica del lenguaje, densa y precisa. Complemento: CS:APP capítulo 3 como lectura paralela para entender qué genera el compilador.

---

### L1b — C: fundamentos profundos

**Foco**: Las características de C que lo distinguen de todo otro lenguaje y que son la base de todo lo que sigue. Punteros como aritmética, alineación, preprocesador y undefined behavior. No es posible programar sistemas en C sin dominar este nivel.

**Unidades teóricas**: tipos enteros y su tamaño real — `int` no es siempre 32 bits, `stdint.h` existe por eso, `size_t` para tamaños de objetos; punteros como valores numéricos — aritmética de punteros, punteros a punteros, punteros a función, la relación real entre arrays y punteros (decay); structs y alineación — padding implícito, `__attribute__((packed))`, cómo verificar el layout con `offsetof`; unions — su uso legítimo para type punning y variantes discriminadas; enums — cómo los representa el compilador (son `int`); el preprocesador como sustitución textual — macros de función, guards de inclusión, por qué las macros sin paréntesis son peligrosas; `const` correctness — `const char *` vs `char * const` vs `const char * const`; `restrict` como hint de no-aliasing para el compilador; `static` e `inline` en sus distintos contextos; linkage — `static` en file scope vs función scope, `extern`; undefined behavior como categoría formal — por qué no es "comportamiento aleatorio" sino un contrato roto entre el programador y el compilador, con ejemplos concretos (signed overflow, null pointer deref, strict aliasing).

**Herramientas**: make y cmake básico; flags de compilación importantes (`-O2`, `-fsanitize=address`, `-std=c11`); clang-format y clang-tidy; cppcheck.

**Proyectos focalizados**:
- `stringlib`: reimplementación de funciones de `<string.h>` (`memcpy`, `strlen`, `strtok`, `strdup`) — punteros en práctica
- `elf-explorer`: usar `nm`, `objdump -d`, `readelf -a` para inspeccionar un ejecutable compilado — ver secciones, símbolos, assembly generado, y la tabla de strings. Este proyecto es de observación, no de implementación; el objetivo es desarrollar el modelo mental del formato binario antes de implementar el linker (que llega en L7).

**Errores típicos**: olvidar el `break` en switch; confundir `sizeof(array)` en un puntero vs en el array real; comparar `char *` con `==`; olvidar `\0`; modificar un string literal; macro sin paréntesis que se expande incorrectamente.

**Referencia clave**: K&R capítulos 5–8; CS:APP capítulo 7 (linking) como lectura anticipada que cobrará sentido en L7.

---

### L2 — C como lenguaje: memoria y gestión manual

**Foco**: El modelo de memoria de C. Stack, heap, segmento de datos. malloc/free. El ciclo de vida de la memoria y los errores que surgen cuando se rompe.

**Unidades teóricas**: layout de memoria de un proceso (text, data, bss, heap, stack); stack frames y cómo crece el stack en cada llamada; `malloc`/`free`/`realloc`/`calloc` — qué garantizan, qué no; por qué free no devuelve memoria al SO inmediatamente; las tres categorías de error de memoria (use-after-free, double-free, buffer overflow) y cómo ASan los detecta; valgrind memcheck — cómo interpretar cada tipo de error; el modelo de ownership conceptual (antes de Rust): "quien lo alloca, lo libera". El modelo de manejo de errores en C — retornar `-1` y setear `errno` para indicar fallos; `perror()` y `strerror()` como forma de traducir un código de error a texto legible; por qué `errno` es thread-local desde POSIX (cada thread tiene el suyo); el patrón de retornar `NULL` en funciones que devuelven puntero; el patrón `goto cleanup` para liberar recursos ante fallo sin repetición de código — la forma idiomática de C ante errores; `assert()` vs error handling real — cuándo cada uno es apropiado.

**Proyectos focalizados**:
- `getopt-impl`: parser de argumentos de línea de comando desde cero (tipo `getopt`)
- `dynamic-array`: vector dinámico genérico con `void *` y punteros a función

**Herramientas**: valgrind memcheck, ASan, UBSan. Se usan en cada proyecto de aquí en adelante.

**Referencia clave**: K&R capítulo 7 (I/O y el modelo de biblioteca estándar); CS:APP capítulo 9 (memoria virtual como contexto del heap y del allocator); TLPI capítulo 7 (memory allocation) y capítulo 3 (manejo de errores con errno) — la referencia definitiva de las APIs POSIX de memoria y errores.

---

### L3a — Rust: primer contacto

**Foco**: Rust como lenguaje antes del borrow checker. El objetivo es poder leer y escribir Rust elemental — sintaxis, sistema de tipos básico, filosofía del lenguaje — antes de enfrentarse al concepto que lo define. Arrancar con ownership en el primer contacto con Rust es el error más común al enseñar el lenguaje.

**Unidades teóricas**: `let` y mutabilidad — `let x = 5` vs `let mut x = 5`, por qué la inmutabilidad es el default; shadowing — re-declarar una variable con `let` en el mismo scope; tipos básicos — `i8/i16/i32/i64/i128`, `u8/../u128`, `f32/f64`, `bool`, `char` (Unicode scalar, no byte), `usize`; inferencia de tipos — cuándo Rust la hace y cuándo hace falta anotación explícita; control flow — `if/else` como expresión que retorna valor, `loop`, `while`, `for in`; `match` básico — pattern matching sobre valores, rangos, tuplas, y por qué es superior al switch de C; funciones — declaración, tipos de parámetros y retorno, retorno implícito de la última expresión (sin `;`); structs — `struct Point { x: f64, y: f64 }`, métodos con `impl`, `self` vs `&self` vs `&mut self`; enums — variantes simples `enum Direction { North, South }` y con datos `enum Shape { Circle(f64), Rect(f64, f64) }`; `Option<T>` como primer enum importante — `Some(x)` vs `None`, pattern matching sobre Option; módulos básicos — `mod`, `use`, visibilidad con `pub`; comentarios de documentación con `///`.

**Herramientas**: rustup, cargo (new, build, run, test); rustfmt; rust-analyzer como compañero en el editor.

**Proyectos focalizados**:
- `hello-rust`: hello world, cargo workflow, estructura de un crate
- `fizzbuzz-rust`: FizzBuzz con `match` — demuestra que `match` es una expresión y cubre todos los casos
- `mini-calculator`: calculadora de consola con `match` exhaustivo sobre operadores, manejo de división por cero con `Option`

**Errores típicos de primer contacto**: intentar modificar una variable `let` sin `mut`; confundir `String` con `&str` (se profundiza en L3b); usar `==` para comparar structs sin implementar `PartialEq`; poner `;` al final de la última expresión de una función (la convierte en `()` en lugar del valor).

**Referencia clave**: The Rust Programming Language (Klabnik & Nichols, "the book", gratis en doc.rust-lang.org) capítulos 1–6. Complemento: Rust in Action (Tim McNamara) capítulos 1–3 para ver Rust en contexto de sistemas desde el primer día.

---

### L3b — Rust: ownership y borrowing

**Foco**: El concepto que diferencia Rust de todo lo demás. El borrow checker no es un obstáculo: es un sistema de tipos que captura en tiempo de compilación los errores que C detecta en runtime (con suerte) o no detecta (muchas veces). Este nivel construye sobre L3a — si el usuario no tiene comodidad con la sintaxis básica, el borrow checker se vuelve doble obstáculo.

**Unidades teóricas**: ownership como invariante del compilador — una sola variable es dueña de un valor a la vez; move semantics — qué ocurre cuando se asigna un valor a otra variable o se pasa a una función; copy semantics — tipos que implementan `Copy` (escalares, referencias) vs tipos que se mueven (`String`, `Vec`, structs custom); borrowing — referencias compartidas (`&T`, solo lectura, múltiples simultáneas) y exclusivas (`&mut T`, lectura/escritura, solo una a la vez); las reglas del borrow checker y por qué garantizan ausencia de data races en compile time; lifetimes como región de validez de una referencia — cuándo el compilador los infiere y cuándo hace falta anotarlos explícitamente; notación `'a` — cómo leer y escribir lifetime parameters; `Clone` vs `Copy` — cuándo implementar cada uno; `Drop` como destructor garantizado — qué ocurre cuando un valor sale de scope; `String` vs `&str` — por qué existen dos tipos de string, cuándo usar cada uno; slices — `&[T]` y `&str` como vistas de una secuencia contigua sin tomar ownership.

**Proyectos focalizados**:
- `data-structures-rust`: reimplementación de estructuras de datos en Rust — linked list (el proyecto clásico que fuerza entender lifetimes y `Box<T>`), binary search tree, stack con genéricos.

**Errores típicos**: mover un valor y seguir usándolo (el error más frecuente de principiantes); borrow inmutable mientras existe un borrow mutable al mismo scope; retornar una referencia a una variable local; usar `clone()` innecesariamente como escape hatch (señal de no haber entendido ownership todavía); confundir el lifetime del valor con el lifetime de la referencia.

**Referencia clave**: The Rust Book capítulos 4–5 y 10.3 (lifetimes). Programming Rust (Blandy, Orendorff, Tindall) capítulos 4–5 para una perspectiva más profunda desde sistemas.

---

### L4 — Rust como lenguaje: tipos, traits, FFI y sistema operativo

**Foco**: El sistema de tipos de Rust más allá del borrow checker. Traits como contratos, genéricos, tipos algebraicos, y la filosofía de manejo de errores. Además: cómo Rust interopera con C (FFI) y cómo accede a las APIs del sistema operativo — los dos puentes que hacen posibles todos los proyectos de sistemas del plan.

**Nota de densidad**: L4 cubre tres bloques temáticos de peso comparable a un nivel cada uno (tipos+traits, FFI, Rust-OS). Puede navegarse en sub-pasadas: completar tipos+traits y sus proyectos primero, avanzar con los primeros niveles de sistemas en C (L5–L7), y volver a las secciones de FFI y Rust-OS cuando los proyectos de sistemas empiecen a requerirlas.

**Unidades teóricas — sistema de tipos y traits**: traits — `Display`, `Debug`, `From`, `Into`, `Iterator`, `Deref`; genéricos y monomorphization vs dynamic dispatch (`impl Trait` vs `dyn Trait`); `Option<T>` y `Result<T, E>` como tipos, no como convenciones; el operador `?` y cómo propaga errores; tipos `newtype` para encapsular invariantes; `PhantomData` y tipos fantasma; macros declarativas (`macro_rules!`) vs procedurales — cuándo usar cada una, qué es la higiene de macros, por qué los proc_macros de Rust son fundamentalmente más poderosos que los templates de C++, cómo se implementa `derive`; `unsafe` — qué deshabilita, cuándo es necesario, cómo contenerlo.

**Unidades teóricas — FFI C↔Rust**: `extern "C"` como bloque de declaraciones para llamar funciones C desde Rust; `#[no_mangle]` y `extern "C"` para exponer funciones Rust a C; tipos que cruzan la frontera — `c_int`, `c_char`, `*const c_char`, `*mut c_char`, `c_void`; punteros crudos en Rust — `*const T` y `*mut T` — cuándo y cómo usarlos dentro de `unsafe`; `bindgen` — generación automática de bindings desde un header C a un módulo Rust; `cbindgen` — generación del header C desde una librería Rust; el patrón de "safe abstraction sobre unsafe" — wrappear una API C peligrosa en un wrapper Rust con invariantes garantizados por el tipo system; proyectos que usarán esto: tinyssh (libsodium), minidocker (libseccomp), mini-debugger (libunwind).

**Unidades teóricas — Rust para el sistema operativo**: `std::fs` y sus tipos — `File`, `OpenOptions`, `DirEntry`, `Metadata`; `std::os::unix::fs::MetadataExt` — el trait de extensión Unix para uid, gid, inodo y otros campos que `std` abstrae; `std::path::Path` y `PathBuf` — la API de paths en Rust, por qué no es simplemente `String`; `OsString` y `OsStr` — por qué existen (los filesystems pueden tener nombres que no son UTF-8 válido), cuándo aparecen; `std::os::unix::io::RawFd` — cómo Rust expone los file descriptors numéricos cuando se necesita interactuar con syscalls directamente; el crate `nix` — qué syscalls expone que `std` no expone (inotify, señales POSIX, ptrace, namespaces, setuid); el crate `libc` — el mínimo común denominador para syscalls; diferencia entre `nix` (API ergonómica y segura) y `libc` (API C literal, todo `unsafe`).

**Herramientas**: rustup, cargo (build, test, bench, doc, clippy, fmt, expand); rust-analyzer; miri (detección de UB en código unsafe); cargo-audit.

**Proyectos focalizados**:
- `custom-iterator`: iterador personalizado con estado — implementa el trait `Iterator` con tipo asociado `Item` y lógica de avance no trivial (e.g., Fibonacci, chunks de slice, zip-con-transformación)
- `parser-combinators`: librería de parsing combinadores minimal (tipo `nom` simplificado) — funciones que consumen input y retornan `Result<(rest, parsed), Error>`, con combinadores `many0`, `tag`, `alt`, `map`
- `ffi-demo`: wrappear una función de `libm` (C) desde Rust con `bindgen`, y exponer una función Rust a C con `cbindgen`. Proyecto pequeño cuyo objetivo es demostrar el flujo completo de FFI antes de necesitarlo en proyectos reales.

---

> **De lenguajes a sistemas**: L0–L4 construyen la caja de herramientas — C y Rust como lenguajes con sus particularidades, modelos mentales y herramientas. A partir de L5 empieza el trabajo de sistemas: cómo el kernel gestiona archivos, procesos, memoria, concurrencia e IPC; cómo se construyen compiladores, bases de datos, servidores, y eventualmente el propio kernel. Los proyectos de L5 en adelante son los que dan sentido concreto a todo lo que precede.

---

### L5 — POSIX: archivos, metadatos y el filesystem

**Foco**: La abstracción central de Unix — todo es un archivo. Inodos, descriptores, permisos, metadatos y traversal de directorios.

**Unidades teóricas**: el inode como estructura del filesystem — qué contiene, qué no; file descriptors como enteros que indexan la tabla de archivos del proceso; la distinción entre pathname, inode y file descriptor; permisos POSIX — bits rwx, suid/sgid/sticky, umask; hard links vs symbolic links — por qué un archivo puede tener muchos nombres; el filesystem virtual de Linux — cómo ext4, tmpfs y /proc comparten la misma interfaz; `/proc` como filesystem — qué expone y cómo se construye dinámicamente.

**Proyectos focalizados**: `spl_stat` (metadatos de archivos); `spl_ls` (listado de directorio); `spl_du` (uso de disco recursivo); `file-monitor` (vigilancia de cambios con inotify).

**Equivalentes industriales**: `stat(1)`, `ls(1)`, `du(1)`, `find(1)`, `inotifywait`, `watchman`, `entr`.

**Referencia clave**: TLPI (Kerrisk) capítulos 15 (metadatos de archivos y stat), 18 (directorios y links) y 19 (inotify) — la referencia definitiva de las APIs POSIX de filesystems. CS:APP capítulo 10 (System-Level I/O) como introducción conceptual más breve.

---

### L6 — Procesos y señales

**Foco**: El proceso como unidad de ejecución. Cómo se crean, cómo se terminan, cómo se comunican a través de señales, y cómo el kernel registra su existencia.

**Unidades teóricas**: el proceso como contexto de ejecución — espacio de memoria, tabla de FDs, señales pendientes, credenciales; `fork()` y copy-on-write — qué se comparte y qué se copia; la familia `exec` — cómo se reemplaza el image del proceso; `wait()` y `waitpid()` — por qué los zombies existen y cómo evitarlos; señales como interrupciones asíncronas — `sigaction`, máscaras, `SA_RESTART`; `SIGCHLD`, `SIGPIPE`, `SIGSEGV` — qué significan en la práctica; `/proc` como vista del árbol de procesos; introducción a `ptrace(2)` — la syscall que hace posible gdb, strace, ltrace, rr y los sanitizers. Teoría de scheduling — política vs mecanismo; scheduling FIFO y Round-Robin — el caso base y sus tradeoffs de fairness vs throughput; MLFQ (Multi-Level Feedback Queue) — múltiples colas de prioridad, reglas de boost/degrade, por qué el aging evita starvation; el Completely Fair Scheduler (CFS) de Linux como referencia del estado del arte — virtual runtime y árbol rojo-negro (se profundiza en L23); métricas de scheduling — turnaround time, response time, fairness; por qué un scheduler de propósito general es un ejercicio de tradeoffs sin solución perfecta.

**Proyectos focalizados**:
- `spl_pstree`: árbol de procesos desde /proc
- `impl_abort`: reimplementación de abort()
- `impl_alarm`: reimplementación de alarm() con setitimer
- `scheduler-sim`: simulador de políticas de scheduling en user space — round-robin, FIFO, MLFQ con aging. Métricas de turnaround y response time. Sin kernel space. Referencia: simuladores de OSTEP capítulos de scheduling.

**Proyectos integradores que empiezan aquí**:
- `mish` (el shell — ver sección 7)
- `mini-debugger`: usa `ptrace(2)` para poner breakpoints, single-step, leer y escribir registros y memoria del proceso objetivo. Implementa `break`, `continue`, `next`, `print` de forma básica. Cruza procesos (L6), señales (L6), memoria virtual (L7) y representación binaria/ELF (L1b/L7). Equivalente industrial: gdb, lldb, rr (Mozilla).

**Referencia clave para scheduling**: OSTEP (Arpaci-Dusseau) capítulos 7 (Scheduling Introduction), 8 (MLFQ), y 9 (Lottery Scheduling) — lectura recomendada antes del proyecto `scheduler-sim`.

---

### L7 — Memoria virtual y formato ELF

**Foco**: Dos temas que el kernel conecta íntimamente — cómo gestiona la memoria (MMU, paginación, mmap) y cómo carga y enlaza programas (ELF, linker). El `mini-linker` de este nivel exige entender ambos: un linker produce binarios ELF que el kernel luego mapea en memoria virtual.

**Unidades teóricas — memoria virtual**: la MMU y la traducción de direcciones virtuales a físicas; la page table y sus niveles (x86_64 usa 4 niveles); page faults — cuándo ocurren y cómo los maneja el kernel; demand paging y copy-on-write; `mmap()` — mapear archivos o memoria anónima; `MAP_PRIVATE` vs `MAP_SHARED`; VMA (Virtual Memory Areas) y cómo `/proc/PID/maps` las expone; overcommit — por qué Linux permite reservar más memoria de la que tiene; el OOM killer.

**Unidades teóricas — formato ELF y linking**: el formato ELF64 — header, secciones vs segmentos (la distinción entre `Elf64_Shdr` y `Elf64_Phdr`); las secciones clave: `.text` (código ejecutable), `.data` (datos inicializados), `.bss` (datos sin inicializar, solo tamaño), `.symtab` (tabla de símbolos), `.strtab` (tabla de strings), `.rela.text` (relocation entries); la tabla de símbolos — `Elf64_Sym`: name, value, size, binding (LOCAL/GLOBAL/WEAK), type (FUNC/OBJECT), section index; relocation entries — `Elf64_Rela`: offset, tipo de relocation (`R_X86_64_PC32`, `R_X86_64_PLT32`, `R_X86_64_64`), symbol index, addend; linking estático vs dinámico — diferencias en el binario final y en cómo carga el kernel; position-independent code (PIC) y el PLT/GOT — por qué las shared libraries lo necesitan; `ld.so` y la resolución dinámica de símbolos en runtime; `RPATH` vs `LD_LIBRARY_PATH` — cómo el loader encuentra las libs.

**Proyectos focalizados**:
- Explorador de VMAs (`/proc/self/maps`) — visualizar las regiones del propio proceso
- Demostración de copy-on-write con fork() — medir cuándo ocurre el page fault
- `spl_cp` — usando `mmap` + `memcpy` en lugar de read/write
- `mini-linker`: lee archivos `.o` ELF64, parsea los headers de secciones y la tabla de símbolos (`Elf64_Sym`), resuelve símbolos globales entre múltiples object files, aplica las relocation entries (`Elf64_Rela`) para parchear las referencias entre funciones, y produce un ejecutable ELF64 mínimo que el kernel puede cargar. El proyecto está intencionalmente limitado: no genera shared libraries, no soporta debug info, no soporta PIC. El objetivo es entender el flujo central de linking — el `elf-explorer` de L1b fue la preparación para este proyecto.

**Referencia clave para mini-linker**: Linkers and Loaders (John Levine, 2000) — la referencia más completa del proceso de linking; CS:APP (Bryant & O'Hallaron) capítulo 7 — presentación clara del formato ELF y relocation. Ambos son lectura altamente recomendada antes de implementar.

---

### L8 — Allocators

**Foco**: Implementar `malloc` y `free` desde cero, entender fragmentación, y diseñar allocators más sofisticados. El nivel donde la teoría de memoria virtual se convierte en código de bajo nivel real.

**Unidades teóricas**: el heap como región de memoria creciente — `sbrk()` vs `mmap()`; el header de bloque y cómo compactar size + free bit; algoritmos de ajuste (first-fit, best-fit, next-fit) y sus tradeoffs de velocidad y fragmentación; coalescencia de bloques adyacentes — boundary tags (Knuth); segregated free lists — bins por tamaño; thread-safety — mutex global vs arenas por thread; por qué jemalloc y mimalloc son tan distintos de ptmalloc2.

**Proyectos**:
- `custom-malloc v1`: sbrk + free list + first-fit + coalescencia
- `custom-malloc v2`: segregated bins + thread-safety + benchmarks vs glibc malloc
- El GC mark-and-sweep para el intérprete Lógico (anticipa la conexión con L13 — la primera conexión explícita entre proyectos de distintos dominios del plan se materializa allí)

**Equivalentes industriales**: jemalloc, mimalloc, tcmalloc, snmalloc, Hoard, ptmalloc2 (glibc).

**Referencia clave**: CS:APP (Bryant & O’Hallaron) capítulo 9.9 — implementación paso a paso de un allocator con boundary tags, la base directa de custom-malloc v1; paper de jemalloc (Jason Evans, 2006, gratis) para el diseño de arenas por thread que inspira v2.

---

### L9 — Concurrencia: threads y primitivas de sincronización

**Foco**: Threads POSIX, sincronización y los problemas clásicos de concurrencia. No es concurrencia asíncrona (eso es L19); es concurrencia basada en threads con memoria compartida.

**Unidades teóricas**: thread como flujo de ejecución dentro de un proceso — qué comparte, qué no; `pthread_create`, `pthread_join`, `pthread_detach`; data race como UB en C y como error de compilación en Rust; mutex — acquire/release, el invariante que protege; condition variables — espera sin busy-wait, el patrón `while(!cond) wait()`; semáforos — `sem_post` y `sem_wait`; deadlock — las cuatro condiciones de Coffman; `futex(2)` como primitiva subyacente; el modelo de memoria de C11/C++11 — `atomic_t`, ordering (sequentially consistent, acquire/release, relaxed); el modelo de memoria de hardware — store buffers y load buffers, por qué los procesadores modernos requieren barreras de memoria; el protocolo MESI de coherencia de cache y qué implica para el programador; por qué x86-64 es TSO (Total Store Order) y ARM es más débil — por qué código portable necesita barreras explícitas.

**Proyectos focalizados**:
- `thread-pool`: thread pool con queue de trabajo y condition variable
- `prod-cons`: productor-consumidor con buffer acotado
- `rwlock-impl`: implementación de un rwlock desde cero sobre mutex + condvar

**Equivalentes industriales**: OpenMP, Intel TBB, rayon (Rust), Java ExecutorService.

**Referencia clave**: Rust Atomics and Locks (Mara Bos), capítulos 1–4 y 7 (modelo de hardware).

---

### L10 — Concurrencia avanzada: atomics, lock-free y memory ordering

**Foco**: Los fundamentos de hardware de la concurrencia de bajo nivel. Memory ordering formal, estructuras de datos sin locks, hazard pointers, y los patrones de sincronización del kernel Linux. Este nivel tiene suficiente densidad conceptual para ser autónomo — lo que en otros planes se entierra dentro de IPC o se omite directamente.

**Unidades teóricas**: memory ordering en detalle — sequentially consistent, acquire/release, relaxed — qué garantiza cada uno en términos de reordenamiento de instrucciones; la diferencia práctica entre x86-64 (TSO) y ARM/POWER en cuanto a ordering observable; barreras de memoria explícitas en C11 y en Rust; algoritmos lock-free clásicos — Treiber stack, Michael-Scott queue; hazard pointers como alternativa a GC para gestionar la memoria en estructuras lock-free con múltiples threads; el problema de ABA — qué es, por qué es peligroso en algoritmos lock-free, cómo evitarlo con tagged pointers; RCU (Read-Copy-Update) — el patrón de sincronización del kernel Linux para datos de lectura intensiva, cómo garantiza que los lectores nunca bloquean.

**Proyectos focalizados**:
- `impl_arc`: implementar `Arc<T>` con conteo atómico de referencias y weak references, desde cero. La referencia directa es el capítulo 6 de Rust Atomics and Locks.
- `lock-free-queue`: Michael-Scott queue con hazard pointers. Implementación dual C/Rust.
- `rcu-demo`: demostración de RCU para una lista enlazada con lectores concurrentes intensivos — ningún lector bloquea aunque el escritor actualice concurrentemente.

**Equivalentes industriales**: `std::sync::Arc` (Rust std), crossbeam (Rust), libatomic_ops, liburcu.

**Referencias clave**: Rust Atomics and Locks (Bos), capítulos 5–7; "Is Parallel Programming Hard, And If So, What Can You Do About It?" (Paul McKenney, gratis); The Art of Multiprocessor Programming (Herlihy & Shavit).

---

### L11 — IPC y comunicación entre procesos

**Foco**: Cómo se comunican procesos distintos. Pipes, FIFOs, shared memory, message queues. La diferencia fundamental entre threads (memoria compartida) y procesos (memoria aislada, necesitan IPC explícito).

**Unidades teóricas**: pipes anónimas — `pipe(2)`, heredar FDs en fork, cerrar el extremo no usado; FIFOs nombradas — `mkfifo`, apertura bloqueante; POSIX shared memory — `shm_open`, `ftruncate`, `mmap`; semáforos POSIX nombrados vs de memoria compartida; System V IPC — msgsnd/msgrcv, shmget/shmat, semop — por qué existe y por qué POSIX IPC es preferible hoy; diseño de un protocolo de wire format — header + payload, serialización, framing.

**Proyectos focalizados**:
- `named-pipe-sem`: semáforo binario sobre named pipes
- `ipc-explorer`: explorador de objetos IPC del sistema (tipo `ipcs(1)`)

**Proyectos integradores que empiezan aquí**: `miniqueue` (message queue tipo RabbitMQ).

**Referencia clave**: TLPI (Kerrisk) capítulos 43–48 — cubre pipes, FIFOs, POSIX shared memory, POSIX message queues y System V IPC de forma exhaustiva; es la referencia definitiva para todo lo que aparece en este nivel.

---

### L12 — Lexers y parsers

**Foco**: Primer arco de compiladores. Cómo se transforma texto en estructura. Autómatas finitos, gramáticas, recursive descent parsing.

**Unidades teóricas**: el problema del parsing — por qué es más difícil que "buscar con regex"; autómatas finitos deterministas (DFA) y no deterministas (NFA) como modelos de lexers; construcción de NFA por el algoritmo de Thompson — cómo cada operador de regex se convierte en un fragmento de NFA; subset construction — conversión NFA→DFA; minimización de DFA por el algoritmo de Hopcroft; gramáticas libres de contexto (CFG) en notación BNF/EBNF; conjuntos FIRST y FOLLOW para parsers LL(1); parsing recursive descent — una función por regla de gramática; Pratt parsing para precedencia de operadores — el algoritmo correcto para expresiones con múltiples niveles de precedencia; Abstract Syntax Tree (AST) — qué nodos tiene, cómo se construye; el patrón visitor para recorrer y transformar un AST.

**Proyectos focalizados**:
- `regex-engine`: NFA construction por Thompson + subset construction + DFA minimizado + motor de backtracking opcional. Implementación dual C/Rust. Es el proyecto que cubre en profundidad los autómatas que el lexer de Semtex solo toca superficialmente — NFA, DFA, y por qué los regex de Python son lentos y los de Go/Rust son rápidos. Equivalente industrial: PCRE2, RE2, regex crate.
- Lexer de un lenguaje de marcado simple (Semtex, Fase 1)
- `expr-parser`: parser de expresiones aritméticas con precedencia correcta (Pratt parsing)

**Proyectos integradores que empiezan aquí**: `Semtex` (parser semántico); `Lógico` (intérprete Lisp — empieza el lexer/reader aquí).

**Equivalentes industriales**: flex, re2c, logos (Rust), nom, pest, tree-sitter, ANTLR.

**Referencia clave**: artículos de Russ Cox sobre implementación de NFA/DFA (swtch.com/~rsc/regexp) — la referencia canónica para entender la diferencia entre regex lentos (backtracking) y rápidos (DFA).

---

### L13 — Intérpretes y evaluadores

**Foco**: Darle vida a un AST. Evaluación de expresiones, entornos léxicos, closures, recursión. Este nivel transforma el parser de L12 en un lenguaje que puede ejecutar código.

**Unidades teóricas**: el ciclo read-eval-print (REPL) como estructura de un intérprete; evaluación por recursión sobre el AST — el modelo de árbol sintáctico como programa; entornos como estructuras de datos — tablas de símbolos encadenadas (frame → parent); scope léxico vs dinámico — por qué el scope léxico es más fácil de razonar; closures — capturar el entorno en tiempo de definición, no de ejecución; tail call optimization — por qué importa en lenguajes funcionales; semántica operacional — big-step vs small-step, reglas de evaluación en notación formal — el vocabulario que permite razonar sobre si una implementación es correcta; Continuation-Passing Style (CPS) — transformación a CPS, su relación con tail calls y con lazy evaluation, cómo los compiladores de lenguajes funcionales representan el control flow.

**Proyectos**: `Lógico v1` (intérprete Lisp completo con closures y recursión); `Semtex` Fase 2 (AST completo) y Fase 3 (validación semántica estructural — sin type checking).

**Nota**: el garbage collector mark-and-sweep de Lógico se implementa usando el allocator de L8 — primera conexión explícita entre proyectos de distintos dominios.

**Referencia clave**: Crafting Interpreters (Nystrom, gratis en craftinginterpreters.com) — construye dos intérpretes completos (tree-walking y bytecode VM) de un lenguaje real; es la referencia práctica directa para Lógico. SICP capítulo 4.

---

### L14 — Sistemas de tipos e inferencia

**Foco**: Cómo un compilador deduce tipos sin que el programador los anote. El algoritmo de Hindley-Milner y su implementación. Este nivel es teóricamente exigente pero el proyecto resultante — un type checker real — vale el esfuerzo.

**Unidades teóricas**: tipos simples — tau ::= Int | Bool | tau → tau; variables de tipo como incógnitas; constraints de tipo — ecuaciones entre tipos generadas durante el análisis; el algoritmo de unificación de Robinson — cómo se resuelven ecuaciones de tipos; union-find (Tarjan) como estructura eficiente para unificación; el algoritmo W de Damas-Milner para inferencia con polimorfismo; let-generalización y cuantificación universal; por qué Rust no tiene HM completo (las implicaciones de traits y coherencia); polimorfismo de subtipos vs polimorfismo paramétrico.

**Proyectos**: `Lógico v2` — agregar inferencia de tipos HM al intérprete; `Semtex` Fase 4 — inferencia de tipos y validación semántica completa con HM.

**Referencia clave**: Engineering a Compiler (Cooper & Torczon, 2ed) para el capítulo de inferencia de tipos; Types and Programming Languages (Pierce) como referencia formal.

---

### L15 — Persistencia y almacenamiento

**Foco**: Durabilidad de datos. Cómo se pasa de "archivos" a "bases de datos". B-Trees, LSM-Trees, WAL, crash recovery. El nivel que separa los sistemas que sobreviven un apagado de los que no.

**Unidades teóricas**: durabilidad como propiedad formal — qué garantiza fsync(); el Write-Ahead Log (WAL) como patrón — log primero, estructura después; B-Tree — estructura de nodo, inserción con split, búsqueda y delete con merge; por qué B-Tree es bueno para lecturas y mediocre para escrituras intensas; LSM-Tree — MemTable + SSTables + compactación; B-Tree vs LSM-Tree — el tradeoff fundamental de bases de datos; MVCC básico — snapshot isolation y versiones de filas; SQL como lenguaje — gramática, planner, joins, transacciones.

**Proyectos**:
- `KVolt v1`: hash map + append-only log + crash recovery
- `KVolt v2`: B-Tree o LSM-Tree + compactación + índices persistentes
- `MiniSQL`: motor SQL con parser (recursive descent), planner, joins y MVCC básico. Usa KVolt como storage engine.

**Equivalentes industriales**: Redis, LevelDB, RocksDB, SQLite, DuckDB, LMDB, sled (Rust).

**Referencia clave**: Designing Data-Intensive Applications (Kleppmann) — capítulos de storage engines, B-Trees, LSM-Trees y transacciones.

---

### L16 — Redes y protocolos

**Foco**: Sockets TCP, HTTP, protocolos modernos, observabilidad de red. La plomería que conecta procesos en máquinas distintas.

**Unidades teóricas**:
- El modelo de capas — por qué existe la separación entre transporte y aplicación; sockets como abstracciones — `socket/bind/listen/accept/connect`; TCP como protocolo orientado a conexión — handshake, flow control, congestion control; el ciclo de vida de una conexión TCP y sus estados.
- HTTP/1.1 como protocolo de texto — request line, headers case-insensitive, body con Content-Length; keep-alive y chunked encoding; el problema de servidores concurrentes — iterativo vs fork-per-client vs thread pool vs event loop; `epoll` y event-driven I/O — edge-triggered vs level-triggered.
- TLS como protocolo propio, separado de SSH: handshake TLS 1.3, certificate chain, ALPN, SNI, session resumption. TLS aparece en HTTPS, gRPC, bases de datos y prácticamente toda comunicación moderna — merece tratamiento independiente de SSH. Referencia interactiva: The Illustrated TLS 1.3 Connection (tls13.xargs.org, gratis).
- DNS wire format: tipos de registro (A, AAAA, CNAME, MX), queries recursivas vs iterativas, caching con TTL, framing sobre UDP.
- HTTP/2 y QUIC como motivación arquitectural: multiplexing de streams, HPACK, por qué HTTP/2 existe; QUIC (HTTP/3) sobre UDP con cifrado integrado — no se implementa desde cero pero se entiende el diseño y por qué existe.
- WebSockets: upgrade de HTTP para comunicación bidireccional, framing binario, handshake, masking.
- Zero-copy networking: `sendfile(2)`, `splice(2)` — cómo evitar copias innecesarias entre kernel y user space.

**Proyectos**:
- `HTTP server`: cuatro fases — secuencial → thread pool → epoll → HTTP/1.1 completo con keep-alive y chunked encoding. Revisitable en L19 con io_uring como fase adicional.
- `shell remoto TCP`: ejecutar comandos sobre una conexión TCP (base del SSH)
- `minisync`: sincronización de directorios tipo rsync con rolling checksum (Adler-32) y deltas a nivel bloque
- `mini-dns-resolver` (focalizado): cliente DNS sobre UDP — parsear wire format, tipos A/AAAA/CNAME/MX, timeout/retry, cache básico con TTL. Equivalente industrial: dnsmasq, Unbound, trust-dns (Rust).
- `mini-tcpdump` (focalizado): captura paquetes con AF_PACKET, parsea headers Ethernet + IP + TCP/UDP, filtra por protocolo/puerto. Equivalente industrial: tcpdump, Wireshark, libpcap.
- `http2-server` (focalizado, extensión): HTTP/2 sobre TLS usando el crate `h2` en Rust. Demuestra multiplexing de streams y HPACK. Contrasta con el HTTP/1.1 implementado desde cero.
- `websocket-server` (focalizado): WebSocket desde HTTP/1.1 — framing binario, handshake de upgrade, masking. Alta densidad de aprendizaje sobre protocolos con extensión de framing.
- `TCP/IP stack` (integrador, L16+L21): pila TCP/IP en user space sobre interfaz TUN/TAP — decodificación Ethernet + ARP → IPv4 con checksums → máquina de estados TCP completa. La parte L21 integra la pila con el orquestador. Equivalente industrial: smoltcp, lwIP.

**Equivalentes industriales**: nginx, Apache, hyper (Rust), axum, actix-web, rsync, rclone, syncthing, dnsmasq, Wireshark.

**Referencias clave**: UNIX Network Programming (Stevens, Vol. 1 y 2); Beej's Guide to Network Programming (gratis); High Performance Browser Networking (Grigorik, gratis en hpbn.co).

---

### L17 — Performance Engineering

**Foco**: La disciplina de medir, entender y mejorar el rendimiento de sistemas. No es perf como herramienta de setup (eso es L0) — es performance engineering como metodología aplicada. Este nivel existe porque los proyectos de L1–L16 generan sistemas medibles, y medir correctamente es una habilidad distinta de construir el sistema.

**Unidades teóricas**:
- Benchmarking correcto: qué es el "ruido" de una medición, cómo minimizarlo; el crate `criterion` en Rust y `hyperfine` como herramientas estadísticamente correctas (vs medir con `time`); calentamiento de cache, varianza entre corridas, significancia estadística.
- Flamegraphs: cómo leer un flamegraph, qué representa el ancho de cada barra (tiempo en CPU), cómo generarlos con `perf record` + `flamegraph.pl` y con `cargo flamegraph`.
- CPU caches: la jerarquía L1/L2/L3, cache misses y cómo detectarlos con `perf stat -e cache-misses,cache-references`; locality de datos — Array of Structs (AoS) vs Struct of Arrays (SoA) como ejemplo concreto de impacto en rendimiento; falsa compartición (false sharing) en estructuras concurrentes.
- Branch prediction: cómo funciona el predictor de ramas, cuándo falla predeciblemente, cómo el compilador puede usar `cmov` para evitar branches; `perf stat -e branch-misses`.
- Profiling de heap: heaptrack, massif (Valgrind) — cómo detectar allocations excesivas y reducir allocation pressure.
- La metodología: hipótesis → medición → análisis → cambio → re-medición. No optimizar sin medir. No medir sin hipótesis.

**Proyectos**:
- `perf-benchmarks`: benchmarks comparativos de los allocators de L8 (custom-malloc vs glibc vs jemalloc vs mimalloc) usando mimalloc-bench como harness
- `flamegraph-lab`: perfilado del HTTP server de L16 — identificar el bottleneck real con flamegraph, medir el impacto de un fix específico
- `cache-locality-exp`: experimento de cache locality — comparar AoS vs SoA en un loop de procesamiento intensivo, medir con `perf stat`
- `false-sharing-exp`: experimento de contención en estructuras concurrentes — medir false sharing con `perf c2c`

**Equivalentes industriales**: Linux perf, Brendan Gregg's bpftrace scripts, Instruments (macOS), Intel VTune, Cachegrind/Callgrind (Valgrind).

**Referencias clave**: Systems Performance (Brendan Gregg, 2da ed. 2020); BPF Performance Tools (Brendan Gregg, 2019); The Art of Writing Efficient Programs (Pikus, 2021).

---

### L18 — Seguridad y criptografía

**Foco**: Criptografía aplicada, no teoría de números. Qué primitivas existen, cuándo usar cada una, y cómo construir un protocolo seguro encima.

**Unidades teóricas**: criptografía simétrica vs asimétrica — cuándo usar cada una; AEAD (Authenticated Encryption with Associated Data) — qué garantiza y qué no garantiza; ChaCha20-Poly1305 vs AES-256-GCM — tradeoffs de rendimiento con y sin hardware AES-NI; ECDH con Curve25519 — intercambio de clave sin transmitir la clave; Ed25519 para firmas digitales — generación, firma, verificación; el protocolo SSH-2 — formato de paquete, negociación de algoritmos, multiplexación de canales; TLS 1.3 en mayor profundidad (complementa lo visto en L16): record protocol, session tickets, 0-RTT; por qué no inventar primitivas criptográficas propias; el modelo de amenaza — qué protege SSH/TLS y qué no protege.

**Proyectos**:
- `tinyssh v1`: TCP + ECDH Curve25519 + framing SSH-2
- `tinyssh v2`: AEAD (ChaCha20-Poly1305 o AES-GCM) + Ed25519 + autenticación por clave pública
- `impl_script`: pseudoterminales para grabar sesiones de terminal — conecta con tinyssh para sesiones remotas

**Nota sobre librerías**: tinyssh usa `ring` (Rust) o libsodium (C) para las primitivas criptográficas — el objetivo pedagógico es entender SSH, no re-implementar AES-GCM.

**Equivalentes industriales**: OpenSSH, rustls, ring (Rust crypto, inspirado en BoringSSL), openssl.

---

### L19 — I/O asíncrono y runtimes

**Foco**: El modelo de I/O asíncrono moderno. `io_uring` como paradigma de completion, en contraste con `epoll` como paradigma de readiness. La construcción de un async runtime mínimo en Rust. Este nivel conecta el modelo de polling de L16 con la concurrencia asíncrona idiomática de Rust.

**Unidades teóricas**:
- `io_uring`: submission queue + completion queue, submission queue entries (sqe) y completion queue entries (cqe), operaciones registradas, modos de polling y de interrupciones; la diferencia fundamental con epoll — epoll notifica cuándo un fd está *listo*, io_uring *completa la operación*; por qué io_uring puede tener hasta 60% menos CPU overhead que epoll en servidores de alta carga; zero-copy con io_uring — buffer registration, fixed files.
- El modelo de Futures en Rust: `Future` como máquina de estado generada por `async/await`; el trait `Poll` y sus variantes (Ready/Pending); el contrato de `Waker`/`RawWaker` — cómo una tarea le dice al executor "despiértame cuando haya trabajo".
- Executor y reactor: el executor mantiene la queue de tareas listas para avanzar; el reactor monitorea eventos de I/O (sobre epoll o io_uring) y notifica al executor vía Waker cuando un evento ocurre; la relación entre ambos y cómo tokio los implementa internamente.
- Single-threaded vs multi-threaded executors: work-stealing, thread-per-core (glommio model).
- El equivalente en C: `libuv` — la biblioteca de I/O asíncrono que alimenta Node.js. Loop de eventos, handles, requests, y backends intercambiables (epoll, kqueue, io_uring según plataforma). Para un usuario del track C, libuv es el punto de llegada natural de L19; leer su código fuente después de implementar el propio async-runtime en Rust es una de las comparaciones más reveladoras del plan.
- Async Rust idiomático con tokio: `tokio::spawn` para lanzar tareas concurrentes; `tokio::select!` para esperar simultáneamente sobre múltiples futures (cancelación implícita de la rama no ganadora); `tokio::join!` y `tokio::try_join!` para esperar varias tareas en paralelo; `tokio::sync::Mutex` vs `std::sync::Mutex` — por qué el Mutex de std no puede cruzar un `.await` y qué hacer al respecto; `tokio::sync::mpsc`, `broadcast`, y `watch` channels — los canales idiomáticos del async world; `Pin<T>` y el trait `Unpin` — por qué los futures no se pueden mover mientras son polled, qué significa `Unpin`, cómo `Box::pin` resuelve el problema en la práctica; el trait `Stream` de `futures` como iterador asíncrono — `StreamExt`, `next()`, `map()`, `filter()`; `async` en traits — las limitaciones actuales del compilador (los async fns en traits eran unstable hasta Rust 1.75), la solución con `async-trait` proc macro, el estado actual del lenguaje; `#[tokio::test]` para escribir tests de código asíncrono — cómo el macro crea un runtime de un solo hilo para el test.

**Proyectos**:
- `async-runtime` (integrador): Future trait manual, Waker/RawWaker, executor de single-thread con queue de tareas, reactor sobre epoll, soporte para timers. Es el proyecto que hace comprensible tokio y async-std desde adentro. Equivalente industrial: tokio, async-std, smol, glommio.
- `io_uring-echo` (focalizado): servidor TCP de echo usando io_uring directamente (C con liburing, Rust con tokio-uring). Comparación de throughput y latencia contra la versión epoll del HTTP server de L16.

**Relación con L16**: el HTTP server de L16 puede revisarse en este nivel para agregar una fase io_uring como comparación directa de los dos paradigmas (readiness vs completion).

---

### L20 — Aislamiento y contenedores

**Foco**: Cómo Linux implementa el aislamiento de procesos. Namespaces, cgroups, OverlayFS. Construir un runtime de contenedores desde cero usando las primitivas del kernel.

**Unidades teóricas**: namespaces de Linux — los siete tipos (PID, NET, MNT, UTS, IPC, USER, TIME) y qué aisla cada uno; cgroups v2 — jerarquía unificada, controllers (memory, cpu, pids), cómo escribir en `/sys/fs/cgroup/`; `pivot_root(2)` vs `chroot(2)` — por qué pivot_root es más seguro; OverlayFS — lowerdir (imagen de lectura), upperdir (capa de escritura), merged; el OCI Image Spec y el OCI Runtime Spec — los estándares que definen qué es un contenedor; seccomp — filtrar syscalls permitidas; capabilities — por qué los contenedores no deben correr como root real.

**Proyectos**: `minidocker` — runtime de contenedores con namespaces + cgroups v2 + pivot_root + OverlayFS + seccomp. Implementa un subconjunto del OCI Runtime Spec.

**Nota**: minidocker usa libseccomp para seccomp y el crate nix en Rust para las syscalls POSIX. El objetivo pedagógico son los namespaces y cgroups, no re-implementar libseccomp.

**Equivalentes industriales**: Docker Engine, podman, containerd, runc, youki, crun.

---

### L21 — Orquestación y sistemas distribuidos

**Foco**: Coordinar múltiples contenedores como unidad. Scheduling, networking entre contenedores, reconciliation loop, API. El nivel más complejo del plan en términos de arquitectura de sistema.

**Unidades teóricas**: el modelo de computación distribuida — qué es diferente cuando los procesos no comparten memoria; el problema de la consistencia — CAP theorem como marco conceptual; el reconciliation loop como patrón de control — estado deseado vs estado actual, apply del diff; scheduling de tareas — bin-packing, round-robin, constraints de recursos; networking entre contenedores — veth pairs, Linux bridge, iptables para NAT y routing; service discovery — cómo un contenedor encuentra a otro; healthchecks — diferencia entre liveness y readiness; gRPC y Protocol Buffers como protocolo de comunicación entre servicios — encoding binario eficiente frente a JSON sobre HTTP; comparación de formatos de wire encoding: protobuf, capnproto, flatbuffers.

**Proyectos**:
- `orquestador` — scheduler + red via veth pairs + API HTTP REST + reconciliation loop + healthchecks + service discovery.
- `TCP/IP stack` (Fase L21): integración de la pila TCP/IP implementada en L16 con la red del orquestador — los contenedores se comunican a través de la pila propia en lugar del stack del kernel.

**Nota**: el orquestador usa minidocker (o cualquier runtime compatible OCI) como dependencia. Comunicación interna recomendada: gRPC sobre HTTP/2.

**Equivalentes industriales**: Kubernetes, Nomad, Docker Swarm, Fly.io, Mesos.

---

### L22 — Generación de código y JIT

**Foco**: El último arco de compiladores. Emitir código máquina en tiempo de ejecución. IR, análisis de flujo de datos, asignación de registros, páginas ejecutables. JIT-Brain cierra el ciclo que empezó en L12.

**Unidades teóricas**: representación intermedia (IR) — qué es SSA (Static Single Assignment) y por qué facilita optimizaciones; análisis de flujo de datos — liveness analysis, reaching definitions — los fundamentos formales de toda optimización real; asignación de registros — linear scan como algoritmo práctico; graph coloring (Chaitin-Briggs) como el algoritmo que usa LLVM — por qué es óptimo pero costoso; selección de instrucciones x86_64 — encodings de opcode, ModRM byte, prefijos REX; mmap con `PROT_READ|PROT_WRITE|PROT_EXEC` para páginas ejecutables — y por qué W^X existe como protección de seguridad; calling convention x86_64 System V ABI; JIT vs AOT — cuándo conviene compilar en tiempo de ejecución; LLVM IR como camino alternativo al JIT hand-rolled — escribir un compilador que emite LLVM IR en lugar de x86_64 directamente es más práctico para proyectos reales (tutorial Kaleidoscope de llvm.org como referencia); WebAssembly (WASM) como target de compilación — portable, con sandbox de seguridad, ejecución en browsers y servidores via WASI — una fase del compilador Lógico que emita WASM en lugar de x86_64 lo hace más moderno y abre conversaciones sobre wasmtime y Cranelift.

**Proyectos**: `JIT-Brain` — IR simplificado + selección de instrucciones x86_64 + páginas PROT_EXEC + compilación de un subconjunto de Lógico a código nativo. Extensión: fase de emisión WASM.

**Equivalentes industriales**: LLVM, Cranelift (Wasmtime), libgccjit, QBE, MIR (GCC).

**Referencias clave**: Engineering a Compiler (Cooper & Torczon, 2ed) — el mejor libro moderno de compiladores, más accesible que el Dragon Book, cubre SSA y register allocation; CS 6120 Advanced Compilers — Cornell, Adrian Sampson (gratis online); LLVM Kaleidoscope Tutorial (llvm.org, gratis); Modern Compiler Implementation in C (Appel) — el proyecto Tiger como referente pedagógico.

---

### L23 — Kernel space

**Foco**: El límite del user space. Módulos de kernel Linux, un filesystem propio en VFS, virtualización con KVM, y eBPF como la alternativa moderna a los módulos para observabilidad y networking.

**Unidades teóricas**:
- La frontera kernel/user — por qué los errores en kernel space son fatales; Linux Kernel Module — estructura básica, `module_init`/`module_exit`, `MODULE_LICENSE`, sistema de parámetros; `file_operations` como tabla de callbacks — qué implementa un driver de carácter; `copy_to_user`/`copy_from_user` — la frontera de seguridad entre espacios.
- Sincronización en kernel: spinlocks vs mutex de kernel — contexto de interrupción vs contexto de proceso; top half vs bottom half — por qué el handler de interrupción no puede hacer trabajo pesado; hardirq, softirq, tasklet y workqueue — cuándo usar cada mecanismo y qué primitivas de sincronización puede usar cada uno.
- La capa VFS — las cuatro estructuras centrales (`super_block`, `inode`, `dentry`, `file`) y cómo registrar un filesystem propio.
- La API KVM — `/dev/kvm`, `ioctl KVM_CREATE_VM`, `KVM_CREATE_VCPU`, la struct `kvm_run` y los tipos de VM exit.
- El memory allocator del kernel: buddy system (asignación de páginas físicas por potencias de 2) y slab allocator (asignación eficiente de objetos de tamaño fijo) — por qué el kernel tiene dos allocators distintos y cómo se relacionan con el allocator de user space de L8.
- El CFS (Completely Fair Scheduler) de Linux: árbol rojo-negro con virtual runtime, fairness, control groups y CPU quotas — conexión directa con minidocker (cgroups) de L20 y con el scheduler-sim de L6.
- eBPF como alternativa moderna a los módulos de kernel: eBPF ejecuta código verificado en el kernel sin escribir módulos. Desde 2016 es la tecnología que define observabilidad, networking y seguridad en Linux moderno. Un programa eBPF de kprobe + mapa BPF + lector en user space es más accesible que un módulo de kernel y tiene aplicaciones inmediatas en producción. Referencia: libbpf (C) y aya (Rust). XDP (eXpress Data Path) para procesamiento de paquetes en el driver de red antes del stack de red del kernel.
- Rust en el kernel Linux: desde Linux 6.1 (2022), Rust es un lenguaje oficial del kernel. Hay drivers escritos en Rust en producción. Los proyectos de este nivel siguen siendo mayoritariamente C, pero el estado del campo ya no es "los módulos de kernel son C por definición".
- Secure Boot y UEFI: los módulos de kernel y el mini-hypervisor se desarrollan y prueban dentro de una VM QEMU donde Secure Boot puede deshabilitarse para el laboratorio. En hardware real en 2025, Secure Boot y UEFI reemplazan a BIOS — un módulo sin firma o un binario bare-metal no arrancaría en una laptop real sin modificaciones UEFI.

**Proyectos**:
- `char-driver`: módulo de kernel Linux con lectura/escritura/ioctl en `/dev/` — en C
- `RAM-FileSystem`: filesystem montable registrado en VFS — en C
- `KVM mini-hypervisor`: VCPU + carga de código en modo real + manejo de VM exits — en C
- `ebpf-tracer` (focalizado): un programa kprobe que traza syscalls de un proceso por PID + un programa XDP que filtra paquetes por protocolo. En C con libbpf, en Rust con aya. Implementación dual. Equivalente industrial: BPFTrace, bcc tools, Cilium, Falco.

**Nota**: char-driver, RAM-FS y KVM son C exclusivamente dado el estado actual de los Rust kernel bindings. ebpf-tracer tiene implementación dual C/Rust — aya en Rust es production-ready.

**Equivalentes industriales**: Linux kernel, FUSE (user-space filesystem alternativo), QEMU/KVM, Firecracker, Cloud Hypervisor, seL4, Cilium.

**Referencias clave**: Linux Kernel Development (Love, 3ra ed.) — el más accesible de internals del kernel; Linux Device Drivers (Corbet, Rubini, Kroah-Hartman, gratis en lwn.net) — referencia canónica de drivers; Writing an OS in Rust (Oppermann, gratis en os.phil-opp.com) — construye un OS bare-metal en Rust; BPF Performance Tools (Gregg, 2019) — el libro de eBPF como tecnología de kernel; Understanding the Linux Kernel (Bovet & Cesati) — para internals profundos de memoria, scheduling y VFS.

---

## 5. La guía de estudio del código

Cada fase de cada proyecto viene con dos artefactos separados:

**El código**: bien estructurado, documentado con comentarios que explican decisiones no obvias. Generado por IA como punto de partida, revisado para ser correcto y pedagógico.

**La guía de estudio**: un documento separado del código que acompaña la lectura. No es documentación del código (eso ya lo tienen los comentarios). Es una guía de lectura que:

- Propone un orden de lectura de los archivos — no siempre el orden alfabético es el más pedagógico
- Explica las decisiones de diseño y por qué se tomaron
- Señala los puntos del código donde conviene pausar y pensar antes de seguir
- Propone experimentos: qué pasa si cambio este parámetro, si cometo este error, si uso esta otra estructura
- Conecta lo que se ve en el código con la teoría del nivel correspondiente
- Señala explícitamente dónde C y Rust divergen en la implementación del mismo concepto, y por qué
- Anticipa preguntas frecuentes

La guía de estudio no reemplaza leer el código. Es un acompañante para esa lectura.

---

## 6. Taxonomía de proyectos

Los proyectos se clasifican en dos categorías:

### Proyectos focalizados

Pequeños, autocontenidos, apuntan a demostrar un concepto o syscall específico. Se pueden completar en pocas horas. Buenos para confirmar que se entendió algo antes de seguir.

### Proyectos integradores

Multi-fase, combinan conceptos de varios niveles, construyen un sistema completo. Se completan en días o semanas. Sus fases son incrementales — cada fase es un sistema funcionando, no trabajo de plomería sin resultado visible.

### Sobre los equivalentes industriales

Cada proyecto menciona su equivalente industrial por una razón específica: mostrar que lo que se está construyendo no es un ejercicio artificial sino una versión simplificada de sistemas que existen y se usan. Esto da contexto y motivación, e invita a comparar: después de implementar el allocator propio, leer el código fuente de jemalloc o mimalloc tiene un sentido completamente diferente. La pregunta "¿por qué el industrial es tan más complejo?" tiene respuestas que enseñan mucho sobre las limitaciones del propio diseño.

### Tabla completa de proyectos

| Proyecto | Tipo | Nivel(es) | Dominio |
|---|---|---|---|
| `devcontainer-setup` | Focalizado | L0 | Entorno |
| `hello-c` | Focalizado | L1a | C Lenguaje |
| `caesar-cipher` | Focalizado | L1a | C Lenguaje |
| `word-count` | Focalizado | L1a | C Lenguaje |
| `stringlib` | Focalizado | L1b | C Lenguaje |
| `elf-explorer` | Focalizado | L1b | C + Arquitectura |
| `getopt-impl` | Focalizado | L2 | C Lenguaje |
| `dynamic-array` | Focalizado | L2 | C Lenguaje |
| `hello-rust` | Focalizado | L3a | Rust Lenguaje |
| `fizzbuzz-rust` | Focalizado | L3a | Rust Lenguaje |
| `mini-calculator` | Focalizado | L3a | Rust Lenguaje |
| `data-structures-rust` | Focalizado | L3b | Rust Lenguaje |
| `custom-iterator` | Focalizado | L4 | Rust Lenguaje |
| `parser-combinators` | Focalizado | L4 | Rust Lenguaje |
| `ffi-demo` | Focalizado | L4 | FFI C↔Rust |
| `spl_stat` | Focalizado | L5 | POSIX Archivos |
| `spl_ls` | Focalizado | L5 | POSIX Archivos |
| `spl_du` | Focalizado | L5 | POSIX Archivos |
| `file-monitor` | Focalizado | L5 | POSIX Archivos |
| `spl_pstree` | Focalizado | L6 | Procesos |
| `impl_abort` | Focalizado | L6 | Procesos |
| `impl_alarm` | Focalizado | L6 | Procesos |
| `scheduler-sim` | Focalizado | L6 | Procesos |
| `mini-debugger` | Integrador | L6, L7 | Procesos + Kernel |
| `mish` | Integrador | L6, L11 | Shell |
| `vma-explorer` | Focalizado | L7 | Memoria Virtual |
| `cow-demo` | Focalizado | L7 | Memoria Virtual |
| `spl_cp` | Focalizado | L7 | Memoria Virtual |
| `mini-linker` | Focalizado | L7 | ELF + Linking |
| `custom-malloc` | Integrador | L8 | Allocators |
| `thread-pool` | Focalizado | L9 | Concurrencia |
| `prod-cons` | Focalizado | L9 | Concurrencia |
| `rwlock-impl` | Focalizado | L9 | Concurrencia |
| `impl_arc` | Focalizado | L10 | Concurrencia Avanzada |
| `lock-free-queue` | Focalizado | L10 | Concurrencia Avanzada |
| `rcu-demo` | Focalizado | L10 | Concurrencia Avanzada |
| `named-pipe-sem` | Focalizado | L11 | IPC |
| `ipc-explorer` | Focalizado | L11 | IPC |
| `miniqueue` | Integrador | L11 | IPC |
| `regex-engine` | Focalizado | L12 | Compiladores I |
| `expr-parser` | Focalizado | L12 | Compiladores I |
| `Semtex` | Integrador | L12, L13, L14 | Compiladores |
| `Lógico` | Integrador | L12, L13, L14, L8, L22 | Compiladores |
| `KVolt` | Integrador | L15 | Persistencia |
| `MiniSQL` | Integrador | L15 | Persistencia |
| `HTTP server` | Integrador | L16 | Redes |
| `shell remoto TCP` | Focalizado | L16 | Redes |
| `minisync` | Integrador | L16 | Redes |
| `mini-dns-resolver` | Focalizado | L16 | Redes |
| `mini-tcpdump` | Focalizado | L16 | Redes |
| `http2-server` | Focalizado | L16 | Redes |
| `websocket-server` | Focalizado | L16 | Redes |
| `TCP/IP stack` | Integrador | L16, L21 | Redes |
| `perf-benchmarks` | Focalizado | L17 | Performance |
| `flamegraph-lab` | Focalizado | L17 | Performance |
| `cache-locality-exp` | Focalizado | L17 | Performance |
| `false-sharing-exp` | Focalizado | L17 | Performance |
| `tinyssh` | Integrador | L18 | Seguridad |
| `impl_script` | Focalizado | L18 | Seguridad |
| `async-runtime` | Integrador | L19 | I/O Asíncrono |
| `io_uring-echo` | Focalizado | L19 | I/O Asíncrono |
| `minidocker` | Integrador | L20 | Contenedores |
| `orquestador` | Integrador | L21 | Distribuido |
| `JIT-Brain` | Integrador | L22 | Compiladores JIT |
| `char-driver` | Focalizado | L23 | Kernel |
| `RAM-FileSystem` | Focalizado | L23 | Kernel |
| `KVM mini-hypervisor` | Integrador | L23 | Kernel |
| `ebpf-tracer` | Focalizado | L23 | Kernel + eBPF |

---

## 7. Los proyectos integradores — descripción de alto nivel

### `mish` — Mini Shell
Niveles: L6, L11. Equivalente: bash, zsh, dash.
Cuatro fases: REPL + comandos internos → fork+exec + comandos externos → pipes y redirecciones → job control y señales. En Rust se usa el crate `nix` para las syscalls no cubiertas por `std`.

### `mini-debugger` — Debugger con ptrace
Niveles: L6, L7. Equivalente: gdb, lldb, rr.
`ptrace(2)` para poner breakpoints (escribir `INT3` en memoria del objetivo), single-step, leer y escribir registros y memoria. Implementa `break`, `continue`, `next`, `print` de forma básica. Cruza procesos (L6), señales (L6), memoria virtual (L7) y parsing de ELF (L1b/L7). Es uno de los proyectos más densos en conceptos por tamaño que existe.

### `miniqueue` — Message Queue
Niveles: L11. Equivalente: RabbitMQ, NATS, ZeroMQ.
Wire format + shared memory producer-consumer → routing por topic → persistencia en disco → ACK y redelivery para garantía at-least-once. En Rust: channels de tokio como contraste con la implementación manual sobre IPC POSIX.

### `custom-malloc` — Allocator
Niveles: L8. Equivalente: jemalloc, mimalloc.
sbrk + free list + first-fit + coalescencia → segregated bins + thread-safety. Fase final: benchmarks comparativos con mimalloc-bench. Comparte allocator con el GC de Lógico.

### `KVolt` — Base de Datos Key-Value
Niveles: L15. Equivalente: RocksDB, LevelDB, Redis.
Fase 1: hash map + append-only log. Fase 2: WAL + crash recovery. Fase 3: B-Tree o LSM-Tree + compactación. Fase 4: índices persistentes con mmap + concurrencia.

### `MiniSQL` — Motor SQL
Niveles: L15. Equivalente: SQLite, DuckDB.
Parser SQL (recursive descent) → planner con estimación de costo → joins (nested-loop y hash join) → transacciones con MVCC básico. Usa KVolt como storage engine.

### `Semtex` — Parser de Marcado
Niveles: L12, L13, L14. Equivalente: pandoc, pulldown-cmark, tree-sitter.
Fase 1 (L12): Lexer. Fase 2 (L13): AST completo. Fase 3 (L13): validación semántica estructural. Fase 4 (L14): inferencia de tipos con HM + emitter HTML/MathML. Enseña el pipeline completo de compilación sin la complejidad de un lenguaje de propósito general.

### `Lógico` — Intérprete Lisp
Niveles: L12, L13, L14, L8, L22. Equivalente: Guile, Chicken Scheme, Janet.
Reader de S-expressions → evaluador con entornos y closures → GC mark-and-sweep (usa custom-malloc de L8) → inferencia de tipos HM (L14) → compilación JIT (usa JIT-Brain de L22). El proyecto que atraviesa más niveles del plan.

### `HTTP Server` — Servidor HTTP
Niveles: L16. Equivalente: nginx, hyper.
Secuencial → thread pool → epoll → HTTP/1.1 completo con keep-alive y chunked encoding. Revisitable en L19 para agregar una fase io_uring.

### `minisync` — Motor de Sincronización
Niveles: L16. Equivalente: rsync, rclone.
Rolling checksum (Adler-32) → deltas a nivel bloque → protocolo TCP para transferencia → HMAC para verificar integridad.

### `tinyssh` — Implementación SSH
Niveles: L18. Equivalente: OpenSSH, libssh.
TCP + framing SSH-2 → ECDH Curve25519 → ChaCha20-Poly1305 / AES-GCM → Ed25519 + autenticación por clave pública. Usa el shell remoto TCP de L16 como base.

### `async-runtime` — Runtime Asíncrono
Niveles: L19. Equivalente: tokio, async-std, smol, glommio.
Future trait manual + Waker/RawWaker + executor de single-thread con queue de tareas + reactor sobre epoll + soporte para timers. El proyecto que hace comprensible tokio desde adentro.

### `minidocker` — Runtime de Contenedores
Niveles: L20. Equivalente: runc, youki.
pivot_root + namespaces → cgroups v2 → OverlayFS → seccomp + capabilities. Implementa un subconjunto del OCI Runtime Spec.

### `orquestador` — Orquestador de Contenedores
Niveles: L21. Equivalente: Kubernetes, Nomad.
Modelo de datos (Pod/Container/Node) → scheduler → red via veth pairs → reconciliation loop + API HTTP/gRPC → healthchecks + service discovery.

### `JIT-Brain` — Compilador JIT
Niveles: L22. Equivalente: Cranelift, libgccjit.
IR simplificado → selección de instrucciones x86_64 → páginas PROT_EXEC → compilación de un subconjunto de Lógico a código nativo. Extensión: emisión WASM.

### `TCP/IP Stack` — Pila TCP/IP en User Space
Niveles: L16, L21. Equivalente: smoltcp, lwIP.
Interfaz TUN/TAP → decodificación Ethernet + ARP → IPv4 con checksums → máquina de estados TCP completa.

### `char-driver` + `RAM-FileSystem` + `KVM mini-hypervisor`
Nivel: L23. Los tres proyectos de kernel space. En C exclusivamente.

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

Para los proyectos simples y focalizados, la política es construir todo desde cero — ese es el punto. Para los proyectos integradores avanzados, se usan librerías industriales donde corresponda.

**La regla práctica**: si un componente es infraestructura de plomería bien conocida con librerías auditadas y estables, se usa la librería. Si el componente es el foco pedagógico del nivel, se implementa desde cero.

Ejemplos concretos: minidocker usa `libseccomp` (el objetivo es entender namespaces y cgroups, no re-implementar filtros de syscalls); tinyssh usa `ring` (el objetivo es entender SSH, no AES-GCM); mini-debugger usaría `libunwind` para frame unwinding (el objetivo es entender ptrace, no el unwinding de stacks).

Esto tiene un beneficio adicional: los proyectos avanzados quedan más robustos y potencialmente útiles más allá del aprendizaje. Un minidocker que usa libseccomp correctamente es un runtime de contenedores real.

---

## 10. El modelo de aprendizaje con código dado

Una de las decisiones más importantes del diseño es que el código de cada fase se da como punto de partida, no se construye desde cero.

**Por qué**: construir todos los proyectos de cero requeriría años incluso para alguien dedicado. El objetivo no es sufrir el tiempo de construcción; es entender los sistemas. El código dado hace posible llegar a proyectos de la complejidad de tinyssh o minidocker sin pasar cinco años en fases previas.

**Cómo se aprende con código dado**:
1. La guía de estudio propone un recorrido de lectura
2. El usuario lee, pausa en los puntos indicados, experimenta modificaciones pequeñas
3. Corre los tests para verificar que el código funciona
4. Introduce errores deliberados para ver qué pasa (una de las formas más poderosas de aprender)
5. Debuggea con gdb o lldb, con strace, con valgrind
6. Una vez que comprende la fase completa, implementa las mejoras propuestas

**Las mejoras propuestas** son el momento de construcción real. Son extensiones no triviales que requieren aplicar lo aprendido. No son opcionales: son la forma de confirmar que el aprendizaje fue real y no superficial.

---

## 11. Caminos posibles de navegación

Forja tiene cuatro caminos explícitos. Todos parten de L0. Ninguno es el único correcto — dependen del objetivo del usuario. El grafo de dependencias permite variantes, pero los cuatro caminos a continuación son coherentes y han sido validados contra las dependencias del plan.

**Nota de entrada**: quien ya sabe C con solidez puede entrar directo en L1b (saltando L1a). Quien ya sabe Rust básico puede entrar directo en L3b (saltando L3a). No saltar niveles si hay dudas — L1a y L3a son deliberadamente rápidos.

**Por dónde empezar**: siempre L0. El `devcontainer-setup` no es opcional — todo lo que sigue asume el laboratorio Linux funcionando. Una vez que el devcontainer arranca y los tests de sanidad pasan (`gcc --version`, `cargo --version`, `valgrind --version`), elegir un camino de los cuatro a continuación y seguirlo. Si hay dudas sobre qué camino elegir, empezar con Camino 2 — es el más completo y puede acortarse en cualquier momento.

---

**Camino 1 — Solo C (Rust como opcional posterior)**

> Para quien quiere sistemas primero, sin la fricción del borrow checker. Rust se puede agregar después del arco de sistemas.

`L0 → L1a → L1b → L2 → L5 → L6 → L7 → L8 → L9 → L10 → L11 → L16 → L17 → L19 → L20 → L21 → L23`

Proyectos clave: mish, mini-debugger, HTTP server (C), custom-malloc, orquestador.
No incluye: Rust, compiladores, bases de datos, seguridad formal — estos se pueden agregar con L3-L4 y el arco de compiladores en cualquier punto. `tinyssh` (L18) no está en este camino — quien quiera seguridad puede agregar L18 después de L17.
**Nota sobre L19**: L19 es mayoritariamente Rust (async/await, tokio, Pin/Unpin). En el Camino 1, se recomienda limitar L19 a la teoría de io_uring y al proyecto `io_uring-echo` en C con liburing, omitiendo las unidades de async Rust idiomático y el proyecto `async-runtime`. El track C completo del nivel es el estudio de libuv como caso de referencia.

---

**Camino 2 — Dual C+Rust (recomendado para la mayoría)**

> El camino completo. Aprende C primero, luego Rust, luego los aplica en paralelo según el proyecto lo requiera.

`L0 → L1a → L1b → L2 → L3a → L3b → L4 → L5 → L6 → L7 → L8 → L9 → L10 → L11 → L12 → L13 → L14 → L15 → L16 → L17 → L18 → L19 → L20 → L21 → L22 → L23`

Proyectos clave: todos. Este es el camino del plan completo.
Duración estimada: el más largo — diseñado para 2-3 años de trabajo serio.

---

**Camino 3 — Compiladorista**

> Para quien tiene interés central en compiladores, lenguajes y teoría. Hace sistemas solo como base y se concentra en el arco de compiladores.

`L0 → L1a → L1b → L2 → L3a → L3b → L4 → L12 → L13 → L14 → L22 → (L5 → L6 → L7 como complemento opcional)`

Proyectos clave: Lógico (intérprete Lisp con GC), Semtex (parser semántico), JIT-Brain (compilador JIT), regex-engine.
**Nota sobre Lógico y el GC**: el garbage collector de Lógico usa el allocator de L8, que no está en este camino. En Camino 3, el GC de Lógico puede implementarse usando `malloc` estándar en primera instancia — quien quiera cerrar el círculo puede agregar L8 como nivel opcional después de L2.
Puede hacerse el arco de compiladores entero antes de tocar procesos, redes o contenedores.

---

**Camino 4 — Integrador**

> Mezcla sistemas y compiladores siguiendo las dependencias naturales entre proyectos. El más ambicioso en términos de integración horizontal.

`L0 → L1a → L1b → L2 → L3a → L3b → L4 → L5 → L6 → L12 → L7 → L8 → L9 → L10 → L11 → L13 → L14 → L15 → L16 → L17 → L18 → L19 → L20 → L22 → L23`

Proyectos clave: todos los integradores excepto `orquestador` (mish, mini-debugger, Lógico con GC, KVolt, tinyssh, JIT-Brain). L21 no está en este camino — `orquestador` requiere L21.
Nota: L12 se adelanta antes de L7 para que, al llegar a L8 (custom-malloc), ya exista contexto de para qué sirve ese allocator — el GC de Lógico en L13 lo usará.

---

## 12. Bibliografía

### Referencia principal

| Libro | Dominio | Acceso |
|---|---|---|
| **The C Programming Language** — Kernighan & Ritchie (2da ed.) | C lenguaje | Pago |
| **The Rust Programming Language** — Klabnik & Nichols | Rust lenguaje | Gratis (doc.rust-lang.org) |
| **Rust in Action** — Tim McNamara | Rust aplicado a sistemas | Pago |
| **OSTEP** — Arpaci-Dusseau | Sistemas operativos | Gratis (ostep.org) |
| **CS:APP** — Bryant & O'Hallaron | Sistemas + Arquitectura | Pago |
| **TLPI** — Kerrisk | Syscalls POSIX | Pago |
| **System Programming in Linux** — Stewart N. Weiss (SPL) | Proyectos guiados de sistemas | Pago |
| **Crafting Interpreters** — Nystrom | Compiladores prácticos | Gratis (craftinginterpreters.com) |
| **Engineering a Compiler** — Cooper & Torczon (2ed, 2011) | Compiladores | Pago |
| **Rust Atomics and Locks** — Mara Bos (O'Reilly, 2023) | Concurrencia Rust | Pago (preview gratis) |
| **Programming Rust** — Blandy, Orendorff, Tindall | Rust lenguaje | Pago |
| **UNIX Network Programming** — Stevens (Vol. 1 y 2) | Networking | Pago |

### Referencia secundaria por dominio

| Libro | Dominio | Acceso |
|---|---|---|
| **The Algorithm Design Manual** — Steven Skiena (3ra ed.) | Estructuras de datos y algoritmos | Pago |
| **Introduction to Algorithms** — Cormen, Leiserson, Rivest, Stein (CLRS) | Algoritmos | Pago |
| **Linux Kernel Development** — Robert Love (3ra ed., 2010) | Kernel Linux | Pago |
| **Linux Device Drivers** — Corbet, Rubini, Kroah-Hartman | Kernel drivers | Gratis (lwn.net) |
| **Understanding the Linux Kernel** — Bovet & Cesati (3ra ed.) | Kernel internals profundos | Pago |
| **BPF Performance Tools** — Brendan Gregg (2019) | Performance + eBPF | Pago |
| **Systems Performance** — Brendan Gregg (2da ed., 2020) | Performance engineering | Pago |
| **The Art of Writing Efficient Programs** — Fedor Pikus (2021) | Performance a nivel de código | Pago |
| **High Performance Browser Networking** — Ilya Grigorik | Networking moderno | Gratis (hpbn.co) |
| **Beej's Guide to Network Programming** — Brian Hall | Sockets + Networking | Gratis (beej.us) |
| **Designing Data-Intensive Applications** — Kleppmann | Storage + distribuido | Pago |
| **Modern Compiler Implementation in C** — Andrew Appel | Compiladores | Pago |
| **The Art of Multiprocessor Programming** — Herlihy & Shavit | Algoritmos concurrentes | Pago |
| **Writing an OS in Rust** — Philipp Oppermann | Kernel en Rust | Gratis (os.phil-opp.com) |
| **Linkers and Loaders** — John Levine (2000) | Linking + ELF | Pago |
| **Is Parallel Programming Hard?** — Paul McKenney | Concurrencia (RCU) | Gratis |
| **Types and Programming Languages** — Benjamin Pierce (TAPL) | Teoría de tipos | Pago |
| **Structure and Interpretation of Computer Programs** — Abelson & Sussman (SICP) | Lenguajes + Compiladores | Gratis (mitpress.mit.edu) |

### Recursos online gratuitos de alta calidad

| Recurso | Dominio |
|---|---|
| The Rust Programming Language (the book) — doc.rust-lang.org | Rust lenguaje |
| Teach Yourself CS — teachyourselfcs.com | Mapa curricular de CS |
| Regex Theory — Russ Cox (swtch.com/~rsc/regexp) | Compiladores: autómatas y regex |
| The Illustrated TLS 1.3 — tls13.xargs.org | Networking / Seguridad |
| CS 6120 Advanced Compilers — Cornell (Adrian Sampson) | Compiladores avanzados |
| LLVM Kaleidoscope Tutorial — llvm.org | Compiladores + JIT |
| Beej's Guide to Network Programming — Brian Hall | Networking con sockets en C |
| The Linux Kernel Module Programming Guide — Salzman | Kernel modules |
| Nand2Tetris — nand2tetris.org | Arquitectura + Compiladores (integración vertical) |
| Little Book of OS Development — Helin & Renberg | OS development básico |
| RFC 1035 (DNS) — IETF | Protocolo DNS |
| RFC 9000 (QUIC) — IETF | Protocolo QUIC / HTTP/3 |
