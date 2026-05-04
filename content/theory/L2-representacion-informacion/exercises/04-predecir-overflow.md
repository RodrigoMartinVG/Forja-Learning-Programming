# Ejercicio 04 — Predecir overflow

## Contexto

El [capítulo 05](../chapters/05-overflow-truncado.md) instaló la regla de que toda operación aritmética en $n$ bits produce el resultado matemático módulo $2^n$, y que el síntoma observable —envolvimiento o cambio de signo— depende de la convención bajo la cual se lea el resultado.

Este ejercicio fija esa regla sobre tres operaciones concretas, distinguiendo los dos tipos de overflow (sin signo y con signo) que pueden aparecer en cada una.

## Consigna

Para cada una de las siguientes operaciones sobre operandos de 8 bits, completar las cuatro columnas:

- **Patrón resultante**: el byte (en hex) que queda después de la operación.
- **Lectura sin signo**: el valor del patrón leído como `uint8_t`.
- **Lectura con signo**: el valor del patrón leído como `int8_t`.
- **¿Hay overflow?**: marcar para cada convención (sin signo / con signo) si el resultado matemático cayó fuera de su rango.

Las operaciones se hacen en aritmética modular de 8 bits, es decir, módulo $2^8 = 256$. Los operandos están escritos con su valor matemático; si en alguno de ellos hace falta interpretarlo, asumir la convención más natural según el signo escrito.

| Operación (matemática) | Patrón resultante | Lectura sin signo | Lectura con signo | Overflow sin signo | Overflow con signo |
|---|---|---|---|---|---|
| 200 + 100 |   |   |   |   |   |
| 100 + 50 |   |   |   |   |   |
| (−10) + (−120) |   |   |   |   |   |

## Resultado esperado

La tabla completa, con un patrón en hex y dos valores numéricos por fila, más las dos marcas de overflow.

## Verificación

| Operación | Patrón | Sin signo | Con signo | Overflow sin signo | Overflow con signo |
|---|---|---|---|---|---|
| 200 + 100 | `0x2C` | 44 | 44 | Sí | No |
| 100 + 50 | `0x96` | 150 | −106 | No | Sí |
| (−10) + (−120) | `0x86` | 134 | −122 | No | No |

Cuentas intermedias:

- 200 + 100 = 300. $300 \bmod 256 = 44$. Patrón `0x2C` = 44. Sin signo: 300 no entra en [0, 255], hay overflow; el resultado se envuelve. Con signo: pero los operandos como `int8_t` ya no eran 200 ni 100 (200 con signo es −56, 100 es +100), y la cuenta sería −56 + 100 = 44, sin overflow. La distinción es que con signo el "valor real" era distinto.
- 100 + 50 = 150. Patrón `0x96` = 150 sin signo, $-128 + 16 + 4 + 2 = -106$ con signo. Sin signo: entra en [0, 255], no hay overflow. Con signo: 150 no entra en [−128, 127], hay overflow; el síntoma es el cambio de signo.
- (−10) + (−120) = −130. En complemento a dos sobre 8 bits, los patrones son `0xF6` y `0x88`. La suma binaria de esos dos da `0x17E`, truncado a 8 bits es `0x86`. Sin signo: 134 (entra). Con signo: $-128 + 4 + 2 = -122$ (entra, aunque la cuenta matemática −130 estaba fuera). Aún así, no hay cambio de signo entre los operandos (negativos) y el resultado (negativo): no hay overflow detectable con la regla de cambio de signo.

Si alguna fila no coincide, los errores típicos son: confundir overflow sin signo con overflow con signo (son condiciones distintas y pueden ocurrir solo una, ambas o ninguna), olvidar que la "operación" vista por el procesador es la misma para los dos casos y solo cambia la lectura, o equivocarse en la suma binaria.

## Criterio de finalización

Las tres filas coinciden con la verificación. Si hubo errores, queda registrado cuál fue: aritmética, lectura, o detección de overflow.
