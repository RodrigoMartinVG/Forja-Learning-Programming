# Ejercicio 02 — Lectura del mismo byte bajo dos convenciones

## Contexto

El [capítulo 04](../chapters/04-complemento-a-dos.md) cerró con la idea de que un mismo patrón de bits admite dos lecturas legítimas: sin signo y complemento a dos. Cuál de las dos es la "correcta" depende de la convención que aplique el programa que está leyendo el byte, no del patrón en sí.

Este ejercicio fija esa dualidad sobre cinco bytes concretos, todos con el bit más significativo encendido —lo que vuelve la diferencia entre las dos lecturas máxima—.

## Consigna

Para cada uno de los siguientes bytes, dar el valor sin signo (`uint8_t`) y el valor en complemento a dos (`int8_t`). Ningún byte cae en el rango ASCII imprimible, así que no hay tentación de leerlos como texto.

| Byte | Sin signo | Complemento a dos |
|---|---|---|
| `0x80` |   |   |
| `0x81` |   |   |
| `0xC0` |   |   |
| `0xFE` |   |   |
| `0xFF` |   |   |

## Resultado esperado

La tabla completa con los dos valores por fila.

## Verificación

| Byte | Sin signo | Complemento a dos |
|---|---|---|
| `0x80` | 128 | −128 |
| `0x81` | 129 | −127 |
| `0xC0` | 192 | −64 |
| `0xFE` | 254 | −2 |
| `0xFF` | 255 | −1 |

La regla rápida para complemento a dos sobre bytes con MSB encendido: el valor sin signo menos 256 da el valor con signo. Por ejemplo, $129 - 256 = -127$. Esa relación funciona porque los pesos coinciden en todos los bits salvo el más alto, y la diferencia entre $+128$ (peso sin signo) y $-128$ (peso con signo) es exactamente $-256$.

Si alguna fila no coincide, el error más común es haberse "saltado" el peso negativo: es decir, leer el bit alto como si pesara $+128$ aun bajo la convención con signo. La otra fuente típica es hacer "invertir y sumar 1" como cálculo, que es para invertir el signo de un valor, no para leerlo: la lectura no requiere ese paso.

## Criterio de finalización

Las cinco filas coinciden con la verificación. Si hubo errores, se registra cuál fue la confusión: peso del bit alto, mecánica del cálculo, o ambas.
