# CPU, registros y memoria

En `01` aparecieron varias piezas juntas: CPU, registros, memoria, direcciones y `pc`. Eso alcanzó para fijar la idea general de máquina de estado. En este capítulo conviene separarlas un poco mejor, porque muchas confusiones futuras nacen de mezclar sus roles.

El objetivo acá no es describir hardware real en detalle. El objetivo es algo más modesto y más útil: que no suene igual decir "la CPU guarda un dato", "la memoria guarda un dato", "el registro cambia" o "el programa salta a una dirección".

Vamos a sostener el mismo ejemplo durante todo el capítulo:

```text
100: LOAD r0, [40]
101: ADD  r0, [41]
102: STORE r0, [42]
103: HALT
```

Y este estado inicial:

| Pieza | Valor inicial |
|---|---|
| `pc` | `100` |
| `r0` | `0` |
| `mem[40]` | `7` |
| `mem[41]` | `5` |
| `mem[42]` | `0` |

## CPU como ejecutor

La CPU no es "toda la computadora". Tampoco es el lugar donde vive entero el programa. En este nivel conviene pensarla como la pieza que ejecuta el paso actual y empuja la máquina hacia el estado siguiente.

En el ejemplo anterior, la CPU cumple tareas como estas:

- mira cuál es la instrucción que toca ejecutar ahora
- interpreta qué acción describe esa instrucción
- usa registros y memoria para llevarla a cabo
- deja actualizado el estado para que el proceso continúe

Eso alcanza para evitar una confusión muy común: la CPU no es una especie de depósito general donde están todas las cosas. Su rol principal no es almacenar, sino ejecutar y coordinar el paso presente.

Si el estado inicial es `pc=100`, `r0=0`, `mem[40]=7`, `mem[41]=5`, `mem[42]=0`, la CPU no "resuelve el problema" de una vez. Hace algo mucho más chico: toma la instrucción de la dirección `100`, la ejecuta y produce un estado nuevo.

Por eso en este nivel conviene quedarse con esta imagen: la CPU es el ejecutor del paso actual, no el contenedor de toda la computación.

## Registros: estado cercano y pequeño

Los registros son celdas pequeñas de estado que la CPU usa de manera directa durante la ejecución. En este ejemplo solo aparece `r0`, pero alcanza para fijar la idea.

Si después de `LOAD r0, [40]` el estado pasa a tener `r0=7`, lo que ocurrió es que el valor leído desde memoria quedó copiado en un registro.

Conviene distinguir registros y memoria sin dar todavía detalles de implementación:

| Pieza | Intuición útil en L1 |
|---|---|
| registro | estado cercano a la ejecución actual |
| memoria | espacio más amplio donde la máquina guarda información direccionable |

Los registros no son "memoria con otro nombre". Cumplen otro rol en el modelo mental:

- suelen ser pocos
- se nombran de manera directa, por ejemplo `r0`
- muchas instrucciones operan primero sobre ellos

Más adelante aparecerán registros especiales como `pc` y, en otros contextos, también `sp`. Por ahora alcanza con entender que un registro es una parte chica pero muy importante del estado de la máquina.

## Memoria: espacio direccionable

La memoria conviene imaginarla como un conjunto grande de celdas identificables. Cada celda tiene una dirección y puede contener algún valor.

En el ejemplo, una vista chica de memoria podría pensarse así:

| Dirección | Contenido |
|---|---|
| `40` | `7` |
| `41` | `5` |
| `42` | `0` |
| `100` | `LOAD r0, [40]` |
| `101` | `ADD r0, [41]` |
| `102` | `STORE r0, [42]` |
| `103` | `HALT` |

No hace falta bajar todavía a bytes ni a representación binaria. En L1 alcanza con esta intuición: memoria es el espacio donde la máquina puede encontrar información si sabe en qué dirección mirar.

Esta tabla también deja ver algo importante: en el mismo espacio de memoria aparecen cosas que, según el momento, cumplen el rol de datos o de instrucciones. Esa idea ya venía de `01`; acá solo se vuelve más concreta.

## Direcciones no son valores misteriosos

Una dirección no es una sustancia rara ni una entidad mágica. En este nivel conviene pensarla simplemente como el modo de nombrar una posición de memoria.

La diferencia clave no es entre "número común" y "número misterioso". La diferencia es de rol:

- `40` puede aparecer como dirección cuando se quiere nombrar una celda
- `7` puede aparecer como valor contenido en esa celda
- `mem[40] = 7` quiere decir: en la dirección `40` está guardado el valor `7`

Lo importante es no mezclar estas dos preguntas:

- qué dirección se está nombrando
- qué valor hay almacenado en esa dirección

En `LOAD r0, [40]`, el `40` no es el dato que termina en `r0`. El `40` sirve para indicar dónde buscar. El dato que termina en `r0` es el contenido de esa celda, en este caso `7`.

Lo mismo vale para `STORE r0, [42]`: `42` no es el valor que se escribe, sino la dirección donde se escribe. El valor escrito será el que tenga `r0` en ese momento.

Este punto parece chico, pero evita muchas confusiones futuras. Antes de hablar de punteros formales o de representación binaria hace falta que esto quede firme: una dirección nombra una ubicación; un valor es el contenido que puede haber en esa ubicación.

## El program counter como ancla del flujo

El `program counter` o `pc` es un registro especial: guarda la dirección de la instrucción que toca ejecutar ahora.

En el ejemplo, el estado empieza con `pc=100`. Eso significa que la siguiente instrucción está en la dirección `100`.

Si la ejecución avanza normalmente, se ve algo así:

| Momento | Valor de `pc` | Lo que indica |
|---|---|---|
| inicio | `100` | la siguiente instrucción está en `100` |
| después de ejecutar `100` | `101` | ahora toca la instrucción en `101` |
| después de ejecutar `101` | `102` | ahora toca la instrucción en `102` |
| después de ejecutar `102` | `103` | ahora toca la instrucción en `103` |

Eso vuelve al `pc` una pieza clave del modelo:

- ancla el orden de ejecución
- permite decir con precisión "dónde está" el flujo del programa
- prepara el terreno para entender después saltos, bifurcaciones y loops

También conviene notar algo importante: el `pc` no guarda "la instrucción misma". Guarda la dirección de la instrucción que toca ejecutar. Esa diferencia entre dirección y contenido es exactamente la que el capítulo viene reforzando.

Con esto ya queda un mapa bastante más limpio:

- la CPU ejecuta el paso actual
- los registros guardan estado cercano a esa ejecución
- la memoria ofrece un espacio direccionable más amplio
- las direcciones nombran ubicaciones, no valores misteriosos
- el `pc` mantiene anclado el flujo de instrucciones

El capítulo siguiente puede apoyarse sobre este mapa para mostrar con más detalle qué significa `fetch`, `decode` y `execute` en una traza concreta.