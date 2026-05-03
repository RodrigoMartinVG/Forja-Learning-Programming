# Seguir una traza simple

Usá la misma traza de `02` y `03` para seguir, paso a paso, cómo cambia el estado.

## Programa

```text
100: LOAD r0, [40]
101: ADD  r0, [41]
102: STORE r0, [42]
103: HALT
```

## Estado inicial

| Pieza | Valor inicial |
|---|---|
| `pc` | `100` |
| `r0` | `0` |
| `mem[40]` | `7` |
| `mem[41]` | `5` |
| `mem[42]` | `0` |

## Consigna

Completá la tabla después de cada instrucción.

| Paso | Instrucción ejecutada | `pc` después | `r0` después | `mem[42]` después |
|---|---|---|---|---|
| 1 | `LOAD r0, [40]` | `?` | `?` | `?` |
| 2 | `ADD  r0, [41]` | `?` | `?` | `?` |
| 3 | `STORE r0, [42]` | `?` | `?` | `?` |
| 4 | `HALT` | `?` | `?` | `?` |

No hace falta escribir una explicación larga. Alcanzan los valores correctos en la tabla.