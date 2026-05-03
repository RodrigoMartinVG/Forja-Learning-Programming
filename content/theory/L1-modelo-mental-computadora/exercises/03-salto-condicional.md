# Leer un salto condicional

Este ejercicio usa la misma lógica de `03`: decidir cómo queda el `pc` cuando una instrucción puede cambiar el flujo.

> Simulador: cargá `salto condicional`, detenete justo antes de `JNZ` y usalo para comprobar cómo cambia el próximo `pc` según el valor del registro.

## Programa

```text
200: LOAD r0, [50]
201: SUB  r0, 1
202: JNZ  r0, 201
203: HALT
```

## Consigna

En todos los casos, asumí que la CPU está por ejecutar `JNZ r0, 201` y que `pc=202`.

Completá el próximo valor de `pc`.

| Caso | Estado antes de `JNZ` | Próximo `pc` |
|---|---|---|
| A | `pc=202`, `r0=2` | `?` |
| B | `pc=202`, `r0=1` | `?` |
| C | `pc=202`, `r0=0` | `?` |

No hace falta justificar cada fila: alcanza con decidir correctamente a qué dirección sigue el flujo.