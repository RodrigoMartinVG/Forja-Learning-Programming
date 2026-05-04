# Ejercicio 09 — Comparar dos snapshots

## Contexto

Este ejercicio invierte la habilidad de los ejercicios anteriores. En lugar de partir de un programa y construir una traza, se parte de dos **snapshots** del mismo proceso —dos filas de la traza, separadas por dos pasos— y se infiere qué cambió, sin ver las instrucciones que produjeron los cambios.

La habilidad que pone a prueba: leer una diferencia de estado y clasificarla por tipo (cambios en registros, en memoria, en `pc`) sin colapsar todo bajo "el programa cambió". El programa nunca cambia entre snapshots: lo que cambia es el estado del proceso.

## Snapshots

Para cada uno de los tres casos siguientes, se dan dos filas de la traza separadas por dos pasos. El proceso es el mismo (es decir, el programa cargado en memoria no cambia entre las dos filas; lo único que cambia es el estado).

### Caso A

| momento | `pc` | `r0` | `r1` | `mem[40]` | `mem[50]` |
| ------- | ---- | ---- | ---- | --------- | --------- |
| snapshot A1 | 5 | 7 | 3 | 12 | 0 |
| snapshot A2 | 7 | 7 | 3 | 12 | 0 |

### Caso B

| momento | `pc` | `r0` | `r1` | `mem[40]` | `mem[50]` |
| ------- | ---- | ---- | ---- | --------- | --------- |
| snapshot B1 | 5 | 7 | 3 | 12 | 0  |
| snapshot B2 | 7 | 7 | 3 | 12 | 99 |

### Caso C

| momento | `pc` | `r0` | `r1` | `mem[40]` | `mem[50]` |
| ------- | ---- | ---- | ---- | --------- | --------- |
| snapshot C1 | 5 | 7 | 3  | 12 | 0 |
| snapshot C2 | 3 | 8 | 10 | 15 | 0 |

## Consigna

Para cada caso, indicar:

1. Qué columnas cambiaron entre snapshot 1 y snapshot 2.
2. Qué tipo de cambio ocurrió: sólo en registros, sólo en memoria, sólo en `pc`, o combinaciones.
3. Una interpretación corta sobre el flujo: ¿el `pc` avanzó secuencialmente, hubo un salto hacia adelante, hubo un salto hacia atrás? ¿Cuántos pasos parece haber dado el proceso entre los dos snapshots?

## Resultado esperado

Tres respuestas, una por caso, cada una con identificación clara de qué cambió y qué tipo de movimiento del `pc` ocurrió.

## Verificación

**Caso A.**

Cambió: sólo el `pc` (de 5 a 7). Tipo: sólo en `pc`. El `pc` avanzó dos posiciones, lo que es consistente con dos pasos de avance secuencial. Lo que hicieron las instrucciones de las direcciones 5 y 6 fue lo suficientemente "neutro" para los registros y la memoria mostrados como para no haber cambiado nada visible —pero hicieron algo, porque el proceso ejecutó dos pasos. Posibilidades: pueden haber escrito en posiciones de memoria no mostradas en la tabla, o pueden haber sido instrucciones que no cambiaron nada del estado observado (raro; pocas instrucciones del ISA del nivel no cambian nada).

**Caso B.**

Cambió: el `pc` (5 → 7) y `mem[50]` (0 → 99). Tipo: en `pc` y en memoria. El `pc` avanzó dos posiciones (consistente con dos pasos secuenciales). El cambio en `mem[50]` sugiere que una de las dos instrucciones ejecutadas fue un `STORE r〈algo〉, [50]` con un valor que terminó siendo 99. Como `r0` vale 7 y `r1` vale 3 en ambos snapshots, ninguno de los dos era 99 en el momento de la escritura, lo que sugiere que el `STORE` se hizo después de que algún registro tuviera 99 y antes de que ese mismo registro se restableciera. (También es posible que el valor 99 fuera escrito por una instrucción aritmética con inmediato, o que viniera de otra posición de memoria no mostrada.)

**Caso C.**

Cambió: el `pc` (5 → 3, **hacia atrás**), `r0` (7 → 8), `r1` (3 → 10), `mem[40]` (12 → 15). Tipo: en todas las categorías —`pc`, registros y memoria. El `pc` retrocedió, lo que indica que en alguno de los dos pasos hubo un salto hacia atrás —probablemente un `JMP` o un `JNZ` que tomó la condición. El número de pasos entre los snapshots es ambiguo: pueden haber sido dos pasos (un salto y luego algo más), o pueden haber sido más, si el salto hacia atrás está en el medio de un loop que se ejecutó varias veces antes de mostrar el snapshot final.

(Nota cuidadosa: el ejercicio dice "separados por dos pasos" para los snapshots. Pero la cantidad efectiva de pasos no se puede confirmar sólo mirando los snapshots: el `pc` final estando en 3 podría ser resultado de un único salto hacia atrás, o de un salto seguido de algunos pasos secuenciales y otro salto. Una respuesta cuidadosa menciona la ambigüedad.)

Errores típicos que conviene anotar si aparecen:

- Llamar "el programa cambió" a la diferencia entre snapshots. El programa —las instrucciones cargadas en memoria— no cambió. Lo que cambió es el estado del proceso.
- Asumir que el `pc` siempre avanza. Especialmente en el caso C, si la respuesta interpreta el `pc = 3` final como "el proceso retrocedió en el código" sin reconocer que retroceder en el `pc` es un fenómeno legítimo (saltos hacia atrás), falta la lectura del flujo del [capítulo 06](../chapters/06-flujo-de-control.md).

## Criterio de finalización

Las tres respuestas identifican correctamente las columnas que cambiaron, clasifican el tipo de cambio, e interpretan el movimiento del `pc` (avance secuencial, salto adelante, salto atrás). Si alguna respuesta colapsó "el programa cambió" con "el estado cambió", queda anotada la diferencia.
