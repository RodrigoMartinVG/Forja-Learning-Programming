# Hexadecimal y lectura humana de bytes

Los capítulos anteriores dejaron varias piezas firmes: la máquina trabaja con patrones finitos, esos patrones ocupan bits y bytes, y la interpretación depende del ancho y de la lectura elegida. Este capítulo agrega una herramienta más austera, pero igual de importante: una manera práctica de mirar esos bytes sin ahogarse en binario puro.

Ahí entra hexadecimal.

No entra como adorno matemático ni como tema de "bases numéricas" por sí mismo. En `L2`, hexadecimal entra porque conversar con bytes reales en binario se vuelve incómodo demasiado rápido.

También entra por una razón de continuidad con el resto del track. Más adelante van a aparecer herramientas industriales y salidas reales donde hexadecimal deja de ser opcional: hexdumps, `xxd`, `od`, `objdump`, dumps de debugger, headers de archivos y tablas de bytes dentro de artefactos del pipeline. Este capítulo no intenta enseñar cada herramienta todavía. Intenta algo anterior: que, cuando lleguen, la notación ya no se sienta ajena.

> Laboratorio: en este capítulo conviene mantener visibles al mismo tiempo la vista binaria agrupada por nibbles, la vista hexadecimal y la tabla de bytes. La pregunta útil no es solo "cómo se escribe este valor", sino "qué agrupamiento me deja leer el mismo patrón sin perder de vista sus bits".

## Por qué binario puro no escala

En ejemplos chicos, el binario sirve bien. Un byte como:

```text
10100111
```

todavía se puede leer con algo de paciencia.

El problema aparece cuando los patrones crecen. Un valor de `32` bits ya se ve así:

```text
11010010101101110001010111100010
```

Y uno de `64` bits ya deja de ser razonable para la lectura humana si no lo agrupás de alguna manera.

La dificultad no es que el binario sea "incorrecto". La dificultad es otra:

- cada dígito binario aporta muy poca información visual por sí solo
- los grupos útiles para la máquina son bytes, no tiras infinitas sin cortes
- a medida que el ancho crece, distinguir bytes o patrones parciales a ojo se vuelve costoso

Por eso, si querés leer memoria, hexdumps o tablas de bytes sin sufrir, necesitás una notación intermedia más compacta, pero que siga manteniendo una relación directa con los bits reales.

Hexadecimal resuelve exactamente eso.

## Nibble y hexadecimal

La pieza que conecta binario con hexadecimal es el **nibble**: un grupo de `4` bits.

Eso importa porque `4` bits pueden formar exactamente $2^4 = 16$ patrones distintos. Y hexadecimal tiene exactamente `16` símbolos:

- `0` a `9`
- `A` a `F`

La correspondencia conviene verla completa al menos una vez:

| Binario | Hex |
|---|---|
| `0000` | `0` |
| `0001` | `1` |
| `0010` | `2` |
| `0011` | `3` |
| `0100` | `4` |
| `0101` | `5` |
| `0110` | `6` |
| `0111` | `7` |
| `1000` | `8` |
| `1001` | `9` |
| `1010` | `A` |
| `1011` | `B` |
| `1100` | `C` |
| `1101` | `D` |
| `1110` | `E` |
| `1111` | `F` |

De ahí sale la ventaja práctica fuerte del capítulo:

- `1` dígito hexadecimal representa `4` bits
- `2` dígitos hexadecimales representan `1` byte

Por eso un byte como:

```text
10100111
```

puede agruparse así:

```text
1010 0111
```

y leerse como:

```text
A7
```

Muchas herramientas lo escriben como `0xA7`, donde `0x` solo indica "lo que sigue está en hexadecimal".

Hexadecimal no cambia el valor almacenado. No cambia el byte. Solo cambia la notación con la que lo estás mirando.

## Pasar entre binario, hex y decimal

La conversión entre binario y hexadecimal conviene hacerla por agrupamiento, no por heroicidad mental.

Tomá este byte:

```text
00101100
```

Lo agrupás en nibbles:

```text
0010 1100
```

y después reemplazás cada nibble por su dígito hex:

```text
2C
```

Así que:

- binario: `00101100`
- hexadecimal: `0x2C`

Si además querés la lectura decimal unsigned, ese mismo patrón vale `44`.

Conviene mirar esa triple relación como una sola cosa:

| Binario | Hex | Decimal unsigned |
|---|---|---|
| `00101100` | `0x2C` | `44` |
| `11111111` | `0xFF` | `255` |
| `00010000` | `0x10` | `16` |

Ese cuadro permite fijar dos ideas importantes.

La primera: hexadecimal conversa mucho mejor con bytes que decimal. `0x2C` conserva la estructura del byte de una manera que `44` no conserva.

La segunda: hexadecimal no decide el significado signed o unsigned.

Por ejemplo:

- `0xFF` es una manera de escribir el byte `11111111`
- si lo leés como unsigned de `8` bits, vale `255`
- si lo leés como signed en complemento a dos de `8` bits, vale `-1`

Ese punto importa mucho: hexadecimal es una notación del patrón. No te impone por sí solo qué lectura decimal usar después.

## Leer dumps y tablas sin sufrir

La ventaja real de hexadecimal aparece cuando empezás a mirar varios bytes juntos.

Tomá esta tabla de memoria:

| Dirección | Byte |
|---|---|
| `0x20` | `0x12` |
| `0x21` | `0x34` |
| `0x22` | `0x56` |
| `0x23` | `0x78` |

Eso también puede aparecer en un formato más compacto, parecido a un hexdump:

```text
0x20: 12 34 56 78
```

Leer eso bien requiere separar planos:

- `0x20` nombra una dirección de memoria
- cada par como `12`, `34`, `56`, `78` nombra un byte
- la línea completa no te dice todavía si esos bytes forman un `u32`, cuatro `u8` o parte de otra estructura

Hexadecimal vuelve visible algo que en decimal suele quedar borroso: el agrupamiento por bytes.

Por eso, cuando veas dumps, tablas de memoria o direcciones más adelante, conviene sostener estas reglas cortas:

- dos dígitos hex suelen equivaler a un byte
- ocho dígitos hex suelen equivaler a `32` bits
- dieciséis dígitos hex suelen equivaler a `64` bits
- la notación hex muestra el patrón con comodidad, pero no resuelve sola la interpretación

Ese último punto prepara directamente el capítulo siguiente. Si ves:

```text
0x20: 12 34 56 78
```

todavía faltan dos preguntas que conviene separar:

- esos bytes podrían ser texto u otra lectura byte a byte antes de formar un valor grande
- si efectivamente forman un valor multi-byte, en qué orden deben reconstruirse

Por eso el capítulo siguiente no salta todavía directo a endianness. Antes conviene abrir una lectura más sobre el mismo dump: texto como bytes.

Si ves:

```text
0x20: 48 6F 6C 61
```

hexadecimal ya te deja leer el patrón sin sufrir. Lo que todavía falta decidir es si eso se mirará como cuatro bytes, como texto simple, como parte de una codificación variable o como un valor tipado más grande.

Recién después, cuando quieras reconstruir un mismo valor lógico multi-byte sobre varios bytes consecutivos, aparece la siguiente pregunta:

- ¿en qué orden deben leerse esos bytes?

Ahí entrará endianness.

Hexadecimal no reemplaza el binario ni el decimal. Los articula.

- el binario deja ver los bits exactos
- hexadecimal deja ver bytes y grupos grandes sin perder relación con los bits
- decimal deja expresar ciertas lecturas numéricas de forma más familiar

`L2` necesita las tres vistas. Pero cuando empiecen a aparecer memoria real, tablas y dumps, hexadecimal pasa a ser la notación de trabajo más práctica para no perder de vista que todo sigue siendo, al final, un patrón finito de bytes.

Por eso este capítulo es menos decorativo de lo que parece. No entra para sumar una base numérica más al inventario escolar. Entra para preparar la lectura de evidencia material real, primero en el laboratorio del nivel y después en herramientas industriales de inspección de memoria y archivos.