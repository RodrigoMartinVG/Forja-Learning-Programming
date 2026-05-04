# Qué es Forja

Forja es una plataforma de aprendizaje de programación de sistemas construida sobre una idea concreta: para entender software real hace falta trabajar con artefactos reales, toolchains reales y proyectos que obliguen a tomar decisiones visibles.

No está pensada como una lectura pasiva ni como una colección de retos sueltos. Está pensada como un workspace vivo donde teoría, ejercicios y proyectos se sostienen entre sí dentro del mismo repositorio.

## Qué ofrece de verdad

La superficie visible de Forja combina varias piezas que se necesitan mutuamente:

- un mapa teórico largo, con niveles que van desde `L0` hasta frontera con kernel space
- capítulos y ejercicios que fijan distinciones reutilizables antes de pasar a sistemas más grandes
- proyectos focalizados e integradores donde esas ideas reaparecen como decisiones de implementación
- un workspace para navegar niveles, proyectos, rutas de entrada e intros sin perder la relación entre unas piezas y otras

Eso cambia la promesa de entrada. No se entra a una carpeta de apuntes. Se entra a una plataforma que ya tiene una columna vertebral curricular y un catálogo práctico conectado con esa columna.

## Qué clase de cosas vive en el mapa

La base arranca por laboratorio, modelo de máquina, representación y compilación porque sin eso todo lo demás queda apoyado sobre intuiciones inestables.

Después el mapa se abre hacia piezas y dominios que sí suenan a programación de sistemas en serio:

- C y Rust como lenguajes de trabajo reales
- procesos, señales, filesystem e interfaces POSIX
- concurrencia, colas, runtimes y coordinación
- parsers, intérpretes, tipos, compiladores y generación de código
- persistencia, formatos, caches y brokers
- redes, contenedores, virtualización y user/kernel boundary

En el track práctico eso se materializa en proyectos del tipo shell, allocator, parser, linker pequeño, debugger, runtime async, contenedor mínimo, stack de red, analizador ELF o piezas cercanas a kernel. La plataforma no promete un tema aislado. Promete un mapa donde esas piezas ya tienen lugar.

## A quién está dirigido

Forja parte de una base acotada pero concreta.

La persona que entra ya programa en algún lenguaje, puede leer código con soltura y no necesita una introducción general a funciones, bucles o sintaxis básica. Lo que todavía no tiene es una estructura firme para programación de sistemas.

Por eso el track no arranca por frameworks ni por productividad superficial. Arranca por condiciones de trabajo, modelo y artefactos, porque esas capas ordenan todo lo que viene después.

## Cómo está organizado

El mapa visible tiene dos ramas principales:

- `theory/`, donde viven los niveles conceptuales, capítulos, ejercicios y piezas de laboratorio o simulación cuando hacen falta
- `projects/`, donde viven los recorridos prácticos focalizados e integradores

Las dos ramas se referencian entre sí. La teoría no está para decorar proyectos y los proyectos no están para confirmar teoría de manera mecánica. Se usan mutuamente para que el usuario pueda pasar de distinción conceptual a artefacto práctico sin romper el hilo.

## Por qué el mapa es grande

Forja ya asume un mapa canónico amplio. Eso no responde a una obsesión por volumen. Responde a otra cosa: programación de sistemas mezcla capas muy distintas y cada una necesita entrar en su momento correcto.

Si laboratorio, representación, toolchain, lenguaje, concurrencia, persistencia, red y frontera con el sistema operativo se comprimen demasiado, el resultado es una secuencia de nombres técnicos sin base estable. El tamaño del mapa existe para evitar esa compresión artificial.

## Qué no es Forja

Forja no es:

- una colección de snippets sueltos
- una serie lineal de videos con progreso ficticio garantizado
- una IDE en el navegador que tape el sistema real
- una capacitación rápida para usar herramientas sin entender qué problema resuelven

El trabajo ocurre con archivos, comandos, warnings, herramientas del sistema, salidas observables y dependencias reales entre niveles y proyectos.

## Cómo conviene entrar al mapa

La secuencia de entrada sigue siendo esta:

1. leer [content/theory/README.md](content/theory/README.md)
2. entrar en `L0`, para dejar el laboratorio operativo y verificable
3. usar `L1`, `L2` y `L3` para fijar máquina, representación y pipeline
4. recién después abrir el resto del mapa con una base más estable

Ese arranque no intenta atrasar el trabajo interesante. Lo habilita. Una vez que laboratorio, modelo y artefactos quedaron firmes, el resto de la plataforma deja de sentirse como una masa opaca de temas sueltos.

## Qué sigue después

Una vez fijada esa base, la plataforma ya puede abrirse hacia C, Rust, POSIX, concurrencia, compiladores, persistencia, redes, runtimes, virtualización y kernel.

Forja existe para que todo eso aparezca dentro de una misma historia: una teoría que prepara proyectos, unos proyectos que devuelven presión a la teoría y un workspace que deja ver que el mapa realmente está ahí.