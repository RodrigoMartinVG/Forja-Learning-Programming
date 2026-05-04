# Hexadecimal como apoyo de lectura

## Por qué binario solo no alcanza

Un byte tiene 8 bits, y escribirlo en binario ocupa 8 dígitos: `01001111`. Para un byte aislado todavía es manejable, pero cualquier inspección real de memoria —el dump de un programa, los primeros bytes de un archivo, el contenido de un buffer— involucra decenas o cientos de bytes seguidos. Una línea de 16 bytes en binario son 128 dígitos sin agrupamiento natural, una pared de ceros y unos donde el ojo se pierde. La materia es legible, pero la **escritura** es hostil.

Decimal no resuelve el problema. El byte `01001111` vale 79 sin signo: ningún error matemático, pero el número 79 no muestra cómo están agrupados los bits ni qué porciones del patrón corresponden a la mitad alta y la mitad baja del byte. Si el bit 6 cambia y el byte pasa a `00001111`, el valor decimal cae a 15 —una distancia de 64—, y la conexión entre el cambio binario y el cambio decimal queda implícita en la cuenta. Decimal es bueno para humanos que piensan en cantidades; es malo para humanos que piensan en patrones de bits.

Hexadecimal —base 16— resuelve los dos problemas a la vez: es mucho más compacto que binario y es directamente convertible a binario sin cuentas. La razón es que 16 es exactamente $2^4$: un dígito hexadecimal codifica cuatro bits.

## Nibbles y bytes en hex

La unidad intermedia entre bit y byte es el **nibble**: un grupo de 4 bits. Cada nibble representa $2^4 = 16$ patrones distintos, y cada uno de esos patrones se escribe con un solo dígito hexadecimal. La tabla siguiente lista los 16 dígitos con su patrón binario y su valor decimal:

| Hex | Binario | Decimal |
|---|---|---|
| `0` | `0000` | 0 |
| `1` | `0001` | 1 |
| `2` | `0010` | 2 |
| `3` | `0011` | 3 |
| `4` | `0100` | 4 |
| `5` | `0101` | 5 |
| `6` | `0110` | 6 |
| `7` | `0111` | 7 |
| `8` | `1000` | 8 |
| `9` | `1001` | 9 |
| `A` | `1010` | 10 |
| `B` | `1011` | 11 |
| `C` | `1100` | 12 |
| `D` | `1101` | 13 |
| `E` | `1110` | 14 |
| `F` | `1111` | 15 |

Los seis dígitos extra después del 9 se escriben con las letras `A` a `F`, que se admiten en mayúscula o minúscula —`a` y `A` valen lo mismo—. La convención del repositorio, alineada con la salida de `xxd` y `hexdump`, es minúscula.

Como un byte son 8 bits y un nibble son 4, **un byte se escribe con exactamente dos dígitos hex**. El nibble alto corresponde a los 4 bits superiores; el nibble bajo, a los 4 inferiores. El byte `01001111` se parte en `0100` (alto) y `1111` (bajo), que en hex son `4` y `F`. El byte completo es `0x4F`.

## Conversión nibble a nibble

La conversión bidireccional es directa porque no hay aritmética cruzada entre nibbles: cada uno se traduce independientemente. Para pasar de binario a hex, el procedimiento es agrupar los bits en bloques de 4 desde la derecha y traducir cada grupo. Para pasar de hex a binario, expandir cada dígito a sus 4 bits.

Un ejemplo trabajado en ambas direcciones, sobre el byte `0xA3`:

- **Hex → binario.** El nibble alto es `A`, que vale `1010`. El nibble bajo es `3`, que vale `0011`. Concatenando: `10100011`. El byte completo es `10100011`.
- **Binario → hex.** El byte `10100011` se parte en `1010` (alto) y `0011` (bajo). El nibble `1010` es `A`. El nibble `0011` es `3`. El byte completo es `0xA3`.

Ningún paso requiere multiplicar, dividir ni acarrear. La operación es una traducción simbólica de cuatro bits por dígito. En la práctica, después de algunos ejercicios, los 16 patrones se aprenden de memoria y la traducción se vuelve automática. Lo único que requiere atención es **el orden de los nibbles**: en `0xA3`, el `A` corresponde a los bits altos y el `3` a los bajos, igual que en decimal el dígito a la izquierda pesa más. La izquierda es más significativa también en hex.

## Notación: prefijos `0x` y dumps tabulares

En código, los literales hexadecimales se escriben con el prefijo `0x` —en C, C++, Rust, Go, Java, Python, JavaScript y la mayor parte de los lenguajes en uso—. El prefijo no es parte del valor: es una marca para el lector y para el parser que indica "lo que sigue está en base 16". El literal `0x4F` y el literal decimal `79` representan el mismo entero. La diferencia es de escritura, no de valor.

En un dump hexadecimal el prefijo se omite por compacidad: cada byte aparece como dos dígitos hex sin adorno, y el contexto fija la convención. Un dump típico producido por `xxd` se ve así:

```text
00000000: 4865 6c6c 6f2c 2057 6f72 6c64 210a       Hello, World!.
```

La línea tiene tres regiones, separadas por dos puntos y por espacios:

- **Offset** `00000000`: la dirección del primer byte de la línea, escrita en hex con padding a 8 dígitos. Acá vale 0 porque es el principio del archivo.
- **Bytes en hex**: `4865 6c6c 6f2c 2057 6f72 6c64 210a`. Trece bytes, agrupados visualmente de a dos para que el ojo distinga palabras de 16 bits sin perder los bytes individuales. La agrupación es decorativa: es la misma secuencia que `48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21 0a`.
- **Lectura ASCII**: `Hello, World!.`. Es la columna donde cada byte se reemplaza por el caracter ASCII correspondiente —si es imprimible— o por un punto —si es de control o no-ASCII—.

Esa última columna es ya una convención aplicada, y es opcional: existe en `xxd` como ayuda visual, no como requisito del formato.

## Hex en herramientas reales: `xxd` y `hexdump`

Las dos herramientas Unix más usadas para producir dumps hex son `xxd` y `hexdump`. Las dos vienen instaladas por defecto en cualquier distribución Linux moderna y en las versiones recientes de macOS. Para el repositorio, la herramienta de referencia es `xxd`, porque tiene un formato de salida estable y compacto.

El uso básico es directo:

```text
$ echo -n "Hello, World!" > saludo.txt
$ xxd saludo.txt
00000000: 4865 6c6c 6f2c 2057 6f72 6c64 21          Hello, World!
```

`hexdump` produce una salida similar pero con convenciones distintas:

```text
$ hexdump -C saludo.txt
00000000  48 65 6c 6c 6f 2c 20 57  6f 72 6c 64 21           |Hello, World!|
```

Misma información, dos presentaciones. La que aparezca en cada herramienta del repositorio se va a aclarar cuando corresponda.

A partir de este capítulo, cada vez que el nivel necesite mostrar un patrón de bytes va a usar hex. La razón ya está instalada: hex es la escritura compacta del mismo patrón, y cada dígito traduce a 4 bits sin ambigüedad. Lo que sigue —enteros, complemento a dos, ASCII, UTF-8, endianness, floats— se va a apoyar en lectura hex como herramienta de inspección por defecto.
