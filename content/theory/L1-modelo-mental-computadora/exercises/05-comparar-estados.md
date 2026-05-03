# Comparar dos estados

Para cada caso, elegí una sola etiqueta entre `cambió el código cargado`, `cambió el estado de ejecución` o `cambiaron solo los datos`.

> Simulador: este ejercicio conversa directo con el historial. Compará snapshots del simulador y usá esa práctica para decidir qué cambió realmente en cada caso.

## Caso A

| Pieza | Estado 1 | Estado 2 |
|---|---|---|
| `pc` | `100` | `102` |
| `r0` | `0` | `12` |
| `mem[40]` | `7` | `7` |
| `mem[41]` | `5` | `5` |
| `mem[42]` | `0` | `0` |
| código `100..103` | igual | igual |

Etiqueta: `?`

## Caso B

| Pieza | Estado 1 | Estado 2 |
|---|---|---|
| `pc` | `100` | `100` |
| `r0` | `0` | `0` |
| `mem[40]` | `7` | `7` |
| `mem[41]` | `5` | `5` |
| `mem[42]` | `0` | `12` |
| código `100..103` | igual | igual |

Etiqueta: `?`

## Caso C

| Pieza | Estado 1 | Estado 2 |
|---|---|---|
| `pc` | `100` | `100` |
| `r0` | `0` | `0` |
| `mem[40]` | `7` | `7` |
| `mem[41]` | `5` | `5` |
| `mem[42]` | `0` | `0` |
| dirección `101` | `ADD r0, [41]` | `SUB r0, [41]` |

Etiqueta: `?`