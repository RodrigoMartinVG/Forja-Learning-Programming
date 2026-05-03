# La computadora como máquina de estado

Una frase como "la computadora corre un programa" suena razonable, pero explica muy poco. Si no se dice qué estado tiene la máquina, qué parte de ese estado cambia y por qué cambia, la ejecución termina pareciendo magia.

Para L1 hace falta un modelo más chico y más útil:

> **Una computadora como una máquina de estado que aplica instrucciones sobre un estado observable.**

Dicho de manera más directa:

- **estado** es lo que la máquina tiene en un momento dado: algunos valores guardados, alguna posición de ejecución, alguna información ya cargada
- **instrucción** es un paso que puede cambiar una parte de ese estado
- **observable** quiere decir que ese cambio no queda en el aire: se puede describir qué había antes y qué queda después en piezas concretas de la máquina

El resto del capítulo despliega esa idea de menor a mayor. Primero conviene ganar intuición sobre por qué algo almacenado puede leerse como dato o como instrucción. Después conviene entender por qué eso vuelve general a la máquina. Recién entonces vale la pena poner nombres técnicos a las piezas y seguir una traza concreta.

## Dato e instrucción: cambia la lectura, no la materia

La primera intuición importante de este capítulo es esta: decir que en memoria puede haber datos e instrucciones no significa que existan dos materias distintas dentro de la RAM. Significa que el mismo contenido almacenado puede cumplir dos roles distintos según como se lo interprete.

No hace falta bajar todavía a bits para captar esto. Alcanza con entender que la memoria no trae una etiqueta física que diga "código" o "dato". Lo que decide el rol es el contexto de ejecución.

Una analogía sobria es pensar en un documento con líneas como estas:

```text
DEBITAR 1000 DE CAJA
ACREDITAR 1000 EN CUENTA_X
IMPRIMIR "TRANSFERENCIA OK"
```

Si ese archivo se abre en un editor, funciona como dato: algo que se lee, copia o archiva. Si un sistema que entiende ese formato lo toma como un procedimiento a ejecutar, esas mismas líneas pasan a funcionar como instrucciones: cada una dispara una acción. El archivo no cambió. Cambió la lectura que se hace de él.

En este ejemplo ya aparece, de manera todavía informal, la frase recuadrada del arranque:

- hay **estado** porque el sistema que interpreta el documento tiene una situación actual que podría describirse, por ejemplo, como `caja=5000`, `cuenta_x=200` y `salida=""`
- hay **instrucciones** porque cada línea del documento propone un paso capaz de cambiar una parte de esa situación
- hay algo **observable** porque se puede decir qué había antes y qué queda después en piezas concretas del sistema

Si se mira el documento de esa manera, incluso sin hablar todavía de CPU ni de registros, ya aparece una pequeña traza:

| Momento | Estado relevante |
|---|---|
| antes de empezar | `caja=5000`, `cuenta_x=200`, `salida=""` |
| después de `DEBITAR 1000 DE CAJA` | `caja=4000`, `cuenta_x=200`, `salida=""` |
| después de `ACREDITAR 1000 EN CUENTA_X` | `caja=4000`, `cuenta_x=1200`, `salida=""` |
| después de `IMPRIMIR "TRANSFERENCIA OK"` | `caja=4000`, `cuenta_x=1200`, `salida="TRANSFERENCIA OK"` |

La frase del arranque ya estaba operando dentro de este ejemplo: había una situación inicial, había pasos que la modificaban y había cambios que podían describirse con precisión.

En una computadora pasa algo análogo:

- cuando una región se toma como el siguiente paso del procedimiento, esa región cumple el rol de código
- cuando una region se consulta para obtener un valor, una tabla o un texto, esa region cumple el rol de dato
- cuando una región se consulta para obtener un valor, una tabla o un texto, esa región cumple el rol de dato
- lo decisivo no es una diferencia de "sustancia", sino el papel que ese contenido cumple en ese momento

Esa intuición tiene mucho alcance. Si las instrucciones pueden almacenarse como información, también pueden copiarse, cargarse, analizarse, transformarse y generarse. De ahí salen compiladores, intérpretes, loaders y muchas otras piezas que no tendrían sentido si el programa viviera pegado al cableado de la máquina.

En L1 no hace falta ir más lejos. Alcanza con fijar esta idea: código y dato no son dos universos físicos separados; son dos usos posibles de información almacenada dentro del mismo modelo de máquina.

Si esto ya se entiende, la idea de programa almacenado deja de sonar misteriosa. Una máquina general puede cambiar de comportamiento porque aquello que le dice qué hacer también vive almacenado.

Todavía no hace falta nombrar todas las piezas de esa máquina. Alcanza con una intuición previa: hay información guardada, hay alguna parte del sistema que la va leyendo como procedimiento y hay un comportamiento que cambia según lo almacenado.

## Von Neumann sin folklore

Con esa intuición en la mano, la referencia a von Neumann entra por una razón más fuerte que un nombre propio. Sirve para fijar el salto conceptual que vuelve a una computadora una máquina general y no una máquina cableada para una sola tarea.

Antes de esa intuición, es fácil imaginar otra clase de artefacto: una máquina armada para hacer un cálculo puntual. Si hace falta otra conducta, no se carga otro programa: hay que cambiar la máquina, recablearla o construir otra.

La idea de programa almacenado rompe eso. La máquina física ya no contiene cada algoritmo posible en su cableado. Contiene una unidad ejecutora capaz de hacer un repertorio finito de pasos simples, una memoria direccionable donde guardar información y alguna forma de marcar cuál es el siguiente paso del procedimiento. Más adelante a esas piezas les pondremos nombres más precisos.

| Si el procedimiento estuviera fijado en la máquina | Si el procedimiento vive en memoria |
|---|---|
| cambiar de tarea exige rediseñar o recablear | cambiar de tarea exige cargar otra secuencia |
| la máquina queda atada a una conducta puntual | la misma máquina puede ejecutar conductas muy distintas |
| "el algoritmo" vive en el hardware | "el algoritmo" vive en información almacenada |

En ese modelo:

- la misma memoria guarda información direccionable
- una parte de esa información puede ser leída como **instrucciones**
- otra parte puede ser leida como **datos**
- otra parte puede ser leída como **datos**
- una unidad ejecutora toma el siguiente paso indicado, lo interpreta y deja preparada la máquina para continuar

La intuición fuerte es esta: el algoritmo deja de estar soldado a la máquina y pasa a estar representado en memoria.

Eso parece una frase chica, pero cambia todo. La misma máquina puede sumar una lista, ordenar un arreglo, buscar un patrón en un archivo o compilar otro programa sin ser reconstruida. Solo hay que cargar otra secuencia de instrucciones y darle otros datos. Acá está el poder de la idea: una computadora de propósito general no es una máquina que "sabe hacer todo", sino una máquina suficientemente simple y general como para seguir procedimientos distintos según lo que encuentra almacenado.

La intuición de Turing conecta directo con esto. La máquina universal no es "una máquina enorme" que trae todas las soluciones adentro. Es la idea de que una máquina puede leer la descripción de otro procedimiento y comportarse según esa descripción. Dicho de manera operativa: si un procedimiento puede representarse como información, otra máquina suficientemente general puede leerlo y ejecutarlo.

## El modelo mínimo que hace falta

Una vez fijada esa intuición, recién conviene bajar al recorte mínimo que hace falta para trabajar el resto del nivel.

Ahora sí conviene poner nombres más precisos a las piezas que veníamos describiendo de manera informal.

El modelo chico que alcanza en este punto del plan es este:

- una **CPU**, es decir, la pieza que ejecuta instrucciones
- un conjunto pequeño de **registros** que guardan estado cercano
- una **memoria** direccionable
- un **program counter**, es decir, un registro que marca qué instrucción toca ejecutar ahora
- un conjunto de **instrucciones** que transforman ese estado

Todavía no hace falta hablar de binarios, transistores, pipelines ni caches. Tampoco hace falta conocer un lenguaje de assembly real. Lo que hace falta es poder mirar una situación y responder: qué estado había antes, qué instrucción se aplica y qué estado queda después.

Un modelo mínimo puede escribirse así:

| Pieza | Estado observable |
|---|---|
| `pc` | dirección de la instrucción actual |
| `r0` | un registro general |
| `mem[40]` | una celda de memoria |
| programa | secuencia finita de instrucciones |

Con eso ya se puede dejar de pensar "el programa hace cosas" y empezar a pensar "esta instruccion cambia estas partes del estado".

Cuando en este nivel se habla de **estado de la máquina**, se está hablando justamente del valor actual de esas piezas observables: qué instrucción toca ejecutar ahora, qué contienen algunos registros y qué valores relevantes hay en memoria. Ejecutar deja de sonar mágico cuando se lo mira así: un estado pasa a otro porque una instrucción transforma una parte de lo que la máquina tenía en ese momento.

## Estado, instrucciones y transiciones

Ahora que las piezas ya tienen nombre, la forma más directa de bajar esa intuición a tierra es seguir una traza pequeña.

Supóngase este programa mínimo, escrito en una pseudonotación:

```text
0: LOAD r0, [40]
1: ADD  r0, 1
2: STORE r0, [40]
3: HALT
```

Y este estado inicial:

| Componente | Valor inicial |
|---|---|
| `pc` | `0` |
| `r0` | `0` |
| `mem[40]` | `7` |

Si se sigue la ejecución paso a paso, lo que importa no es la notación exacta sino la transición de estado:

| Paso | Instrucción | Estado antes | Estado después |
|---|---|---|---|
| 1 | `LOAD r0, [40]` | `pc=0`, `r0=0`, `mem[40]=7` | `pc=1`, `r0=7`, `mem[40]=7` |
| 2 | `ADD r0, 1` | `pc=1`, `r0=7`, `mem[40]=7` | `pc=2`, `r0=8`, `mem[40]=7` |
| 3 | `STORE r0, [40]` | `pc=2`, `r0=8`, `mem[40]=7` | `pc=3`, `r0=8`, `mem[40]=8` |
| 4 | `HALT` | `pc=3`, `r0=8`, `mem[40]=8` | ejecución detenida |

Si en las direcciones `0..3` hubiera otra secuencia, la CPU sería la misma pero la historia de estados sería otra. Ese es exactamente el punto del programa almacenado: la máquina no cambia de identidad, cambia el procedimiento que va leyendo desde memoria.

Ese cuadro ya alcanza para ver varias cosas importantes:

- la CPU no "entiende el problema"; aplica instrucciones
- no todas las instrucciones cambian las mismas partes del estado
- el `pc` ancla el orden de ejecución
- memoria y registros cumplen roles distintos
- ejecutar no es otra cosa que encadenar transiciones de estado

Esta forma de pensar sirve mucho más adelante cuando aparezcan punteros, stack frames, syscalls, debuggers y assembly. En todos esos casos la pregunta fuerte sigue siendo la misma: qué parte del estado cambia y por qué.

## Entrada, salida y entorno

El modelo anterior parece cerrado, pero una computadora real no vive aislada. Recibe entrada, produce salida y convive con un entorno.

En este punto alcanza con una intuición mínima:

- una entrada puede terminar cambiando memoria, registros o flujo de control
- una salida observable suele ser el efecto de un cambio de estado que después se vuelve visible afuera
- el entorno importa porque la máquina no vive solo para transformarse a sí misma; también interactúa con dispositivos, archivos, red o terminal

Todavía no hace falta bajar eso a syscalls ni a sistema operativo. Lo que hace falta es no imaginar la ejecución como una cajita sellada. El programa tiene estado interno, pero también produce efectos y reacciona a información que llega desde afuera.

Por eso, incluso en un modelo tan chico como el de este capítulo, conviene reservar una casilla mental para "entorno": algo externo que puede alimentar datos o consumir resultados sin que por eso desaparezca el modelo de estado.

## Qué deja afuera este modelo

Este capítulo deja afuera bastante a propósito.

- Deja afuera como se representan exactamente los datos. Eso es `L2`.
- Deja afuera cómo se construye el ejecutable que la máquina termina corriendo. Eso es `L3`.
- Deja afuera como se ven instrucciones reales en assembly. Eso es `L7`.
- Deja afuera detalles de microarquitectura, pipelines, caches y branch prediction.
- Deja afuera también el detalle de procesos, syscalls, scheduler y memoria virtual.

No porque esos temas no importen, sino porque conviene llegar a ellos con una base común ya fijada. Si primero no queda clara la idea de máquina + estado + transiciones, los niveles siguientes se vuelven nombres técnicos sin forma estable.

El criterio de L1 no es explicar toda la computadora. Es explicar el modelo mínimo que permite dejar de tratarla como magia.