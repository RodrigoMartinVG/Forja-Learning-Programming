# ¿Qué es Forja?

Forja es un track largo y deliberado para aprender programación de sistemas con artefactos reales. La premisa es bastante simple, y bastante incómoda: la mayoría del software que la gente escribe se apoya sobre cosas (compiladores, allocators, kernels, schedulers, formatos en disco, protocolos de red) que se entienden poco. Forja existe para cerrar esa distancia, capa por capa, sin saltar pasos.

No es un curso, no es una serie de tutoriales y no es un bootcamp. Es un repositorio que combina **57 niveles teóricos** y **más de 70 proyectos**, conectados entre sí, pensados para recorrerse durante meses o años. Todo el material es navegable, está versionado y se construye en local con la misma toolchain que usa el contenido.

## El problema que intenta resolver

Hay tres maneras habituales de acercarse a programación de sistemas, y ninguna termina de funcionar.

- **Cursos cortos**: enseñan a usar herramientas, no a entenderlas. Salís sabiendo invocar `gcc` pero sin saber qué pasa entre el `.c` y el ejecutable.
- **Libros canónicos**: dan modelos profundos, pero te dejan solo frente al sistema. No hay continuidad entre lo que leés y lo que tu computadora hace cuando corrés un programa.
- **Aprender por proyecto suelto**: te deja un allocator que funciona y la sensación de que probablemente entendiste; pero la próxima pieza del stack vuelve a sentirse opaca.

Forja apuesta por una cuarta vía: un mapa explícito donde la teoría prepara proyectos concretos, los proyectos devuelven presión sobre la teoría, y la transición entre ambos se ve sin esfuerzo dentro del mismo repo.

## Qué hay efectivamente adentro

El track teórico arranca por una base dura y deliberadamente angosta:

- `L0`: laboratorio reproducible (devcontainer, toolchain, verificación).
- `L1`: modelo mental mínimo de una computadora.
- `L2`: representación material de la información (bits, endianness, alineación, punto flotante).
- `L3`: pipeline de compilación en C, paso a paso, viendo cada artefacto intermedio.
- `L4`: build system de Rust, con cargo y dependencias reales.

Después se abre a C avanzado, Rust, POSIX, procesos y señales, scheduling, memoria virtual, ELF y linking, allocators, concurrencia, IPC, parsers e intérpretes, sistemas de tipos, persistencia, redes, runtimes async, contenedores, virtualización y frontera con kernel.

El track práctico va en paralelo. Algunos ejemplos concretos del catálogo:

- **focalizados**: implementar `cp`, `ls`, `du`, `pstree`, `stat` desde syscalls; un `getopt` propio; un mini-linker; un thread pool; un parser combinator; un ELF explorer.
- **integradores**: `mish` (un shell completo), `custom-malloc`, `mini-debugger`, `minisql`, `mini-broker`, `tcp-ip-stack`, `minidocker`, `kvm-mini-hypervisor`, un runtime async, un JIT.

No es un catálogo aspiracional. Cada proyecto tiene su `project.yaml` con niveles requeridos, lenguajes y reaperturas declaradas; el repo es la fuente de verdad.

## A quién está dirigido

A alguien que ya programa, lee código con soltura y no necesita una introducción a funciones, bucles ni sintaxis. Lo que todavía no tiene es un modelo firme de **cómo se sostienen las cosas debajo**: por qué un programa segfaultea, qué hace un linker, cómo se diferencia un allocator de otro, qué pasa cuando un proceso bloquea, qué significa "async" cuando se mira de cerca.

No está pensado para quien busca productividad rápida ni atajos. El recorrido es largo a propósito, y cada nivel asume el anterior.

## En qué se diferencia

- **Es un repo, no una plataforma cerrada.** Todo el material está en archivos `.md`, los proyectos compilan localmente, la web es solo una vista del mismo contenido.
- **El mapa es explícito y honesto.** Hay 57 niveles definidos. Algunos están escritos a fondo (hoy `L0` a `L4`); el resto vive como placeholder declarado, con metadata real y cuerpo sintetizado. No hay simulación de progreso.
- **La teoría y la práctica se citan entre sí.** Cuando un nivel introduce una distinción, declara dónde reaparece como decisión de implementación. Cuando un proyecto pide un concepto, declara qué nivel lo cubre.
- **Nada queda colgado.** Los cabos sueltos se etiquetan: si un tema se introduce parcial, el texto dice dónde se cierra.
- **El estándar editorial está versionado.** Voz, prosa, anti-patrones y protocolo de revisión viven en [estandar_editorial_forja.md](../../../estandar_editorial_forja.md). Cada capítulo se escribe contra ese contrato.

## Qué no es

- No es una colección de snippets ni de ejercicios sueltos.
- No es un fast-track para "saber sistemas en X semanas".
- No es una IDE en el navegador que tape el sistema real.
- No es un compendio de teoría para leer pasivamente.

El trabajo ocurre con archivos, comandos, warnings, salidas observables y dependencias reales entre niveles y proyectos.

## Cómo seguir

La entrada al repo se hace en este orden:

1. leer la [introducción al Workspace](../workspace/workspace.md), que describe cómo está armado el material como objeto de trabajo.
2. entrar en `L0` y dejar el laboratorio operativo y verificable.
3. usar `L1`, `L2`, `L3` y `L4` para fijar máquina, representación, pipeline y build system.
4. recién entonces abrir el resto del mapa, que ya no se siente como una masa opaca de temas.

Forja apuesta a que, después de ese arranque, el resto del track se vuelve recorrible. Y a que, al final del recorrido, la frase «sé programación de sistemas» signifique algo concreto: poder construir piezas reconocibles del stack, no solo nombrarlas.
