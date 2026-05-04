# Ejercicio 08 — Comparar LE y BE sobre el mismo valor

## Contexto

El [capítulo 08](../chapters/08-endianness.md) mostró que la endianness es una decisión de la arquitectura: el mismo entero se almacena de manera distinta en memoria según la máquina sea little-endian o big-endian, pero el valor representado es siempre el mismo. La diferencia es de **disposición**, no de **valor**.

Este ejercicio entrena escribir, dado un valor matemático, cómo aparecería ese valor en un dump de cada una de las dos endianness.

## Consigna

Para cada uno de los siguientes valores enteros de 32 bits, escribir cómo aparecerían en un dump de cuatro bytes consecutivos bajo little-endian y bajo big-endian. Asumir que los bytes empiezan en una dirección que no importa (la convención los deja en orden creciente).

| Valor (hex) | Dump en LE | Dump en BE |
|---|---|---|
| `0x12345678` |   |   |
| `0xCAFEBABE` |   |   |
| `0x00000001` |   |   |

## Resultado esperado

La tabla completa con los dos dumps por fila. Cada dump es una secuencia de cuatro bytes en hex, separados por espacios.

## Verificación

| Valor | Dump en LE | Dump en BE |
|---|---|---|
| `0x12345678` | `78 56 34 12` | `12 34 56 78` |
| `0xCAFEBABE` | `be ba fe ca` | `ca fe ba be` |
| `0x00000001` | `01 00 00 00` | `00 00 00 01` |

La regla operativa es directa: el dump en BE coincide con la escritura del valor en hex (de izquierda a derecha, byte alto primero), y el dump en LE es el mismo dump en BE leído de derecha a izquierda.

El tercer caso —el valor 1— es el más ilustrativo del bug de endianness en la práctica. Un programa en una máquina LE escribe el valor 1 en un archivo y los bytes en disco son `01 00 00 00`. Si otro programa lee esos bytes asumiendo BE —porque está siguiendo network byte order, por ejemplo—, reconstruye el valor `0x01000000` = 16 777 216 en lugar de 1. La diferencia entre 1 y 16 millones se manifiesta como "este valor es absurdamente grande", que es el síntoma típico del error de endianness.

Si alguna fila no coincide, el error más común es haber invertido el orden de los nibbles dentro de cada byte en lugar de invertir el orden de los bytes. Endianness aplica a bytes, nunca a bits dentro del byte: el byte `0xCA` es `0xCA` en LE y en BE; lo que cambia es en qué posición de la secuencia aparece.

## Criterio de finalización

Las tres filas coinciden con la verificación. Si hubo errores, queda registrado si la confusión fue de granularidad (bits en lugar de bytes), de dirección (cuál es la "primera" posición), o aritmética (cálculo del valor reconstruido si se intentó verificar).
