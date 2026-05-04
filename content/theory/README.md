# Teoría

Esta carpeta no es un apéndice menor del repo. Es la columna vertebral conceptual de Forja.

Acá viven las introducciones previas al track, los niveles teóricos, los capítulos, los ejercicios y las piezas auxiliares que hacen falta para volver visible el mapa. Si `projects/` muestra qué se construye, `theory/` explica con qué modelo conviene mirar y construir esas piezas.

## Qué ofrece esta parte del workspace

Dentro de `theory/` no hay solo texto corrido. Hay una superficie de trabajo bastante más rica:

- introducciones que ubican la plataforma antes de `L0`
- niveles con foco único y progresión explícita
- capítulos que desarrollan una sola distinción fuerte por tramo
- ejercicios que obligan a observar artefactos, estados, comandos o salidas reales
- piezas auxiliares como laboratorios, simuladores o documentos de apoyo cuando un nivel lo necesita

La meta de esta carpeta no es cubrir temas por acumulación. Es hacer que cada capa del mapa entre con una función clara antes de reaparecer en proyectos y herramientas más complejas.

## Qué teoría sostiene Forja

El mapa teórico arranca por una base deliberadamente dura:

- `L0`: laboratorio reproducible
- `L1`: modelo mental mínimo de una computadora
- `L2`: representación material de la información
- `L3`: pipeline de compilación en C

Esa base existe para que el resto de la plataforma no quede apoyado sobre intuiciones borrosas.

Después la teoría se abre a un mapa bastante más grande: C, Rust, POSIX, concurrencia, compiladores, persistencia, redes, runtimes, contenedores, virtualización y frontera con kernel. El usuario no entra acá para ver cuatro notas técnicas. Entra a la mitad conceptual de una plataforma amplia.

## Cómo se conecta con proyectos

`theory/` y `projects/` no están separados por comodidad organizativa. Están separados porque cumplen trabajos distintos.

- la teoría instala modelos, vocabulario preciso y errores que conviene desarmar temprano
- los proyectos fuerzan a usar esas distinciones en piezas reconocibles como shells, allocators, parsers, runtimes, linkers, contenedores o sistemas de red

La relación correcta no es “primero leer todo y después practicar”. La relación correcta es circular: una teoría prepara un proyecto y un proyecto devuelve presión sobre la teoría.

## Por dónde entrar

La entrada corta sigue siendo esta:

1. leer [content/theory/forja.md](content/theory/forja.md)
2. abrir `L0-setup-laboratorio`
3. dejar el laboratorio operativo y verificable
4. recién después avanzar al resto de niveles

Esa secuencia evita un error común: querer entrar directamente al contenido más vistoso sin tener entorno reproducible, ruta de lectura y criterio para separar problemas del sistema de problemas del nivel.

## Cómo leer un nivel

Un nivel puede incluir varias piezas. Las más comunes son estas:

- `README.md`, si hace falta fijar estado editorial o alcance del nivel
- `outline.md`, donde vive el contrato de escritura
- `chapters/`, donde vive el cuerpo del nivel
- `exercises/` o `exercises.md`, donde vive la práctica guiada
- documentos auxiliares como simuladores o laboratorios, cuando el nivel necesita una pieza interactiva o de diseño

No todas las carpetas tienen el mismo grado de authoría real en el mismo momento. El mapa visible puede ser más grande que el cuerpo ya escrito, pero la estructura tiene que seguir siendo honesta para que el usuario vea qué parte del canon ya está desarrollada y cuál sigue en expansión.

## La primera tarea real

La primera tarea real dentro de `theory/` no es elegir el tema más atractivo. Es entrar a `L0` y comprobar que repo, contenedor y toolchain base coinciden con lo que el proyecto declara.

Sin eso, la lectura del resto del mapa queda contaminada por fallos del entorno.

## Lo que sigue

Una vez que `L0` está sano, el recorrido ya puede avanzar por el núcleo inicial del track y después abrirse al resto de la plataforma con otra estabilidad.

La razón de que esta carpeta exista antes de cualquier proyecto vistoso es simple: Forja quiere que el usuario entienda qué está mirando cuando más adelante aparezcan procesos, compiladores, runtimes, contenedores o kernel. `theory/` es la mitad que instala ese criterio.