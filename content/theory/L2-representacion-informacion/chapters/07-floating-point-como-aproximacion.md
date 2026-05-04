# Floating point como aproximación finita

Los capítulos anteriores fijaron varias intuiciones duras de `L2`: los datos viven como patrones finitos, el ancho importa, un mismo bloque puede leerse como entero o como texto, los bytes pueden agruparse de distintas maneras y ninguna lectura viene pegada al patrón por naturaleza. Este último capítulo agrega una consecuencia más: cuando querés representar números con parte fraccionaria sobre un ancho finito, tampoco podés esperar exactitud infinita.

Ahí entra floating point.

No entra como "los números decimales de verdad" ni como una versión más sofisticada del entero. Entra como otra estrategia de representación finita, con sus propios tradeoffs entre rango y precisión.

> Laboratorio: en este capítulo conviene usar escenas chicas donde el mismo ancho fijo intente representar varios valores fraccionarios. La pregunta útil no es solo "qué número quería escribir", sino "qué aproximación exacta terminó entrando en los bits disponibles".

## No todos los reales entran

Una máquina finita no puede guardar todos los números reales de manera exacta. No puede hacerlo por una razón muy simple: tiene una cantidad finita de bits y, por lo tanto, una cantidad finita de patrones posibles.

Eso ya alcanza para descartar una fantasía común: pensar que un `float` guarda "el decimal exacto" siempre que le des suficiente buena voluntad.

No. Un float también representa con un ancho fijo. Y eso obliga a elegir:

- qué rango aproximado querés cubrir
- con cuánta precisión querés distinguir valores cercanos

Algunos valores entran exactos con facilidad. Por ejemplo, en binario finito es natural representar fracciones que se apoyan en potencias de dos, como:

- `0.5`
- `0.25`
- `0.75`

Porque corresponden a patrones binarios finitos:

- `0.5 = 0.1` en binario
- `0.25 = 0.01` en binario
- `0.75 = 0.11` en binario

Pero otros valores no tienen una expansión binaria finita y entonces solo pueden entrar como aproximación.

Ese es el punto de partida real del capítulo: floating point no promete exactitud infinita; promete una manera finita y útil de aproximar muchos valores sobre un rango amplio.

## Signo, exponente y significando como intuición

La intuición mínima que conviene retener para un float es esta: no guarda el número como un entero gigantesco con una coma mágica en algún lugar. Lo separa en partes.

De manera muy simplificada, un float organiza bits para expresar algo de esta forma:

$$
\text{signo} \times \text{significando} \times 2^{\text{exponente}}
$$

No hace falta reconstruir IEEE 754 completo para ver la idea.

- el **signo** distingue positivo de negativo
- el **exponente** mueve la escala: muy chico, mediano o muy grande
- el **significando** conserva los bits más informativos del valor

Eso permite representar números muy grandes y muy pequeños sin usar una cantidad absurda de bits para cada caso particular.

Pero ese beneficio trae un costo: no todos los bits disponibles se usan para precisión fina del valor. Parte del ancho se gasta en guardar escala.

Por eso floating point no conviene pensarlo como "más preciso que un entero". Conviene pensarlo como otra ingeniería del mismo presupuesto finito de bits.

## Rango versus precisión

Una vez que el ancho total es fijo, aparece un tradeoff inevitable:

- si reservás más bits para exponente, ganás rango
- si reservás más bits para significando, ganás precisión local

No podés maximizar ambas cosas al mismo tiempo con el mismo ancho total.

Esa tensión es parte de la naturaleza de floating point. No es un defecto accidental.

Por eso dos floats con distinto formato pueden comportarse distinto frente al mismo valor:

- uno puede llegar más lejos en magnitud
- otro puede distinguir mejor valores cercanos entre sí

La intuición útil es esta: un float no reparte precisión uniforme sobre toda la recta numérica.

Cerca de ciertos valores, los números representables quedan más juntos. En otras zonas quedan más separados. Entonces aparece una consecuencia importante:

- dos valores reales distintos pueden caer en la misma aproximación representable
- sumar una cantidad muy chica a una muy grande puede no cambiar el patrón final si esa diferencia ya no cabe en la precisión disponible

No hace falta todavía trabajar esos casos al detalle. Hace falta fijar la intuición general: floating point compra rango a costa de exactitud uniforme.

## Por qué 0.1 da sorpresas

`0.1` sorprende porque en decimal parece simple, pero en binario no tiene expansión finita.

En binario, `0.1` decimal se desarrolla como una secuencia periódica infinita. En forma abreviada:

```text
0.00011001100110011...
```

Como el ancho del float es finito, esa secuencia no puede guardarse completa. En algún punto hay que cortar.

Entonces pasa algo muy concreto:

- el valor ideal que querías representar era `0.1`
- el patrón almacenado representa el binario finito más cercano que entre en ese formato
- la lectura posterior devuelve una aproximación, no el real matemático exacto

Por eso aparecen sorpresas como estas:

- comparaciones que no dan lo que intuís desde decimal puro
- pequeñas diferencias acumuladas después de varias operaciones
- impresiones donde el número mostrado parece casi `0.1`, pero no exactamente

Esto no significa que floating point "esté roto". Significa que volvió a aparecer la misma regla de todo `L2`: el ancho es finito y el patrón representable no coincide siempre con el valor ideal que imaginabas.

En ese sentido, floating point no rompe la lógica del nivel. La continúa.

## Qué se posterga para más adelante

Para `L2`, con esta intuición alcanza. No hace falta todavía abrir toda la especificación.

Se posterga para más adelante:

- la codificación normativa completa de IEEE 754
- NaN, infinitos y subnormales en detalle
- rounding modes formales
- errores numéricos más finos y análisis de estabilidad
- diferencias concretas entre formatos y bibliotecas en lenguajes específicos

Lo que sí conviene llevarse de este capítulo es una idea firme y simple:

- floating point no representa "todos los decimales"
- representa aproximaciones finitas usando signo, escala y precisión limitada
- algunos valores entran exactos y otros no
- `0.1` no sorprende por capricho del lenguaje, sino por la forma binaria finita de la representación

Con eso, `L2` ya deja armada su idea central de punta a punta. Enteros, texto, bytes, hexadecimal, endianness y floats ya no deberían verse como temas sueltos. Todos responden a la misma pregunta: qué patrón finito entra realmente en la máquina y bajo qué lectura decís que ese patrón vale lo que vale.