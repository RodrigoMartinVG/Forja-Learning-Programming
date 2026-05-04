# Texto como bytes: ASCII y UTF-8

El capítulo anterior dejó una herramienta práctica para mirar bytes sin perder de vista sus bits: hexadecimal. Este capítulo agrega otra familia de lecturas sobre esos mismos bytes. No todos los patrones se miran solo como enteros. Muchos también se leen como texto.

Eso importa más de lo que parece.

Cuando una persona ve `H`, `o`, `l`, `a`, tiende a pensar en letras, palabras y significado. Pero la máquina no ve letras. Ve bytes. Si ese punto no queda firme, después es fácil caer en un reduccionismo engañoso: creer que el texto es una sustancia distinta a los números, cuando en realidad también vive como patrones finitos de bits y bytes.

Ahí entran ASCII y UTF-8.

No entran como teoría general de strings ni como semántica de un lenguaje concreto. Entran porque un hexdump real rara vez contiene solo números. También contiene bytes que, bajo cierta convención, representan caracteres. Y esas convenciones obligan a pensar mejor qué significa leer un flujo de bytes.

> Laboratorio: en este capítulo conviene mantener visible al mismo tiempo el dump hexadecimal, la vista ASCII simple y una lectura numérica sobre el mismo rango. La pregunta útil no es solo “qué texto veo”, sino “qué bytes exactos hay y bajo qué convención estoy diciendo que eso es texto”.

## 0x41 no es solo 65

Tomá este byte:

```text
01000001
```

En hexadecimal se escribe:

```text
0x41
```

Si lo leés como entero unsigned de `8` bits, vale `65`.

Pero bajo la convención ASCII simple, ese mismo byte también representa el carácter:

```text
A
```

Nada material cambió entre una lectura y la otra.

- el byte sigue siendo `0x41`
- su patrón de bits sigue siendo `01000001`
- la memoria no guarda una versión “numérica” y otra “textual”

Lo único que cambió fue la convención con la que decidiste interpretar ese byte.

Ese punto hace avanzar la idea central de `L2`. Hasta ahora el contraste fuerte había sido unsigned contra signed. Acá aparece otra familia de lecturas: los mismos bytes también pueden leerse como símbolos.

Eso obliga a precisar mejor la pregunta correcta. Cuando ves un bloque de memoria, no alcanza con preguntar “¿qué valor tiene?”. También hace falta preguntar:

- ¿lo estoy leyendo como entero, como texto o como otra cosa?
- ¿estoy mirando bytes sueltos o una unidad lógica más grande?
- ¿la convención que uso consume siempre la misma cantidad de bytes o no?

## ASCII como lectura byte a byte

ASCII es una codificación simple para texto básico. Históricamente define `128` símbolos, o sea `2^7` posibilidades. Eso quiere decir que su repertorio entra en `7` bits.

En la práctica, como la memoria moderna se mira byte a byte, ASCII suele aparecer guardado en bytes completos. Lo esperable en ASCII puro es que el bit más alto quede en `0` y que el valor efectivo esté en el rango `0x00` a `0x7F`.

ASCII no solo codifica letras. También incluye:

- dígitos
- signos de puntuación
- espacio
- algunos controles simples, como salto de línea

Algunos ejemplos útiles:

| Byte | Unsigned | ASCII |
|---|---|---|
| `0x41` | `65` | `A` |
| `0x61` | `97` | `a` |
| `0x20` | `32` | espacio |
| `0x30` | `48` | `0` |
| `0x39` | `57` | `9` |
| `0x0A` | `10` | salto de línea |

Lo importante no es memorizar toda la tabla. Lo importante es fijar la forma de lectura:

- ASCII simple mira bytes de a uno
- cada byte representa un carácter dentro de un repertorio limitado
- el texto aparece como secuencia de bytes consecutivos

Por eso, si en memoria ves esto:

```text
0x20: 48 6F 6C 61
```

y aplicás ASCII simple byte a byte, obtenés:

```text
Hola
```

La lectura textual no elimina la lectura material. Al contrario: depende de ella. Si no sabés qué bytes hay, tampoco sabés qué texto creés estar viendo.

También conviene desarmar una confusión muy común. El carácter `5` no es el mismo objeto que el valor numérico `5`.

- el dígito textual `5` en ASCII se guarda como `0x35`
- el entero unsigned `5` en un byte se guarda como `0x05`

Visualmente ambos pueden remitir a “cinco”, pero materialmente son bytes distintos porque pertenecen a lecturas distintas.

Eso ya alcanza para una intuición operativa fuerte: un archivo de texto, una línea leída desde terminal o un string en memoria no dejan de ser bytes por parecer humanos. Siguen siendo bytes. Solo que alguien acordó una tabla para leerlos como caracteres.

## El mismo bloque como texto y como número

Conviene detenerse un momento en una comparación que el laboratorio ahora ya deja visible.

Tomá este bloque:

```text
34 32
```

Como ASCII simple, esos dos bytes se leen así:

```text
42
```

Pero eso no significa que la memoria haya guardado el valor lógico `42` como entero de `16` bits.

Si quisieras guardar `42` como unsigned de `16` bits en little endian, el patrón material sería otro:

```text
2A 00
```

Eso deja una distinción muy importante:

- `34 32` puede significar el texto `42`
- `2A 00` puede significar el entero `42` en `u16` little endian

La coincidencia visual entre “cuarenta y dos” como texto y `42` como valor abstracto no autoriza a mezclar codificación con significado.

En la máquina, esas dos cosas viven como bytes distintos.

Podés empujar un poco más esa comparación con otro ejemplo:

```text
31 32 33
```

Como ASCII simple, eso es:

```text
123
```

Pero como tres `u8`, eso es:

```text
49 50 51
```

Y si quisieras guardar el entero `123` como `u32` little endian, el bloque material sería:

```text
7B 00 00 00
```

Otra vez: mismo significado humano aproximado, representación material distinta.

## UTF-8 como codificación de longitud variable

ASCII simple alcanza para fijar la idea de texto como bytes, pero no alcanza para representar la enorme variedad de caracteres que aparecen en textos reales.

Ahí entra UTF-8.

Antes de seguir, conviene separar dos cosas que suelen mezclarse:

- **Unicode** nombra un repertorio amplio de caracteres y puntos de código
- **UTF-8** es una manera concreta de codificar esos caracteres como bytes

No hace falta abrir acá toda la teoría de Unicode. Pero sí hace falta evitar un reduccionismo confuso: UTF-8 no es “el conjunto de caracteres”. UTF-8 es una estrategia de codificación sobre bytes.

La idea central de UTF-8 es esta:

- conserva ASCII intacto para el rango básico `0x00` a `0x7F`
- usa secuencias de `2`, `3` o `4` bytes cuando hace falta salir de ese repertorio
- marca la forma de la secuencia en los bits altos del primer byte y de los bytes siguientes

Eso rompe una falsa seguridad muy común:

- una unidad lógica de texto no siempre ocupa exactamente un byte

### Compatibilidad con ASCII

Si un texto usa solo caracteres ASCII básicos, UTF-8 produce exactamente los mismos bytes que ASCII.

Por ejemplo:

| Texto | Bytes en UTF-8 |
|---|---|
| `Hola` | `48 6F 6C 61` |
| `123` | `31 32 33` |
| `A` | `41` |

Eso no es un detalle menor. Es una de las razones por las que UTF-8 resultó tan útil: no rompe el caso simple.

### Cómo marca UTF-8 la longitud

UTF-8 no deja la longitud librada al contexto humano. La marca en la propia forma de los bytes.

Los patrones importantes son estos:

```text
0xxxxxxx                         -> secuencia de 1 byte
110xxxxx 10xxxxxx               -> secuencia de 2 bytes
1110xxxx 10xxxxxx 10xxxxxx      -> secuencia de 3 bytes
11110xxx 10xxxxxx 10xxxxxx 10xxxxxx -> secuencia de 4 bytes
```

La idea operativa es muy valiosa:

- si un byte empieza con `0`, puede ser un carácter ASCII completo por sí solo
- si empieza con `110`, `1110` o `11110`, está anunciando el comienzo de una secuencia más larga
- si empieza con `10`, no es un comienzo: es un byte de continuación

Eso ya permite ver por qué UTF-8 no es una sopa arbitraria de bytes. Tiene estructura. El comienzo de la secuencia le dice al decodificador cuántos bytes debe consumir para reconstruir una unidad lógica.

### Ejemplos concretos

Algunos ejemplos ayudan más que una definición comprimida:

| Carácter | Bytes en UTF-8 | Longitud |
|---|---|---|
| `A` | `41` | 1 byte |
| `ñ` | `C3 B1` | 2 bytes |
| `€` | `E2 82 AC` | 3 bytes |
| `🙂` | `F0 9F 99 82` | 4 bytes |

Lo importante no es memorizar estos casos. Lo importante es notar el patrón:

- un carácter simple del rango ASCII puede ocupar `1` byte
- otros caracteres necesitan `2`, `3` o `4` bytes
- el decodificador no adivina: mira la forma del primer byte y sigue la estructura esperada

Eso vuelve más rica la idea de `L2`: incluso dentro del mundo del texto, la memoria sigue siendo un bloque uniforme de bytes. Lo que cambia es cómo una convención decide agruparlos para reconstruir unidades lógicas.

También conviene agregar un matiz importante: no cualquier secuencia arbitraria de bytes es UTF-8 válido. La codificación tiene reglas. Eso significa que “parece texto” y “es una secuencia válida según la convención elegida” no son la misma afirmación.

## Qué pasa si corrés el cursor

La memoria sigue siendo direccionable por bytes. Una dirección nombra un byte. Eso no cambió.

Pero una decodificación como UTF-8 agrega otra pregunta: ¿desde qué byte empezás a leer?

Tomá esta secuencia:

```text
63 61 66 C3 A9
```

Leída en UTF-8 desde el principio, eso da:

```text
café
```

Los primeros tres caracteres ocupan `1` byte cada uno. El último ocupa `2` bytes.

Si empezás a leer desde `C3`, todavía estás entrando por el comienzo correcto de la última unidad lógica. Pero si movés el cursor al byte `A9` y pretendés arrancar desde ahí como si nada hubiera pasado, ya no estás entrando por el comienzo del carácter. Caíste en el medio de la secuencia.

Ese fenómeno no hace a la memoria “más complicada”. Hace visible otra diferencia entre dos capas:

- **cursor por byte**: una dirección puede empezar en cualquier byte
- **cursor de decodificación**: no toda posición sirve igual como comienzo de una unidad lógica

UTF-8, de hecho, deja una pista útil: los bytes de continuación empiezan con `10`. Si caés sobre uno de ellos, ya sabés que no estás parado al comienzo de una unidad. No es magia. Es estructura codificada en los propios bytes.

Eso vale para texto y después reaparecerá en otros contextos donde un flujo de bytes no puede cortarse arbitrariamente sin perder significado.

## Por qué la longitud variable importa tanto

La longitud variable es interesante por al menos dos motivos.

El primero es práctico.

Si todo carácter ocupara siempre `4` bytes, el caso simple sería caro e innecesariamente grande para textos llenos de ASCII básico. UTF-8 evita eso: conserva el caso común compacto y paga más bytes solo cuando hace falta.

El segundo es conceptual.

UTF-8 obliga a pensar como piensa un parser o un decodificador real:

- no toda unidad lógica tiene tamaño fijo
- el comienzo de una secuencia orienta cómo seguir leyendo
- correr el cursor a un byte cualquiera no garantiza que sigas entrando por el comienzo de algo válido

Esa idea no pertenece solo al texto.

Más adelante reaparece en encodings de instrucciones y opcodes. En arquitecturas con instrucciones de longitud variable, como `x86`, no todas las instrucciones ocupan el mismo número de bytes. El decodificador usa ciertos bytes iniciales para saber si hay prefijos, qué opcode está viendo, si después viene un `ModR/M`, un desplazamiento o un inmediato. Otra vez aparece la misma intuición fuerte:

- un flujo material de bytes puede contener unidades lógicas de tamaño variable
- para reconstruirlas, no alcanza con contar bytes a ciegas: hay que seguir reglas de decodificación
- si entrás en el medio, podés perder sincronización con la estructura real

Por eso UTF-8 es interesante en sí mismo. No solo porque sirve para texto, sino porque entrena una idea más general: un byte stream puede requerir una lectura estructurada donde la propia forma de los bytes guía la reconstrucción de unidades lógicas.

## Qué anticipa y qué no

Este capítulo deja abierta una intuición estratégica, pero no necesita convertirla todavía en otro curso completo.

Lo que sí anticipa:

- que un flujo de bytes puede codificar unidades lógicas de tamaño variable
- que el cursor material y el cursor de decodificación no siempre coinciden
- que un mismo bloque puede seguir teniendo varias lecturas plausibles sin que la memoria “elija” por sí sola
- que la idea de longitud variable no se agota en texto y reaparece en otros encodings

Lo que no conviene abrir todavía en `L2`:

- teoría general de strings
- bibliotecas o tipos concretos de lenguajes
- `char`, `NUL`, encoding APIs o detalles de Unicode más finos
- normalización, grapheme clusters o semánticas avanzadas de texto
- formatos textuales reales como eje dominante del nivel

Con esta intuición más desarrollada alcanza. `L2` no necesita convertir el texto en un tema aparte. Necesita algo más fuerte y más claro: que cuando aparezcan bytes que “parecen letras”, ya no suenen como materia misteriosa. Siguen siendo patrones finitos de bytes. Lo que cambió fue la lectura que aplicaste sobre ellos. Y cuando esa lectura tiene longitud variable, el propio patrón empieza a decirte cómo debe ser recorrido.