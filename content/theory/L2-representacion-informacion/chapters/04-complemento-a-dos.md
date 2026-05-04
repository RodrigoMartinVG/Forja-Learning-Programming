# Complemento a dos

## El bit más significativo como peso negativo

La convención sin signo cubre solo valores no negativos. Para representar enteros negativos en el mismo ancho hace falta una convención distinta, y la elegida —universalmente, en cualquier procesador moderno— se llama **complemento a dos**. La definición es minúscula: en un patrón de $n$ bits leído como entero con signo, el bit más significativo —el de la posición $n-1$— pesa **negativo** en lugar de positivo. Todos los demás bits pesan como en sin signo.

Para un byte de 8 bits, los pesos en complemento a dos son:

| posición | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|---|---|---|---|---|---|---|---|---|
| peso | −128 | +64 | +32 | +16 | +8 | +4 | +2 | +1 |

El bit 7 ahora pesa **−128** en vez de +128. Los demás siguen siendo $+2^i$ como antes. El valor total se calcula igual que en sin signo: sumar los pesos de los bits encendidos. La única diferencia es que el peso de la posición más alta es negativo.

Dos consecuencias inmediatas. Primera, los patrones que tienen el bit 7 apagado no incluyen el peso negativo y por lo tanto valen exactamente lo mismo que en sin signo: el byte `0x4F` (que es `01001111`) sigue valiendo 79. Segunda, los patrones con el bit 7 encendido aportan −128 al total, y el resto de los bits suma como mucho $64 + 32 + \ldots + 1 = 127$, así que el resultado siempre es negativo o cero. La división entre números positivos y negativos es nítida y depende solo del bit más significativo.

## Cálculo del valor en complemento a dos

El método operativo es directo: identificar el bit más significativo, sumarlo con peso negativo si está encendido, y agregar los pesos positivos del resto. Un ejemplo, sobre el byte `10000001`:

| posición | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|---|---|---|---|---|---|---|---|---|
| bit | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| peso aportado | −128 | · | · | · | · | · | · | +1 |

Bit 7 encendido aporta −128. Bit 0 encendido aporta +1. Suma: $-128 + 1 = -127$. El byte `10000001` vale −127 en complemento a dos, mientras que en sin signo vale 129. El mismo patrón, dos lecturas distintas.

Otro ejemplo, sobre el byte `11111111`:

| posición | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|---|---|---|---|---|---|---|---|---|
| bit | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| peso aportado | −128 | +64 | +32 | +16 | +8 | +4 | +2 | +1 |

Todos encendidos. Suma: $-128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = -1$. El byte `0xFF` vale −1 en complemento a dos, 255 en sin signo, y —como anticipaba el capítulo 00— ninguna de las dos lecturas es "más verdadera" que la otra.

## Cómo cambia el rango

El rango representable cambia con respecto a sin signo. En $n$ bits, complemento a dos cubre el intervalo $[-2^{n-1},\, 2^{n-1} - 1]$. Para los anchos típicos:

| Ancho | Mínimo | Máximo |
|---|---|---|
| 8 bits | −128 | 127 |
| 16 bits | −32 768 | 32 767 |
| 32 bits | −2 147 483 648 | 2 147 483 647 |
| 64 bits | $-2^{63}$ | $2^{63} - 1$ |

El rango es **asimétrico**: hay un valor negativo más que valores positivos. La explicación es directa. La cantidad total de patrones distinguibles sigue siendo $2^n$ —porque la cantidad de bits no cambió—, y hay que repartirlos entre negativos, cero y positivos. El cero ocupa un patrón. Los $2^n - 1$ patrones restantes se reparten en mitades casi iguales: $2^{n-1}$ negativos y $2^{n-1} - 1$ positivos. La asimetría es estructural, no un accidente.

La consecuencia más visible es que el valor mínimo no tiene opuesto representable. En 8 bits, $-128$ entra en el rango pero $+128$ no. En 32 bits, $-2^{31}$ entra pero $+2^{31}$ no. Cualquier intento de calcular `-x` cuando `x` es el mínimo va a producir un patrón que, leído otra vez en complemento a dos, sigue siendo el mínimo. Eso se trabaja más abajo en este capítulo y reaparece en el capítulo de overflow.

## Inversión de signo como consecuencia mecánica

La regla para invertir el signo de un valor en complemento a dos es: **invertir todos los bits y sumar 1**. Parece arbitraria, pero es una consecuencia mecánica del peso negativo del bit alto, no un axioma.

Tomar el patrón de un valor positivo $v$. Si invierto todos sus bits, obtengo un patrón cuyos bits son el complemento del original. La suma del patrón original con su complemento bit a bit, en cualquier ancho, da el patrón de "todos unos", que en complemento a dos vale −1. Es decir: $v + \overline{v} = -1$. Despejando: $\overline{v} = -1 - v = -(v + 1)$. Si quiero $-v$ tengo que sumar 1 a $\overline{v}$.

Un ejemplo trabajado, sobre el valor +3 en 8 bits:

| Paso | Patrón |
|---|---|
| Patrón de +3 | `00000011` |
| Invertir bits | `11111100` |
| Sumar 1 | `11111101` |

Verificación: el patrón `11111101` tiene bits encendidos en las posiciones 7, 6, 5, 4, 3, 2, 0. Suma de pesos: $-128 + 64 + 32 + 16 + 8 + 4 + 1 = -3$. Funciona.

Otro ejemplo, sobre +127:

| Paso | Patrón |
|---|---|
| Patrón de +127 | `01111111` |
| Invertir bits | `10000000` |
| Sumar 1 | `10000001` |

Verificación: el patrón `10000001` tiene bits encendidos en 7 y 0. Suma: $-128 + 1 = -127$. Funciona.

El caso del mínimo, en cambio, **no funciona**. El patrón de −128 es `10000000`. Invertirlo da `01111111`. Sumar 1 da `10000000` —el mismo patrón original—. La razón es que +128 no es representable en 8 bits con signo: el rango se queda corto. Cuando la regla "invertir y sumar 1" se aplica al mínimo, lo que el patrón resultante representa sigue siendo el mínimo, no su opuesto. El opuesto matemático existe; el opuesto representable, no.

## El mismo patrón leído sin signo y con signo

La idea más importante del capítulo es que **el patrón de bits no cambia**: cambia la convención bajo la cual se lo lee. Un programa que escribe el byte `0xFF` en una posición de memoria y otro que lo lee no necesita "convertir" entre representaciones para que ambos vean el mismo byte. Lo que necesita acuerdo es la convención de interpretación.

La tabla siguiente lista los 8 patrones de 4 bits con MSB encendido, comparando ambas lecturas:

| Patrón | Hex | Sin signo | Compl. a dos (4 bits) |
|---|---|---|---|
| `1000` | `0x8` | 8 | −8 |
| `1001` | `0x9` | 9 | −7 |
| `1010` | `0xA` | 10 | −6 |
| `1011` | `0xB` | 11 | −5 |
| `1100` | `0xC` | 12 | −4 |
| `1101` | `0xD` | 13 | −3 |
| `1110` | `0xE` | 14 | −2 |
| `1111` | `0xF` | 15 | −1 |

Cada fila es un solo patrón con dos valores legítimos. La convención se elige antes de leer; el patrón en sí no decide. En un programa C, esa elección está fijada por el tipo declarado de la variable: `uint8_t` lee el byte sin signo, `int8_t` lo lee en complemento a dos. Pero los bytes en memoria no llevan ninguna marca que distinga un tipo del otro: la marca vive en el código que los lee.

## Por qué esta convención y no otra

Existieron históricamente otras convenciones para representar enteros con signo. **Magnitud y signo** dedicaba el bit más alto a marcar el signo y leía el resto como magnitud, lo que producía dos patrones distintos para el cero (`+0` y `−0`). **Complemento a uno** representaba el negativo invirtiendo todos los bits, sin sumar 1, también con dos ceros. Las dos convenciones son matemáticamente coherentes, pero ninguna llegó al cómputo moderno: todos los procesadores actuales usan complemento a dos, sin excepciones relevantes para este nivel.

La razón de la elección es operativa, no estética. En complemento a dos, la operación de suma de enteros con signo es **idéntica** a la suma de enteros sin signo en el plano de los bits: el mismo circuito sumador del procesador funciona para las dos convenciones. La instrucción `ADD` no necesita saber si los operandos son positivos, negativos o sin signo: produce el mismo patrón de bits en los tres casos, y la convención se aplica recién cuando el resultado se lee. La resta también se reduce a sumar el complemento. La unidad aritmética del procesador queda más simple, más rápida y más chica.

Magnitud y signo no comparte esa propiedad: sumar dos números en magnitud y signo requiere lógica distinta según los signos relativos de los operandos, lo cual obligaría a un sumador más complicado. Complemento a uno mejora la situación pero deja un acarreo final que también complica el circuito. Complemento a dos es el único que reduce la suma con signo a la suma sin signo, y por eso ganó.

Una consecuencia indirecta: el hecho de que la operación de bits sea la misma en ambas convenciones explica por qué el overflow puede manifestarse de manera distinta según se lea el resultado. La aritmética es la misma; la lectura es la que cambia, y con la lectura cambia el síntoma observable.
