# Convenciones del Repositorio

> Documento usable de convenciones estructurales y operativas de Forja.
>
> **Voz, prosa, tono, anti-patrones y protocolo de revisión editorial:** [estandar_editorial_forja.md](estandar_editorial_forja.md). Este documento no duplica esas reglas; las referencia.

## Índice

1. [Estado estructural actual](#1-estado-estructural-actual)
2. [Idioma, slugs y nombres](#2-idioma-slugs-y-nombres)
3. [Convención para niveles teóricos](#3-convención-para-niveles-teóricos)
4. [Convención para proyectos](#4-convención-para-proyectos)
5. [Placeholders editoriales](#5-placeholders-editoriales)
6. [Estructura interna de un nivel teórico](#6-estructura-interna-de-un-nivel-teórico)
7. [El archivo `outline.md`](#7-el-archivo-outlinemd)
8. [Pasada de diseño antes que pasada con fuentes](#8-pasada-de-diseño-antes-que-pasada-con-fuentes)
9. [Ejercicios accionables](#9-ejercicios-accionables)
10. [Reglas editoriales: dónde viven](#10-reglas-editoriales-dónde-viven)
11. [Plantillas y matriz de decisiones](#11-plantillas-y-matriz-de-decisiones)
12. [Biblioteca local](#12-biblioteca-local)
13. [Documentos relacionados](#13-documentos-relacionados)

---

## 1. Estado estructural actual

Este archivo describe el estado actual del repo, no una fase histórica del bootstrap. Si una convención vieja deja de coincidir con el repo real, se actualiza acá en vez de seguir nombrando una fase que ya no organiza el proyecto.

Hoy Forja incluye:

- `.devcontainer/` para el laboratorio reproducible.
- `metadata/*.yaml` para catálogos y relaciones globales.
- `content/theory/**` y `content/projects/**` como fuentes de contenido.
- `web/` como interfaz de navegación y lectura.

---

## 2. Idioma, slugs y nombres

- La prosa del repo se escribe en español, con tildes normales.
- Los nombres de carpetas y slugs se mantienen en ASCII y en `kebab-case`.
- Los nombres visibles al usuario pueden conservar mayúsculas, espacios o acentos cuando corresponda; los slugs no.

Ejemplos de slugs canónicos:

| Nombre visible | Slug |
|---|---|
| `shell remoto TCP` | `shell-remoto-tcp` |
| `RAM-FileSystem` | `ram-filesystem` |
| `KVM mini-hypervisor` | `kvm-mini-hypervisor` |
| `Lógico` | `logico` |
| `HTTP server` | `http-server` |
| `TCP/IP stack` | `tcp-ip-stack` |

---

## 3. Convención para niveles teóricos

Cada nivel teórico vive en `content/theory/` con el patrón `L<orden>-<slug-canónico>`. El orden y el slug se derivan de [metadata/levels.yaml](metadata/levels.yaml).

Ejemplos: `L0-setup-laboratorio`, `L1-modelo-mental-computadora`, …, `L57-kernel-space-2`.

### 3.1 Estados de un nivel

| Estado | Contenido mínimo obligatorio |
|---|---|
| **Placeholder canónico** (nivel todavía no entró en authoría real) | `README.md`, `meta.yaml` |
| **Authoría real** | `README.md`, `meta.yaml`, `outline.md`, `chapters/`, `exercises.md` o `exercises/`, `src/` cuando corresponda |

El paso de placeholder a authoría real **empieza por `outline.md`** (ver §7 y §8). No se crean `chapters/` ni `exercises.md` antes de tener un outline aprobado.

---

## 4. Convención para proyectos

Los proyectos viven en una de estas dos ramas:

- `content/projects/focused/`
- `content/projects/integrating/`

Los slugs de proyecto usan `kebab-case` ASCII (ver §2).

### 4.1 Estados de un proyecto

| Estado | Contenido mínimo obligatorio |
|---|---|
| **Placeholder estructural** | `project.yaml`. `README.md` puede existir como placeholder declarado. |
| **Authoría real** | `project.yaml`, `c/` y/o `rust/`, subdirectorios `phase-n/`, y dentro de cada fase `README.md`, `STUDY_GUIDE.md`, `IMPROVEMENTS.md`. |

Si un proyecto necesita un outline o plan de fases antes o durante la authoría real, se trata con la misma seriedad que un outline de nivel: modela todo el arco necesario, no una versión recortada para "dejarlo corto".

### 4.2 Autoridad cuando el README y `project.yaml` discrepan

Mientras el proyecto siga en placeholder, manda `project.yaml`. El README gana solo cuando el proyecto entra en authoría real y pasa a ser documento mantenido deliberadamente.

---

## 5. Placeholders editoriales

Los placeholders trackeables son correctos mientras un nivel o proyecto todavía no tiene su cuerpo final. Reglas:

- La estructura canónica del directorio ya debe existir.
- `meta.yaml` acompaña siempre a cada nivel canónico, incluso en placeholder.
- `README.md` puede existir como placeholder desde mucho antes del contenido final.
- `outline.md` no se crea por anticipado: aparece cuando un nivel entra en authoría real.
- En proyectos, `project.yaml` existe antes que la documentación de arco. El `README.md` puede quedarse como placeholder estructural durante mucho tiempo.
- El archivo declara explícitamente si es contenido para estudiar o documento interno de diseño.
- Cuando llega contenido real, el placeholder se reemplaza sin romper la estructura esperada del repo.

El estándar editorial v2 (§8) regula la **prosa** de un placeholder. Esta sección regula su **estructura**.

---

## 6. Estructura interna de un nivel teórico

### 6.1 Terminología

| Término | Significado |
|---|---|
| **Capítulo** | un archivo `.md` dentro de `chapters/`. Unidad de navegación del sidebar de la web. |
| **Sección** | un heading `##` dentro de un capítulo. |
| **Subsección** | un heading `###`. |
| **Sub-subsección** | un heading `####`. Uso moderado. |

En la prosa del contenido: *"en la siguiente sección"* refiere a un `##`; *"en el capítulo siguiente"* refiere al próximo archivo. Nunca usar *sección* para referirse a un archivo completo.

### 6.2 Layout del directorio

```
LN-slug/
  README.md          ← documento de diseño interno del nivel
  meta.yaml          ← metadata del catálogo
  outline.md         ← contrato de diseño (existe en authoría real)
  chapters/
    00-introduccion.md
    01-primer-tema.md
    02-segundo-tema.md
    ...
  exercises.md       ← o bien
  exercises/
    01-...md
    ...
  src/               ← cuando el nivel necesita artefactos fuente
```

### 6.3 Reglas de archivos

- Los archivos de `chapters/` se ordenan lexicográficamente. El prefijo numérico (`00`, `01`, `02`…) define el orden y el número que aparece en el sidebar.
- `00-introduccion.md` es obligatorio y usa exactamente ese nombre. No se reemplaza por `00-panorama.md`, `00-mapa.md` u otras variantes.
- La primera línea de cada archivo es un heading `# Título` sin prefijo numérico ni la palabra "Capítulo". Ese título aparece en el sidebar.
- `README.md` del nivel es documento de diseño interno; no se muestra en la web cuando existe `chapters/`.

### 6.4 Bloque editorial de entrada antes de L0

Antes del primer nivel existe un bloque editorial compuesto por [content/theory/forja.md](content/theory/forja.md) y [content/theory/README.md](content/theory/README.md).

Ese bloque no cuenta como nivel ni reemplaza a `L0`. Su función:

- dar contexto a alguien que todavía no sabe qué es Forja ni cómo se usa;
- explicar cómo se recorre el workspace, incluyendo niveles y proyectos;
- justificar por qué `L0` existe y por qué no conviene entrar directo a tecnicismos del laboratorio.

`forja.md` cubre plataforma, motivación, expectativas y perfil de entrada. `README.md` es breve, orientador y no duplica el detalle curricular de [docs/forja-contenido.md](docs/forja-contenido.md).

### 6.5 Cobertura explícita: nada colgado

Cada vez que un tema se introduce de forma parcial o superficial, el texto lo declara explícitamente:

- Si el tema se trata en otro nivel: citar ese nivel. Ej: *"el formato ELF se cubre en `L25`, una vez que se tiene el contexto de memoria virtual"*.
- Si el tema se menciona pero no se enseña: justificar por qué.
- Si algo queda sin resolver intencionalmente: decirlo y decir cuándo se resuelve.

No está permitido que un concepto quede *colgado*: presentado pero sin cierre ni referencia. Todo cabo suelto lleva una etiqueta explícita.

### 6.6 Contrato del capítulo 00

`00-introduccion.md` ubica al lector en el nivel. Su contrato editorial **no** es la lista plantilla de secciones que se usaba en versiones previas de este documento (`Qué es / Qué cubre / Qué no cubre / Cómo trabajarlo / El nivel siguiente`). Esa plantilla está vetada por [estandar_editorial_forja.md](estandar_editorial_forja.md) §6.4 y A6.

El contrato real del archivo `00-introduccion.md` está definido en v2 §6.4: nombra el problema que abre el nivel, puede declarar exclusiones una vez en prosa breve, y la transición curricular hacia `LX+1` vive en el `README.md` del nivel, no en el cuerpo del capítulo.

---

## 7. El archivo `outline.md`

Cada nivel que ya entró en authoría real tiene un `outline.md` en la raíz de su directorio (al mismo nivel que `chapters/`, no dentro).

El outline es un **documento de diseño**, no contenido para el estudiante. No se sirve en la web. Sus funciones:

- registrar el objetivo del nivel en una oración verificable;
- listar cada capítulo con su objetivo, sus secciones H2/H3 y notas de implementación;
- documentar las decisiones de diseño: por qué este orden, qué se postergó y a dónde va;
- servir como punto de partida para detectar inconsistencias antes de escribir o revisar contenido.

El outline se escribe **antes** del contenido y se actualiza cada vez que el contenido cambia. Es la fuente de verdad sobre la intención del nivel.

### 7.1 No economizar el outline

Cuando exista un outline de nivel o un outline/plan de proyecto, debe ser tan exhaustivo, amplio y profundo como haga falta para modelar la pieza completa. Si el problema pide ocho capítulos, seis fases o varios desvíos de implementación, se listan todos. No se escatima esfuerzo para que el outline capture la estructura real del trabajo.

### 7.2 Forma del outline

Como documento de diseño (v2 §6.6), el outline contiene en este orden: objetivo, contrato conceptual, decisiones tomadas con su razón, decisiones pendientes o exclusiones, y relación con el nivel y artefactos hermanos.

Plantilla mínima:

```markdown
# Outline: LN — Nombre del nivel

## Metadatos
- Prerrequisito: ...
- Desbloquea: ...
- Proyectos asociados: ...

## Objetivo
[Una oración concreta y verificable]

## Preguntas guía
- ...

## Regla editorial del nivel
- ...

## Capítulos

### Capítulo NN — Nombre
**Archivo:** `chapters/NN-slug.md`
**Objetivo:** ...
**Problema que abre:** ...
**Secciones:**
- `## Sección`
  - `### Subsección`
**Desarrollo obligatorio:** ...
**Artefactos y evidencia obligatorios:** ...
**Confusiones que debe desmontar:** ...
**Cierre que debe quedar:** ...

## Ejercicios
...

## Decisiones de diseño
- ...
```

### 7.3 Outline y estándar editorial v2

El outline se diseña con conciencia del estándar editorial. En particular:

- los títulos H2 sugeridos para los capítulos no pueden ser títulos vetados por v2 §A5 (catálogo de títulos metadidácticos);
- no se planifica una sección `## El nivel siguiente` dentro del cuerpo del capítulo (v2 §R7, B4);
- la sección "Secciones" del outline lista los `##` reales tal como aparecerán; si esa lista falla el test de v2 §A5/§A8, el outline se corrige antes de escribir el capítulo.

---

## 8. Pasada de diseño antes que pasada con fuentes

Cuando se desarrolla un nivel o un proyecto, el proceso correcto es:

1. **Primera pasada — outline propio, sin consultar `libros-consulta/`.** Primero se hace el mayor esfuerzo de diseño interno: objetivo, capítulos o fases, secciones, experimentos, errores típicos, relaciones con otros niveles. Esta pasada no se recorta por falta de apoyo externo ni se arma siguiendo el índice de un libro.
2. **Segunda pasada — contraste y enriquecimiento con fuentes.** Recién después de tener un outline fuerte, se consultan referencias para ganar ideas, detectar huecos, sumar mejores ejemplos, afinar vocabulario o corregir errores de enfoque.

Estos dos momentos no se mezclan. El outline de Forja nace primero desde la lógica del plan y del repo; las fuentes entran después para tensionarlo y mejorarlo, no para reemplazarlo.

Si una fuente externa obliga a cambiar algo importante, ese cambio se hace explícitamente sobre el outline ya existente. Nunca se reemplaza el diseño por una traducción encubierta del capítulo de un libro.

---

## 9. Ejercicios accionables

Todos los ejercicios deben ser accionables de una de estas dos formas:

1. **Comando con resultado observable**: un comando de shell cuyo output el estudiante puede comparar o interpretar. Puede pedir interpretarlo, modificar algo y observar el cambio, o comparar dos variantes.
2. **Multiple choice con verificación**: una pregunta con opciones, la respuesta correcta marcada y un comando que permite comprobar la respuesta empíricamente.

**Prohibido:** ejercicios del tipo *"describí con tus palabras"*, *"explicá la diferencia entre X e Y"*, o cualquier consigna que no produzca un resultado verificable. Forja aprende haciendo, no escribiendo ensayos.

Cuando un ejercicio pide escribir una conclusión, esa conclusión debe salir de una observación previa hecha con un comando concreto. El ejercicio no puede depender solo de memoria o intuición.

---

## 10. Reglas editoriales: dónde viven

Esta es la división de competencia entre `CONVENTIONS.md` y el estándar editorial:

| Tema | Vive en |
|---|---|
| Layout de directorios y archivos por nivel/proyecto | CONVENTIONS.md (§3, §4, §6) |
| Slugs, idioma, nombres | CONVENTIONS.md (§2) |
| Estados (placeholder vs authoría real) | CONVENTIONS.md (§3.1, §4.1, §5) |
| Contrato del `outline.md` como artefacto | CONVENTIONS.md (§7) |
| Proceso de diseño (dos pasadas) | CONVENTIONS.md (§8) |
| Forma de los ejercicios | CONVENTIONS.md (§9) |
| Voz, persona, modo verbal | v2 §3 |
| Anti-patrones léxicos y estructurales | v2 §7 |
| Reglas de prosa de bajo nivel (R1–R9) | v2 §5 |
| Contrato de prosa por tipo de archivo | v2 §6 |
| Protocolo de revisión con veredicto | v2 §9 |
| Estructura de un placeholder en cuanto a tono | v2 §8 |
| Estructura de un placeholder en cuanto a archivos | CONVENTIONS.md (§5) |

Si un tema no aparece arriba, se asume que vive en v2.

---

## 11. Plantillas y matriz de decisiones

### 11.1 README.md placeholder de nivel

Plantilla por defecto para niveles que todavía no entraron en authoría real:

```markdown
# LN — Nombre del nivel

> Placeholder editorial del nivel.
>
> Qué es Forja → `content/theory/forja.md`
> Introducción al Workspace → `content/theory/README.md`
> Diseño curricular → `docs/forja-contenido.md`

## Estado editorial

- Este nivel ya existe en el canon.
- Todavía no entró en authoría real.
- `outline.md`, `chapters/`, `src/` y `exercises.md` aparecen cuando se abra esa fase.

## Prerrequisitos

...

## Proyectos asociados

...

## Próximo paso

Abrir authoría real del nivel, crear un `outline.md` exhaustivo y derivar de ahí los capítulos, ejercicios y artefactos necesarios.
```

### 11.2 Matriz: ¿qué archivo crear cuándo?

| Situación | Crear ahora | No crear todavía |
|---|---|---|
| Nivel canónico nuevo, sin authoría | `README.md` (placeholder), `meta.yaml` | `outline.md`, `chapters/`, `exercises.md`, `src/` |
| Nivel entra en authoría real | `outline.md` exhaustivo | `chapters/` recién después del outline |
| Outline aprobado | `chapters/00-introduccion.md`, los capítulos siguientes en orden | `exercises.md` antes de tener al menos los capítulos centrales |
| Proyecto canónico nuevo | `project.yaml` | `c/`, `rust/`, fases |
| Proyecto entra en authoría real | `README.md` real, plan de fases si corresponde | fases sin diseño previo |

### 11.3 Decisión rápida: ¿esto va a CONVENTIONS o al estándar v2?

```
¿Define dónde vive un archivo, cómo se nombra
o qué archivos contiene un directorio?
        │
        ├── Sí ──→ CONVENTIONS.md
        │
        └── No
             │
             ¿Define cómo se escribe la prosa,
             qué palabras evitar, cómo revisar
             un texto, qué tono usar?
                     │
                     ├── Sí ──→ estandar_editorial_forja.md
                     │
                     └── No ──→ docs/forja-contenido.md (currícula)
                                docs/forja-proyectos.md (proyectos)
                                docs/forja-arquitectura.md (técnica)
```

---

## 12. Biblioteca local

La carpeta `libros-consulta/` queda reservada para materiales privados de consulta personal. Debe permanecer fuera de Git y del remoto.

Su uso correcto es como apoyo de segunda pasada (§8). No define el primer outline, no fija el alcance del nivel o del proyecto y no dicta la estructura canónica de Forja.

---

## 13. Documentos relacionados

- [estandar_editorial_forja.md](estandar_editorial_forja.md) — voz, prosa, anti-patrones, revisión.
- [estandar_editorial_forja.md](estandar_editorial_forja.md) — versión 1, conservada como histórico.
- [docs/forja-contenido.md](docs/forja-contenido.md) — currícula humana, niveles y bloques.
- [docs/forja-proyectos.md](docs/forja-proyectos.md) — catálogo y arcos de proyectos.
- [docs/forja-arquitectura.md](docs/forja-arquitectura.md) — arquitectura técnica del repo y la web.
- [docs/forja-construccion.md](docs/forja-construccion.md) — dinámica operativa de construcción.
- [content/theory/forja.md](content/theory/forja.md) y [content/theory/README.md](content/theory/README.md) — bloque editorial de entrada.

---

## Apéndice — Cambios respecto de la versión previa

- Se reorganiza el archivo en 13 secciones con índice navegable y división de competencia explícita (§10).
- Se elimina la duplicación con el estándar editorial: las secciones *Tono*, *Filosofía de autoría* y *Capítulo 00* dejan de regular prosa y delegan en [estandar_editorial_forja.md](estandar_editorial_forja.md).
- Se corrige el contrato del `00-introduccion.md`: la antigua plantilla obligatoria de seis secciones (`Qué es / Qué cubre / Qué no cubre / Cómo trabajarlo / El nivel siguiente`) está vetada por v2 §6.4 y A6, y este documento ya no la prescribe.
- Se incorporan tildes y se mejora consistencia ortográfica.
- Se agrega §11 con plantillas concretas y dos matrices de decisión rápida.
- Se mantienen sin cambios sustantivos: convenciones de slugs (§2), layout de niveles (§3, §6), proyectos (§4), placeholders (§5), `outline.md` como artefacto (§7), proceso de dos pasadas (§8), ejercicios accionables (§9), biblioteca local (§12).
