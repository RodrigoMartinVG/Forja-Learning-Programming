# Convenciones del Repositorio

## Alcance de Base 0

Base 0 deja la forma del repo, no su operatividad completa.

En esta fase:

- si se crea la estructura raiz del monorepo
- si se fijan slugs y convenciones de contenido
- no se agregan archivos de tooling de Base 1
- no se agregan metadatos operativos de Base 2

Eso significa que en Base 0 no aparecen todavia `.devcontainer/`, `meta.yaml`, `project.yaml`, `paths.yaml`, `cross-refs.yaml`, `package.json` ni codigo ejecutable de la web.

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
- `meta.yaml` (desde Base 2 en adelante)

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

- `project.yaml` (desde Base 2 en adelante)
- `c/` y/o `rust/`
- subdirectorios `phase-n/`
- `README.md`, `STUDY_GUIDE.md` e `IMPROVEMENTS.md` dentro de cada fase

## Placeholders en Base 0

En esta fase, los README de cada rama funcionan como placeholders trackeables. Las carpetas concretas de niveles y proyectos se iran materializando a medida que avance el plan o cuando una fase posterior necesite sembrarlas de forma masiva.

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
- La primera línea de cada archivo debe ser un heading `# Título` (sin prefijo numérico). Ese título es el que aparece en el sidebar.
- `README.md` del nivel es un documento de diseño interno (no se muestra en la web cuando existe `chapters/`). Ver plantilla al final de esta sección.

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

### Ejercicios — siempre accionables

Todos los ejercicios deben ser accionables de una de estas dos formas:

1. **Comando con resultado observable**: un comando de shell cuyo output el estudiante puede comparar o interpretar. Puede pedir interpretarlo, modificar algo y observar el cambio, o comparar dos variantes.
2. **Multiple choice con verificación**: una pregunta con opciones, la respuesta correcta marcada, y un comando que permite comprobar la respuesta empíricamente.

**Prohibido**: ejercicios del tipo "describí con tus palabras", "explicá la diferencia entre X e Y", o cualquier cosa que no produzca un resultado verificable. Forja aprende haciendo, no escribiendo ensayos.

### Plantilla de README.md de nivel

```markdown
# LN — Nombre del nivel

> El contenido está en `chapters/`. Este README es un documento de diseño interno.
>
> Diseño curricular → `docs/forja-contenido.md`
> Outline del nivel → `outline.md`

## Capítulos

| Archivo | Título |
|---|---|
| `chapters/00-introduccion.md` | Introducción |
| `chapters/01-...md` | ... |

Ejercicios en `exercises.md`. Outline en `outline.md`. Meta del nivel en `meta.yaml`.
```
