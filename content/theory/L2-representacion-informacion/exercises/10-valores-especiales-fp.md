# Ejercicio 10 — Identificar valores especiales de IEEE 754

## Contexto

El [capítulo 09](../chapters/09-floating-point.md) presentó los casos especiales del formato IEEE 754: cero positivo, cero negativo, infinito positivo, infinito negativo, y los distintos patrones de NaN. Cada uno corresponde a una combinación específica de exponente y mantisa, y reconocerlos a la vista del patrón es parte del trabajo de inspección de memoria.

Este ejercicio entrena ese reconocimiento sobre cuatro patrones, sin recurrir a una calculadora ni a la fórmula completa: los casos especiales se identifican por la estructura de los campos de exponente y mantisa.

## Consigna

Cuatro patrones de `float` de 32 bits. Identificar cada uno con uno de los siguientes valores especiales: `+0`, `-0`, `+∞`, `NaN`.

| Patrón hex | Valor especial |
|---|---|
| `0x00000000` |   |
| `0x80000000` |   |
| `0x7F800000` |   |
| `0x7FC00000` |   |

Para cada fila, completar **además** una columna con la **regla** que permitió identificarlo, expresada en términos del exponente y la mantisa (no del valor numérico calculado).

## Resultado esperado

La tabla con dos columnas extra completas: el valor especial y la regla de reconocimiento.

## Verificación

**`0x00000000`**:
- `S = 0`, `E = 00000000`, `M = 0`.
- Regla: exponente todo en cero **y** mantisa todo en cero, con `S = 0` → `+0`.

**`0x80000000`**:
- `S = 1`, `E = 00000000`, `M = 0`.
- Regla: exponente todo en cero **y** mantisa todo en cero, con `S = 1` → `-0`.

**`0x7F800000`**:
- Bits: `0 11111111 00000000000000000000000`.
- `S = 0`, `E = 11111111` (todo en uno), `M = 0`.
- Regla: exponente todo en uno **y** mantisa todo en cero, con `S = 0` → `+∞`.

**`0x7FC00000`**:
- Bits: `0 11111111 10000000000000000000000`.
- `S = 0`, `E = 11111111` (todo en uno), `M ≠ 0`.
- Regla: exponente todo en uno **y** mantisa con al menos un bit encendido → `NaN`.

Resumen de las reglas para inspecciones futuras:

| Exponente | Mantisa | Significado |
|---|---|---|
| 0 | 0 | cero (con signo del bit `S`) |
| 0 | ≠ 0 | subnormal |
| 1...254 | cualquiera | normal |
| 255 | 0 | infinito (con signo del bit `S`) |
| 255 | ≠ 0 | NaN |

Una observación sobre `+0` y `-0`: aunque tienen patrones de bits distintos —el primer bit cambia—, la comparación `+0 == -0` da verdadero por convención de IEEE 754. Esta es la trampa que un programa puede pisar si asume que "valores iguales tienen los mismos bits": dos floats pueden ser iguales y tener bytes distintos.

Si alguna fila se clasificó mal, los errores típicos son: confundir `+0` con `+∞` (los dos tienen mantisa en cero, pero los exponentes son opuestos: todos ceros vs todos unos), o tratar todos los patrones con exponente 255 como infinitos (tienen que tener mantisa cero específicamente; con mantisa no cero son NaN).

## Criterio de finalización

Los cuatro patrones se identificaron correctamente y la regla de reconocimiento está expresada en términos de los campos. Si hubo errores, queda registrado cuál fue la confusión —típicamente entre exponente todo en cero y todo en uno—.
