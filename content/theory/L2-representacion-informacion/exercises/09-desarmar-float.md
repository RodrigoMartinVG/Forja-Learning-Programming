# Ejercicio 09 — Desarmar un `float` en sus tres campos

## Contexto

El [capítulo 09](../chapters/09-floating-point.md) instaló el formato IEEE 754 de precisión simple: un bit de signo, ocho bits de exponente con sesgo 127, y veintitrés bits de mantisa con un 1 implícito. Aplicando la fórmula
$\text{valor} = (-1)^S \cdot 2^{E - 127} \cdot (1 + M/2^{23})$
se obtiene el valor numérico que representa cualquier patrón normal.

Este ejercicio recorre el procedimiento inverso sobre dos valores concretos: extraer los campos de un patrón hex, calcular el valor según la fórmula, y verificar que coincide con el valor de partida.

## Consigna

Para cada uno de los siguientes patrones —ambos correspondientes a `float` de 32 bits—, completar:

1. Los **bits separados** por campo: `S` (1 bit), `E` (8 bits), `M` (23 bits).
2. El **valor de E** en decimal y el exponente real $E - 127$.
3. La **mantisa con 1 implícito**: $1 + M/2^{23}$ como fracción decimal aproximada.
4. El **valor numérico final** según la fórmula.

| Patrón hex | S | E (binario) | M (binario) | E (decimal) | E − 127 | $1 + M/2^{23}$ | Valor |
|---|---|---|---|---|---|---|---|
| `0x3F800000` |   |   |   |   |   |   |   |
| `0x40490FDB` |   |   |   |   |   |   |   |

El segundo patrón es el `float` más cercano a $\pi$. La verificación final requiere comparar el valor calculado con el valor real de $\pi$ y observar el error de aproximación.

## Resultado esperado

La tabla completa con todas las columnas. Para el segundo patrón, además, una nota corta sobre cuántos dígitos decimales coinciden con $\pi = 3.141592653589793...$ y por qué la coincidencia se corta en algún punto.

## Verificación

**Patrón `0x3F800000`** (bytes `3F 80 00 00`):

- Binario: `0011 1111 1000 0000 0000 0000 0000 0000`.
- Separación por campo:
  - `S = 0` (positivo)
  - `E = 01111111` (decimal 127)
  - `M = 000 0000 0000 0000 0000 0000` (decimal 0)
- $E - 127 = 0$.
- $1 + M/2^{23} = 1 + 0 = 1$.
- Valor: $(-1)^0 \cdot 2^0 \cdot 1 = 1.0$.

**Patrón `0x40490FDB`** (bytes `40 49 0F DB`):

- Binario: `0100 0000 0100 1001 0000 1111 1101 1011`.
- Separación por campo:
  - `S = 0` (positivo)
  - `E = 10000000` (decimal 128)
  - `M = 100 1001 0000 1111 1101 1011`
- $E - 127 = 1$.
- $M$ en decimal: $4787163$ (calculando bit por bit, o convirtiendo la fracción $M/2^{23}$).
- $M / 2^{23} = 4787163 / 8388608 \approx 0.5707963$.
- $1 + M/2^{23} \approx 1.5707963$.
- Valor: $(-1)^0 \cdot 2^1 \cdot 1.5707963 \approx 3.1415927$.

Comparación con $\pi = 3.141592653589793...$:

- Calculado: $3.1415927...$
- Real: $3.1415926535...$

Coinciden los siete primeros dígitos significativos. La precisión simple da aproximadamente 7 dígitos decimales de exactitud, que es una propiedad estructural del formato: 23 bits de mantisa equivalen a $\log_{10}(2^{23}) \approx 6.9$ dígitos. A partir del séptimo, los dígitos del `float` calculado divergen del valor real de $\pi$ porque el `float` no puede representar exactamente la fracción binaria de $\pi$.

Si los valores calculados no coinciden, las fuentes de error más comunes son: olvidar el sesgo de 127 al calcular $E - 127$, olvidar el 1 implícito de la mantisa (sumar $M/2^{23}$ en lugar de $1 + M/2^{23}$), o equivocarse en la conversión binario-decimal de la mantisa.

## Criterio de finalización

Los dos patrones se desarmaron en sus tres campos, los valores se calcularon según la fórmula, y los resultados coinciden con $1.0$ exacto y con $\pi$ aproximado a 7 dígitos. Si hubo error, queda registrado el paso que falló: separación de campos, sesgo, o aritmética de la mantisa.
