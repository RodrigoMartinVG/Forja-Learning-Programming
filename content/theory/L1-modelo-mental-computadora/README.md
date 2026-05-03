# L1 - Modelo mental de una computadora

> Autoría del nivel abierta en `outline.md`.
>
> Este README sigue funcionando como documento de diseño interno, aunque el nivel ya tenga capítulos y ejercicios renderizables.
>
> Diseño curricular -> `docs/forja-contenido.md`
> Introducción general -> `content/theory/README.md`
> Outline del nivel -> `outline.md`
> Diseño del simulador -> `simulador.md`

## Estado editorial

- Objetivo del nivel: fijar el modelo mental mínimo de CPU, registros, memoria, direcciones y programa en ejecución antes de abrir `L2`, `L3` y `L7`.
- Proyecto asociado: ninguno.
- Estado actual: `outline.md`, los capítulos `00` a `04`, los ejercicios `01` a `05` y una primera implementación del simulador con carga, stepping manual y ejecución continua en `Web Worker` ya existen; los artefactos de `src/` siguen pendientes.
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

## Ejercicios del nivel

| Archivo | Título | Nota |
|---|---|---|
| `exercises/01-seguir-una-traza.md` | Seguir una traza simple | Seguir cambios de `pc`, registros y memoria paso a paso. |
| `exercises/02-distinguir-las-piezas.md` | Distinguir las piezas | Separar CPU, registros, memoria, direcciones, código y datos. |
| `exercises/03-salto-condicional.md` | Leer un salto condicional | Decidir cómo cambia el `pc` cuando hay bifurcación. |
| `exercises/04-source-codigo-y-proceso.md` | Separar source, código y proceso | No mezclar texto fuente, memoria cargada, datos y ejecución. |
| `exercises/05-comparar-estados.md` | Comparar dos estados | Distinguir cambios de código, estado de ejecución y datos. |

## Próximo paso

Derivar `src/` con fragmentos mínimos que acompañen las trazas y distinciones del nivel, y extender la solapa `simulador` con mejores trazas didácticas, escenarios curriculares y la evolución prevista para niveles posteriores.
