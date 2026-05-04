# Ejercicio 07 — Una posición, dos roles

## Contexto

El [capítulo 02](../chapters/02-memoria.md) sostuvo que el rol de una posición de memoria —si su contenido se interpreta como instrucción o como dato— no está pegado a la materia, sino que se decide en el momento del uso. Una posición que el `pc` señala durante un fetch se interpreta como instrucción; la misma posición, si una instrucción la nombra como operando de un `LOAD`, se interpreta como dato. La materia es la misma; el rol cambia.

Este ejercicio fija esa idea sobre un programa concreto donde una posición de memoria es leída primero como instrucción y luego como dato. Identificar el momento exacto del cambio de rol es la habilidad de fondo.

## Programa

| dirección | contenido (interpretado nominalmente) |
| --------- | ------------------------------------- |
| 0 | `MOV r0, 1` |
| 1 | `MOV r1, 3` |
| 2 | `ADD r0, r1` |
| 3 | `LOAD r0, [2]` |
| 4 | `(fin)` |

Estado inicial: `pc = 0`, `r0 = 0`, `r1 = 0`.

(Nota: el contenido de `mem[2]` está escrito en la tabla como una instrucción nominal, `ADD r0, r1`. En el modelo del nivel se asume que esa instrucción tiene una representación numérica concreta —algún valor— que puede leerse, llegado el caso, también como dato. No es necesario fijar cuál es ese valor para hacer el ejercicio; basta con reconocer que existe.)

## Consigna

Responder:

1. ¿En qué paso la posición `mem[2]` es leída como **instrucción**?
2. ¿En qué paso la posición `mem[2]` es leída como **dato**?
3. ¿Cuál es la diferencia mecánica entre las dos lecturas? Específicamente: ¿qué pieza del estado señala cada lectura, y qué subpaso del ciclo `fetch-decode-execute` la realiza?
4. ¿La posición `mem[2]` se modifica entre las dos lecturas? Justificar mirando el programa.
5. Si después de este programa otro programa cargara código en otras posiciones y volviera a saltar a `pc = 2`, ¿qué se ejecutaría?

## Resultado esperado

Cinco respuestas cortas, cada una específica sobre el paso, la pieza del estado o el subpaso involucrado.

## Verificación

**1.** En el **paso 3**. Antes de ese paso, `pc = 2`, así que el fetch del paso 3 lee `mem[2]` como instrucción. La instrucción reconocida es `ADD r0, r1`, que se ejecuta en ese paso.

**2.** En el **paso 4**. La instrucción aplicada en ese paso es `LOAD r0, [2]`, que durante su execute lee `mem[2]` para obtener un valor —ese valor es el que termina almacenado en `r0`. La lectura ocurre con la posición tratada como dato.

**3.** En el paso 3, la pieza del estado que señala `mem[2]` es el `pc` (que vale 2 al iniciar el paso), y la lectura ocurre durante el subpaso **fetch**. En el paso 4, la pieza que señala `mem[2]` es el operando inmediato de la instrucción `LOAD` (la dirección `2` está en la propia codificación de la instrucción), y la lectura ocurre durante el subpaso **execute**, no durante fetch. Las dos lecturas son del mismo lugar de memoria; difieren en quién las pidió y en qué subpaso ocurrieron.

**4.** **No.** El programa no contiene ningún `STORE ..., [2]` ni ninguna otra instrucción que escriba en la posición 2. Entre las dos lecturas, el contenido de `mem[2]` permanece igual.

**5.** Se ejecutaría exactamente lo mismo que en el paso 3 original: la instrucción `ADD r0, r1`. La posición de memoria sigue conteniendo lo que contenía; un fetch desde `pc = 2` la traería como instrucción y la ejecutaría como tal. El hecho de que un `LOAD` haya leído esa posición como dato en un paso intermedio no cambia su contenido (los `LOAD` son lecturas, no destructivas).

Una observación que cierra la lectura del ejercicio: la posición `mem[2]` no es "más" instrucción o "más" dato según cuántas veces se la haya leído de cada modo. Cada lectura es un acto independiente; el rol de la posición se decide en cada acto. Si una persona internalizó esto, no debería sorprenderse cuando, en niveles posteriores, aparezcan punteros a función que toman direcciones (datos) y las saltan al `pc` (volviéndolas roles de instrucción), o JIT compilers que escriben código nuevo en direcciones (escritura de memoria) y luego saltan ahí.

## Criterio de finalización

Las cinco respuestas son correctas. Especialmente la pregunta 3, sobre qué subpaso realiza cada lectura, debe distinguir fetch (paso 3) de execute (paso 4) sin colapsar las dos.
