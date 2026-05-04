# Texto como bytes: ASCII

## La tabla ASCII como acuerdo

Hasta acá los bytes se leyeron como números enteros. La pregunta de este capítulo es distinta: ¿cómo se representa **texto** en bytes? La respuesta requiere una convención adicional, porque los bytes son patrones de bits y los caracteres de texto —letras, dígitos, signos de puntuación— son entidades simbólicas que no tienen un valor numérico inherente. La convención que conecta unos con otros se llama una **codificación de caracteres**, y la más antigua y simple en uso continuo se llama ASCII.

ASCII —*American Standard Code for Information Interchange*— es una tabla publicada en 1963 que asigna a cada uno de los 128 patrones de 7 bits un caracter del alfabeto inglés, los dígitos, signos de puntuación comunes y un puñado de caracteres de control. La tabla cubre los valores de 0 a 127 y nada más: los patrones con el bit 7 encendido —valores de 128 a 255— no están definidos por ASCII puro y dependen de extensiones que se tratan aparte.

La estructura de la tabla es regular. Los caracteres se agrupan en cuatro bloques de 32:

- **Caracteres de control** (0x00–0x1F): bytes que no representan glyphs visibles sino órdenes para terminales antiguas. Algunos sobrevivieron al desuso del teletipo: `\n` (0x0A, *line feed*), `\r` (0x0D, *carriage return*), `\t` (0x09, *tab*), `\0` (0x00, *null*).
- **Imprimibles bajos** (0x20–0x3F): el espacio (0x20), los signos de puntuación comunes y los dígitos del 0 al 9. Los dígitos son consecutivos: `'0'` es 0x30, `'1'` es 0x31, hasta `'9'` que es 0x39.
- **Letras mayúsculas y signos** (0x40–0x5F): `'@'`, las 26 letras mayúsculas (`'A'` = 0x41, hasta `'Z'` = 0x5A) y algunos signos.
- **Letras minúsculas y signos** (0x60–0x7F): el acento grave, las 26 letras minúsculas (`'a'` = 0x61, hasta `'z'` = 0x7A), más caracteres como `{`, `}`, `~`, y al final el control 0x7F (*delete*).

## Imprimibles y caracteres de control

La tabla siguiente lista el subset imprimible —los bytes 0x20 a 0x7E—, que son los que aparecen en cualquier dump de texto en inglés:

| Hex | Char | Hex | Char | Hex | Char | Hex | Char |
|---|---|---|---|---|---|---|---|
| `0x20` | (espacio) | `0x40` | `@` | `0x60` | `` ` `` | (vacío) | |
| `0x21` | `!` | `0x41` | `A` | `0x61` | `a` | | |
| `0x22` | `"` | `0x42` | `B` | `0x62` | `b` | | |
| `0x23` | `#` | `0x43` | `C` | `0x63` | `c` | | |
| `0x24` | `$` | `0x44` | `D` | `0x64` | `d` | | |
| `0x25` | `%` | `0x45` | `E` | `0x65` | `e` | | |
| `0x26` | `&` | `0x46` | `F` | `0x66` | `f` | | |
| `0x27` | `'` | `0x47` | `G` | `0x67` | `g` | | |
| `0x28` | `(` | `0x48` | `H` | `0x68` | `h` | | |
| `0x29` | `)` | `0x49` | `I` | `0x69` | `i` | | |
| `0x2A` | `*` | `0x4A` | `J` | `0x6A` | `j` | | |
| `0x2B` | `+` | `0x4B` | `K` | `0x6B` | `k` | | |
| `0x2C` | `,` | `0x4C` | `L` | `0x6C` | `l` | | |
| `0x2D` | `-` | `0x4D` | `M` | `0x6D` | `m` | | |
| `0x2E` | `.` | `0x4E` | `N` | `0x6E` | `n` | | |
| `0x2F` | `/` | `0x4F` | `O` | `0x6F` | `o` | | |
| `0x30` | `0` | `0x50` | `P` | `0x70` | `p` | | |
| `0x31` | `1` | `0x51` | `Q` | `0x71` | `q` | | |
| `0x32` | `2` | `0x52` | `R` | `0x72` | `r` | | |
| `0x33` | `3` | `0x53` | `S` | `0x73` | `s` | | |
| `0x34` | `4` | `0x54` | `T` | `0x74` | `t` | | |
| `0x35` | `5` | `0x55` | `U` | `0x75` | `u` | | |
| `0x36` | `6` | `0x56` | `V` | `0x76` | `v` | | |
| `0x37` | `7` | `0x57` | `W` | `0x77` | `w` | | |
| `0x38` | `8` | `0x58` | `X` | `0x78` | `x` | | |
| `0x39` | `9` | `0x59` | `Y` | `0x79` | `y` | | |
| `0x3A` | `:` | `0x5A` | `Z` | `0x7A` | `z` | | |
| `0x3B` | `;` | `0x5B` | `[` | `0x7B` | `{` | | |
| `0x3C` | `<` | `0x5C` | `\` | `0x7C` | `\|` | | |
| `0x3D` | `=` | `0x5D` | `]` | `0x7D` | `}` | | |
| `0x3E` | `>` | `0x5E` | `^` | `0x7E` | `~` | | |
| `0x3F` | `?` | `0x5F` | `_` | | | | |

Tres regularidades operativas se desprenden de la tabla:

- La diferencia entre una letra mayúscula y su minúscula es exactamente $0x20 = 32$. `'A'` es 0x41, `'a'` es 0x61. Esa diferencia es el bit 5 del byte: encendido en minúsculas, apagado en mayúsculas. Cambiar el caso de una letra ASCII es cambiar un bit.
- El dígito `'0'` no vale 0: vale 0x30. Convertir un caracter dígito a su valor numérico requiere restar 0x30.
- Los caracteres no se ordenan alfabéticamente entre mayúsculas y minúsculas: `'Z'` (0x5A) viene antes que `'a'` (0x61). Una comparación lexicográfica byte a byte trata `'Z'` como menor que `'a'`, lo cual no coincide con el orden del diccionario.

Los caracteres de control son menos visibles pero tan reales como los imprimibles. En un dump, la columna de lectura ASCII de `xxd` los reemplaza por puntos, lo que oculta su presencia. Los más comunes:

| Hex | Nombre | Significado |
|---|---|---|
| `0x00` | NUL | byte cero, fin de cadena en C |
| `0x09` | TAB | tabulador horizontal |
| `0x0A` | LF | salto de línea (Unix, macOS moderno) |
| `0x0D` | CR | retorno de carro (legacy Mac, parte del fin de línea Windows) |
| `0x1B` | ESC | escape, prefijo de secuencias de terminal |
| `0x7F` | DEL | borrar |

El byte 0x00 es el que merece más atención: en C, una cadena de caracteres es una secuencia de bytes terminada por 0x00. La función `strlen` recorre la cadena hasta encontrar ese byte. Si el byte de fin se pierde, `strlen` sigue leyendo memoria que no le pertenece.

## Cadenas como secuencias con fin acordado

La idea de "cadena de texto" no es nativa de la materia: lo que hay en memoria es una secuencia de bytes. Para que un programa sepa dónde termina una cadena hace falta una **convención de fin** acordada por las dos partes que la usan.

Las dos convenciones más comunes en la práctica:

- **Fin con byte cero** (estilo C). La cadena termina cuando aparece el byte `0x00`. Ningún caracter ASCII imprimible es 0x00, así que el byte está libre para usarse como marca. La cadena `"Hola"` ocupa 5 bytes en memoria: `0x48 0x6F 0x6C 0x61 0x00`.
- **Longitud explícita** (estilo Pascal, Rust, Go). El primer byte (o un campo previo de varios bytes) almacena la longitud y los siguientes bytes son los caracteres, sin marcador de fin.

Los lenguajes modernos suelen usar longitud explícita por dos razones: permite cadenas que contengan el byte cero, y permite calcular `strlen` en tiempo constante en lugar de tiempo proporcional al largo. C mantuvo la convención del byte cero por razones históricas, y todos los archivos `.c` que se van a leer en niveles posteriores —en `L9` y siguientes— funcionan así.

## Lectura de un archivo de texto con `xxd`

Un ejemplo concreto. El archivo `saludo.txt` se crea con un comando de shell:

```
$ echo "Hello, World!" > saludo.txt
$ xxd saludo.txt
00000000: 4865 6c6c 6f2c 2057 6f72 6c64 210a       Hello, World!.
```

Catorce bytes en total. Leyendo byte por byte con la tabla ASCII:

| Hex | Char | Hex | Char |
|---|---|---|---|
| `0x48` | `H` | `0x6F` | `o` |
| `0x65` | `e` | `0x72` | `r` |
| `0x6C` | `l` | `0x6C` | `l` |
| `0x6C` | `l` | `0x64` | `d` |
| `0x6F` | `o` | `0x21` | `!` |
| `0x2C` | `,` | `0x0A` | (LF) |
| `0x20` | (espacio) | | |
| `0x57` | `W` | | |

El último byte es `0x0A`, el line feed, que `xxd` muestra como un punto en la columna ASCII. Si el archivo se hubiera creado con `echo -n` —sin newline final— el dump tendría 13 bytes y no 14. La diferencia es invisible en un editor de texto, pero los bytes están todos.

Una observación importante: el archivo no tiene byte de fin de cadena. Los archivos en disco no usan la convención del 0x00; el "fin" lo establece el tamaño del archivo, almacenado por el sistema operativo en el directorio. La convención del byte cero es de C en memoria, no de archivos.

## Lo que ASCII no representa

ASCII no cubre nada fuera del alfabeto inglés. Las letras acentuadas —`á`, `é`, `ñ`, `ü`—, los caracteres de otros alfabetos —griego, cirílico, hebreo, árabe—, los ideogramas asiáticos, los emojis, los símbolos matemáticos: nada de eso tiene un patrón asignado en los 128 valores de 7 bits.

Históricamente esa limitación se intentó resolver primero con extensiones de un solo byte que aprovechaban los valores 128 a 255, asignando a cada uno un caracter dependiente del idioma o región. Latin-1 (oficial: ISO-8859-1) cubre español, francés, alemán, italiano y otros idiomas europeos. Hubo otras extensiones distintas para cirílico, griego, hebreo, etc. Las extensiones eran incompatibles entre sí: el byte `0xE9` valía `é` en Latin-1, una letra distinta en Latin-2, otra en codificaciones cirílicas. Un archivo escrito bajo una extensión y abierto bajo otra producía mojibake —caracteres acentuados que aparecen como símbolos raros—, una experiencia familiar para quien usó computadoras antes de 2010.

La solución a ese desorden se llama **Unicode**, y la codificación que la lleva a la práctica es **UTF-8**. Lo que importa de ASCII para entender UTF-8 es que ASCII queda como subconjunto exacto: los bytes 0x00 a 0x7F representan en UTF-8 los mismos caracteres que en ASCII, con el bit alto en cero. Cualquier archivo ASCII puro es también un archivo UTF-8 válido sin modificación. Esa compatibilidad hacia atrás es una de las razones por las que UTF-8 ganó frente a otras codificaciones de Unicode.
