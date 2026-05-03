# Distinguir MOV, LOAD y STORE

Este ejercicio compara tres familias de instrucciones que se parecen en la forma, pero no hacen el mismo tipo de trabajo sobre el estado.

> Simulador: cargá `MOV y copias` para mirar `MOV` aislado. Después comparalo con `suma base` o `indirección por registro` para ver cuándo una instrucción sí toca memoria.

## Consigna

Para cada caso, elegí una sola etiqueta entre `inmediato a registro`, `registro a registro`, `lee memoria` o `escribe memoria`.

| Caso | Etiqueta |
|---|---|
| `MOV r0, 5` | `?` |
| `MOV r1, r0` | `?` |
| `LOAD r1, [40]` | `?` |
| `LOAD r1, [r0]` | `?` |
| `STORE r1, [42]` | `?` |
| `STORE r1, [r0]` | `?` |

La pregunta no es qué valor queda al final, sino qué clase de acceso o copia representa cada instrucción.