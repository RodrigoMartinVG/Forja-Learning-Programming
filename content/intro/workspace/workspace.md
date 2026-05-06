# Introducción al Workspace

El texto previo —[¿qué es Forja?](../forja/forja.md)— responde por qué existe el repo. Este describe **cómo está armado por dentro** y qué vas a tener delante cuando empieces a recorrerlo.

## El repo como objeto de trabajo

Forja es un monorepo. Todo lo que importa vive en archivos navegables:

```
content/
  intro/         ← este bloque editorial, antes de L0
  theory/        ← niveles L0 a L57, con outlines, capítulos y ejercicios
  projects/
    focused/     ← ~50 proyectos focalizados (un objetivo, días o semanas)
    integrating/ ← ~20 proyectos integradores (multi-fase, multi-lenguaje)
docs/            ← canon curricular y de arquitectura
metadata/        ← fuente de verdad estructural (levels.yaml, paths.yaml…)
templates/       ← scaffolds para nivel y proyecto nuevos
web/             ← la vista navegable del mismo contenido
```

La web sirve para hojear cómodamente. El repo es la fuente. Cualquier cosa que se vea en pantalla está en algún archivo `.md` o `.yaml` que podés leer, editar y compilar.

## Las dos ramas de contenido

`content/theory/` y `content/projects/` no son dos secciones separadas por organización: cumplen trabajos distintos.

**Teoría** instala modelos, vocabulario preciso y errores que vale la pena desarmar temprano. Está organizada en niveles. Cada nivel cubre una sola distinción fuerte y la trabaja a fondo.

**Proyectos** fuerzan a usar esas distinciones en piezas reconocibles: shells, allocators, parsers, runtimes, linkers, contenedores, sistemas de red. Cada proyecto declara qué niveles requiere y qué niveles reabre cuando se vuelve más complejo.

La relación entre ambas no es lineal. No es «primero leo todo, después practico». Un nivel prepara un proyecto, ese proyecto vuelve a un nivel posterior con presión nueva, y el siguiente nivel se entiende mejor por haber pasado por el proyecto. El recorrido tiene esa forma a propósito.

## Cómo está armado un nivel

Un nivel teórico (`content/theory/Lx-slug/`) puede contener varias piezas. Las más comunes:

- `meta.yaml` — metadata estructural. Existe siempre. Es la fuente de verdad.
- `outline.md` — contrato de diseño del nivel. Su aparición marca el inicio de authoría real.
- `chapters/` — el cuerpo del nivel, en archivos numerados. `00-introduccion.md` es obligatorio y abre el nivel.
- `exercises/` o `exercises.md` — práctica guiada, observable y verificable.
- `src/` — artefactos fuente cuando el nivel los necesita (ej: `L3` trae mini-programas C para mirar el pipeline).
- `simulator-presets/`, `laboratorio.md`, `simulador.md` — piezas auxiliares cuando el nivel pide una herramienta interactiva.

Mientras un nivel está en placeholder, no tiene `README.md` ni `outline.md`: el cuerpo se sintetiza desde `meta.yaml` y la web lo muestra como tal. **Eso permite ver el mapa completo sin fingir contenido escrito que todavía no existe.**

## Cómo está armado un proyecto

Un proyecto (`content/projects/{focused,integrating}/slug/`) tiene esta forma cuando entra en authoría real:

- `project.yaml` — niveles requeridos, lenguajes, reaperturas, fases declaradas.
- `README.md` — portada de arco: qué se construye, en qué fases, qué se aprende.
- `c/` y/o `rust/` — código por lenguaje.
- `phase-n/` — cada fase con su `README.md`, `STUDY_GUIDE.md` y `IMPROVEMENTS.md`.

En placeholder, solo el `project.yaml` existe; la web sintetiza el cuerpo. Hoy el único proyecto en authoría real completa es `devcontainer-setup`.

## Estado real del contenido

Forja tiene un mapa amplio pero no oculta dónde está cada parte:

- **`L0` a `L4` están escritos a fondo**: outline, capítulos, ejercicios, artefactos. Cubren laboratorio, modelo de máquina, representación, pipeline en C y build system de Rust.
- **`L5` a `L57` viven como placeholder declarado**, con `meta.yaml` real y cuerpo sintetizado. La estructura del canon ya existe; el cuerpo se va escribiendo de a uno.
- **`devcontainer-setup` es el único proyecto en authoría real**. El resto del catálogo está declarado en metadata.

Esa honestidad es deliberada. Ver el mapa entero, sabiendo qué parte ya está escrita y cuál no, es preferible a un track corto que finge cubrirlo todo.

## Por dónde empezar

1. Si todavía no leíste [¿qué es Forja?](../forja/forja.md), empezar por ahí.
2. Abrir `L0-setup-laboratorio` y dejar el laboratorio operativo: devcontainer corriendo, toolchain de C y Rust verificada, scripts de chequeo verdes.
3. Recorrer `L1`, `L2`, `L3` y `L4` en orden. Esa secuencia fija máquina, representación, pipeline y build system. Sin esa base, el resto del mapa se siente opaco.
4. Recién después, decidir el resto del recorrido. La metadata (`metadata/paths.yaml`) declara rutas temáticas posibles, pero ningún recorrido es obligatorio una vez que el núcleo está firme.

## Cómo se contribuye al recorrido

El laboratorio que se monta en `L0` (devcontainer reproducible) es el mismo que se usa para construir cualquier proyecto del repo. Eso significa que:

- compilar y correr cualquier ejercicio o proyecto no requiere instalar herramientas del host;
- los warnings, errores y salidas que ves en tu pantalla son los mismos que el contenido describe;
- la web se sirve desde el host, pero el código y los artefactos viven dentro del contenedor.

`scripts/forja.py` y los Makefiles de cada proyecto encapsulan los comandos típicos. La web (`npm run dev` desde Windows) hace de mapa navegable, pero no es necesaria para trabajar: todo el material es legible directamente con un editor de texto.

## Una última distinción

Lo que hace que este workspace sea recorrible no es la cantidad de material. Es que cada pieza declara su lugar. Un capítulo cita el proyecto donde la idea reaparece. Un proyecto cita los niveles que lo preparan. Un placeholder declara que es placeholder y muestra el mapa de lo que va a ocupar.

Mientras esa disciplina se mantenga, el repo puede crecer sin perder forma. Es la promesa estructural de Forja, y este texto existe para que se pueda verificar antes de empezar.
