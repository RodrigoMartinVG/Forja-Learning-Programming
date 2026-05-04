# Ejercicio 02 — Identificar la clase de instrucción

## Contexto

El [capítulo 04](../chapters/04-instrucciones-operandos.md) organizó las instrucciones del ISA de juguete en cuatro clases —movimiento, acceso a memoria, aritmética, control de flujo— y cerró con una tabla que predice, para cada instrucción, qué columnas de la traza va a tocar. Este ejercicio comprueba si esa taxonomía está disponible para reconocimiento directo, sin tener que ejecutar la instrucción mentalmente paso a paso.

Es un ejercicio breve y de respuesta cerrada. Su valor está en hacer explícita la lectura: ante una instrucción, la pregunta es *"¿qué clase es y qué partes del estado modifica?"*, no *"¿qué hace?"*.

## Consigna

Para cada una de las seis instrucciones que siguen, indicar:

1. La **clase** a la que pertenece, eligiendo entre `movimiento`, `acceso a memoria`, `aritmética` o `control de flujo`.
2. Las **partes del estado que modifica** (registros, posiciones de memoria, `pc` con valor no secuencial). Marcar todas las que apliquen.

Las seis instrucciones:

- (a) `MOV r2, r0`
- (b) `STORE r1, [60]`
- (c) `JMP 10`
- (d) `ADD r0, r1`
- (e) `LOAD r1, [70]`
- (f) `JNZ r0, 3`

## Resultado esperado

Una tabla de seis filas y tres columnas: *instrucción*, *clase*, *partes del estado que modifica*. Para la última columna, ser específico: si una instrucción modifica un registro, decir cuál; si modifica memoria, indicar la posición; si modifica el `pc` con un valor no secuencial, anotarlo.

## Verificación

| instrucción | clase | modifica |
| ----------- | ----- | -------- |
| `MOV r2, r0` | movimiento | `r2` |
| `STORE r1, [60]` | acceso a memoria | `mem[60]` |
| `JMP 10` | control de flujo | `pc` (con valor 10, salto incondicional) |
| `ADD r0, r1` | aritmética | `r0` |
| `LOAD r1, [70]` | acceso a memoria | `r1` |
| `JNZ r0, 3` | control de flujo | `pc` (condicional: si `r0 ≠ 0`, queda en 3; si `r0 = 0`, avance secuencial) |

Una nota sobre `JNZ`: como el cambio del `pc` es condicional, depende del estado al momento de ejecutar. La respuesta correcta menciona ambas posibilidades, no una sola. Si la respuesta sólo menciona el caso del salto, falta reconocer que la instrucción puede no saltar.

Errores típicos a registrar si aparecen: confundir `MOV` con `LOAD` (los dos copian, pero `MOV` no toca memoria); confundir `LOAD` con `STORE` (los dos involucran memoria y un registro, pero la dirección del cambio es opuesta); creer que `ADD r0, r1` modifica también `r1` (no, sólo lee `r1`); creer que `JMP` modifica algún registro (no, sólo el `pc`).

## Criterio de finalización

Las seis filas son correctas en clase y modificación. Si alguna estuvo errada, queda anotada con la confusión específica que la produjo.
