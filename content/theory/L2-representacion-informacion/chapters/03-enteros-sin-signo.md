# Enteros sin signo

## Pesos por posición

La convención más simple para leer un patrón de bits como número se llama **representación sin signo en notación posicional binaria**. La idea es la misma que en decimal: cada posición del número tiene un peso, y el valor total es la suma de los pesos de los dígitos encendidos. Lo único que cambia entre decimal y binario es la base de los pesos.

En decimal, el número `307` se lee como $3 \cdot 10^2 + 0 \cdot 10^1 + 7 \cdot 10^0 = 300 + 0 + 7$. Cada dígito multiplica una potencia de 10, y el exponente crece de derecha a izquierda. En binario, los dígitos solo pueden ser 0 o 1 —están "apagados" o "encendidos"— y la base es 2 en lugar de 10. El bit de la posición $i$, contado desde la derecha empezando en cero, pesa $2^i$.

Así, el byte `00010110`, leído de izquierda a derecha, tiene los bits encendidos en las posiciones 4, 2 y 1 (numeradas desde la derecha):

```
posición:  7  6  5  4  3  2  1  0
bit:       0  0  0  1  0  1  1  0
peso:    128 64 32 16  8  4  2  1
```

Los bits encendidos son los de pesos 16, 4 y 2. La suma es $16 + 4 + 2 = 22$. El byte `00010110` representa, bajo la convención sin signo, el valor 22.

La regla es general: en un patrón de $n$ bits, la posición más a la derecha pesa $2^0 = 1$, la siguiente $2^1 = 2$, y así hasta la más a la izquierda, que pesa $2^{n-1}$. La tabla siguiente lista los pesos hasta 16 bits, suficiente para cualquier conversión razonable a mano:

| Posición $i$ | Peso $2^i$ | Posición $i$ | Peso $2^i$ |
|---|---|---|---|
| 0 | 1 | 8 | 256 |
| 1 | 2 | 9 | 512 |
| 2 | 4 | 10 | 1 024 |
| 3 | 8 | 11 | 2 048 |
| 4 | 16 | 12 | 4 096 |
| 5 | 32 | 13 | 8 192 |
| 6 | 64 | 14 | 16 384 |
| 7 | 128 | 15 | 32 768 |

Los patrones se memorizan rápido: 1, 2, 4, 8, 16, 32, 64, 128 cubren un byte; doblar uno más da 256, 512, 1024 (que muchas veces se llama 1K en este contexto, no en sentido métrico estricto). A partir de la posición 10 los pesos crecen tan rápido que rara vez hay que sumarlos a mano.

## Convertir binario a decimal sumando pesos

El método directo es: identificar las posiciones encendidas, anotar el peso de cada una, sumar. La cuenta no exige nada más. Un ejemplo trabajado, sobre el byte `10110100`:

```
posición:  7  6  5  4  3  2  1  0
bit:       1  0  1  1  0  1  0  0
peso:    128  -  32 16  -  4  -  -
```

Las posiciones encendidas son 7, 5, 4 y 2. La suma es $128 + 32 + 16 + 4 = 180$. El byte `10110100` vale 180 sin signo.

Para anchos mayores el método no cambia: solo crece la cantidad de posiciones a inspeccionar. Para un valor de 16 bits es razonable separar el byte alto y el byte bajo, convertir cada uno por separado, y combinar al final con la fórmula `valor_total = byte_alto · 256 + byte_bajo`. Por ejemplo, el patrón de 16 bits `0000 0001 0010 0011`:

- Byte alto `00000001` = 1.
- Byte bajo `00100011` = 32 + 2 + 1 = 35.
- Valor total = $1 \cdot 256 + 35 = 291$.

Esa descomposición —pensar en grupos de 8 bits y combinar— se vuelve útil más adelante cuando aparezca endianness, que se trata exactamente sobre dos bytes que combinan así.

## Convertir decimal a binario por divisiones

La dirección inversa requiere un procedimiento sistemático. El método estándar es dividir repetidamente por 2 y leer los restos en orden inverso. Cada división produce un resto que es 0 o 1, y ese resto es uno de los bits del resultado. La convención es que el primer resto producido es el bit menos significativo (posición 0).

Un ejemplo, con el decimal 173:

| División | Cociente | Resto | Bit |
|---|---|---|---|
| 173 / 2 | 86 | 1 | bit 0 |
| 86 / 2 | 43 | 0 | bit 1 |
| 43 / 2 | 21 | 1 | bit 2 |
| 21 / 2 | 10 | 1 | bit 3 |
| 10 / 2 | 5 | 0 | bit 4 |
| 5 / 2 | 2 | 1 | bit 5 |
| 2 / 2 | 1 | 0 | bit 6 |
| 1 / 2 | 0 | 1 | bit 7 |

Leyendo los restos de abajo hacia arriba —del bit más significativo al menos significativo— el patrón es `10101101`. Verificación: $128 + 32 + 8 + 4 + 1 = 173$. Coincide.

Existe un atajo cuando el valor está cerca de una potencia de 2 conocida. El decimal 200 está cerca de 256 ($2^8$). Como $256 - 200 = 56 = 32 + 16 + 8$, el valor 200 se puede pensar como "la potencia 256 menos los pesos 32, 16, 8". En patrón directo: $200 = 128 + 64 + 8 = $ posiciones 7, 6, 3 encendidas, lo cual da `11001000`. Las dos vías llegan al mismo patrón.

## Rango y máximo de un ancho dado

Con $n$ bits sin signo, el rango representable es $[0,\, 2^n - 1]$. El valor 0 corresponde al patrón con todos los bits apagados; el valor máximo, al patrón con todos los bits encendidos. Para los anchos típicos:

| Ancho | Mínimo | Máximo |
|---|---|---|
| 8 bits | 0 | 255 |
| 16 bits | 0 | 65 535 |
| 32 bits | 0 | 4 294 967 295 |
| 64 bits | 0 | 18 446 744 073 709 551 615 |

Hay un punto sutil: el rango llega hasta $2^n - 1$, **no** hasta $2^n$. La razón es que el patrón "todo ceros" cuenta como un valor (el cero), por lo cual los $2^n$ patrones distinguibles cubren los valores 0, 1, 2, …, $2^n - 1$, y no 1 a $2^n$. Confundir el máximo con $2^n$ es uno de los errores comunes en la lectura inicial: el último valor representable en 8 bits sin signo es 255, no 256.

El número $2^n$ no es representable con $n$ bits, y la cota es dura: cualquier operación sin signo cuyo resultado matemático llegue a $2^n$ o más, no entra.

## Lectura combinada con hex

Como hex es la escritura compacta de los mismos bits, convertir hex a decimal sin signo es directo: expandir cada dígito hex a sus 4 bits y aplicar el método anterior. Pero hay un atajo más rápido cuando los valores son chicos: pensar cada dígito hex como un dígito en base 16, igual que se piensan los dígitos en decimal.

Bajo esa lectura, el byte `0xA3` vale $A \cdot 16 + 3 = 10 \cdot 16 + 3 = 163$. Verificación cruzada: el byte `0xA3` en binario es `10100011`, cuyas posiciones encendidas (7, 5, 1, 0) suman $128 + 32 + 2 + 1 = 163$. Coincide.

Para valores de 16 bits, el método se generaliza: cada par de dígitos hex es un byte, y los bytes se combinan como antes. El valor `0x1234` se calcula como $0x12 \cdot 256 + 0x34 = 18 \cdot 256 + 52 = 4608 + 52 = 4660$. La lectura es directa una vez que los pesos por posición —ahora pesos por dígito hex— se vuelven automáticos: $16^0 = 1$, $16^1 = 16$, $16^2 = 256$, $16^3 = 4096$.

A partir de acá, ningún capítulo del nivel va a volver a escribir un byte en binario salvo cuando el patrón de bits importe específicamente —el bit de signo en complemento a dos, los bits de cabecera en UTF-8, el desglose de los tres campos de un float—. La escritura por defecto va a ser hex, y la conversión a decimal va a apoyarse en los pesos por dígito hex que este capítulo deja instalados.
