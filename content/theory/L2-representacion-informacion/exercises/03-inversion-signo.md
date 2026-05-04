# Ejercicio 03 — Inversión de signo en complemento a dos

## Contexto

El [capítulo 04](../chapters/04-complemento-a-dos.md) mostró que invertir el signo de un valor en complemento a dos requiere dos pasos: invertir todos los bits y sumar 1. La cuenta es mecánica pero tiene un error frecuente —saltarse el +1— y un caso patológico —el mínimo, cuyo opuesto no es representable—.

Este ejercicio entrena los dos pasos sobre tres valores positivos, anotando explícitamente cada uno para que la mecánica quede instalada antes de aplicarla en problemas más grandes.

## Consigna

Para cada uno de los siguientes valores positivos en 8 bits, calcular el patrón de su negativo aplicando "invertir bits y sumar 1". Mostrar los tres pasos para cada caso: patrón positivo, patrón con bits invertidos, patrón final tras sumar 1.

| Valor | Patrón positivo | Bits invertidos | Tras sumar 1 (patrón de $-v$) |
|---|---|---|---|
| +5 |   |   |   |
| +42 |   |   |   |
| +100 |   |   |   |

## Resultado esperado

La tabla completa con los tres patrones por fila. El último patrón —tras sumar 1— es el que representa el valor negativo en complemento a dos.

## Verificación

| Valor | Patrón positivo | Bits invertidos | Tras sumar 1 |
|---|---|---|---|
| +5 | `00000101` | `11111010` | `11111011` |
| +42 | `00101010` | `11010101` | `11010110` |
| +100 | `01100100` | `10011011` | `10011100` |

Verificación cruzada calculando el valor signed del patrón final:

- `11111011`: $-128 + 64 + 32 + 16 + 8 + 2 + 1 = -5$. Coincide.
- `11010110`: $-128 + 64 + 16 + 4 + 2 = -42$. Coincide.
- `10011100`: $-128 + 16 + 8 + 4 = -100$. Coincide.

Si alguna fila no coincide, los dos errores más probables son: olvidar el +1 final (queda el complemento a uno, que da un valor un poco distinto), o equivocarse en la suma binaria con acarreos (cuando el +1 se propaga a través de varios bits altos).

Una observación: si se intenta el procedimiento sobre el mínimo —`10000000` = $-128$—, los pasos dan `01111111` → `10000000`, es decir, el mismo patrón original. El opuesto matemático $+128$ no entra en 8 bits con signo. Esto no es un error: es el caso patológico del mínimo, mencionado en el capítulo 04.

## Criterio de finalización

Las tres filas coinciden con la verificación. Si hubo errores, queda registrado cuál de los dos pasos los produjo y se vuelve a hacer la cuenta hasta que cuadre.
