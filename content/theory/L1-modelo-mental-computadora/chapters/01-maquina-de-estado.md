# La computadora como máquina de estado

## De la receta a la trinidad estado / instrucción / transición

La [introducción](00-introduccion.md) usó la imagen de una receta leída por un cocinero para nombrar, sin tecnicismos, las ideas de algoritmo y de máquina universal. Antes de pasar a las definiciones formales que el resto del capítulo va a sostener, conviene mostrar cómo esa imagen se traduce —una sola vez— al vocabulario que `L1` va a usar a partir de acá.

En la cocina, hay tres cosas distinguibles. Primero, **lo que hay en este momento**: qué ingredientes están sobre la mesa, qué cantidades quedan en cada recipiente, qué tiene el horno, qué paso de la receta el cocinero está a punto de leer. Esa foto completa de la situación actual es el **estado** de la cocina. Segundo, **cada paso escrito de la receta**: *"agregar 200 g de harina al bol"*, *"hornear 20 minutos a 180°"*. Cada paso es una **instrucción**: una descripción de qué cambio aplicar, no el cambio mismo. Tercero, **el momento concreto en que el cocinero aplica un paso**: ese acto produce una **transición** del estado anterior al estado siguiente. La harina pasó del paquete al bol; el bol pesa más; el paquete pesa menos; el cocinero apunta al paso siguiente.

Las tres cosas —estado, instrucción, transición— ya están en cualquier proceso que siga una receta. La computadora hace exactamente lo mismo, con dos diferencias importantes: el estado es muchísimo más pequeño (registros, memoria, un contador de paso, nada más) y el repertorio de instrucciones es muchísimo más estrecho (siete instrucciones básicas en el ISA del nivel, en lugar del repertorio abierto de un cocinero). Esa estrechez es la que hace que el modelo se pueda razonar con precisión: hay un número pequeño de cosas que pueden pasar en cada paso, y todas son inspeccionables.

A partir de acá, la metáfora de la cocina queda guardada. El resto del capítulo —y del nivel— va a hablar de estado, instrucción y transición como conceptos técnicos, sin volver a invocar al cocinero. La intuición hizo su trabajo: dejó nombradas las tres ideas. Lo que viene es darles forma rigurosa para que las trazas sean comprobables y las preguntas que el track va a hacer después tengan dónde apoyarse.

## Estado, instrucción y transición

La introducción del nivel dejó dicho que `L1` ataca el problema de qué significa exactamente que un programa se esté ejecutando, y que la respuesta va a apoyarse en una distinción entre estado y transición. Este capítulo convierte esa distinción en algo manipulable. Antes de nombrar piezas concretas —registros, memoria, `pc`—, conviene fijar las tres ideas que las van a sostener.

La primera idea es **estado**. El estado de un sistema es, simplemente, toda la información actual del sistema en un momento dado. Para una computadora en ejecución, eso incluye qué valor tiene cada registro, qué hay en cada posición de memoria que importe, y a qué instrucción está apuntando el `pc`. El estado no es una abstracción flotante: es algo que, en cualquier momento, se podría escribir en una hoja como una lista de pares "nombre = valor". Si dos sistemas tienen la misma lista, están en el mismo estado.

La segunda idea es **instrucción**. Una instrucción no es una acción; es la *descripción* de una transformación posible. La instrucción `ADD r0, 1` no hace nada por sí sola: dice cómo cambiar el estado *si se aplicara*. Esta distinción parece pedante hasta que alguien intenta explicar qué pasa cuando una instrucción está cargada en memoria pero todavía no se ejecutó —un caso central en el track. Una instrucción es una descripción; cuando se aplica, produce el tercer concepto.

La tercera idea es **transición**. Una transición es el paso concreto entre un estado y el siguiente, producido por la aplicación de una instrucción. Si el estado es la foto, la transición es el evento que separa dos fotos consecutivas. Una transición tiene autor (la instrucción que la produjo) y efecto (las piezas del estado que cambiaron).

Con estas tres ideas, una ejecución entera deja de ser un fenómeno opaco y se vuelve algo bien definido: una secuencia de estados $s_0, s_1, s_2, \dots$ donde cada $s_{i+1}$ se obtiene de $s_i$ aplicando alguna instrucción. La computadora ejecutando un programa es exactamente eso, sin nada agregado y sin nada faltando.

## Programa almacenado

Una observación que parece menor y resulta central: el programa también vive en el estado. No flota en otro lado, no entra desde afuera en cada paso. El programa es una secuencia de instrucciones cargadas en posiciones de memoria, y esas posiciones forman parte del estado igual que cualquier otra.

La idea —conocida históricamente como **programa almacenado** o *stored-program*— suena obvia hoy y no lo era cuando se formuló. Antes existían máquinas donde el programa era cableado físico: para cambiar el programa había que recablear. La idea de que el programa sea simplemente un patrón de valores en memoria, manipulable como cualquier otro patrón de valores, es lo que permite que una computadora cargue programas distintos sin ser reconstruida físicamente. Para `L1`, la consecuencia operativa es directa: cuando se escriba la traza de un programa, el programa mismo va a aparecer como un bloque de posiciones de memoria con instrucciones adentro, lado a lado con las posiciones que el programa usa para datos.

Esto abre una pregunta que el resto del capítulo va a contestar: si tanto las instrucciones como los datos viven en memoria, ¿qué los distingue?

## Rol e interpretación: la materia y la lectura

La respuesta es incómoda al principio: nada los distingue *materialmente*. Una posición de memoria contiene un valor. El mismo valor puede ser interpretado como una instrucción (un código que la CPU reconoce y aplica) o como un dato (un número, un caracter, una dirección a otro lugar). La materia —el patrón de bits, el valor concreto— es la misma; lo que cambia es el **rol** que esa posición juega en la ejecución particular.

La distinción entre **rol** e **interpretación** es uno de los aportes centrales de `L1`. Un mismo bloque material puede leerse como instrucción si el `pc` apunta a él durante un fetch, o como dato si una instrucción lo nombra como operando. La lectura no está pegada a la materia; depende de cómo la ejecución la usa en cada momento.

Esta no es una sutileza filosófica. Es la base de varios fenómenos que el track va a explorar más adelante: punteros a función (datos que después se interpretan como instrucciones), exploits que sobrescriben código (datos que la ejecución terminará leyendo como instrucciones aunque eso no fuera intención del programa), debuggers que muestran las mismas direcciones a veces como código y a veces como datos. Todo eso depende de aceptar, desde acá, que una posición de memoria es solamente eso: una posición con un valor, y el rol se decide en el uso.

## Las piezas del estado mínimo

Con las tres ideas (estado, instrucción, transición) y la noción de programa almacenado, ya se puede nombrar el estado mínimo que el nivel va a observar. Son cinco componentes:

1. **Memoria**: una secuencia de posiciones, cada una identificada por una dirección, cada una con un valor.
2. **Registros**: un puñado pequeño de posiciones especiales, nombradas (no direccionadas), accesibles instantáneamente desde la CPU.
3. **CPU**: el ejecutor del paso actual; la pieza que toma una instrucción y produce la transición.
4. **`pc`** (program counter): la dirección de la próxima instrucción a ejecutar.
5. **Programa**: las instrucciones cargadas en memoria, formando una sub-secuencia contigua de posiciones cuyos valores se interpretan como instrucciones cuando el `pc` las señala.

Los próximos capítulos van a examinar cada pieza por separado: el [capítulo 02](02-memoria.md) se concentra en la memoria, el [capítulo 03](03-cpu-registros.md) en CPU y registros, el [capítulo 04](04-instrucciones-operandos.md) en las clases de instrucciones del ISA de juguete. Antes de eso, conviene ver una traza completa que use las cinco piezas al mismo tiempo, aunque sea brevemente.

## Una primera traza de juguete

Considerar el siguiente programa, cargado en memoria a partir de la dirección 0:

| dirección | contenido (interpretado) |
| --------- | ------------------------ |
| 0 | `LOAD r0, [40]` |
| 1 | `ADD r0, 1` |
| 2 | `STORE r0, [40]` |
| 3 | `(fin)` |
| ... | ... |
| 40 | `7` |

Las direcciones 0 a 2 contienen tres instrucciones; la dirección 40 contiene el dato que las instrucciones van a manipular. El programa carga el valor de la posición 40 en el registro `r0`, le suma 1, y lo escribe de vuelta en la posición 40. Estado inicial: `pc = 0`, `r0 = 0`, `mem[40] = 7`. El resto de la memoria no cambia y se omite.

La traza completa:

| momento | `pc` | `r0` | `mem[40]` | instrucción aplicada |
| ------- | ---- | ---- | --------- | -------------------- |
| inicio       | 0 | 0 | 7 | (ninguna) |
| tras paso 1  | 1 | 7 | 7 | `LOAD r0, [40]`   |
| tras paso 2  | 2 | 8 | 7 | `ADD r0, 1`       |
| tras paso 3  | 3 | 8 | 8 | `STORE r0, [40]`  |

Cada fila es un estado. Cada transición entre filas consecutivas es la aplicación de la instrucción nombrada en la última columna. La columna `pc` muestra que avanza una posición por paso —comportamiento por defecto del que el [capítulo 06](06-flujo-de-control.md) va a dar la versión completa. La columna `r0` cambia en los pasos 1 y 2 (las dos primeras instrucciones lo modifican) y queda igual en el paso 3 (`STORE` lee de `r0` pero no lo cambia). La columna `mem[40]` cambia sólo en el paso 3.

Vale la pena leer esta tabla con detalle, porque concentra casi todo el nivel. Tres pasos, cuatro filas, todo el cambio visible. Una persona que mire esta traza y pueda explicar por qué `r0` cambia en los primeros dos pasos pero no en el tercero, ya entendió la mitad de lo que `L1` busca instalar. La otra mitad —cómo cada pieza se comporta y cómo el flujo se desvía— viene en los capítulos siguientes.

Una observación final sobre la traza, conectada con la sección anterior: las direcciones 0, 1, 2 contienen instrucciones porque el `pc` las recorre durante los tres pasos. La dirección 40 contiene un dato porque las instrucciones la nombran como operando. Si en un programa distinto el `pc` llegara a apuntar a la dirección 40, su contenido —el valor 7, o lo que esté en ese momento— se leería como instrucción. La materia es la misma; el rol depende del uso.
