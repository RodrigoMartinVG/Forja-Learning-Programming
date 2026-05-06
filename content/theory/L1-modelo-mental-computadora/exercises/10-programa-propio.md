# Ejercicio 10 — Diseñar un programa propio

## Contexto

Los nueve ejercicios anteriores trabajaron sobre programas dados, pidiendo lecturas, descomposiciones o predicciones. Este último ejercicio invierte la dirección: hay que **escribir un programa** de juguete que cumpla ciertas condiciones, y producir su traza completa.

El valor está en la inversión. Leer una traza ya dada deja siempre la posibilidad de seguir mecánicamente el programa sin entender por qué hace lo que hace. Escribir un programa que satisfaga restricciones —usar al menos una instrucción de cada clase, contener un loop con condición de salida observable— obliga a articular qué pretende lograr cada parte del programa antes de tipear la primera instrucción. Si el programa termina y la traza muestra el comportamiento intencionado, el modelo del nivel está suficientemente firme para producir ejecuciones simples a pedido.

## Consigna

Escribir un programa de **5 a 7 instrucciones** que cumpla todas las siguientes condiciones:

1. Use al menos una instrucción de cada una de las cuatro clases del [capítulo 04](../chapters/04-instrucciones-operandos.md): movimiento, acceso a memoria, aritmética, control de flujo.
2. Contenga un **loop** —es decir, un salto hacia atrás bajo cierta condición— con una **condición de salida observable** en la traza (algún registro o posición de memoria que cambie de un valor que dispara el salto a un valor que no lo dispara).
3. Termine —el loop tiene que salir en una cantidad finita de iteraciones— y la traza completa quepa en, digamos, 20 filas o menos.

Después de escribir el programa, producir:

1. La tabla del programa (`dirección` / `contenido`), incluyendo la posición `(fin)` al final y los valores iniciales de las posiciones de memoria que el programa lea o escriba.
2. El estado inicial completo (`pc`, registros, posiciones de memoria relevantes).
3. La traza completa, fila por fila, con todas las columnas relevantes y la columna *instrucción aplicada*.

## Resultado esperado

Tres entregables:

1. **Programa** (tabla de 6 a 8 entradas, incluyendo `(fin)` y posiciones de datos).
2. **Estado inicial** (una línea o dos).
3. **Traza completa** (tabla de hasta 20 filas).

## Verificación

No hay una única solución correcta. Una solución de referencia que satisface todas las restricciones es la siguiente; la respuesta del estudiante es válida si cumple las tres condiciones de la consigna y la traza es internamente consistente.

### Solución de referencia

Programa:

| dirección | contenido |
| --------- | --------- |
| 0 | `MOV r0, 3` |
| 1 | `LOAD r1, [40]` |
| 2 | `ADD r1, r0` |
| 3 | `SUB r0, 1` |
| 4 | `JNZ r0, 2` |
| 5 | `STORE r1, [40]` |
| 6 | `(fin)` |
| ... | ... |
| 40 | 0 |

Las cuatro clases están representadas: `MOV` (movimiento), `LOAD` y `STORE` (acceso a memoria), `ADD` y `SUB` (aritmética), `JNZ` (control de flujo). El loop está en las direcciones 2 a 4: el cuerpo suma `r0` a `r1`, decrementa `r0`, y `JNZ` salta de vuelta a 2 mientras `r0` no sea 0. La condición de salida —`r0` llegando a cero— es observable en la traza.

Estado inicial: `pc = 0`, `r0 = 0`, `r1 = 0`, `mem[40] = 0`.

Traza:

| momento | `pc` | `r0` | `r1` | `mem[40]` | instrucción aplicada |
| ------- | ---- | ---- | ---- | --------- | -------------------- |
| inicio        | 0 | 0 | 0 | 0 | (ninguna) |
| tras paso 1   | 1 | 3 | 0 | 0 | `MOV r0, 3` |
| tras paso 2   | 2 | 3 | 0 | 0 | `LOAD r1, [40]` |
| tras paso 3   | 3 | 3 | 3 | 0 | `ADD r1, r0` |
| tras paso 4   | 4 | 2 | 3 | 0 | `SUB r0, 1` |
| tras paso 5   | 2 | 2 | 3 | 0 | `JNZ r0, 2` (salta, `r0 = 2 ≠ 0`) |
| tras paso 6   | 3 | 2 | 5 | 0 | `ADD r1, r0` |
| tras paso 7   | 4 | 1 | 5 | 0 | `SUB r0, 1` |
| tras paso 8   | 2 | 1 | 5 | 0 | `JNZ r0, 2` (salta, `r0 = 1 ≠ 0`) |
| tras paso 9   | 3 | 1 | 6 | 0 | `ADD r1, r0` |
| tras paso 10  | 4 | 0 | 6 | 0 | `SUB r0, 1` |
| tras paso 11  | 5 | 0 | 6 | 0 | `JNZ r0, 2` (no salta, `r0 = 0`) |
| tras paso 12  | 6 | 0 | 6 | 6 | `STORE r1, [40]` |

Doce pasos, dentro del límite de 20. El loop ejecuta el cuerpo tres veces (con `r0` valiendo 3, 2, 1 al entrar). En la cuarta evaluación, `r0` vale 0 y `JNZ` no salta. El programa termina con `mem[40] = 6`, que es 3 + 2 + 1.

### Errores típicos que invalidan la solución

- **Uso incompleto de las clases**: si el programa no usa al menos una de las cuatro clases. Por ejemplo, programas que sólo hacen aritmética sobre registros sin usar memoria, o que no usan `MOV` aprovechando que `LOAD` puede sustituirlo en algunos casos.
- **Loop sin condición de salida observable**: si el programa contiene un `JMP` hacia atrás sin condición, no hay manera de que termine (es un loop infinito). El loop tiene que estar cerrado con un `JNZ` (o equivalente) cuya condición eventualmente se vuelva falsa.
- **Programa que no termina**: si la condición del `JNZ` nunca se vuelve falsa con los valores iniciales dados, la traza no termina y el ejercicio queda sin completar. Verificar que el cuerpo del loop modifica el registro evaluado por el `JNZ`.
- **Traza inconsistente con el programa**: si la traza muestra cambios que las instrucciones aplicadas no producen, o si una columna cambia sin que la instrucción aplicada toque esa columna. Esto requiere volver a la taxonomía del [capítulo 04](../chapters/04-instrucciones-operandos.md).

## Criterio de finalización

El programa cumple las tres condiciones de la consigna (cuatro clases representadas, loop con condición de salida, terminación en finitos pasos). La traza es completa, fila por fila, y los cambios entre filas son consistentes con las instrucciones aplicadas. Si la solución difiere significativamente de la solución de referencia, eso está bien: lo que importa es la coherencia interna del programa entregado.

Con este ejercicio cierra `L1`. El próximo nivel ([`L2`](../../L2-representacion-informacion/)) abre la representación binaria de instrucciones y datos —cómo el ISA de juguete se reemplaza por algo concreto, donde cada instrucción es un patrón de bits específico y cada valor también lo es.
