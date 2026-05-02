# Outline: L0 — Entorno y Toolchain

## Metadatos

- **Prerequisito:** ninguno
- **Desbloquea:** L1a
- **Proyectos asociados:** devcontainer-setup
- **Dominio:** languages

## Objetivo

El estudiante termina L0 siendo capaz de compilar, ejecutar, observar y depurar un programa C o Rust en el laboratorio, y de describir con precisión qué ocurre en cada etapa del pipeline.

---

## Capítulos

### Capítulo 00 — Introducción
**Archivo:** `chapters/00-introduccion.md`
**Objetivo:** Orientar al estudiante sobre qué es Forja, por qué empezar en este nivel, y cómo aprovechar el material.
**Secciones:**
- `## Qué es Forja`
- `## Por qué L0 es el primer nivel`
- `## Qué cubre L0`
- `## Qué no cubre L0, y por qué`
- `## Cómo trabajar este nivel`
- `## El nivel siguiente`

**Notas:** Capítulo puramente orientativo, sin código. Incluye el razonamiento sobre el orden C-antes-que-Rust y la distribución de proyectos (36 bilingüe, 7 solo-C, 7 solo-Rust, 1 ninguno).

---

### Capítulo 01 — El laboratorio
**Archivo:** `chapters/01-laboratorio.md`
**Objetivo:** El estudiante levanta el dev container, entiende qué tiene instalado y por qué, y sabe reconstruirlo cuando cambia.
**Secciones:**
- `## Qué es un Dev Container (y qué no es)`
- `## Qué tiene instalado el laboratorio`
- `## Archivos montados vs copiados`
- `## Cómo abrirlo`
  - `### Opción 1: VS Code + Docker (recomendada)`
  - `### Opción 2: GitHub Codespaces`
  - `### Opción 3: Docker manual`
- `## Verificar que todo funciona`
- `## La anatomía del .devcontainer/`
  - `### devcontainer.json`
  - `### Dockerfile`
- `## Cómo reconstruir el contenedor`
- `## Sobre puertos y red`
- `## Por qué esto es parte del contenido`

**Notas:** Los comentarios bash/dockerfile dentro de los bloques de código aparecen como H1 en el grep pero no son headings reales — no hay problema estructural. Contenido duplicado corregido (segunda copia de ~150 líneas truncada).

---

### Capítulo 02 — El pipeline de compilación
**Archivo:** `chapters/02-compilador.md`
**Objetivo:** El estudiante comprende las cuatro fases de GCC, los flags más usados y puede automatizar la compilación con Make.
**Secciones:**
- `## Las cuatro fases`
  - `### 1. Preprocesamiento`
  - `### 2. Compilación propiamente dicha`
  - `### 3. Ensamblado`
  - `### 4. Enlazado (linking)`
- `## Hacer todo en un solo comando`
- `## Los flags que más importan ahora`
  - `### -fsanitize: el compilador como detector de bugs`
- `## GCC vs Clang: ¿cuál usar?`
- `## Makefiles: automatizar la cadena`
  - `### Variables especiales en Make`
- `## Inspeccionar el resultado`
- `## Lo que el pipeline te muestra`

**Notas:** Diagrama ASCII del pipeline (5 nodos con box-drawing chars) reemplaza el mermaid original. Bloques de código gdb/shell usan alias de highlight.js.

---

### Capítulo 03 — Una intuición de máquina
**Archivo:** `chapters/03-maquina.md`
**Objetivo:** El estudiante puede leer ensamblador básico, razonar sobre stack frames y localizar regiones de memoria de un proceso.
**Secciones:**
- `## La máquina de von Neumann`
  - `### El ciclo fetch-decode-execute`
  - `### La idea clave: código y datos son bytes en la misma memoria`
  - `### Por qué los registros son tan rápidos`
- `## Los enteros no son infinitos: complemento a dos`
  - `### Cómo funciona el complemento a dos`
  - `### El comportamiento indefinido de overflow`
- `## Registros: las variables de la CPU`
- `## El stack: memoria de las llamadas a funciones`
  - `### Stack vs heap`
- `## Leer ensamblador: la primera vez`
- `## call y ret: lo que realmente pasa al llamar una función`
- `## Ver el ensamblador de un binario ya compilado`
- `## Las regiones de memoria de un proceso`
  - `### Ver el layout real con /proc`
- `## La dirección de una variable y ASLR`
- `## La intuición que necesitás`

**Notas:** Dos diagramas ASCII (stack frames + mapa de memoria del proceso) reemplazan los mermaid block-beta originales. Archivo truncado en línea 296 para corregir duplicación de contenido.

---

### Capítulo 04 — Herramientas de observación
**Archivo:** `chapters/04-herramientas.md`
**Objetivo:** El estudiante usa strace, gdb, valgrind, ASan y perf para observar y diagnosticar programas en ejecución.
**Secciones:**
- `## strace — ver cada llamada al sistema`
  - `### Lo que strace te enseña`
  - `### Entender qué hace una syscall: man 2`
  - `### Cómo funciona strace (brevemente)`
  - `### ltrace — llamadas a funciones de biblioteca`
- `## gdb — el debugger simbólico`
  - `### Los comandos esenciales`
  - `### Comandos para inspección profunda`
  - `### Watchpoints y breakpoints condicionales`
  - `### Modo TUI — interfaz de texto mejorada`
- `## valgrind — detectar errores de memoria`
  - `### Los errores más comunes que detecta`
  - `### valgrind tiene más herramientas`
- `## Address Sanitizer (ASan) — más rápido, igual de útil`
  - `### Cuándo usar cuál`
- `## perf — rendimiento real`
- `## La filosofía del observador`

**Notas:** Archivo de 322 líneas, codificación UTF-8 restaurada (193 secuencias `ï¿½` corregidas).

---

### Capítulo 05 — Tu primer recorrido completo
**Archivo:** `chapters/05-primer-recorrido.md`
**Objetivo:** El estudiante aplica todo lo visto en L0 sobre un programa concreto, de principio a fin, como cierre integrador.
**Secciones:**
- `## Paso 0: verificar el ambiente`
- `## El programa`
- `## Paso 1: compilar con flags correctas`
- `## Paso 2: inspeccionar las dependencias`
- `## Paso 3: mirá el ensamblador`
- `## Paso 4: strace — del printf al kernel`
  - `### ¿Por qué no hay llamada directa de printf a write?`
  - `### Contraste: printf vs write directa`
- `## Paso 5: gdb — ejecutar línea por línea`
- `## Paso 6: valgrind — verificar que no hay errores de memoria`
- `## Paso 7: compilar con sanitizers`
- `## Lo que registrás`
- `## Qué notaste que faltó — y dónde aparece`

**Notas:** Capítulo de síntesis. Referencia a `src/` del nivel (hello.c, hello.rs, suma.c, etc.).

---

## Ejercicios

Archivo: `exercises.md` — 5 series, 19 ejercicios en total.

| Serie | Tema | Ejercicios | Formatos |
|-------|------|-----------|---------|
| A | Pipeline de compilación | A1–A4 | comando + observación, opción múltiple |
| B | strace | B1–B4 | comando + observación, opción múltiple |
| C | gdb | C1–C4 | comando + observación, opción múltiple |
| D | valgrind y sanitizers | D1–D4 | comando + observación, opción múltiple |
| E | Rust en el laboratorio | E1–E3 | comando + observación |

**Criterio de salida:** definido al final de `exercises.md`.

---

## Decisiones de diseño

### Por qué este orden de capítulos
- 00 orienta antes de que el estudiante toque código
- 01 establece el entorno antes de compilar nada
- 02 explica la cadena antes de mostrar ensamblador
- 03 da intuición de máquina antes de usar gdb
- 04 presenta las herramientas individualmente
- 05 las integra todas sobre un solo programa

### Qué se postponó y a dónde va
- **Linking profundo** (símbolos, relocs, bibliotecas dinámicas) → L7 (Virtual Memory + ELF)
- **Makefiles avanzados** (deps automáticas, múltiples targets) → L1b
- **Profiling serio** (flamegraphs, perf record/report) → L17 (Performance)
- **Kernel y syscalls** en profundidad → L6 (Processes + Signals), L23 (Kernel)
- **Rust toolchain** (cargo, clippy, rustfmt) → L3a (Rust: primer contacto)
- **Debugging de concurrencia** (tsan, helgrind) → L9 (Concurrency)

### Por qué C antes que Rust
- L1-L2 solo C: exposición deliberada a la gestión manual de memoria antes de que Rust la automatice
- El contraste es el mensaje; entender por qué Rust diseñó el ownership requiere haber sufrido sin él

### Sobre 01-laboratorio.md
- Tiene headings H1 donde deberían ser H2/H3 (instrucciones de docker como `# Construir la imagen`)
- Posible contenido duplicado (dos bloques de secciones similares en el mismo archivo)
- Pendiente: revisar y limpiar estructura de headings
