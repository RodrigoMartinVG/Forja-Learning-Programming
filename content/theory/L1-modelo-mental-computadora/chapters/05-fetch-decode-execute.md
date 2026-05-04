# El ciclo fetch-decode-execute

## Abrir el paso interno

El [capítulo 03](03-cpu-registros.md) describió a la CPU como ejecutor del paso actual y el [capítulo 04](04-instrucciones-operandos.md) clasificó las instrucciones por lo que cada clase consulta y modifica. Las dos descripciones, juntas, alcanzan para leer trazas a nivel de paso entero: en cada fila de la tabla, una instrucción produjo una transición, y la clase de la instrucción explica qué cambió.

Lo que esa lectura todavía oculta es qué pasa **dentro** del paso. La frase *"la CPU ejecuta una instrucción"* funciona como atajo, pero atrás de ese atajo hay un proceso que el resto del track va a necesitar abrir. Cuando aparezcan errores de tipo *"el procesador interpretó como instrucción algo que era dato"*, *"el `pc` quedó apuntando a una posición no válida"*, o *"la decodificación falló"*, ya no va a alcanzar con tratar el paso como atómico. Hace falta un modelo de qué subpasos componen el paso y qué pregunta responde cada uno.

El modelo que `L1` instala se conoce como ciclo **fetch / decode / execute**. Los tres subpasos no son ritual: cada uno responde a una pregunta distinta y modifica una parte distinta del estado interno de la CPU. Aprender a descomponer un paso en estos tres subpasos es la habilidad que el capítulo busca asentar.

Antes de entrar, una aclaración de alcance. El ciclo de tres subpasos que `L1` describe es una idealización conceptual, no una descripción literal del hardware moderno. Las CPUs reales superponen subpasos de instrucciones consecutivas (eso es lo que llaman *pipelining*), reordenan instrucciones, y predicen saltos. Todo ese refinamiento existe y es importante en niveles muy avanzados. En `L1`, la versión sin pipeline alcanza para razonar sobre lo que pasa, y traer el resto antes de tiempo solamente confunde.

## Fetch: localizar la instrucción señalada por el `pc`

El primer subpaso del ciclo se llama **fetch**. La pregunta que responde es directa: *"¿qué instrucción se va a ejecutar?"*.

La operación es la siguiente. La CPU lee el `pc` (que, por estar dentro de la CPU, es accesible instantáneamente). El `pc` contiene una dirección de memoria. La CPU usa esa dirección para acceder a la posición correspondiente en memoria y leer su contenido. El contenido leído —el valor que está en la posición que el `pc` señalaba— es la instrucción que va a ejecutarse en este paso.

Lo que cambia en este subpaso, conceptualmente, es el estado interno de la CPU: la instrucción leída queda disponible para los subpasos siguientes. Lo que **no** cambia es nada del estado observable: el `pc` no se modificó todavía, los registros no se tocaron, la memoria sólo se leyó (sin escritura). Una traza fila por fila no muestra el fetch como cambio porque el cambio que produce vive dentro del paso, no entre pasos.

Vale detenerse en una observación que el [capítulo 02](02-memoria.md) ya preparó. El fetch trata el contenido de la posición señalada por el `pc` como una **instrucción**. Si esa misma posición fuera nombrada como operando de un `LOAD` por otra instrucción, su contenido se leería como dato. La materia es la misma; el rol —instrucción o dato— se decide en el momento del uso. El fetch es exactamente el momento donde una posición de memoria se interpreta como instrucción: si el `pc` apunta a ella, eso es lo que pasa.

## Decode: reconocer qué clase de instrucción es

El segundo subpaso es **decode**. La pregunta es: *"¿qué clase de transformación describe esta instrucción y cuáles son sus operandos?"*.

La operación, en el modelo de `L1`, es de reconocimiento. Tomado el contenido leído en el fetch, la CPU lo interpreta para identificar:

- la **clase** de la instrucción —movimiento, acceso a memoria, aritmética, control de flujo, en términos de la taxonomía del [capítulo 04](04-instrucciones-operandos.md)—;
- los **operandos** que la instrucción nombra y, para cada uno, su tipo (registro, posición de memoria, constante inmediata).

Una instrucción como `ADD r0, 1`, después del decode, queda reconocida como aritmética con dos operandos: `r0` (registro, lectura+escritura) y `1` (constante inmediata, sólo lectura). Una como `LOAD r0, [40]` queda reconocida como acceso a memoria con dos operandos: `r0` (registro, escritura) y la posición 40 (memoria, lectura). El reconocimiento determina qué hace la CPU en el subpaso siguiente.

El decode no modifica nada del estado observable. Como el fetch, su efecto vive dentro del paso. Pero a diferencia del fetch, el decode involucra **interpretación**: el patrón leído de memoria tenía que ser interpretado como uno de los códigos válidos del ISA, lo que abre la posibilidad de que el patrón no corresponda a ninguno. En máquinas reales esto se manifiesta como *"instrucción inválida"*, una situación donde la CPU no puede ejecutar el paso. En `L1` se asume que todas las instrucciones que aparecen en los ejemplos son válidas; la posibilidad del decode fallido aparece de manera tangencial, sólo para no esconderla.

Una distinción que merece mención. Cuando se discute decode en computadoras reales, suele aparecer la idea de que el subpaso "traduce a binario". Eso no es exactamente lo que pasa: la instrucción ya está en binario en memoria (es la única forma en la que puede estar). Lo que el decode hace es **reconocer** qué clase representa ese patrón binario y extraer los operandos. La traducción a binario, si es relevante, es del compilador, no del decode. `L1` evita la confusión postergando la representación binaria a `L2` y describiendo el decode puramente como reconocimiento de clase y operandos.

## Execute: aplicar el efecto sobre el estado

El tercer subpaso es **execute**. La pregunta: *"¿cuál es el cambio que esta instrucción produce sobre el estado, y cómo se aplica?"*.

A diferencia de los anteriores, este subpaso sí modifica el estado observable. La modificación específica depende de la clase reconocida en el decode:

- Para una instrucción de **movimiento**, execute copia el valor del registro fuente al registro destino.
- Para una instrucción de **acceso a memoria** (`LOAD`/`STORE`), execute hace el acceso correspondiente: lee de memoria y escribe en registro, o lee de registro y escribe en memoria.
- Para una instrucción **aritmética**, execute lee los operandos, calcula la operación (suma, resta), y escribe el resultado en el registro destino.
- Para una instrucción de **control de flujo**, execute escribe el `pc` con la dirección de salto (incondicional o condicional según el caso).

Después del execute, el `pc` también se actualiza. Para las primeras tres clases, avanza una posición por defecto (la próxima instrucción es la que sigue secuencialmente). Para la cuarta clase, el avance ya fue parte del execute mismo.

Cuando todo esto termina, el paso se considera completo: hay un nuevo estado, una nueva fila se puede agregar a la traza, y la CPU está lista para empezar el siguiente fetch con el nuevo valor del `pc`.

Un dibujo del ciclo, repetido para tres pasos consecutivos, ayuda a fijar la imagen:

```
     paso 1                paso 2                paso 3
  +---------+           +---------+           +---------+
  | fetch   |           | fetch   |           | fetch   |
  | decode  |           | decode  |           | decode  |
  | execute |           | execute |           | execute |
  +----+----+           +----+----+           +----+----+
       |                     |                     |
       v                     v                     v
     pc=0 -> pc=1          pc=1 -> pc=2          pc=2 -> pc=3
```

Cada paso macro —cada fila de la traza estandar— corresponde a un ciclo completo. Lo que la traza muestra como una sola transicion (una fila a la siguiente) es internamente la sucesion de los tres subpasos. La columna `pc` es la única que delata el ritmo del ciclo desde afuera: cada vez que el `pc` cambia, hubo un ciclo entero entre medio.

## Un ciclo paso a paso sobre la traza de juguete

Para fijar la descomposición, conviene aplicarla a una traza concreta. Considerar el siguiente programa, con estado inicial `pc = 0`, `r0 = 0`, `mem[40] = 7`:

| dirección | contenido |
| --------- | --------- |
| 0 | `LOAD r0, [40]` |
| 1 | `ADD r0, 1` |
| 2 | `STORE r0, [40]` |

La traza ya familiar muestra tres pasos macro:

| momento | `pc` | `r0` | `mem[40]` | instrucción |
| ------- | ---- | ---- | --------- | ----------- |
| inicio | 0 | 0 | 7 | (ninguna) |
| tras paso 1 | 1 | 7 | 7 | `LOAD r0, [40]` |
| tras paso 2 | 2 | 8 | 7 | `ADD r0, 1` |
| tras paso 3 | 3 | 8 | 8 | `STORE r0, [40]` |

Lo que se hace nuevo acá es descomponer cada paso macro en sus tres subpasos. Para el paso 1:

- **Fetch**: la CPU lee el `pc` (vale 0). Lee la posición de memoria 0. Su contenido es `LOAD r0, [40]`.
- **Decode**: reconoce que es una instrucción de acceso a memoria. Identifica los operandos: `r0` (registro destino, escritura) y la posición 40 (memoria fuente, lectura).
- **Execute**: lee el contenido de la posición 40 (vale 7). Escribe ese valor en `r0`. Avanza el `pc` a 1.

Para el paso 2:

- **Fetch**: lee el `pc` (vale 1). Lee la posición de memoria 1. Contenido: `ADD r0, 1`.
- **Decode**: aritmética. Operandos: `r0` (registro, lectura+escritura) y 1 (inmediato, lectura).
- **Execute**: lee `r0` (vale 7). Calcula 7 + 1 = 8. Escribe 8 en `r0`. Avanza el `pc` a 2.

Para el paso 3:

- **Fetch**: lee el `pc` (vale 2). Lee la posición de memoria 2. Contenido: `STORE r0, [40]`.
- **Decode**: acceso a memoria. Operandos: posición 40 (memoria destino, escritura) y `r0` (registro fuente, lectura).
- **Execute**: lee `r0` (vale 8). Escribe 8 en la posición 40. Avanza el `pc` a 3.

Tres pasos macro, nueve líneas de descomposición. Esta forma de leer trazas es lo que el ejercicio 06 del nivel ([06-fetch-decode-execute](../exercises/06-descomponer-fdx.md)) va a pedir como producto. La granularidad parece excesiva al principio y resulta esclarecedora cuando algo sale mal, porque permite ubicar exactamente en qué subpaso se produjo el problema: si la CPU leyó mal el contenido del `pc`, el problema está en el fetch; si reconoció mal la clase, en el decode; si aplicó mal el efecto, en el execute.

## Por qué los tres subpasos no son cosméticos

Una pregunta legítima al cierre: si la traza fila a fila ya describe el cambio entre estados, ¿qué se gana descomponiendo cada paso en tres? La respuesta tiene dos partes.

La primera es de **diagnóstico**. Cuando una ejecución produce un resultado inesperado, la pregunta *"¿por qué este paso cambió esto en lugar de aquello?"* admite tres respuestas posibles según el subpaso donde estuvo el problema. Si el `pc` apuntaba a una posición distinta de la esperada, el problema está en el fetch (alguna instrucción anterior dejó el `pc` mal). Si la instrucción correcta se interpretó como una clase distinta, el problema está en el decode. Si la clase era correcta pero el efecto fue distinto al esperado, el problema está en el execute (probablemente un operando estaba en un valor inesperado). Esa partición del diagnóstico es lo que permite, en niveles posteriores, leer un crash con precisión.

La segunda es **evolutiva**. Cuando `L7` introduzca x86-64 real, los tres subpasos van a aparecer con nombres y mecánicas más concretos, pero la estructura va a ser la misma. Cuando niveles muy avanzados discutan pipelining, lo que se pipeline-iza son exactamente esos tres subpasos: una instrucción está en execute mientras la siguiente está en decode mientras la tercera está en fetch. Sin la descomposición de `L1`, esos refinamientos se ven como capas extra; con ella, se ven como variaciones sobre una estructura ya familiar.

Una idea final que conecta este capítulo con el siguiente. El subpaso execute, para las instrucciones de control de flujo, escribe el `pc` con un valor que no es simplemente "la próxima dirección". Esa flexibilidad —que el `pc` pueda terminar en cualquier dirección, no sólo en la siguiente— es lo que abre la posibilidad de saltos, loops y bifurcaciones. El [capítulo 06](06-flujo-de-control.md) toma esa flexibilidad como tema central y muestra cómo construcciones aparentemente complejas (loops, llamadas a funciones) emergen de algo tan simple como "el execute puede escribir cualquier valor en el `pc`".
