# L1 - Modelo mental de una computadora

> Autoría del nivel abierta en `outline.md`.
>
> Este README sigue funcionando como documento de diseño interno hasta que existan `chapters/` y contenido teórico renderizable.
>
> Diseño curricular -> `docs/forja-contenido.md`
> Introducción general -> `content/theory/README.md`
> Outline del nivel -> `outline.md`

## Estado editorial

- Objetivo del nivel: fijar el modelo mental mínimo de CPU, registros, memoria, direcciones y programa en ejecución antes de abrir `L2`, `L3` y `L7`.
- Proyecto asociado: ninguno.
- Estado actual: `outline.md`, `chapters/00-introduccion.md`, `chapters/01-maquina-de-estado.md`, `chapters/02-cpu-registros-memoria.md` y `chapters/03-fetch-decode-execute.md` ya existen; el resto de capítulos, ejercicios y artefactos siguen pendientes.
- Nota de alcance: `L1` sigue siendo una unidad conceptual base. No debe absorber representación binaria, compilación ni assembly más allá de lo mínimo necesario para ubicar el mapa.

## Prerequisitos

- L0

## Proyectos asociados

- Sin proyectos asociados todavía.

## Capítulos del nivel

| Archivo | Título | Nota |
|---|---|---|
| `chapters/00-introduccion.md` | Introducción | Ubica L1 en el mapa y fija su alcance. |
| `chapters/01-maquina-de-estado.md` | La computadora como máquina de estado | Estado, instrucciones y transiciones como modelo mínimo. |
| `chapters/02-cpu-registros-memoria.md` | CPU, registros y memoria | Roles distintos antes de punteros y representación binaria. |
| `chapters/03-fetch-decode-execute.md` | El ciclo fetch-decode-execute | Trazas concretas de cambio de estado. |
| `chapters/04-codigo-datos-programa.md` | Código, datos y programa en ejecución | Source, memoria cargada y proceso como programa con estado. |

## Próximo paso

Abrir `04-codigo-datos-programa.md` y, recién después, derivar `exercises.md` y los artefactos de `src/` sin perder el recorte conceptual del nivel.
