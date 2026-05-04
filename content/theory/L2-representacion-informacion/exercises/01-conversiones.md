# Ejercicio 01 — Conversiones binario / hex / decimal sin signo

## Contexto

El [capítulo 02](../chapters/02-hexadecimal.md) instaló la conversión nibble a nibble entre hex y binario, y el [capítulo 03](../chapters/03-enteros-sin-signo.md) instaló la suma de pesos para leer un patrón como entero sin signo. Este ejercicio combina las dos habilidades: dado un patrón en cualquier representación, llegar al mismo valor en las otras dos sin pasar por una calculadora.

La habilidad que se busca instalar es operativa: pasar entre las tres notaciones tiene que volverse reflejo, porque todos los capítulos siguientes asumen que mirar `0xA3` y "ver" 163 sin pensar es parte del trabajo.

## Consigna

Completar la siguiente tabla. Cada fila tiene una sola celda con valor; las otras dos hay que calcularlas. No usar calculadora ni programa: hacer la cuenta a mano, anotando los pesos cuando convenga.

| Binario (8 bits) | Hex | Decimal sin signo |
|---|---|---|
| `00010110` |   |   |
|   | `0x4F` |   |
| `10110100` |   |   |
|   |   | 200 |
|   | `0xA3` |   |
| `11111111` |   |   |

## Resultado esperado

La tabla completa, con cada celda calculada. Las cuentas intermedias no son obligatorias en la entrega final, pero hacerlas en un costado durante el cálculo permite detectar errores antes de que se propaguen.

## Verificación

| Binario (8 bits) | Hex | Decimal sin signo |
|---|---|---|
| `00010110` | `0x16` | 22 |
| `01001111` | `0x4F` | 79 |
| `10110100` | `0xB4` | 180 |
| `11001000` | `0xC8` | 200 |
| `10100011` | `0xA3` | 163 |
| `11111111` | `0xFF` | 255 |

Si alguna fila no coincide, las dos fuentes más probables de error son: invertir el orden de los nibbles al pasar de binario a hex (el nibble alto va primero, izquierda), y olvidar que el dígito hex `A` vale 10, no 11.

## Criterio de finalización

Las seis filas coinciden con la verificación. Si hubo errores, queda registrada cuál fue la fila errada y qué tipo de error produjo: confusión de nibble alto/bajo, valor incorrecto de un dígito hex, suma de pesos mal hecha.
