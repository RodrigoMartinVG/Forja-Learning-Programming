# Bits, bytes y ancho finito

En `L1` alcanzaba con mirar cosas como `mem[40] = 7` y seguir cómo cambiaba el estado. En `L2` hace falta bajar un nivel más: dejar de tratar ese `7` como una cantidad abstracta sin cuerpo y empezar a preguntarse qué patrón exacto está guardado.

Ahí aparece la primera intuición fuerte del nivel: dentro de la máquina no hay valores infinitos ni ideas matemáticas puras. Hay patrones finitos de bits, agrupados en bytes, ocupando un ancho concreto.

> Laboratorio: en este capítulo conviene trabajar primero con ancho de `8` bits y después repetir las mismas escenas con `16`. La pregunta útil no es solo "qué valor veo", sino "cuántos bits tengo y qué patrón exacto cabe ahí".

## Bit como diferencia mínima

Un **bit** no conviene pensarlo como un numerito minúsculo. Conviene pensarlo como la diferencia mínima que este modelo necesita para distinguir dos estados posibles.

En la notación usual esos dos estados se escriben como `0` y `1`.

Con un solo bit, la máquina puede distinguir solo dos patrones:

| Cantidad de bits | Patrones posibles |
|---|---|
| `1` | `0`, `1` |

Eso alcanza para fijar una idea importante: un bit aislado no sirve para "guardar cualquier número". Sirve para aportar una diferencia mínima dentro de un patrón más grande.

Por eso, cuando `L2` hable de representación, casi nunca alcanzará con nombrar un bit suelto. Lo que importa es:

- cuántos bits hay disponibles
- qué patrón forman juntos
- bajo qué regla se los está leyendo

El bit es la materia mínima. El significado aparece recién cuando varios bits se agrupan y alguien decide cómo interpretarlos.

## Byte como unidad práctica

En la práctica, el agrupamiento que más conviene fijar temprano es el **byte**.

Para este nivel, alcanza con la convención habitual:

- `1 byte = 8 bits`

Eso ya trae una consecuencia operativa fuerte. Si un byte tiene 8 bits, entonces puede formar $2^8 = 256$ patrones distintos.

No hace falta enumerarlos todos para ver el punto. Alcanza con notar que un byte puede contener desde:

```text
00000000
```

hasta:

```text
11111111
```

y todo lo que hay entre ambos.

El byte entra tan temprano en el nivel por una razón práctica, no decorativa:

- es la unidad con la que conviene leer memoria
- es la unidad con la que hexadecimal conversa mejor
- es la unidad mínima sobre la que después se agrupan valores más grandes

Más adelante aparecerán valores de 16, 32 o 64 bits. Pero incluso ahí conviene recordar que el piso material sigue siendo el mismo: bytes.

## Una dirección nombra un byte

Esta es una de las intuiciones más importantes de `L2`: en el modelo base del nivel, una **dirección de memoria nombra un byte**.

Eso significa que si la memoria se ve así:

| Dirección | Byte almacenado |
|---|---|
| `20` | `00010010` |
| `21` | `00110100` |
| `22` | `01010110` |
| `23` | `01111000` |

las direcciones `20`, `21`, `22` y `23` avanzan de a una unidad porque cada una nombra un byte distinto.

La memoria no "salta" de 4 en 4 cuando querés leer un valor de 32 bits. Lo que pasa es otra cosa:

- las direcciones crudas siguen avanzando byte a byte
- una lectura tipada de 32 bits agrupa cuatro de esas direcciones consecutivas como un solo valor lógico

Por eso, si una vista activa decide leer un `u32` empezando en `mem[20]`, ese valor ocupa exactamente este rango:

- `mem[20]`
- `mem[21]`
- `mem[22]`
- `mem[23]`

La memoria sigue siendo byte-addressable. Lo que cambió fue la **ventana** con la que elegiste leer varios bytes juntos.

Ese punto evita una confusión muy común: pensar que la dirección misma ya trae pegado el "tamaño del dato". No. La dirección nombra un byte. El tamaño del dato aparece en la lectura que hacés sobre bytes consecutivos.

## El ancho importa

Una representación finita siempre trae una pregunta práctica: ¿cuántos bits tengo?

El ancho importa porque determina cuántos patrones distintos caben.

| Ancho | Patrones posibles |
|---|---|
| `8` bits | $2^8 = 256$ |
| `16` bits | $2^{16} = 65536$ |
| `32` bits | $2^{32}$ |

No hace falta todavía traducir todos esos patrones a enteros signed o unsigned. Lo importante en este punto es ver que el ancho no es un detalle cosmético.

Cambiar el ancho cambia:

- cuántos patrones distintos entran
- cuánto espacio ocupa un valor en memoria
- qué resultados caben completos y cuáles ya no

Por ejemplo, el patrón:

```text
00000111
```

usa 8 bits. Si quisieras leer "el mismo valor" sobre 16 bits, ya no estarías mirando exactamente el mismo patrón, sino uno más ancho, por ejemplo:

```text
00000000 00000111
```

La intuición útil es esta: cuando el ancho cambia, no solo cambia el rango disponible. Cambia también la forma material con la que el valor queda almacenado.

Más adelante aparecerán overflow y truncado. Pero ambos dependen de algo que ya puede verse acá: un ancho finito obliga a elegir qué patrones caben y cuáles no.

## El mismo patrón no trae significado pegado

Hasta acá ya apareció varias veces la idea central del nivel: el patrón material no trae sentido pegado de antemano.

Tomá este byte:

```text
11111111
```

Ese patrón no dice por sí solo "soy tal número". Su lectura depende de la convención elegida.

Más adelante, en el capítulo siguiente, ese mismo byte podrá leerse por ejemplo como:

- `255` si se toma como entero sin signo de 8 bits
- `-1` si se toma como entero con signo en complemento a dos

Y en otros contextos todavía podría aparecer como:

- `0xFF` si lo escribís en hexadecimal
- el byte alto o bajo de un valor más grande
- una pieza de un texto o de un formato binario

El patrón no cambió. Cambió la lectura.

Esa idea ya venía insinuada desde `L1`, cuando código y dato podían compartir la misma memoria sin ser "materias distintas". En `L2` aparece la versión material de la misma intuición: la secuencia almacenada es una; sus interpretaciones posibles pueden ser varias.

Si esto no queda firme ahora, más adelante es fácil caer en frases engañosas como estas:

- "ese byte es negativo"
- "esa dirección contiene un entero"
- "esos cuatro bytes son un `u32` por naturaleza"

En todos los casos conviene corregir la frase de la misma manera: esos bits o bytes **pueden leerse** así bajo cierta convención. El significado no viaja soldado al patrón.

## Qué vuelve visible esta capa

Con este capítulo ya quedan visibles varias piezas que en `L1` todavía podían mantenerse implícitas:

- un dato dentro de la máquina vive como un patrón finito
- el byte es la unidad práctica con la que conviene mirar memoria
- una dirección nombra un byte, no un valor lógico completo
- un valor más grande puede ocupar varias direcciones consecutivas
- el ancho cambia tanto el rango como la forma material del almacenamiento
- un mismo patrón no trae un único significado obligatorio

Eso prepara el terreno para lo que sigue:

- el capítulo siguiente vuelve operativa la diferencia entre unsigned y signed
- después aparecerán overflow y truncado como efectos normales de trabajar con anchos finitos
- más adelante hexadecimal y endianness volverán práctica la lectura de esos mismos bytes

L2 no pide todavía dominar todas esas capas a la vez. Pide algo más austero y más importante: dejar de pensar el dato como una cantidad abstracta sin materia. A partir de acá, cada vez que aparezca un valor dentro de la máquina, conviene preguntar primero por su patrón, su ancho y su lectura.