# CPU y registros

## La CPU como ejecutor del paso actual

Hasta ahora la CPU apareció en las trazas pero no como pieza distinguible. Las instrucciones simplemente "se ejecutaban", y los valores cambiaban entre filas sin que nada en la tabla mostrara quién hacía esos cambios. Llegó el momento de poner a la CPU en el centro y darle un rol preciso, porque sin esa precisión la separación entre registros y memoria —que el resto del capítulo va a fijar— se vuelve arbitraria.

La CPU, en el modelo de `L1`, es el **ejecutor del paso actual**. Es la pieza que, en cada paso, lee el `pc`, accede a la posición de memoria que el `pc` señala, interpreta el contenido como una instrucción, y aplica la transformación que esa instrucción describe sobre el resto del estado. Cuando termina el paso, deja el estado modificado y el `pc` señalando la próxima instrucción. Lo que sucede dentro del paso —los tres subpasos `fetch / decode / execute`— es lo que el [capítulo 05](05-fetch-decode-execute.md) va a abrir.

Una caracterización así, deliberadamente acotada, choca con la noción coloquial de "CPU" como sinónimo de "computadora entera". La CPU del coloquio incluye memoria, controladores de I/O, todo lo que está dentro del gabinete. La CPU de `L1` es algo más estricto: la pieza que ejecuta el paso, y nada más. La memoria está afuera de la CPU; los dispositivos están afuera del modelo entero. Esta delimitación no es pedante: cuando aparezcan calling conventions, stack frames y debugging en niveles posteriores, la diferencia entre "lo que hace la CPU" y "lo que hace la memoria" va a ser exactamente lo que permita razonar.

## Registros como cuaderno cercano

La CPU, para hacer su trabajo, necesita un lugar de almacenamiento al que pueda acceder instantáneamente, sin pasar por la maquinaria de direccionamiento de memoria. Ese lugar son los **registros**.

Un registro es una posición de almacenamiento, igual que una posición de memoria, en el sentido de que tiene un valor. Pero a diferencia de una posición de memoria, no se accede por dirección sino por **nombre**. En el ISA de juguete del nivel, los registros se llaman `r0`, `r1`, `r2`, etcétera. Cuando una instrucción dice `ADD r0, 1`, no está pidiendo "leer el contenido de la posición de memoria llamada `r0`": está nombrando directamente al registro `r0`, que es una pieza distinta de la memoria.

La diferencia entre acceder a un registro y acceder a memoria, en este modelo, es funcional. Un registro está, conceptualmente, dentro de la CPU; una posición de memoria está afuera. Acceder a un registro es trivial para la CPU; acceder a una posición de memoria requiere especificar la dirección y atravesar el camino que conecta CPU con memoria. Acá importa la distinción cualitativa, no la cuantitativa: el costo concreto en ciclos no es tema de `L1`. Lo que `L1` fija es que ambas operaciones existen y son distintas; cuándo importa la diferencia y por qué se discute en niveles posteriores cuando aparezca performance como tema.

Una consecuencia operativa que se ve en cualquier traza: los registros aparecen como columnas en la tabla, identificados por nombre (`r0`, `r1`, ...). Las posiciones de memoria también aparecen como columnas, pero identificadas por dirección (`mem[40]`, `mem[50]`, ...). La notación distinta refleja la naturaleza distinta de cada pieza, no es solamente cosmética.

La imagen mental del nivel queda así: la CPU contiene un puñado de registros nombrados (`pc`, `r0`, `r1`, `r2`, ...) que la CPU accede de manera inmediata, sin atravesar ningún camino. La memoria es una región externa a la CPU, organizada como una secuencia de posiciones direccionadas por número (`0`, `1`, ..., `40`, ...), cada una con un valor. Para leer o escribir cualquier posición de memoria, la CPU tiene que cruzar el camino entre las dos: el fetch para traer la próxima instrucción, el `LOAD` para leer un dato, el `STORE` para escribir uno. Las instrucciones que sólo manipulan registros no cruzan ese camino: se quedan dentro de la CPU.

## Operar en registro vs operar en memoria

La distinción anterior se vuelve concreta cuando se mira qué partes del estado toca cada instrucción. Hay instrucciones que sólo manipulan registros, hay instrucciones que tocan memoria, y la diferencia es observable en la traza.

Considerar dos pasos consecutivos sobre el siguiente programa. Estado inicial: `pc = 0`, `r0 = 5`, `r1 = 0`, `mem[40] = 99`.

| dirección | contenido |
| --------- | --------- |
| 0 | `MOV r1, r0` |
| 1 | `STORE r1, [40]` |

La traza:

| momento | `pc` | `r0` | `r1` | `mem[40]` | instrucción aplicada |
| ------- | ---- | ---- | ---- | --------- | -------------------- |
| inicio       | 0 | 5 | 0 | 99 | (ninguna) |
| tras paso 1  | 1 | 5 | 5 | 99 | `MOV r1, r0` |
| tras paso 2  | 2 | 5 | 5 | 5  | `STORE r1, [40]` |

Vale la pena leer las dos transiciones por separado. El paso 1 cambió `r1` y nada más: la instrucción `MOV r1, r0` copia el contenido de `r0` en `r1`, sin tocar memoria. La columna `mem[40]` queda igual. El paso 2 cambió `mem[40]` y nada más: la instrucción `STORE r1, [40]` copia el contenido de `r1` en la posición de memoria 40. La columna `r1` queda igual (la instrucción la lee, no la modifica).

Esta clase de comparación entre dos pasos —uno que toca sólo registros, otro que toca memoria— es el ejercicio central del nivel. Una persona que mire la traza y pueda decir, sin titubear, dónde vivió el cambio en cada paso (sólo en `r1` en el primero, sólo en `mem[40]` en el segundo), tiene firme la distinción entre registro y memoria. Si esa lectura no es directa, conviene volver al capítulo y revisar las dos primeras secciones antes de seguir.

## Cuántos registros y por qué este número no importa todavía

Una pregunta razonable: ¿cuántos registros tiene la CPU del modelo de `L1`?

La respuesta corta es que no importa. La respuesta más larga es que `L1` asume que hay un puñado pequeño de registros nombrados (`r0`, `r1`, hasta donde haga falta para los ejemplos), sin fijar un número concreto. Las trazas del nivel rara vez van a usar más de tres o cuatro al mismo tiempo.

La pregunta tiene su importancia, pero su respuesta concreta es propiedad de cada ISA real, no del modelo mínimo. x86-64, por dar el dato sin entrar en el tema, tiene 16 registros enteros de propósito general. ARM64 tiene 31. Cada arquitectura elige un número distinto basándose en compromisos de diseño que `L7` va a discutir cuando corresponda. Mientras tanto, lo que `L1` afirma —que hay un puñado pequeño y nombrado— es cierto para cualquier ISA real, y eso alcanza para construir el modelo.

Hay una propiedad relacionada que sí importa fijar acá: los registros son **pocos**. No son una mini-memoria que pueda reemplazar a la memoria; son demasiado escasos para eso. Cualquier programa no trivial necesita más espacio del que cabe en los registros, y por eso la memoria sigue siendo necesaria. La distribución de trabajo entre registros y memoria —qué se mantiene en registros, qué se va a memoria, cuándo conviene mover de un lado al otro— es un tema enorme que aparece bajo distintos nombres en niveles posteriores (calling conventions, register allocation en compiladores, tuning de performance). En `L1` queda apenas instalado: registros pocos y rápidos, memoria mucha y un escalón más cara de tocar.

## El `pc` como un registro especial

El `pc` ha aparecido en cada traza desde el [capítulo 01](01-maquina-de-estado.md) y no se ha discutido qué clase de pieza es. Llegó el momento. El `pc` es, en el modelo de `L1`, un **registro especial** dentro de la CPU.

Es un registro porque es una pieza pequeña, nombrada, accesible instantáneamente desde la CPU, que contiene un valor. Comparte todas las propiedades de los registros generales del nivel.

Es **especial** porque la CPU lo manipula implícitamente en cada paso. Las instrucciones generales nombran explícitamente sus registros operandos: `ADD r0, 1` dice "operar sobre `r0`". El `pc`, en cambio, se lee sin que ninguna instrucción lo nombre (cuando la CPU empieza un paso, lee el `pc` para saber dónde está la instrucción) y se escribe casi sin que ninguna instrucción lo nombre (al terminar un paso, la CPU avanza el `pc` automáticamente). Las únicas instrucciones que tocan el `pc` explícitamente son las de control de flujo (`JMP`, `JNZ`), que el [capítulo 06](06-flujo-de-control.md) va a tratar como tema central.

Una consecuencia menor pero útil: en las trazas, el `pc` siempre aparece como columna. Su evolución muestra el flujo del programa con la misma materialidad con la que `r0` muestra el cuaderno aritmético. Una traza donde el `pc` avanza linealmente describe un programa sin saltos. Una traza donde el `pc` retrocede describe un loop. Una traza donde el `pc` salta a una dirección no contigua describe una bifurcación. Todo eso se va a leer en la columna `pc`, y por eso el `pc` merece estar siempre presente en las trazas, aunque parezca redundante para programas simples.

El `pc` como pieza explícita del estado es lo que conecta este capítulo con el siguiente. Si el `pc` señala la próxima instrucción y la CPU la ejecuta, queda la pregunta de qué clases de instrucciones existen, qué operandos consultan y qué partes del estado modifican. Esa clasificación —el repertorio del ISA de juguete— es lo que el [capítulo 04](04-instrucciones-operandos.md) abre.
