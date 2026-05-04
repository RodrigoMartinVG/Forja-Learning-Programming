# Ejercicio 03 — Distinguir registro de memoria

## Contexto

El [capítulo 03](../chapters/03-cpu-registros.md) puso a registros y memoria como piezas funcionalmente distintas del estado, y dejó como ejercicio implícito poder mirar una traza y reconocer dónde vivió el cambio en cada paso. Este ejercicio hace esa lectura explícita.

El valor del ejercicio no está en ejecutar trazas —ya están dadas— sino en clasificar los cambios. La pregunta operativa para cada traza es: *"¿el trabajo principal de esta secuencia ocurrió en registros, en memoria, o en ambos?"*. La distinción no es académica: predice qué tipo de fenómenos van a aparecer cuando, en niveles posteriores, se discuta performance, calling conventions o layout de proceso.

## Consigna

Para cada una de las tres trazas siguientes, indicar:

1. Si el cambio principal entre la fila *inicio* y la fila final ocurrió **sólo en registros**, **sólo en memoria**, o **en ambos**.
2. Una justificación corta (una o dos oraciones) apoyada en filas concretas de la traza, no en la lectura del programa.

### Traza A

Programa: `MOV r0, 5`, `MOV r1, r0`, `ADD r0, r1`, `(fin)`. Estado inicial: `pc = 0`, `r0 = 0`, `r1 = 0`, `mem[40] = 7` (no se toca).

| momento | `pc` | `r0` | `r1` | `mem[40]` |
| ------- | ---- | ---- | ---- | --------- |
| inicio       | 0 | 0  | 0 | 7 |
| tras paso 1  | 1 | 5  | 0 | 7 |
| tras paso 2  | 2 | 5  | 5 | 7 |
| tras paso 3  | 3 | 10 | 5 | 7 |

### Traza B

Programa: `LOAD r0, [40]`, `STORE r0, [41]`, `(fin)`. Estado inicial: `pc = 0`, `r0 = 0`, `mem[40] = 99`, `mem[41] = 0`.

| momento | `pc` | `r0` | `mem[40]` | `mem[41]` |
| ------- | ---- | ---- | --------- | --------- |
| inicio       | 0 | 0  | 99 | 0  |
| tras paso 1  | 1 | 99 | 99 | 0  |
| tras paso 2  | 2 | 99 | 99 | 99 |

### Traza C

Programa: `LOAD r0, [40]`, `ADD r0, 3`, `STORE r0, [40]`, `(fin)`. Estado inicial: `pc = 0`, `r0 = 0`, `mem[40] = 12`.

| momento | `pc` | `r0` | `mem[40]` |
| ------- | ---- | ---- | --------- |
| inicio       | 0 | 0  | 12 |
| tras paso 1  | 1 | 12 | 12 |
| tras paso 2  | 2 | 15 | 12 |
| tras paso 3  | 3 | 15 | 15 |

## Resultado esperado

Tres respuestas, una por traza, cada una con clasificación (sólo registros / sólo memoria / ambos) y justificación corta.

## Verificación

**Traza A**: sólo registros. Justificación: la columna `mem[40]` mantiene el valor 7 en las cuatro filas; los cambios entre filas viven todos en `r0` o `r1`.

**Traza B**: ambos. Justificación: `r0` cambió en el paso 1 (de 0 a 99) y `mem[41]` cambió en el paso 2 (de 0 a 99). Aunque `mem[40]` no cambió, hubo lectura sobre memoria en el paso 1; eso solo no contaría, pero la escritura sobre `mem[41]` en el paso 2 sí cuenta como modificación de memoria.

**Traza C**: ambos. Justificación: `r0` cambia en los pasos 1 y 2 (lectura desde memoria, luego suma), y `mem[40]` cambia en el paso 3 (`STORE`). La traza pasa por ambos lados aunque el resultado final sea como un "incremento" sobre `mem[40]`.

Un error frecuente en la traza C: clasificarla como "sólo memoria" mirando que el cambio neto entre la fila inicial y la final ocurrió en `mem[40]`. Pero el ejercicio pide ver dónde vivió el cambio entre filas intermedias, no sólo la diferencia entre inicio y final. Los cambios intermedios en `r0` cuentan; sin ellos, el `STORE` final no habría tenido valor que escribir.

## Criterio de finalización

Las tres clasificaciones son correctas y las justificaciones citan filas concretas. Si alguna se contestó "neto" en lugar de "fila por fila", queda registrada esa diferencia de lectura como nota al margen.
