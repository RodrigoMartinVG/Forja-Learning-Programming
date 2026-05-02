# Introducción

Antes de escribir una sola línea de código conviene entender a dónde lleva el camino. Este capítulo existe para eso: establecer el contexto completo de L0, explicar qué vas a encontrar en cada parte y dejar claro qué queda afuera, por qué, y cuándo vuelve a aparecer.

## Qué es Forja

Forja es un laboratorio de programación de sistemas organizado en niveles. No es un curso de introducción a la programación: asume que podés leer código y entender estructuras básicas. Lo que construye es otra cosa: la capacidad de trabajar cerca del hardware, de entender lo que el sistema operativo hace en nombre de tu programa, de leer binarios, de gestionar memoria manualmente, de escribir código que no tiene red de seguridad.

Los lenguajes son C y Rust, los dos en serio. No "C primero para aprender memoria y luego Rust para olvidarlo": se usan juntos y en contraste. El mundo real usa los dos, y entender cuándo uno es mejor que el otro requiere haberlos trabajado ambos.

**El orden tiene una lógica.** Los niveles L1 y L2 son exclusivamente C: punteros, aritmética de memoria, el modelo de error de C, lectura de assembly. Ese dolor es intencional — Rust tiene las mismas restricciones pero te las explica el compilador; C te las muestra como crashes. Aprender primero el problema hace que la solución de Rust tenga sentido real. L3 y L4 arrancan Rust desde ese contexto: ownership, borrowing y el borrow checker no son reglas arbitrarias sino respuestas concretas a errores que ya cometiste en C. A partir de L5, los dos lenguajes coexisten nivel a nivel.

**Los proyectos siguen el mismo principio.** La mayoría implementa la misma cosa en C y en Rust — no para comparar líneas de código, sino para que el contraste sea concreto: qué garantiza el compilador, qué queda a cargo del programador, qué se pierde o se gana en cada uno. Algunos proyectos son C puro cuando el tema no tiene traducción directa a Rust seguro (módulos de kernel, exploración de ELF a nivel raw, drivers de caracteres). Otros son Rust puro cuando el objetivo es mostrar un feature del lenguaje sin contaminación de C (iteradores, Arc, el type system). Pero la mayoría son los dos.

Los niveles van desde L0 (donde estás ahora) hasta L23. El mapa no es completamente lineal: hay cuatro caminos con sus lógicas propias. Pero los primeros niveles tienen un orden natural y L0 es la puerta de entrada a todos.

## Por qué L0 es el primer nivel

En teoría podrías saltear L0 si ya tenés un ambiente Linux listo y sabés compilar. En la práctica, L0 establece tres cosas que ningún otro nivel repite:

**El piso común.** Desde L1 en adelante vas a recibir instrucciones como "compilá con `-g -O0`", "mirá el assembly con `-S`", "ejecutá bajo valgrind". Si eso no te dice nada o no tenés las herramientas instaladas, cada nivel tiene un paso previo no documentado que te traba. L0 elimina esa deuda.

**El vocabulario.** Registros, frames, syscalls, ELF, linking, ASLR: estas palabras van a aparecer en todos los niveles siguientes. No necesitás memorizarlas ahora, pero sí necesitás haberlas encontrado al menos una vez con contexto.

**La actitud experimental.** Forja no te da código para ejecutar y observar. Te da código para modificar, romper, reparar y entender. Esa actitud empieza en L0: el laboratorio es el lugar donde provocar errores es seguro y esperado.

## Qué cubre L0

Este nivel tiene cinco capítulos más un set de ejercicios:

| Capítulo | Qué establece |
|---|---|
| **01 — El laboratorio** | El devcontainer, cómo abrirlo, qué tiene instalado, cómo verificarlo |
| **02 — El pipeline** | Las cuatro fases de compilación, flags fundamentales, GCC vs Clang, Makefiles |
| **03 — Una intuición de máquina** | Von Neumann, ciclo fetch-decode-execute, complemento a dos, registros, stack, leer ensamblador, ASLR |
| **04 — Herramientas de observación** | strace, gdb, valgrind, sanitizers, perf |
| **05 — Primer recorrido completo** | Todo junto con un programa real, de fuente hasta syscall |

Los capítulos están pensados para leerse en orden la primera vez, aunque podés volver a cualquiera como referencia.

## Qué no cubre L0, y por qué

Esto es importante: hay cosas que L0 toca pero no explica a fondo, y hay cosas que L0 directamente no menciona. La diferencia es intencional.

**Lo que L0 toca superficialmente, porque lo usarás pronto:**

- **El formato ELF.** Los binarios que produce `gcc` son archivos ELF. L0 te muestra que existen y cómo compilarlos, pero la estructura interna (secciones, segmentos, tabla de símbolos) se cubre en L7. Ahí vas a diseccionar un ELF con `readelf` y `objdump` de forma sistemática. No vale la pena hacerlo ahora sin el contexto de memoria virtual que ese nivel también establece.

- **El proceso de linking en profundidad.** L0 explica que el linker une `.o` files y resuelve símbolos. El proyecto `mini-linker` (después de L7) implementa un linker real desde cero. Entender linking en profundidad requiere entender ELF primero.

- **El ensamblador.** L0 te muestra cómo leer assembly generado. Leer y escribir assembly con propósito es tema de L1b, que también cubre `objdump`, `gdb` en profundidad y la ABI de x86-64. En L0 solo necesitás saber que existe y poder encontrar un `call` o un `ret`.

- **`gdb` avanzado.** L0 cubre los cuatro comandos esenciales. El uso completo de `gdb` —watchpoints, condiciones, scripting, debugging de procesos multi-thread— se desarrolla progresivamente. En L1b y L6 vas a usarlo mucho más.

**Lo que L0 no menciona porque requiere base que aún no tenés:**

- **Gestión manual de memoria** (`malloc`, `free`, `realloc`). No se toca en L0 porque sin entender el heap no tiene sentido. L2 lo cubre desde cero, con errores comunes, herramientas y los patrones para evitarlos.

- **Procesos, `fork`, `exec`, señales.** `strace` muestra syscalls, pero lo que cada una significa en el contexto de procesos y su ciclo de vida es tema de L6. Ahí vas a escribir un shell básico y entender cómo el kernel gestiona los procesos.

- **Memoria virtual, páginas, `mmap`.** La dirección que imprime `printf("&x = %p", &x)` está en un espacio de direcciones virtual. Qué significa eso, cómo el kernel mapea páginas reales a esas direcciones, cómo funciona `mmap` y qué pasa cuando desbordás el stack: todo eso es L7.

- **Concurrencia.** Threads, mutexes, variables atómicas, race conditions. L9 y L10.

- **Rust.** L3 arranca Rust desde cero. En L0 solo verificás que `rustc` funciona en el laboratorio.

**Lo que L0 no menciona porque está fuera del alcance de los primeros niveles:**

- Redes (L16), containers (L20), kernel modules (L23), async I/O (L19). No son cosas que se "salteen": tienen su lugar natural en el mapa después de que los fundamentos estén sólidos.

## Cómo trabajar este nivel

Cada capítulo tiene contenido conceptual y código para ejecutar. No alcanza con leer: ejecutá cada comando, mirá el output, modificá el programa y observá qué cambia.

Los capítulos 01 a 05 son para leer y experimentar. Los ejercicios son para verificar que el aprendizaje fue real: todos son comandos concretos con resultados observables o preguntas de opción múltiple que podés comprobar con un comando.

El proyecto `devcontainer-setup` es la pieza de trabajo práctica de este nivel: documentar y verificar un ambiente reproducible es una habilidad de ingeniería en sí misma.

## El nivel siguiente

Después de L0, el mapa se bifurca. El camino natural es:

- **L1a** — C: primer contacto. Tipos, aritmética, punteros básicos, compilación manual.
- **L1b** — C: fundamentos profundos. Lectura de assembly, ABI, `gdb` en serio, `objdump`.

L1a y L1b son consecutivos y se trabajan juntos. Con L0 terminado tenés exactamente lo que necesitás para empezarlos.
