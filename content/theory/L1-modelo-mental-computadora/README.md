# L1 — Modelo mental de una computadora

> Documento de diseño interno del nivel. Voz y prosa: [estandar_editorial_forja.md](../../../estandar_editorial_forja.md). Estructura: [CONVENTIONS.md](../../../CONVENTIONS.md). Plan de capítulos y ejercicios: [outline.md](outline.md).

## Estado editorial

- Authoría real abierta.
- Outline aprobado en mayo de 2026.
- Capítulos `chapters/00`–`chapters/07` redactados.
- Ejercicios en `exercises/` con un archivo por consigna.

## Prerrequisitos

[`L0`](../L0-setup-laboratorio/) completo. El nivel asume que la persona tiene el laboratorio abierto, el devcontainer activo y la rutina de arranque del [capítulo 04 de `L0`](../L0-setup-laboratorio/chapters/04-workflow.md) instalada como costumbre.

## Bloque editorial de entrada recomendado

Antes de empezar `L1`, leer [¿qué es Forja?](../../intro/forja/forja.md) y la [introducción al Workspace](../../intro/workspace/workspace.md). Esos dos archivos sitúan a Forja como track y a este nivel como el punto donde se construye el modelo mental que el resto va a asumir disponible.

## Objetivo del nivel

Que la persona pueda describir un programa en ejecución como una máquina de estado mínima donde CPU, registros, memoria, instrucciones y `pc` cambian según un ciclo observable, sin necesitar todavía representación binaria precisa ni assembly real.

## Capítulos

1. [Por qué este nivel existe](chapters/00-introduccion.md)
2. [La computadora como máquina de estado](chapters/01-maquina-de-estado.md)
3. [Memoria como espacio direccionable](chapters/02-memoria.md)
4. [CPU y registros](chapters/03-cpu-registros.md)
5. [Instrucciones y operandos](chapters/04-instrucciones-operandos.md)
6. [El ciclo fetch-decode-execute](chapters/05-fetch-decode-execute.md)
7. [Flujo de control: program counter, saltos y loops](chapters/06-flujo-de-control.md)
8. [Código, datos y programa en ejecución](chapters/07-codigo-datos-programa.md)

## Ejercicios

Los ejercicios viven en [exercises/](exercises/), un archivo por consigna. Cada uno produce evidencia observable (traza completada, clasificación contra criterio, predicción contra ejecución) o es multiple choice con verificación. La materialidad principal del nivel es la **traza tabular de estado**: casi todos los ejercicios producen o leen una.

## Pieza interactiva

La solapa `simulador` del nivel ejecuta el ISA de juguete paso a paso y muestra el estado completo (registros, memoria, `pc`) en cada transición. Es apoyo de observación para los ejercicios; no reemplaza los capítulos. Diseño en [simulador.md](simulador.md), [simulador-layouts.md](simulador-layouts.md) y [simulator-presets/](simulator-presets/).

## Proyecto asociado

Ninguno. `L1` es puramente conceptual y produce el lenguaje de estado que `L2`, `L3` y `L7` van a tomar como base.

## Próximo paso después de `L1`

[`L2` — Representación de la información](../L2-representacion-informacion/) profundiza la idea —ya instalada acá como distinción rol/interpretación— de que el patrón material no trae interpretación pegada. Bits, bytes, endianness y convenciones de lectura aparecen en `L2` apoyados directamente sobre el estado mínimo que `L1` deja firme. Entrar a `L2` sin haber estabilizado este modelo vuelve la representación binaria un ejercicio de notación en vez de una elección de lectura sobre material previamente comprendido.

Más adelante, [`L3`](../L3-pipeline-compilacion-c/) usa la separación entre source, código cargado y proceso del [capítulo 07](chapters/07-codigo-datos-programa.md) como base directa del pipeline de compilación. [`L7`](../L7-alfabetizacion-assembly/) reemplaza el ISA de juguete por x86-64 real sin tener que reconstruir el modelo, sólo refinarlo.

## Notas de mantenimiento

- El ISA de juguete (instrucciones nominales `LOAD`, `STORE`, `MOV`, `ADD`, `SUB`, `JMP`, `JNZ`) debe usarse de forma consistente entre capítulos. Si se introduce una variante, revisar todos los capítulos donde aparezca.
- La traza tabular es la forma material principal. Si un capítulo deja de tener al menos una traza, el nivel pierde su materialidad central (v2 §R3).
- No mencionar x86, ARM ni ninguna ISA real más allá de la nota breve en la introducción. Esa frontera la cruza `L7`, no `L1`.
- La transición a `L2` vive en este README, no en los capítulos.
