# Ejercicio 01 — Completar una traza simple

## Contexto

El [capítulo 01](../chapters/01-maquina-de-estado.md) introdujo la traza tabular como la materialidad principal del nivel y mostró un ejemplo de tres pasos. Este ejercicio fija la habilidad básica del nivel: dado un programa de juguete y un estado inicial, producir la traza completa fila por fila, sin saltearse ningún paso.

La consigna parece mecánica y lo es. Lo que importa en este punto del nivel no es resolver nada inteligente, sino instalar la rutina de leer una instrucción, reconocer qué columnas toca, y registrar el cambio. Si esa rutina no se vuelve reflejo acá, los ejercicios siguientes no tienen base.

## Programa

| dirección | contenido |
| --------- | --------- |
| 0 | `LOAD r0, [50]` |
| 1 | `MOV r1, r0` |
| 2 | `ADD r0, 5` |
| 3 | `STORE r0, [51]` |
| 4 | `STORE r1, [52]` |
| 5 | `(fin)` |
| ... | ... |
| 50 | 10 |
| 51 | 0 |
| 52 | 0 |

Estado inicial: `pc = 0`, `r0 = 0`, `r1 = 0`, `mem[50] = 10`, `mem[51] = 0`, `mem[52] = 0`.

## Consigna

Completar la siguiente traza, una fila por paso ejecutado, hasta llegar a la dirección 5 (fin). Usar columnas `momento`, `pc`, `r0`, `r1`, `mem[50]`, `mem[51]`, `mem[52]` e `instrucción aplicada`. La fila *inicio* es la única que se entrega.

| momento | `pc` | `r0` | `r1` | `mem[50]` | `mem[51]` | `mem[52]` | instrucción aplicada |
| ------- | ---- | ---- | ---- | --------- | --------- | --------- | -------------------- |
| inicio  | 0 | 0 | 0 | 10 | 0 | 0 | (ninguna) |

Dejar la columna *instrucción aplicada* completa en cada fila con la instrucción exacta tal como aparece en la dirección que el `pc` señalaba antes del paso.

## Resultado esperado

Una tabla de seis filas (la fila *inicio* más cinco pasos), con todas las columnas completas. El estado final debe tener `pc = 5`, `r0 = 15`, `r1 = 10`, `mem[50] = 10`, `mem[51] = 15`, `mem[52] = 10`.

## Verificación

La traza correcta es:

| momento | `pc` | `r0` | `r1` | `mem[50]` | `mem[51]` | `mem[52]` | instrucción aplicada |
| ------- | ---- | ---- | ---- | --------- | --------- | --------- | -------------------- |
| inicio       | 0 | 0  | 0  | 10 | 0  | 0  | (ninguna) |
| tras paso 1  | 1 | 10 | 0  | 10 | 0  | 0  | `LOAD r0, [50]` |
| tras paso 2  | 2 | 10 | 10 | 10 | 0  | 0  | `MOV r1, r0` |
| tras paso 3  | 3 | 15 | 10 | 10 | 0  | 0  | `ADD r0, 5` |
| tras paso 4  | 4 | 15 | 10 | 10 | 15 | 0  | `STORE r0, [51]` |
| tras paso 5  | 5 | 15 | 10 | 10 | 15 | 10 | `STORE r1, [52]` |

Si alguna fila tiene un valor distinto, parar en esa fila y volver a la instrucción aplicada: ¿qué columnas debería haber tocado, según la taxonomía del [capítulo 04](../chapters/04-instrucciones-operandos.md)? La fuente más común de error es escribir un cambio en una columna que la instrucción no tocaba (por ejemplo, modificar `mem[50]` durante un `LOAD`, que es lectura), o no escribir un cambio que sí ocurrió.

## Criterio de finalización

La traza completa coincide fila por fila con la verificación. Si hay diferencias, queda registrado en una nota corta cuál fue la fila errada y qué confusión la produjo, antes de pasar al siguiente ejercicio.
