# Bit, byte y ancho finito

## Bit como dígito binario

Un bit es un dígito binario: vale 0 o vale 1, sin valores intermedios. La palabra es contracción de *binary digit* y data de los años cuarenta, pero el concepto es más viejo: cualquier sistema con dos estados estables sirve para almacenar un bit. En la electrónica de una computadora actual, un bit suele estar representado por dos niveles de tensión (uno alto, uno bajo) sostenidos por un circuito biestable, pero el modelo no depende de la implementación física. Lo que importa, para el resto del nivel, es que un bit es la unidad atómica de información: el menor recurso que permite distinguir dos alternativas.

Un solo bit no alcanza para casi nada. Sirve para representar una elección binaria (prendido o apagado, presente o ausente, válido o inválido), pero no para un número arbitrario, ni para un caracter, ni para una dirección de memoria. Lo que sí ofrece es una propiedad combinatoria fuerte: si un bit distingue 2 alternativas, dos bits distinguen 4, tres bits 8, y en general $n$ bits distinguen $2^n$ alternativas. Esa propiedad combinatoria, el crecimiento exponencial de la capacidad representativa con el número de bits, es la que vuelve útil agruparlos.

## Byte como agrupación de 8 bits

El byte es la agrupación estándar de 8 bits. La elección de 8 no es matemáticamente necesaria (existieron máquinas con bytes de 6, 7 y 9 bits), pero se consolidó con la familia IBM System/360 a mediados de los años sesenta y desde entonces es la unidad universal del cómputo. En cualquier procesador moderno, en cualquier sistema operativo en uso, en cualquier formato de archivo, un byte son 8 bits.

Ese acuerdo tiene una consecuencia operativa importante: la **memoria está direccionada por byte**. Cuando en `L1` se hablaba de "la posición 40 de la memoria", esa posición contiene un byte (8 bits), no un bit suelto ni una palabra completa. Los programas no pueden pedirle al hardware "el bit en la posición 320": lo que pueden pedir es el byte en la posición 40, y operar sobre sus bits internamente. La unidad mínima de direccionamiento es el byte.

Un byte representa $2^8 = 256$ patrones distintos. Esos patrones son lo siguientes:

```text
00000000
00000001
00000010
...
11111110
11111111
```

256 filas. Ninguna repetida, ninguna omitida. Cuál de esos patrones se le asigne a qué valor —entero, caracter, fragmento de instrucción— depende de la convención que se use para leerlos, y los capítulos siguientes van a ir mostrando convenciones distintas. Pero la materia subyacente, el patrón en sí, es siempre uno de esos 256.

La palabra *convención* hace trabajo pesado en este nivel y vale la pena precisarla. Una convención no es un capricho del lector: un patrón no significa lo que cada uno decida que signifique en el momento de leerlo. Una convención es un acuerdo previo y compartido sobre cómo se interpreta el patrón, fijado antes de la lectura. Dos lectores que apliquen la misma convención al mismo byte llegan al mismo valor; si llegan a valores distintos, alguno de los dos está leyendo bajo otra convención. La libertad está en elegir qué convención se aplica, no en qué dice la convención elegida.

## Cuántos valores caben en n bits

La fórmula es $2^n$ para $n$ bits. La razón es directa: cada bit duplica el espacio de patrones. Con un bit hay 2 patrones; agregar un segundo bit produce dos copias del espacio anterior —una con el nuevo bit en 0, otra con el nuevo bit en 1—, y así sucesivamente. La tabla siguiente lista los anchos más relevantes para el nivel:

| Ancho ($n$ bits) | Cantidad de patrones ($2^n$) | Lectura común |
|---|---|---|
| 1 | 2 | un bit, una elección binaria |
| 4 | 16 | un nibble, un dígito hex |
| 8 | 256 | un byte |
| 16 | 65 536 | dos bytes, una *palabra corta* |
| 32 | 4 294 967 296 | cuatro bytes, una *palabra* |
| 64 | 18 446 744 073 709 551 616 | ocho bytes, una *palabra larga* |

Los números crecen muy rápido. Un ancho de 32 bits cubre el orden de los miles de millones; uno de 64 bits, los trillones. Esa diferencia explica por qué los procesadores actuales son mayoritariamente de 64 bits: con 32 bits la cantidad de direcciones de memoria distinguibles —del orden de 4 mil millones, es decir 4 GiB— se quedaba corta para las cantidades de RAM y los espacios de direcciones que el cómputo moderno necesita.

Lo importante de la tabla, más allá de los valores concretos, es que la cantidad de patrones es **exacta**, no aproximada. Un ancho de 8 bits no cubre "alrededor de 250 valores": cubre exactamente 256, ni uno más ni uno menos. Esa exactitud es la que permite razonar sobre rangos, overflow y truncado en los capítulos siguientes.

## Ancho como límite estructural

El ancho de una representación es una propiedad del **tipo**, no del valor concreto. Cuando un programa declara una variable como `uint8_t`, no está diciendo "guardame este valor concreto en un byte si entra"; está diciendo "esta posición de memoria mide un byte, y todo lo que viva ahí va a leerse según ese ancho". El ancho está fijado antes de que llegue ningún valor, y los valores tienen que adaptarse a él.

Esto contradice una intuición razonable cuando uno empieza a programar: que los enteros son "ilimitados" y crecen a demanda. En aritmética matemática, eso es cierto: el conjunto $\mathbb{Z}$ no tiene cota superior. En aritmética de máquina, en cambio, todo entero vive dentro de un ancho fijo, y ese ancho impone una cota dura. Si la operación produce un resultado que no entra en el ancho disponible, **algo tiene que pasar**: el resultado se trunca, se envuelve, dispara una excepción, o reaparece con un valor distinto. Cuál de esas cosas pasa depende de la convención y del lenguaje, y se trabaja en el capítulo 05.

Algunos lenguajes (Python, Ruby, ciertos modos de JavaScript) ofrecen enteros de "ancho arbitrario" que parecen romper esta restricción. No la rompen: la trasladan. Por debajo, esos enteros se representan como cadenas de bytes de longitud variable, y la cota deja de ser un ancho fijo para volverse la memoria total disponible. La materia sigue siendo finita; lo que cambia es la unidad. En los lenguajes donde el ancho es explícito —C, C++, Rust, Go, assembly—, la restricción es directamente visible.

## Por qué los anchos típicos son potencias pequeñas de 2

La pregunta de por qué los anchos comunes son 8, 16, 32, 64 (y no, por ejemplo, 10 o 24) admite varias respuestas alineadas. La primera, ya mencionada, es histórica: el byte de 8 bits se consolidó en los años sesenta y todo el ecosistema posterior se construyó sobre múltiplos de esa unidad. Una palabra de 16 bits son dos bytes; una de 32, cuatro; una de 64, ocho. Cualquier ancho que no sea múltiplo de 8 obligaría a que un valor "no termine donde termina un byte", lo cual rompe la correspondencia entre ancho y direccionamiento.

La segunda es operativa. Las direcciones de memoria también son patrones de bits, almacenados en registros. Si el ancho de las direcciones es 64 bits, los anchos de los datos manipulables son potencias de 2 menores o iguales (1, 2, 4, 8 bytes) porque eso permite alinearlos en memoria de manera regular y operar con ellos en una sola instrucción del procesador. Una palabra de 24 bits no se alinearía limpiamente en una memoria byte-direccionable, y el hardware tendría que hacer dos accesos donde hoy hace uno.

La tercera es ergonómica. Con anchos potencia de 2, las cuentas con bits funcionan: dividir un valor de 32 bits en cuatro bytes es directo; reagrupar dos bytes en una palabra de 16 bits, también. Si el ancho fuera 10, ninguna de esas operaciones tendría una correspondencia natural con la unidad de direccionamiento. La regularidad combinatoria que `2^n` ofrece (duplicar bits duplica patrones) se traduce, a nivel de implementación, en una regularidad estructural que el hardware aprovecha.

El nivel se queda con cinco anchos: 1 bit (caso límite, conceptual), 4 bits (nibble, en hex), 8 bits (byte, base de todo), 16 bits, 32 bits y 64 bits. Cualquier convención que aparezca de acá en adelante —enteros, complemento a dos, floats— se va a anclar en uno de estos anchos. La pregunta *"¿de qué ancho es esto?"* va a aparecer antes que la pregunta *"¿qué valor representa?"*, porque sin ancho la segunda no tiene respuesta.
