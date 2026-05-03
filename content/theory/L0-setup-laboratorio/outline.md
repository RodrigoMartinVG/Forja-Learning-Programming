# Outline: L0 - Setup del laboratorio

## Metadatos
- Prerequisitos: ninguno.
- Introducción al Workspace recomendada: `content/theory/README.md`.
- Proyectos asociados: devcontainer-setup.
- Resultado esperado: un laboratorio reproducible, verificable y entendible.
- Desbloquea: `L1`.

## Objetivo

Que la persona pueda abrir el repo en el devcontainer, localizar los archivos que definen el entorno, ejecutar la verificación base y elegir el siguiente paso de diagnóstico sin confundir problemas de laboratorio con problemas de código.

## Preguntas guía

- Qué problema resuelve un devcontainer en Forja.
- Qué partes del entorno viven en el repo y cuáles viven en la imagen o en el contenedor.
- Cómo comprobar rápidamente si el laboratorio está sano.
- Cómo recuperarse cuando el entorno deja de coincidir con lo que declara el repo.

## Capítulos

### Capítulo 00 - Introducción
**Archivo:** `chapters/00-introduccion.md`
**Objetivo:** ubicar L0 en el mapa, explicitar qué cubre, qué no cubre y cómo se trabaja.
**Secciones:**
- `## Qué es este nivel`
- `## Qué cubre`
- `## Qué toca superficialmente y por qué`
- `## Qué no cubre y por qué`
- `## Cómo trabajarlo`
- `## El nivel siguiente`

**Notas:** se apoya en `content/theory/README.md` como introducción general previa al track y no repite toda la presentación de Forja.

### Capítulo 01 - El devcontainer como contrato de trabajo
**Archivo:** `chapters/01-devcontainer.md`
**Objetivo:** ubicar Dockerfile, `devcontainer.json`, workspace montado y toolchain declarada.
**Secciones:**
- `## Los archivos que definen el entorno`
- `## Imagen, contenedor y workspace`
- `## Qué persiste y qué se reconstruye`
- `## Comprobación rápida`
- `## Dónde mirar cuando algo no coincide`

**Notas:** este capítulo debe anclar rápido en archivos reales del repo con `ls`, `sed` y `jq`.

### Capítulo 02 - Workflow del día cero
**Archivo:** `chapters/02-workflow.md`
**Objetivo:** convertir la teoría del entorno en una rutina operativa corta.
**Secciones:**
- `## Secuencia mínima de arranque`
- `## Verificación con verify-setup.sh`
- `## Un primer sanity check manual`
- `## Qué evidencia conviene guardar`

**Notas:** el flujo debe terminar en comandos concretos que puedan repetirse después sin releer todo el capítulo.

### Capítulo 03 - Diagnóstico y recuperación
**Archivo:** `chapters/03-diagnostico.md`
**Objetivo:** dar un playbook inicial para errores de entorno frecuentes.
**Secciones:**
- `## Fallos de arranque`
- `## Herramienta declarada pero no disponible`
- `## Cambios en Dockerfile que no aparecen`
- `## Host y contenedor diciendo cosas distintas`

**Notas:** cada caso debe quedar ligado a una cadena de evidencia corta y repetible.

## Ejercicios

- Comparar qué archivo declara la instalación de herramientas y cuál describe la apertura del contenedor.
- Verificar que `verify-setup.sh` formaliza el contrato base y distinguirlo del snapshot manual.
- Confirmar con evidencia que nightly y miri no forman parte del perfil base por defecto.
- Proponer un check nuevo para `devcontainer-setup` usando el formato observable del repo.

## Decisiones de diseño

- L0 no es un curso de Docker; es una unidad para usar el laboratorio con criterio.
- La introducción general del track vive fuera del nivel para no forzar a `L0` a cargar todo el contexto de entrada.
- El `README.md` del nivel vuelve a ser un documento interno; el contexto para quien estudia vive en `00-introduccion.md`.
- Los ejercicios de L0 quedan restringidos a verificaciones observables y multiple choice comprobable.
