# Flujo de control: program counter, saltos y loops

## El `pc` como parte observable del estado

El `pc` ha venido apareciendo en cada traza desde el [capítulo 01](01-maquina-de-estado.md), siempre como una columna más, sin discusión separada. Esa presencia continua fue deliberada: el `pc` es estado, no metadato sobre el estado. Cambia paso a paso de manera observable, igual que `r0` o `mem[40]`. La diferencia con esos otros nombres es que el `pc` no captura un cómputo del programa, sino el **flujo** —dónde está la ejecución en cada momento.

Este capítulo se concentra en lo que pasa cuando ese flujo deja de avanzar de manera trivial. Hasta acá, todas las trazas mostraron al `pc` incrementándose una posición por paso, lineal y predecible. La pregunta que abre el capítulo es: ¿qué clase de instrucción puede romper esa linealidad, y qué fenómenos —saltos, bifurcaciones, loops— emergen cuando se rompe?

La respuesta corta: las instrucciones de control de flujo del [capítulo 04](04-instrucciones-operandos.md) son las únicas que escriben en el `pc` con un valor que no es `pc + 1`. Todo el resto se sigue de eso. Las consecuencias, sin embargo, son sustanciales y merecen tratarse con cuidado, porque son una de las fuentes más recurrentes de confusión en niveles posteriores: punteros a función, returns que parecen no retornar, recursión que desborda el stack —todos esos fenómenos se vuelven legibles si el flujo está bien instalado acá, e ilegibles si no.

## Avance secuencial por defecto

La regla por defecto del `pc`, cuando ninguna instrucción interviene explícitamente sobre él, es simple: incremento de uno por paso. Si antes de un paso `pc = 5`, después del paso `pc = 6`, salvo que la instrucción aplicada haya sido de control de flujo. Esto vale para todas las clases del [capítulo 04](04-instrucciones-operandos.md) excepto la última.

Esa regla por defecto es lo que hace que un programa "fluya hacia abajo": el `pc` recorre las direcciones contiguas en orden, una tras otra, sin saltos ni vueltas. La gran mayoría de los pasos de cualquier programa siguen esta regla, incluso programas con loops complicados —los loops son la excepción, no la norma.

La regla parece tan obvia que vale la pena explicitarla un momento. Importa porque, cuando un programa se desvía, hay dos interpretaciones posibles del desvío: que el `pc` saltó (algo cambió el flujo deliberadamente) o que la próxima instrucción no era la que esperábamos (la dirección apuntada contiene otra cosa). La primera interpretación es flujo; la segunda es algo más raro y peligroso. Distinguirlas requiere tener internalizada la regla por defecto, y poder reconocer una violación sólo cuando *efectivamente* hay una instrucción de flujo aplicada.

## Saltos incondicionales

La forma más simple de romper la regla por defecto es la instrucción `JMP`. Su efecto es directo: escribir un valor literal en el `pc`. Después de un `JMP 7`, el `pc` vale 7, sin importar qué valía antes ni qué condiciones se cumplían. El próximo fetch va a leer `mem[7]`.

Una traza ilustrativa. Programa:

| dirección | contenido |
| --------- | --------- |
| 0 | `MOV r0, 1` |
| 1 | `JMP 4` |
| 2 | `MOV r0, 99` |
| 3 | `MOV r0, 99` |
| 4 | `ADD r0, 1` |
| 5 | `(fin)` |

Estado inicial: `pc = 0`, `r0 = 0`.

| momento | `pc` | `r0` | instrucción aplicada |
| ------- | ---- | ---- | -------------------- |
| inicio       | 0 | 0 | (ninguna) |
| tras paso 1  | 1 | 1 | `MOV r0, 1`  |
| tras paso 2  | 4 | 1 | `JMP 4`      |
| tras paso 3  | 5 | 2 | `ADD r0, 1`  |

Las direcciones 2 y 3 contienen instrucciones —`MOV r0, 99`— pero esas instrucciones nunca se ejecutan. El `pc` saltó de 1 a 4, dejando esas dos posiciones intactas. Material y conceptualmente, las direcciones 2 y 3 siguen conteniendo lo que contienen; sólo que el flujo no las visitó. Si más adelante (en un programa más complejo) algún `JMP 2` apuntara a esa dirección, las instrucciones se ejecutarían. La materia está; el flujo decide si se usa.

Esta observación —que las instrucciones existen en memoria independientemente de si el flujo las visita— es central. Conecta directamente con la distinción rol/interpretación del [capítulo 02](02-memoria.md). Una posición que contiene una instrucción puede ser nunca-ejecutada, ejecutada-una-vez o ejecutada-muchas-veces, según cómo el flujo la atraviese. Su existencia no depende de su uso.

## Saltos condicionales sobre el estado

Más interesante que `JMP` es `JNZ` —*Jump if Not Zero*. La instrucción tiene dos operandos: un registro y una dirección. Su efecto: leer el registro, evaluar si su contenido es distinto de cero, y si lo es, escribir la dirección en el `pc`. Si el registro vale cero, la condición no se cumple y el `pc` avanza secuencialmente.

`JNZ` es la primera instrucción del nivel donde el flujo **depende del estado** del programa. Las instrucciones anteriores producían el mismo efecto siempre que se ejecutaran. `JNZ`, en cambio, produce efectos distintos según qué valor tenga el registro evaluado en el momento de la ejecución. Esa dependencia es lo que vuelve posible la **bifurcación**: el programa puede ir por un camino o por otro según una condición observable.

Un ejemplo concreto:

| dirección | contenido |
| --------- | --------- |
| 0 | `LOAD r0, [40]` |
| 1 | `JNZ r0, 4` |
| 2 | `MOV r1, 100` |
| 3 | `JMP 5` |
| 4 | `MOV r1, 200` |
| 5 | `(fin)` |
| ... | ... |
| 40 | 0 |

Estado inicial: `pc = 0`, `r0 = 0`, `r1 = 0`, `mem[40] = 0`.

| momento | `pc` | `r0` | `r1` | `mem[40]` | instrucción aplicada |
| ------- | ---- | ---- | ---- | --------- | -------------------- |
| inicio       | 0 | 0 | 0   | 0 | (ninguna) |
| tras paso 1  | 1 | 0 | 0   | 0 | `LOAD r0, [40]` |
| tras paso 2  | 2 | 0 | 0   | 0 | `JNZ r0, 4` (no salta, `r0` vale 0) |
| tras paso 3  | 3 | 0 | 100 | 0 | `MOV r1, 100` |
| tras paso 4  | 5 | 0 | 100 | 0 | `JMP 5` |

El programa terminó con `r1 = 100` porque `mem[40]` valía cero. Si el estado inicial hubiera sido `mem[40] = 7`, la traza habría sido distinta:

| momento | `pc` | `r0` | `r1` | `mem[40]` | instrucción aplicada |
| ------- | ---- | ---- | ---- | --------- | -------------------- |
| inicio       | 0 | 0 | 0   | 7 | (ninguna) |
| tras paso 1  | 1 | 7 | 0   | 7 | `LOAD r0, [40]` |
| tras paso 2  | 4 | 7 | 0   | 7 | `JNZ r0, 4` (salta, `r0` vale 7) |
| tras paso 3  | 5 | 7 | 200 | 7 | `MOV r1, 200` |

Mismo programa, distinto estado inicial, distinta ruta del `pc`, distinto resultado. Los pasos 3 y 4 de la primera traza no existen en la segunda; el paso 3 de la segunda traza no existe en la primera. El programa, leído como secuencia de instrucciones cargadas en memoria, es el mismo en los dos casos. La ejecución es distinta porque el flujo recorre caminos distintos según `r0`. Esto es exactamente lo que significa, en términos del modelo, que el programa "decida" qué hacer.

## Loops como consecuencia, no como construcción

Hasta acá los saltos fueron hacia adelante: el `pc` aumentó. Nada en `JMP` ni en `JNZ` impide que la dirección destino sea **menor** que la actual, lo que produce un salto hacia atrás. Un salto hacia atrás bajo una condición que eventualmente se vuelve falsa es, exactamente, un loop.

Esta es una de las observaciones centrales del nivel: en el modelo de `L1`, los loops no existen como construcción separada. No hay una instrucción `WHILE` ni una instrucción `FOR`. Los loops emergen como **consecuencia** de saltos hacia atrás. Cuando uno escribe `while (r0 > 0) { ... }` en un lenguaje de alto nivel, el compilador no genera una "instrucción de loop"; genera una secuencia de instrucciones que termina con un salto condicional hacia atrás, y de esa secuencia emerge el comportamiento que llamamos *loop*.

Un ejemplo. Programa que decrementa `r0` desde 3 hasta 0:

| dirección | contenido |
| --------- | --------- |
| 0 | `MOV r0, 3` |
| 1 | `SUB r0, 1` |
| 2 | `JNZ r0, 1` |
| 3 | `(fin)` |

La traza:

| momento | `pc` | `r0` | instrucción aplicada |
| ------- | ---- | ---- | -------------------- |
| inicio       | 0 | 0 | (ninguna) |
| tras paso 1  | 1 | 3 | `MOV r0, 3` |
| tras paso 2  | 2 | 2 | `SUB r0, 1` |
| tras paso 3  | 1 | 2 | `JNZ r0, 1` (salta, `r0 = 2 ≠ 0`) |
| tras paso 4  | 2 | 1 | `SUB r0, 1` |
| tras paso 5  | 1 | 1 | `JNZ r0, 1` (salta, `r0 = 1 ≠ 0`) |
| tras paso 6  | 2 | 0 | `SUB r0, 1` |
| tras paso 7  | 3 | 0 | `JNZ r0, 1` (no salta, `r0 = 0`) |

Siete pasos. El cuerpo del loop son las direcciones 1 y 2 (la pareja `SUB` + `JNZ`). El `pc` recorre esa pareja tres veces antes de que la condición de `JNZ` falle y el flujo continúe a la dirección 3. La traza muestra el loop exactamente como lo que es: el `pc` oscilando entre 1 y 2, con `r0` decreciendo, hasta que `r0` llega a cero y el salto deja de tomarse.

Leído como grafo de flujo, el programa tiene una flecha de retroceso que es exactamente lo que produce el loop. Cada bloque del grafo es una instrucción y cada flecha es una transición posible del `pc`:

| desde | a | condición |
|---|---|---|
| `0: MOV r0, 3` | `1: SUB r0, 1` | siempre (avance por defecto) |
| `1: SUB r0, 1` | `2: JNZ r0, 1` | siempre (avance por defecto) |
| `2: JNZ r0, 1` | `1: SUB r0, 1` | si `r0 != 0` (flecha de retroceso) |
| `2: JNZ r0, 1` | `3: (fin)` | si `r0 == 0` (avance por defecto) |

Las dos flechas que salen del bloque 2 son las dos posibilidades de la instrucción `JNZ`. La flecha hacia atrás (`2 → 1`) es lo que cierra el loop. Sin esa flecha, el programa fluiría linealmente de 0 a 3 y terminaría; con esa flecha, el flujo se queda dando vueltas mientras la condición se cumpla. Toda la mecánica del loop está en esa flecha de retroceso, y esa flecha de retroceso es solamente una escritura del `pc` con un valor menor que el actual.

Una propiedad importante de esta lectura: el loop no es nada que esté "en el programa" como entidad; el programa contiene tres instrucciones distintas, y el loop es lo que pasa cuando esas tres se ejecutan en cierto orden bajo cierta condición. El `pc` es la única columna de la traza que delata la presencia del loop, oscilando entre dos direcciones que el observador reconoce como un par. Si una persona mira la traza y no reconoce el patrón de oscilación del `pc`, no ve el loop; si lo reconoce, ve el loop. El loop existe en la lectura de la traza, no en el programa.

Esto tiene una consecuencia que va a importar mucho más adelante: no hay diferencia material entre un salto hacia adelante y un salto hacia atrás. Las dos son escrituras al `pc` con un valor distinto del incremento por defecto. La distinción entre "salto adelante" y "salto atrás" es sólo si el valor escrito al `pc` es mayor o menor que el `pc + 1` que habría correspondido. Para la CPU, no hay diferencia; para nosotros, leer una traza implica reconocer ambos patrones.

## El flujo como información que la traza también captura

El cierre del capítulo —y, en cierto sentido, una parte del cierre del nivel— es esta observación: **la traza captura el flujo igual que captura cualquier otro cambio del estado**. La columna `pc` es una columna como las otras. Su evolución es información de pleno derecho, no decoración auxiliar.

Cuando alguien aprende a leer trazas en este nivel, lo que está aprendiendo es a leer todas las columnas, no sólo las de los registros y la memoria. La columna `pc` cuenta cómo se desplaza la ejecución. Una columna `pc` que crece linealmente describe un programa rectilíneo. Una columna `pc` con un salto único hacia adelante describe una bifurcación. Una columna `pc` con oscilación entre dos direcciones describe un loop. Una columna `pc` que salta a una dirección que no parece tener sentido describe, posiblemente, un error —el programa está ejecutando algo que no era código intencional.

Esta última posibilidad —el `pc` apuntando a memoria que no era código— es la base mecánica de varios fenómenos de niveles posteriores: stack overflow, return address corruption, exploits que redirigen el flujo. Todos esos fenómenos requieren reconocer que el `pc` es estado y que su valor en cada paso decide qué se ejecuta a continuación. Si el `pc` está bien instalado como pieza observable del estado desde acá, esos fenómenos se vuelven legibles después; si no lo está, son magia.

Con el flujo abierto, queda un solo capítulo del nivel: poner las cuatro capas —source, código cargado, datos, proceso en ejecución— en relación entre sí, para que todo lo que `L1` construyó se pueda diferenciar de lo que vive en otros lugares (un archivo en disco, un compilador, un sistema operativo). Eso es el [capítulo 07](07-codigo-datos-programa.md).
