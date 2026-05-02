# Outline: L0 - Setup del laboratorio

## Metadatos
- Prerequisitos: ninguno.
- Introduccion al Workspace recomendada: `content/theory/README.md`.
- Proyectos asociados: devcontainer-setup.
- Resultado esperado: un laboratorio reproducible, verificable y entendible.
- Desbloquea: `L1`.

## Objetivo

Que la persona pueda abrir el repo en el devcontainer, localizar los archivos que definen el entorno, ejecutar la verificacion base y elegir el siguiente paso de diagnostico sin confundir problemas de laboratorio con problemas de codigo.

## Preguntas guia

- Que problema resuelve un devcontainer en Forja.
- Que partes del entorno viven en el repo y cuales viven en la imagen o en el contenedor.
- Como comprobar rapidamente si el laboratorio esta sano.
- Como recuperarse cuando el entorno deja de coincidir con lo que declara el repo.

## Capitulos

### Capitulo 00 - Introduccion
**Archivo:** `chapters/00-introduccion.md`
**Objetivo:** ubicar L0 en el mapa, explicitar que cubre, que no cubre y como se trabaja.
**Secciones:**
- `## Que es este nivel`
- `## Que cubre`
- `## Que toca superficialmente y por que`
- `## Que no cubre y por que`
- `## Como trabajarlo`
- `## El nivel siguiente`

**Notas:** se apoya en `content/theory/README.md` como introduccion general previa al track y no repite toda la presentacion de Forja.

### Capitulo 01 - El devcontainer como contrato de trabajo
**Archivo:** `chapters/01-devcontainer.md`
**Objetivo:** ubicar Dockerfile, `devcontainer.json`, workspace montado y toolchain declarada.
**Secciones:**
- `## Los archivos que definen el entorno`
- `## Imagen, contenedor y workspace`
- `## Que persiste y que se reconstruye`
- `## Comprobacion rapida`
- `## Donde mirar cuando algo no coincide`

**Notas:** este capitulo debe anclar rapido en archivos reales del repo con `ls`, `sed` y `jq`.

### Capitulo 02 - Workflow del dia cero
**Archivo:** `chapters/02-workflow.md`
**Objetivo:** convertir la teoria del entorno en una rutina operativa corta.
**Secciones:**
- `## Secuencia minima de arranque`
- `## Verificacion con verify-setup.sh`
- `## Un primer sanity check manual`
- `## Que evidencia conviene guardar`

**Notas:** el flujo debe terminar en comandos concretos que puedan repetirse despues sin releer todo el capitulo.

### Capitulo 03 - Diagnostico y recuperacion
**Archivo:** `chapters/03-diagnostico.md`
**Objetivo:** dar un playbook inicial para errores de entorno frecuentes.
**Secciones:**
- `## Fallos de arranque`
- `## Herramienta declarada pero no disponible`
- `## Cambios en Dockerfile que no aparecen`
- `## Host y contenedor diciendo cosas distintas`

**Notas:** cada caso debe quedar ligado a una cadena de evidencia corta y repetible.

## Ejercicios

- Comparar que archivo declara la instalacion de herramientas y cual describe la apertura del contenedor.
- Verificar que `verify-setup.sh` formaliza el contrato base y distinguirlo del snapshot manual.
- Confirmar con evidencia que nightly y miri no forman parte del perfil base por defecto.
- Proponer un check nuevo para `devcontainer-setup` usando el formato observable del repo.

## Decisiones de diseno

- L0 no es un curso de Docker; es una unidad para usar el laboratorio con criterio.
- La introduccion general del track vive fuera del nivel para no forzar a `L0` a cargar todo el contexto de entrada.
- El `README.md` del nivel vuelve a ser un documento interno; el contexto para quien estudia vive en `00-introduccion.md`.
- Los ejercicios de L0 quedan restringidos a verificaciones observables y multiple choice comprobable.
