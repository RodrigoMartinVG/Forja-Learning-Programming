# Ejercicio 05 — Reconocer un loop en una traza

## Contexto

El [capítulo 06](../chapters/06-flujo-de-control.md) sostuvo que los loops emergen como consecuencia de saltos hacia atrás bajo cierta condición, no como construcciones aparte. Una persona que internalizó esa idea debería poder mirar una traza larga y, sin haber visto el programa correspondiente, **reconocer la presencia del loop**, identificar su cuerpo, su condición de salida y el número de iteraciones que ejecutó.

Este ejercicio pone a prueba exactamente esa lectura. Se da una traza; el programa se da después, sólo para verificación.

## Traza dada

| momento | `pc` | `r0` | `r1` | `mem[50]` |
| ------- | ---- | ---- | ---- | --------- |
| inicio        | 0  | 0 | 0 | 0 |
| tras paso 1   | 1  | 5 | 0 | 0 |
| tras paso 2   | 2  | 5 | 1 | 0 |
| tras paso 3   | 3  | 4 | 1 | 0 |
| tras paso 4   | 2  | 4 | 1 | 0 |
| tras paso 5   | 3  | 4 | 2 | 0 |
| tras paso 6   | 4  | 3 | 2 | 0 |
| tras paso 7   | 2  | 3 | 2 | 0 |

(Nota: la traza se corta acá deliberadamente. El loop no termina en el rango mostrado.)

## Consigna

Responder, basándose **sólo en la traza**:

1. ¿Hay un loop en esta ejecución? ¿Cómo se reconoce en la traza?
2. ¿Qué rango de direcciones forma el cuerpo del loop?
3. ¿Cuántas iteraciones del cuerpo del loop se ejecutaron en los siete pasos mostrados?
4. ¿Qué columnas del estado cambian en cada iteración? ¿Hay alguna columna que no cambia entre iteración e iteración?
5. Especular —sin certeza, basándose sólo en lo observado— qué condición debería volverse falsa para que el loop termine.

## Resultado esperado

Cinco respuestas cortas, cada una apoyada en filas concretas de la traza.

## Verificación

**1. ¿Hay loop?** Sí. Se reconoce porque el `pc` oscila entre los valores 2, 3 y 4 (con un primer paso de inicialización en `pc = 1`), volviendo periódicamente al mismo conjunto de direcciones. Específicamente, después del paso 3 el `pc` es 3, después del paso 4 vuelve a ser 2, después del paso 5 a 3, después del paso 7 vuelve a 2 —el patrón de oscilación es la marca del loop.

**2. Cuerpo del loop.** El cuerpo va de la dirección 2 a la 3 (las direcciones que el `pc` oscila visitando). La dirección 4 aparece después del paso 6, indicando que en algún momento el flujo se desvía hacia ahí —probablemente porque la dirección 3 contiene un `JNZ` que decide si retornar al cuerpo (saltar a 2) o continuar a la siguiente posición (4).

(Nota cuidadosa: con la traza dada, una lectura razonable es que el cuerpo es 2 → 3 con `JNZ` en 3 que salta a 2, y la dirección 4 sería *fuera del loop*, alcanzada cuando el `pc` avance secuencialmente desde 3. Pero la traza muestra `pc = 4` después del paso 6 y luego `pc = 2` después del paso 7, lo que sugiere otra interpretación: el cuerpo va de 2 a 4, con un `JNZ` en 4 que salta a 2. Las dos lecturas son legítimas con la información dada; lo importante para el ejercicio es que la respuesta cite la oscilación del `pc` como evidencia.)

**3. Iteraciones ejecutadas.** Tres. Después del paso de inicialización (paso 1, `pc = 0 → 1`), el `pc` entra al cuerpo en el paso 2 y completa una iteración (pasos 2 y 3, llegando a `pc = 3`). El paso 4 vuelve el `pc` a 2 (segunda iteración inicia). El paso 7 vuelve el `pc` a 2 (tercera iteración inicia). Hay tres entradas al cuerpo del loop en los siete pasos mostrados.

**4. Columnas que cambian / no cambian.** En cada iteración, `r0` decrece (de 5 a 4 a 3) y `r1` crece (de 0 a 1 a 2). La columna `mem[50]` se mantiene constante en 0 durante toda la traza. La columna `pc` oscila siguiendo el flujo del loop.

**5. Condición especulada.** Como `r0` decrece en cada iteración, una hipótesis razonable es que la condición de salida sea *cuando `r0` llegue a 0*. Si el `JNZ` que cierra el loop evalúa `r0`, va a salir cuando `r0 = 0`. Como `r0` empezó en 5 y decrece en 1 por iteración, deberían faltar tres iteraciones más para que el loop termine.

(Otra hipótesis: el `JNZ` podría evaluar otro registro, o la condición podría involucrar memoria. Sin más traza, no se puede descartar. Una respuesta cuidadosa menciona que `r0` es la sospecha principal pero no la única posibilidad.)

## Programa correspondiente (para verificación post-respuesta)

| dirección | contenido |
| --------- | --------- |
| 0 | `MOV r0, 5` |
| 1 | `MOV r1, 0` |
| 2 | `ADD r1, 1` |
| 3 | `SUB r0, 1` |
| 4 | `JNZ r0, 2` |
| 5 | `(fin)` |

Esto confirma la lectura: el cuerpo va de la dirección 2 a la 4, con `JNZ r0, 2` cerrando el loop. El loop termina cuando `r0` llega a 0, después de cinco iteraciones totales (tres ya ejecutadas en la traza dada, dos faltantes). La columna `mem[50]` no cambiaba porque el programa no la toca.

## Criterio de finalización

Las cinco respuestas se justifican apoyándose en la traza. La identificación del cuerpo y el número de iteraciones es correcta o, si difiere, la diferencia se explica por la ambigüedad genuina de la traza (cuerpo 2-3 vs cuerpo 2-4). La especulación sobre la condición de salida está fundada en la observación de qué columnas cambian.
