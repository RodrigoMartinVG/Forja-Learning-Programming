# Floating point como aproximación finita

## El formato en tres campos

Hasta acá las convenciones del nivel cubrieron enteros y texto. Falta una clase de valores que aparece en cualquier programa que toque cantidades físicas, fracciones o resultados de operaciones que no sean enteras: los **números de punto flotante**, conocidos como `float` en C, `f32` en Rust, `Number` en JavaScript. La convención que define cómo esos valores se representan en bits se llama **IEEE 754**, publicada en 1985 y revisada en 2008 y 2019, y la implementan absolutamente todos los procesadores modernos sin variaciones relevantes.

Un valor IEEE 754 de **precisión simple** ocupa 32 bits divididos en tres campos:

| posición | 31 | 30 … 23 | 22 … 0 |
|---|---|---|---|
| campo | S | E (8 bits) | M (23 bits) |

- **Signo `S`** (1 bit): 0 indica positivo, 1 indica negativo. La convención es la misma idea que magnitud y signo para enteros, pero acá el bit de signo solo afecta al signo del valor; no se entrelaza con la magnitud como en complemento a dos.
- **Exponente `E`** (8 bits): un entero sin signo de 0 a 255 que codifica el exponente de la potencia de 2. La codificación incluye un sesgo, descrito más abajo.
- **Mantisa `M`** (23 bits): un entero sin signo que codifica los 23 bits fraccionarios después de un 1 implícito.

Un valor de **precisión doble** —`double` en C, `f64` en Rust, `Number` en JavaScript— ocupa 64 bits con la misma estructura pero campos más anchos: 1 bit de signo, 11 bits de exponente, 52 bits de mantisa. La fórmula es la misma; lo único que cambia es la cantidad de dígitos significativos y el rango de exponentes. Este capítulo trabaja sobre precisión simple por compacidad, pero lo que se diga vale igual para doble.

## Cómo se calcula el valor representado

Para los valores **normales** —el caso más común—, la fórmula que conecta los tres campos con el valor representado es:

$$\text{valor} = (-1)^S \cdot 2^{E - 127} \cdot \left(1 + \frac{M}{2^{23}}\right)$$

Tres pedazos:

- $(-1)^S$ produce $+1$ si el bit de signo es 0, $-1$ si es 1. Aplica el signo al final.
- $2^{E - 127}$ es la potencia de 2 que define la magnitud aproximada del número. El 127 es el sesgo: el exponente almacenado es el exponente real más 127, así que un valor de $E = 127$ representa exponente real 0, $E = 128$ representa exponente real 1, $E = 126$ representa exponente real $-1$. El sesgo se trata aparte más abajo.
- $1 + M / 2^{23}$ es la **mantisa con el 1 implícito**: un número entre 1 y 2 (sin incluir el 2). El 1 es siempre el mismo y no se almacena —se asume—; los 23 bits del campo `M` representan la fracción que sigue al punto binario. Si todos los bits están en 0, la mantisa vale exactamente 1; si están todos en 1, vale casi 2 (concretamente $2 - 2^{-23}$).

Un ejemplo trabajado: el valor exacto `1.0f`. La fórmula tiene que dar 1, así que necesitamos $S = 0$, exponente real = 0, y mantisa fraccionaria = 0:

- $S = 0$ (positivo)
- $E - 127 = 0$ → $E = 127 = 0111\,1111_2$
- $M = 0 = 000\,0000\,0000\,0000\,0000\,0000_2$

Concatenando los bits:

```text
S: 0
E: 0111 1111
M: 000 0000 0000 0000 0000 0000

bits: 0 01111111 00000000000000000000000
```

Reagrupado en bytes: `0011 1111 1000 0000 0000 0000 0000 0000` = `0x3F800000`.

Verificación con `xxd`:

```c
#include <stdio.h>
int main(void) {
    float x = 1.0f;
    unsigned char *p = (unsigned char*)&x;
    for (int i = 0; i < 4; i++) printf("%02x ", p[i]);
    printf("\n");
    return 0;
}
```

En una máquina little-endian la salida es:

```text
00 00 80 3f
```

Los cuatro bytes en orden físico: `0x00`, `0x00`, `0x80`, `0x3F`. Reconstruyendo el valor de 32 bits a partir de los bytes en little-endian (capítulo 08): `0x3F800000`. Coincide con la cuenta a mano. El `1.0f` no es un valor abstracto: es ese patrón de 32 bits, y nada más.

Otro ejemplo: `0.5f`. Como $0.5 = 2^{-1}$, queremos exponente real $-1$ y mantisa exacta 1:

- $S = 0$
- $E - 127 = -1$ → $E = 126 = 0111\,1110_2$
- $M = 0$

Bits: `0 01111110 00000000000000000000000` = `0x3F000000`. Y en dump little-endian: `00 00 00 3f`.

## El sesgo del exponente y por qué existe

El campo de exponente almacena un valor sin signo de 0 a 255, pero el exponente real puede ser positivo o negativo: hace falta cubrir tanto $2^{-126}$ como $2^{127}$ para representar números muy chicos y muy grandes. La solución elegida por IEEE 754 es **almacenar el exponente con un sesgo**: el exponente real se obtiene restando 127 al valor almacenado. Por simetría, los exponentes representables van de −126 a +127 (los valores extremos `E = 0` y `E = 255` se reservan para casos especiales, descritos abajo).

Existían alternativas. Una sería usar complemento a dos para el exponente —como se hace para los enteros con signo—. Otra, reservar un bit explícito de signo del exponente. ¿Por qué sesgo y no esas otras?

La razón es operativa: con sesgo, **comparar dos floats positivos como si fueran enteros sin signo da el resultado correcto**. El bit de signo es 0 en ambos, lo que sigue es exponente más mantisa, y como el exponente está al frente y crece monotónicamente con el valor real, los floats positivos se ordenan igual cuando se los lee como `uint32_t`. Esto permite usar comparaciones de hardware sobre los bits de un float sin necesidad de extraer el exponente y compararlo aparte. Para floats con signos opuestos hay un caso especial obvio (negativos antes que positivos, una vez resuelto eso lo demás es directo), pero la propiedad principal —que el orden binario coincida con el orden numérico para valores del mismo signo— se preserva gracias al sesgo. Con complemento a dos en el exponente esa propiedad se rompería.

El sesgo de doble precisión es 1023 (en 11 bits, $2^{10} - 1$). La regla es siempre $\text{sesgo} = 2^{n-1} - 1$ donde $n$ es el ancho del campo de exponente.

## Casos especiales: cero, infinitos, NaN, subnormales

La fórmula con 1 implícito y exponente sesgado cubre los valores normales pero deja afuera algunos casos importantes. IEEE 754 los rescata reservando los exponentes extremos —`E = 0` y `E = 255`— para usos especiales:

| Patrón general | Significado | Notas |
|---|---|---|
| `S = 0, E = 0, M = 0` | `+0.0` | cero positivo |
| `S = 1, E = 0, M = 0` | `-0.0` | cero negativo, distinto patrón pero `== +0.0` da verdadero |
| `S = ?, E = 0, M ≠ 0` | subnormales | mantisa sin 1 implícito, llenan el hueco entre 0 y el menor normal |
| `S = 0, E = 255, M = 0` | `+∞` | infinito positivo |
| `S = 1, E = 255, M = 0` | `-∞` | infinito negativo |
| `S = ?, E = 255, M ≠ 0` | NaN | "Not a Number", múltiples patrones |

Algunos patrones concretos en precisión simple:

| Valor | Patrón hex | Bytes en LE |
|---|---|---|
| `+0.0f` | `0x00000000` | `00 00 00 00` |
| `-0.0f` | `0x80000000` | `00 00 00 80` |
| `+∞` | `0x7F800000` | `00 00 80 7F` |
| `-∞` | `0xFF800000` | `00 00 80 FF` |
| NaN típico | `0x7FC00000` | `00 00 c0 7F` |

El cero negativo es un caso particular: existe, tiene un patrón distinto al cero positivo, pero la comparación `0.0f == -0.0f` da verdadero por convención de IEEE 754. Esto crea bugs sutiles en código que asume "si dos floats tienen los mismos bits, son iguales" o "si dos floats son iguales, tienen los mismos bits": ninguna de las dos implicaciones es válida en presencia de cero negativo.

NaN es más raro todavía: comparar cualquier NaN consigo mismo da **falso**. Es decir, si una variable `x` contiene NaN, `x == x` es false. Esta propiedad permite detectar NaN —la única manera portable de detectarlo es preguntar `x != x`—, pero rompe muchas asunciones implícitas sobre comparación de igualdad. En un sort sobre un array que contenga NaN, el algoritmo puede no terminar o producir resultados erráticos según la implementación.

Los **subnormales** ocupan el rango entre 0 y el menor número normal (que en simple precisión es $2^{-126}$). Su mantisa no tiene 1 implícito —el bit del frente vale 0—, lo que les permite representar valores cada vez más chicos a costa de perder precisión. Para los fines de este capítulo basta saber que existen y que llenan ese hueco; los detalles aritméticos son territorio de niveles más avanzados.

## Por qué `0.1 + 0.2` no da `0.3`

La pregunta se la hace cualquiera que abre un REPL de JavaScript o Python:

```text
>>> 0.1 + 0.2
0.30000000000000004
```

La respuesta es que `0.1`, `0.2` y `0.3` no son representables exactamente en binario finito. La fracción decimal `0.1` corresponde a una fracción binaria periódica —en binario, `0.1` se escribe `0.0001100110011...` con un patrón que se repite infinitamente—, igual que `1/3` es periódico en decimal (`0.333...`). Los 23 bits de mantisa solo pueden almacenar una **aproximación** de esa fracción, redondeando al patrón más cercano representable.

`0.1f` en bits es exactamente `0x3DCCCCCD`. Reconstruyendo el valor con la fórmula: $1.6 \cdot 10^{-1}$ aproximadamente, pero no exactamente $1/10$. Lo mismo pasa con `0.2f` y `0.3f`. Cuando un programa suma las dos primeras aproximaciones, el resultado tiene su propio error de redondeo y no coincide bit a bit con la aproximación de `0.3`. La diferencia es minúscula —del orden de $10^{-17}$ en doble precisión— pero existe, y cualquier comparación por igualdad la detecta.

La consecuencia operativa: **comparar floats por igualdad es frágil por construcción**. El patrón correcto es comparar con tolerancia: `abs(a - b) < epsilon` donde `epsilon` es una cota razonable para la precisión esperada. Algunos lenguajes ofrecen funciones específicas (`math.isclose` en Python). El error no es del compilador ni del procesador: es una consecuencia matemática de representar fracciones decimales en una mantisa binaria finita.

## Lo que sigue siendo dump hex y se lee igual

A pesar de la complicación de la fórmula, los floats en memoria son cuatro u ocho bytes como cualquier otro valor. La herramienta para inspeccionarlos es la misma: `xxd`, `hexdump`, una vista de memoria de un debugger. Lo que cambia es la convención de lectura, no la materia.

Dado un patrón de 4 bytes en un dump little-endian, el procedimiento para leerlo como float es:

1. Reconstruir el valor de 32 bits aplicando la convención LE (capítulo 08).
2. Separar los tres campos por bits: el bit 31 es el signo; los bits 30-23 son el exponente; los bits 22-0 son la mantisa.
3. Verificar si el exponente es 0 (cero o subnormal), 255 (infinito o NaN), o intermedio (valor normal).
4. Aplicar la fórmula correspondiente para obtener el valor numérico.

Es laborioso a mano para cualquier valor que no sea uno de los casos especiales tabulados, pero es completamente determinista: el patrón de bits y la convención IEEE 754 fijan el valor sin ambigüedad. La pregunta operativa del nivel —"dado este patrón y esta convención, ¿qué valor representa?"— se aplica acá igual que en los capítulos anteriores. Lo único que requiere costumbre es la fórmula con tres campos en lugar de una suma de pesos.

A partir de acá `L2` está completo. Con sin signo, complemento a dos, ASCII, UTF-8, endianness y IEEE 754 instalados, cualquier dump hex que aparezca en `L3` —secciones binarias de archivos `.o`, headers de ELF, fragmentos de código máquina— admite ser leído byte a byte, eligiendo en cada región la convención adecuada. La transición a `L3` consiste exactamente en eso: aplicar las convenciones de `L2` a artefactos producidos por el toolchain real.
