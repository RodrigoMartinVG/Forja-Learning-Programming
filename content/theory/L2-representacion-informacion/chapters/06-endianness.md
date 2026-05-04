# Endianness y orden de bytes

El capítulo anterior agregó otra familia de lecturas sobre los mismos bytes: texto simple y una primera intuición de codificación de longitud variable. Este capítulo vuelve a una pregunta distinta, que aparece apenas esos bytes empiezan a formar valores más grandes que un solo byte: si un valor ocupa `2`, `4` u `8` bytes, ¿en qué orden quedan guardados en memoria?

Ahí entra endianness.

No entra para complicar la notación. Entra porque un valor lógico multi-byte no vive en una "celda mágica" indivisible: vive repartido en varias direcciones consecutivas. Y entonces el orden de esos bytes importa.

> Laboratorio: en este capítulo conviene fijar un mismo valor de `16` o `32` bits y alternar solo el orden de bytes en memoria. La pregunta útil no es solo "qué byte va primero", sino "qué sigue igual aunque cambie el orden y qué lectura necesito para reconstruir el valor".

## Un valor puede ocupar varias direcciones consecutivas

En `L2`, la memoria sigue siendo direccionable por bytes. Eso no cambió.

Lo que sí cambia cuando el valor es más grande es esto: una lectura tipada ya no toma una sola dirección, sino varias consecutivas.

Por ejemplo:

- un valor de `8` bits ocupa `1` byte
- un valor de `16` bits ocupa `2` bytes
- un valor de `32` bits ocupa `4` bytes
- un valor de `64` bits ocupa `8` bytes

Si una lectura de `32` bits empieza en `mem[0x20]`, entonces ese valor lógico ocupa exactamente:

- `mem[0x20]`
- `mem[0x21]`
- `mem[0x22]`
- `mem[0x23]`

Ese punto conviene retenerlo porque endianness no cambia la cantidad de bytes que ocupa el valor. Tampoco cambia el hecho de que las direcciones avanzan de a un byte por vez. Lo único que discute es el orden en que esos bytes se acomodan dentro del rango ocupado.

## Un valor repartido en varios bytes

Tomá este valor de `32` bits:

```text
0x12345678
```

Si lo separás por bytes, queda así:

```text
0x12 0x34 0x56 0x78
```

Eso ya deja ver algo importante:

- el valor lógico es uno
- los bytes materiales que lo componen son varios

Cuando hablás de endianness, no estás cambiando esos bytes. Seguís hablando de `0x12`, `0x34`, `0x56` y `0x78`. Lo que cambia es cuál de ellos queda en la dirección más baja y cuáles le siguen después.

Por eso conviene pensar el problema así:

- primero: qué bytes componen el valor
- después: en qué orden se almacenan en direcciones consecutivas

Sin esa separación, es fácil creer que endianness "cambia el número". No. Lo que cambia es el orden material de los bytes en memoria.

## Little endian y big endian

Las dos convenciones principales son estas:

- **big endian**: el byte más significativo queda en la dirección más baja
- **little endian**: el byte menos significativo queda en la dirección más baja

Con el mismo valor `0x12345678`, eso se ve así.

En **big endian**:

| Dirección | Byte |
|---|---|
| `0x20` | `0x12` |
| `0x21` | `0x34` |
| `0x22` | `0x56` |
| `0x23` | `0x78` |

En **little endian**:

| Dirección | Byte |
|---|---|
| `0x20` | `0x78` |
| `0x21` | `0x56` |
| `0x22` | `0x34` |
| `0x23` | `0x12` |

La diferencia ya se ve con claridad:

- el rango de direcciones ocupado es el mismo
- los bytes que participan son los mismos
- el valor lógico que querés representar sigue siendo el mismo
- cambia solo el orden en que esos bytes aparecen en memoria

Conviene no traducir esto a una frase vaga como "uno va al revés". Conviene decir exactamente qué byte queda en la dirección menor y cómo se reconstruye el valor a partir de ahí.

## Qué cambia y qué no cambia

Endianness suele confundir porque mezcla cosas que deberían ir separadas.

Lo que **sí cambia**:

- qué byte aparece primero en la dirección más baja
- cómo se ve el valor cuando inspeccionás memoria byte a byte
- cómo tenés que recomponer el valor lógico desde esos bytes

Lo que **no cambia**:

- la memoria sigue avanzando byte a byte
- el valor ocupa la misma cantidad total de bytes
- cada byte conserva sus bits internos tal como está
- el valor lógico abstracto que querés codificar puede ser el mismo en ambas convenciones

Ese tercer punto importa mucho. Endianness **no** da vuelta los bits dentro de cada byte.

Si un byte es `0x12`, sus bits siguen siendo:

```text
00010010
```

No se convierten en otra cosa por pasar de big a little endian. Lo único que cambia es en qué dirección queda ese byte dentro del conjunto.

Esa distinción evita un error muy común: confundir orden de bytes con orden de bits. Endianness habla del orden de varios bytes, no del interior de cada byte.

## Texto byte a byte y valores multi-byte

El capítulo anterior deja un contraste útil para no inflar endianness más de la cuenta.

Tomá estos cuatro bytes:

```text
48 6F 6C 61
```

Si los leés como ASCII simple byte a byte, obtenés:

```text
Hola
```

Ahí no hace falta endianness porque no estás diciendo que esos cuatro bytes formen un único valor lógico de `32` bits. Estás leyendo cuatro bytes consecutivos como cuatro caracteres consecutivos.

Pero si ese mismo bloque se interpreta como un `u32`, la situación cambia.

- en big endian, la lectura sería `0x486F6C61`
- en little endian, la lectura sería `0x616C6F48`

Los bytes materiales no cambiaron. Cambió la decisión de agruparlos como un valor multi-byte y, con eso, apareció la necesidad de fijar un orden de reconstrucción.

Ese contraste conviene retenerlo así:

- una secuencia de bytes leída byte a byte como texto no plantea el mismo problema que un valor lógico que ocupa varios bytes
- endianness no es una propiedad general de “todo bloque de memoria”, sino de la reconstrucción de valores multi-byte bajo cierta lectura tipada

## Cómo aparece en memoria

Cuando esto aparece en una tabla o en un dump, la diferencia deja de ser teórica y se vuelve inmediatamente visible.

Para el mismo valor `0x12345678`, podrías ver esto en big endian:

```text
0x20: 12 34 56 78
```

y esto en little endian:

```text
0x20: 78 56 34 12
```

Si no sabés la convención usada, mirar solo los bytes no alcanza para reconstruir el valor multi-byte correcto.

Por eso, frente a memoria real conviene mantener siempre separados estos dos planos:

- **cursor por byte**: qué hay exactamente en `0x20`, `0x21`, `0x22`, `0x23`
- **ventana tipada**: cómo esos bytes se agrupan para leer un `u16`, `u32` o `u64`

El cursor por byte no tiene endianness: solo te muestra bytes en direcciones consecutivas. La ventana tipada sí necesita saber el orden correcto para recomponer el valor lógico.

Esto también explica por qué una sobrescritura parcial puede cambiar lecturas más grandes. Si cambiás uno de los bytes dentro del rango ocupado, el valor multi-byte reconstruido cambia, y la posición de ese byte dentro del valor depende justamente del endianness usado.

## Por qué esto reaparece más adelante

Endianness vuelve una y otra vez porque cualquier lugar donde haya valores multi-byte y memoria observable termina necesitando esta distinción.

Aparece más adelante:

- cuando leas hexdumps y dumps de memoria reales
- cuando mires formatos binarios o headers de archivos
- cuando una red o un protocolo definan un orden concreto de bytes
- cuando un debugger te muestre memoria cruda y vos tengas que reconstruir valores
- cuando aparezcan structs, layout y campos que ocupan varios bytes

Si esto queda firme ahora, más adelante no debería sonar como una jerga misteriosa. Debería sonar como lo que realmente es: una convención para ordenar bytes dentro de un valor multi-byte ya repartido en memoria.

Eso también prepara bien el cierre del nivel. Después de bits, bytes, signedness, overflow, truncado, hexadecimal y endianness, ya queda visible casi todo lo necesario para abrir la última intuición de `L2`: incluso cuando el patrón usa varios campos internos, como en floating point, sigue siendo una representación finita con tradeoffs y límites propios.