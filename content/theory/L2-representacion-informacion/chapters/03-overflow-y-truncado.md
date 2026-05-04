# Overflow, truncado y límites de representación

El capítulo anterior dejó una pieza firme: un mismo ancho finito puede leerse como unsigned o signed. Este capítulo agrega la consecuencia inevitable de esa finitud: a veces el resultado matemático que querés producir no entra en los bits disponibles.

Ahí aparecen tres fenómenos que conviene separar temprano:

- el resultado ideal que te gustaría conservar completo
- los bits que efectivamente caben en el ancho activo
- la lectura que hacés después sobre esos bits recortados

Si estas tres cosas se mezclan, overflow y truncado se vuelven una sopa de palabras. Si se separan, ambos pasan a ser efectos normales de una representación finita.

> Laboratorio: en este capítulo conviene ejecutar sumas y conversiones sobre `8` bits, mirando siempre dos planos a la vez: el resultado matemático ideal y el patrón final que realmente quedó almacenado. La pregunta útil no es solo "cuánto dio", sino "qué parte entró y qué parte quedó afuera".

## Cuando el resultado no cabe

Una máquina finita no puede almacenar un resultado infinito ni arbitrariamente grande dentro de un ancho fijo.

Si trabajás con `8` bits, solo hay `256` patrones posibles. Eso vale tanto si la lectura es unsigned como si es signed. Lo que cambia es el rango que asignás a esos patrones, no la cantidad de patrones disponibles.

Por eso, cuando hacés una operación, conviene separar dos cosas:

- el **resultado matemático ideal**
- el **resultado representable** con el ancho disponible

Tomá un caso simple en unsigned de `8` bits:

```text
11111111 + 00000001
```

Si lo pensás como enteros unsigned, eso es:

```text
255 + 1 = 256
```

Pero `256` ya no entra en `8` bits unsigned. El mayor valor representable era `255`.

Entonces pasa algo muy concreto:

- el resultado ideal existe como cuenta matemática
- el ancho disponible no alcanza para guardarlo completo
- la máquina conserva solo los bits que caben en ese ancho

Ese es el punto de partida real de overflow y truncado. No aparecen porque la aritmética "esté mal". Aparecen porque la representación es finita.

## Overflow sin signo

En unsigned, la regla operativa más útil es esta: si un resultado supera el máximo representable, el patrón final conserva solo los `n` bits bajos.

Para `8` bits, eso equivale a trabajar módulo $2^8 = 256$.

$$
\text{resultado final} = \text{resultado ideal} \bmod 2^n
$$

Volvamos al ejemplo:

```text
11111111 + 00000001
```

La suma ideal es:

```text
255 + 1 = 256
```

En binario, eso necesita `9` bits:

```text
1 00000000
```

Si solo podés guardar `8`, queda:

```text
00000000
```

y el bit que sobró sale por arriba como **carry**.

Ese detalle importa: en unsigned conviene no confundir estas dos frases:

- hubo un bit extra de salida
- el resultado final almacenado wrapeó dentro del ancho disponible

Las dos cosas están relacionadas, pero no nombran exactamente lo mismo. El carry es el bit que salió; el wraparound es el patrón recortado que quedó.

Otro ejemplo en `8` bits:

```text
250 + 10 = 260
```

Como $260 \bmod 256 = 4$, el patrón final representa `4`.

No conviene describir esto como "dio mal". Conviene decir algo más preciso: el resultado ideal era `260`, pero en unsigned de `8` bits solo sobrevivió el resultado módulo `256`.

## Overflow con signo

En signed, el fenómeno es distinto. Acá el problema no es solo que "sobró un bit". El problema es que el resultado ideal queda fuera del rango signed representable para ese ancho.

En complemento a dos de `8` bits, el rango era:

$$
-128 \text{ a } 127
$$

Tomá esta suma:

```text
01111111 + 00000001
```

Si la leés como signed, eso significa:

```text
127 + 1 = 128
```

Pero `128` no entra en el rango signed de `8` bits.

El patrón binario resultante es:

```text
10000000
```

Y ese patrón, leído en complemento a dos de `8` bits, vale `-128`.

Ese es el punto incómodo pero importante: el patrón final sí entra en `8` bits; lo que no entra es el resultado ideal `128` dentro de la lectura signed de `8` bits.

Por eso, en signed no conviene usar "overflow" como sinónimo de carry. Podés tener carry sin el tipo de problema semántico que interesa en signed, y podés tener overflow signed justamente porque el resultado esperado quedó fuera del rango aunque el patrón final siga teniendo `8` bits.

La intuición que conviene retener es esta:

- en unsigned mirás si te pasaste del máximo del rango `0` a $2^n - 1$
- en signed mirás si te saliste del rango $-2^{n-1}$ a $2^{n-1} - 1$

En ambos casos los bits finales siguen siendo finitos. Lo que cambia es la lectura bajo la cual decís que ese resultado ya no representa lo que querías representar.

## Truncado y pérdida de información

El truncado aparece cuando reducís el ancho y, al hacerlo, descartás parte del patrón original.

No hace falta ni siquiera una suma para verlo. Alcanza con una conversión o una escritura en un ancho más chico.

Tomá este valor de `16` bits:

```text
00000001 00101100
```

Leído como unsigned, ese patrón vale `300`.

Si ahora lo recortás a `8` bits, solo conservás el byte bajo:

```text
00101100
```

Y ese patrón vale `44` en unsigned.

Lo importante no es memorizar el ejemplo. Lo importante es ver la regla material:

- el valor original ocupaba más bits
- el ancho nuevo obliga a descartar parte del patrón
- la lectura posterior se hace sobre un patrón ya recortado

Por eso truncar no es "reinterpretar". Reinterpretar deja intactos los bits y cambia la lectura. Truncar cambia el patrón mismo: pierde bits.

También conviene separar truncado de overflow aunque muchas veces aparezcan juntos:

- en una suma de ancho fijo, puede haber overflow y el patrón final ya queda recortado al ancho activo
- en una conversión de `16` a `8` bits, puede haber truncado aunque no hayas hecho ninguna cuenta nueva

La regla corta de `L2` es esta: truncar significa conservar solo una parte del patrón y aceptar que la información descartada ya no puede recuperarse desde el resultado recortado.

## Por qué esto importa antes de C

Todo esto conviene entenderlo antes de llegar a C porque no es una rareza del lenguaje. Es una propiedad de cualquier representación finita que use anchos fijos.

Aparece antes y más allá de C:

- en hardware que suma con un ancho concreto
- en registros y buses que no crecen para acomodar un resultado
- en formatos binarios que reservan exactamente cierta cantidad de bytes
- en memoria, cuando una escritura conserva solo una ventana de bytes
- en protocolos y archivos donde ciertos campos tienen tamaño fijo

Si esta capa no queda firme ahora, más adelante es fácil cometer errores conceptuales como estos:

- creer que overflow significa simplemente "número muy grande"
- creer que truncar es lo mismo que reinterpretar
- creer que signed y unsigned fallan de la misma manera
- creer que la máquina guarda el resultado ideal y después "lo traduce raro"

Lo que realmente pasa es más austero:

- elegiste un ancho
- produjiste o recortaste un patrón
- ese ancho decidió qué parte del resultado sobrevivía
- la interpretación posterior le dio sentido a los bits que quedaron

Eso es exactamente lo que después reaparece en C, Rust, assembly, layout de memoria, formatos binarios y debugging. `L2` no necesita todavía las reglas finas de cada lenguaje. Necesita algo anterior: ver con claridad que overflow y truncado son consecuencias normales de trabajar con representaciones finitas.