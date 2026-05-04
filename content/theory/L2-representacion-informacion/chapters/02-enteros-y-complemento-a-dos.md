# Enteros sin signo y complemento a dos

El capítulo anterior dejó una idea base: dentro de la máquina hay patrones finitos, no números abstractos flotando sin cuerpo. Este capítulo agrega la pregunta que aparece enseguida después: si tengo un patrón de `8` o `16` bits, ¿cómo lo leo como entero?

La primera respuesta es la más simple: leerlo como **entero sin signo**. La segunda ya obliga a decidir cómo representar negativos sin cambiar el hecho material de que la cantidad de bits sigue siendo finita. Ahí aparece complemento a dos.

> Laboratorio: en este capítulo conviene fijar un byte y cambiar solo la interpretación. La escena útil no es "cargar otro dato", sino mirar el mismo patrón y alternar entre lectura unsigned y signed para ver que lo almacenado no cambió.

## Enteros sin signo: contar patrones

La lectura más directa de un patrón binario es tomarlo como un entero **unsigned**: todos los patrones disponibles se usan para contar desde `0` hacia arriba.

Si el ancho es de `n` bits, entonces hay $2^n$ patrones posibles. En unsigned, eso da este rango:

$$
0 \text{ a } 2^n - 1
$$

Para `8` bits:

| Patrón | Lectura unsigned |
|---|---|
| `00000000` | `0` |
| `00000001` | `1` |
| `00000111` | `7` |
| `11111110` | `254` |
| `11111111` | `255` |

La intuición operativa es simple:

- no hay patrones "reservados para negativos"
- todo el espacio disponible se usa para contar hacia arriba
- el máximo valor depende solo del ancho

Por eso, en `8` bits el tope es `255`; en `16`, el tope pasa a ser $65535$; en `32`, $2^{32} - 1$.

Unsigned no es una lectura "más real" que otras. Solo es la más directa: usa todos los patrones como cantidades no negativas.

## Signo y rango finito

La dificultad aparece cuando querés representar enteros negativos sin dejar de trabajar con una cantidad fija de bits.

La máquina no te regala patrones extra por haber decidido introducir signo. Si seguís en `8` bits, seguís teniendo exactamente `256` patrones. La diferencia es cómo los repartís.

En una lectura signed de `8` bits, el rango típico ya no puede ser `0` a `255`, porque parte del espacio ahora se usa para negativos:

$$
-2^{7} \text{ a } 2^{7} - 1
$$

o sea:

$$
-128 \text{ a } 127
$$

La comparación conviene verla lado a lado:

| Ancho | Lectura unsigned | Lectura signed |
|---|---|---|
| `8` bits | `0` a `255` | `-128` a `127` |
| `16` bits | `0` a `65535` | `-32768` a `32767` |

El dato importante no es memorizar números. El dato importante es este:

- el ancho no cambió
- la cantidad total de patrones no cambió
- lo que cambió fue la interpretación del mismo espacio finito

Por eso no conviene pensar el signo como un "menos escrito adelante". Conviene pensarlo como una convención de lectura sobre patrones que siguen siendo finitos.

## Complemento a dos sin folklore

La convención práctica que domina para enteros signed es **complemento a dos**.

Muchas veces se la enseña como un truco: "invertí bits y sumá uno". Esa receta sirve para calcular, pero no es la intuición principal que conviene retener.

La intuición útil es otra:

- con `n` bits, seguís teniendo $2^n$ patrones
- la mitad baja se lee como `0`, `1`, `2`, ...
- la mitad alta se lee como valores negativos

En `8` bits, eso queda así:

| Patrón | Unsigned | Signed en complemento a dos |
|---|---|---|
| `00000000` | `0` | `0` |
| `00000001` | `1` | `1` |
| `01111111` | `127` | `127` |
| `10000000` | `128` | `-128` |
| `11111110` | `254` | `-2` |
| `11111111` | `255` | `-1` |

Una forma muy operativa de leerlo es esta:

- si el bit más alto vale `0`, la lectura signed coincide con la unsigned
- si el bit más alto vale `1`, la lectura signed puede obtenerse como:

$$
\text{valor signed} = \text{valor unsigned} - 2^n
$$

Por ejemplo, en `8` bits:

- `11111111` vale `255` en unsigned
- `255 - 256 = -1`

y entonces ese mismo patrón vale `-1` en complemento a dos.

Con `11111110` pasa esto:

- unsigned: `254`
- signed: `254 - 256 = -2`

Esta lectura tiene varias ventajas prácticas:

- deja un solo patrón para `0`
- permite sumar y restar con reglas de hardware muy regulares
- evita tener dos ceros distintos, problema que otras convenciones sí traían

No hace falta demostrar formalmente todo eso ahora. Hace falta que complemento a dos deje de sonar como magia negra y empiece a verse como una forma consistente de reutilizar el mismo espacio finito para representar negativos.

## El mismo byte como signed o unsigned

Una vez fijada esa convención, conviene volver sobre la idea más importante del nivel: el patrón no cambió; la lectura sí.

Tomá este byte:

```text
11111111
```

Si lo interpretás como unsigned de `8` bits, vale `255`.

Si lo interpretás como signed en complemento a dos de `8` bits, vale `-1`.

La memoria no guarda dos versiones distintas. Guarda el mismo byte. Lo que cambia es el contrato de lectura.

Lo mismo pasa con otros patrones:

| Byte | Unsigned | Signed |
|---|---|---|
| `01111111` | `127` | `127` |
| `10000000` | `128` | `-128` |
| `10000001` | `129` | `-127` |
| `11111111` | `255` | `-1` |

Esto importa porque más adelante vas a encontrar muchas situaciones donde el patrón material es el mismo, pero cambia la lectura:

- una instrucción puede tratar un byte como dato sin signo
- un lenguaje puede tratar el mismo patrón como entero signed
- una vista hexadecimal puede mostrar `0xFF` sin decir todavía si eso se leerá como `255` o como `-1`

La confusión habitual es preguntar "cuál de las dos es la verdadera". La pregunta correcta es otra: bajo qué convención se está leyendo ese patrón ahora.

## Qué intuición conviene retener

Si este capítulo queda bien asentado, lo importante no es recordar una receta mecánica aislada. Lo importante es retener estas intuiciones:

- unsigned usa todos los patrones para contar desde `0`
- signed no agrega capacidad: reinterpreta el mismo espacio finito
- complemento a dos no cambia los bits almacenados; cambia cómo se leen los patrones con el bit alto en `1`
- el rango signed de `n` bits es $-2^{n-1}$ a $2^{n-1} - 1$
- el mismo byte puede valer cosas distintas sin que la memoria haya cambiado

Eso deja preparado el terreno para el próximo paso. Cuando en el siguiente capítulo aparezcan overflow y truncado, ya no deberían sentirse como rarezas. Van a salir de algo mucho más simple: querés producir un resultado, pero el ancho y la convención de lectura siguen siendo finitos.