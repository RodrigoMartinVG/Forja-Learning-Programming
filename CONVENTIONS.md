# Convenciones del Repositorio

## Estado estructural actual

Este archivo describe el estado actual del repo, no una fase historica del bootstrap.

Hoy Forja ya incluye:

- `.devcontainer/` para el laboratorio reproducible
- `metadata/*.yaml` para catalogos y relaciones globales
- `content/theory/**` y `content/projects/**` como fuentes de contenido
- `web/` como interfaz de navegacion y lectura

Si una convencion vieja deja de coincidir con el repo real, se actualiza aca en vez de seguir nombrando una fase que ya no organiza el proyecto.

## Idioma y estilo

- La prosa del repo se escribe en espanol.
- Los nombres de carpetas y slugs se mantienen en ASCII y en kebab-case.
- Los nombres visibles al usuario pueden conservar mayusculas, espacios o acentos cuando haga falta; los slugs no.

## Convencion para niveles teoricos

Cada nivel teorico usara un directorio con este patron:

- `L0-setup-laboratorio`
- `L1-modelo-mental-computadora`
- `...`
- `L49-kernel-space-2`

En general, el patron es `L<orden>-<slug-canonico>` y se deriva de `metadata/levels.yaml`.

Cuando llegue la fase de un nivel, su carpeta deberia contener como minimo:

- `README.md`
- `chapters/`
- `src/`
- `exercises.md`
- `outline.md`
- `meta.yaml`

## Convencion para proyectos

Los proyectos viven en una de estas dos ramas:

- `content/projects/focused/`
- `content/projects/integrating/`

Los slugs de proyecto usan kebab-case ASCII. Ejemplos:

- `shell remoto TCP` -> `shell-remoto-tcp`
- `RAM-FileSystem` -> `ram-filesystem`
- `KVM mini-hypervisor` -> `kvm-mini-hypervisor`
- `Lógico` -> `logico`
- `HTTP server` -> `http-server`
- `TCP/IP stack` -> `tcp-ip-stack`

Cuando llegue la fase de un proyecto, su carpeta deberia contener como minimo:

- `project.yaml`
- `c/` y/o `rust/`
- subdirectorios `phase-n/`
- `README.md`, `STUDY_GUIDE.md` e `IMPROVEMENTS.md` dentro de cada fase

## Placeholders editoriales

Los README y outlines pueden funcionar como placeholders trackeables mientras un nivel o proyecto todavia no tiene su cuerpo final.

La regla es:

- la estructura canonica del directorio ya debe existir
- el archivo debe dejar claro si es contenido para estudiar o documento interno de diseno
- cuando llegue contenido real, el placeholder se reemplaza sin romper la estructura esperada del repo

## Biblioteca local

La carpeta `libros-consulta/` queda reservada para materiales privados de consulta personal. Debe permanecer fuera de Git y del remoto.

---

## Filosofía de autoría de contenido

Esta sección documenta cómo se escribe el contenido de los niveles teóricos de Forja. Aplica a todas las secciones de todos los niveles.

### Terminología: capítulo, sección, subsección

- **Capítulo** — un archivo `.md` dentro de `chapters/`. Es la unidad de navegación del panel izquierdo de la web. Cada ítem del sidebar es un capítulo.
- **Sección** — un heading `##` dentro de un capítulo. Organiza el contenido dentro del archivo.
- **Subsección** — un heading `###`. Subordinado a una sección.
- **Sub-subsección** — un heading `####`. Usado con moderación.

En la prosa del contenido: cuando se dice *"en la siguiente sección"* se habla de un `##`; cuando se dice *"en el capítulo siguiente"* se habla del próximo archivo. Nunca usar *sección* para referirse a un archivo completo.

### Estructura de un nivel

Cada nivel teórico tiene un directorio `chapters/` con archivos `.md` numerados:

```
chapters/
  00-introduccion.md   ← siempre presente: qué es este nivel, qué no es, el mapa
  01-primer-tema.md
  02-segundo-tema.md
  ...
```

- Los archivos se ordenan lexicográficamente. El prefijo numérico (`00`, `01`, `02`...) define el orden y el número que aparece en el sidebar de la web.
- `00-introduccion.md` es obligatorio y usa exactamente ese nombre. No se reemplaza por `00-panorama.md`, `00-mapa.md` u otras variantes.
- La primera línea de cada archivo debe ser un heading `# Título` (sin prefijo numérico ni la palabra "Capítulo"). Ese título es el que aparece en el sidebar.
- `README.md` del nivel es un documento de diseño interno (no se muestra en la web cuando existe `chapters/`). Ver plantilla al final de esta sección.

### Introducción general antes de L0

Antes del primer nivel existe un bloque editorial de entrada compuesto por `content/theory/forja.md` y `content/theory/README.md`.

Ese bloque no cuenta como nivel ni reemplaza a `L0`. Su función es:

- dar contexto a alguien que todavia no sabe que es Forja ni como se usa
- explicar cómo se recorre el workspace, incluyendo niveles y proyectos
- justificar por qué `L0` existe y por qué no conviene entrar directo a tecnicismos del laboratorio

La parte `Que es Forja` debe explicar plataforma, motivacion, expectativas y perfil de entrada. La `Introduccion al Workspace` debe ser breve, orientadora y no duplicar el detalle curricular de `docs/forja-contenido.md`.

### El archivo `outline.md`

Cada nivel debe tener un `outline.md` en la raíz de su directorio (al mismo nivel que `chapters/`, no dentro de él).

El outline es un **documento de diseño**, no contenido para el estudiante. No se sirve en la web. Su función:
- Registrar el objetivo del nivel en una oración verificable.
- Listar cada capítulo con su objetivo, sus secciones H2/H3 exactas y notas de implementación.
- Documentar las decisiones de diseño: por qué este orden, qué se postponó y adónde va.
- Servir como punto de partida para detectar inconsistencias antes de escribir o revisar contenido.

El outline se escribe **antes** de escribir el contenido del nivel y se actualiza cada vez que el contenido cambia. Es la fuente de verdad sobre la intención del nivel.

**Formato mínimo de `outline.md`:**

```markdown
# Outline: LN — Nombre del nivel

## Metadatos
- Prerequisito: ...
- Desbloquea: ...
- Proyectos asociados: ...

## Objetivo
[Una sola oración concreta y verificable]

## Capítulos

### Capítulo 00 — Nombre
**Archivo:** `chapters/00-nombre.md`
**Objetivo:** ...
**Secciones:**
- `## Sección principal`
  - `### Subsección`

**Notas:** ...

## Ejercicios
...

## Decisiones de diseño
...
```

### El capítulo 00 — Introducción

Todo nivel debe tener un capítulo `00-introduccion.md` que establezca:

1. **Qué es este nivel** — en qué contexto del mapa completo aparece.
2. **Qué cubre** — tabla de las secciones con una línea descriptiva por cada una.
3. **Qué toca superficialmente y por qué** — con referencia explícita al nivel donde se profundiza.
4. **Qué no cubre en absoluto y por qué** — mismo criterio.
5. **Cómo trabajarlo** — secciones + ejercicios + proyecto.
6. **El nivel siguiente** — a dónde va el mapa desde acá.

Si existe una introducción general previa al track, este capítulo debe apoyarse en ella y no repetirla completa.

### Cobertura explícita: nada colgado

Cada vez que un tema se introduce de forma parcial o superficial, el texto debe decirlo explícitamente:

- **Si el tema se trata en otro nivel**: citar ese nivel. Ej: *"el formato ELF se cubre en L7, una vez que se tiene el contexto de memoria virtual"*.
- **Si el tema se menciona pero no se enseña**: justificar por qué. Ej: *"malloc aparece aquí solo como herramienta; la mecánica interna del heap es L2"*.
- **Si algo queda sin resolver intencionalmente**: decirlo y decir cuándo se resuelve.

No está permitido que un concepto quede "colgado": presentado, pero sin cierre ni referencia. Todo cabo suelto lleva una etiqueta explícita.

### Tono

- **Técnico pero motivado.** Antes de explicar *cómo* funciona algo, explicar *por qué importa* en el contexto del nivel.
- **Sin condescendencia.** El lector sabe programar; lo que construye Forja es profundidad, no alfabetización.
- **Directo.** Sin padding introductorio del tipo "en esta sección vamos a ver...". El contenido empieza en la primera oración.
- **El laboratorio es el método.** Las secciones no son apuntes de cátedra: son guías de experimentación. Cada concepto tiene un comando para verificarlo o un ejemplo que se puede modificar y observar.
- **Voz consistente.** En niveles teóricos, preferir prosa impersonal o segunda persona consistente, pero no mezclar voseo, tuteo y registros académicos en el mismo texto.
- **Sin épica vacía.** Evitar frases grandilocuentes, slogans y motivación genérica. La importancia del tema se demuestra con consecuencias técnicas concretas.
- **Anclar temprano.** En la primera mitad del capítulo debe aparecer al menos un comando, experimento o artefacto real del repo que aterrice la idea.

### Ejercicios — siempre accionables

Todos los ejercicios deben ser accionables de una de estas dos formas:

1. **Comando con resultado observable**: un comando de shell cuyo output el estudiante puede comparar o interpretar. Puede pedir interpretarlo, modificar algo y observar el cambio, o comparar dos variantes.
2. **Multiple choice con verificación**: una pregunta con opciones, la respuesta correcta marcada, y un comando que permite comprobar la respuesta empíricamente.

**Prohibido**: ejercicios del tipo "describí con tus palabras", "explicá la diferencia entre X e Y", o cualquier cosa que no produzca un resultado verificable. Forja aprende haciendo, no escribiendo ensayos.

Cuando un ejercicio pide escribir una conclusión, esa conclusión debe salir de una observación previa hecha con un comando concreto. El ejercicio no puede depender solo de memoria o intuición.

### Plantilla de README.md de nivel

```markdown
# LN — Nombre del nivel

> El contenido está en `chapters/`. Este README es un documento de diseño interno.
>
> Que es Forja? → `content/theory/forja.md`
> Introducción al Workspace → `content/theory/README.md`
> Diseño curricular → `docs/forja-contenido.md`
> Outline del nivel → `outline.md`

## Estado editorial

- Objetivo del nivel: ...
- Proyecto(s) asociado(s): ...
- Notas de implementación: ...

## Capítulos

| Archivo | Título |
|---|---|
| `chapters/00-introduccion.md` | Introducción |
| `chapters/01-...md` | ... |

Ejercicios en `exercises.md`. Outline en `outline.md`. Meta del nivel en `meta.yaml`.
```
