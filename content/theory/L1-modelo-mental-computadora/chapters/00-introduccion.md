# Por qué este nivel existe

> —¿Por qué me hablas de las piedras? Es sólo el arco lo que me importa.
> —Sin piedras no hay arco.
> — *Diálogo entre Kublai Kan y Marco Polo, en Las ciudades invisibles, Italo Calvino (1972)*

## Una receta, un cocinero y la idea de máquina universal

Antes de cualquier tecnicismo, conviene apoyarse en una imagen cotidiana para nombrar dos ideas que después el nivel va a desplegar con cuidado: **algoritmo** y **máquina universal**.

Una receta de cocina, escrita en un papel o guardada en un archivo de texto, es **un dato**. Como hoja, no hace nada: es tinta sobre papel o caracteres en disco. Si esa misma hoja la lee un cocinero, o la procesa un artefacto que sabe interpretar instrucciones de cocina, el contenido del papel deja de ser solamente texto y se vuelve una **receta en ejecución**: pasos que se aplican uno tras otro, ingredientes que cambian de estado, un plato que termina existiendo. La materia escrita en la hoja sigue siendo la misma; el efecto es radicalmente distinto según exista o no algo capaz de leerla y aplicarla.

Esa receta —una secuencia finita de pasos ordenados que, dadas ciertas entradas, produce un resultado— es lo que llamamos **algoritmo**. La idea es independiente de cualquier computadora: una receta de cocina, un protocolo médico, las instrucciones de armado de un mueble son todos algoritmos. Lo que tienen en común es la promesa de que, si los pasos se aplican fielmente, el resultado está determinado por las entradas. La computación no inventó los algoritmos; los volvió mecánicamente ejecutables.

La segunda idea aparece cuando uno mira la relación entre el cocinero y las recetas. El cocinero —o el artefacto que las interpreta— es **uno y el mismo**, pero las recetas que puede ejecutar son **muchas y variables**. Hoy un risotto, mañana un pan, pasado un caldo, todas con el mismo cocinero. Lo que cambia entre un día y otro no es la cocina: es la receta cargada. Esta asimetría —máquina fija, programas variables— es exactamente la idea de **máquina universal**, y es lo que distingue a una computadora de un electrodoméstico de función única. Una tostadora hace tostadas; una computadora hace lo que la receta cargada le diga que haga.

Esa intuición alcanza para arrancar y nada más. La metáfora del cocinero arrastra cosas que no se trasladan a una computadora real —un cocinero entiende la receta, improvisa cuando falta un ingrediente, ajusta sal a gusto— y `L1` necesita un modelo donde nada de eso ocurra: la CPU no entiende, no improvisa, no ajusta. Aplica códigos reconocidos sobre estado observable, paso por paso, sin interpretación. Por eso la imagen de la receta sirve para entrar al nivel pero queda cerrada al inicio del [capítulo 01](01-maquina-de-estado.md), donde se traduce a un vocabulario propio que el resto del track va a usar sin volver a invocar la cocina.

## El problema del modelo mínimo

"La computadora ejecuta código" es una de esas frases que resulta cierta y al mismo tiempo inservible. Es cierta porque ningún tecnicismo la contradice: efectivamente, hay algo llamado computadora que efectivamente ejecuta algo llamado código. Es inservible porque, cuando algo deja de funcionar —un programa que se cuelga, un valor que aparece donde no debería, un loop que no termina—, la frase no permite formular ninguna pregunta concreta sobre qué pasó. No nombra piezas que se puedan inspeccionar. No describe transiciones que se puedan recorrer. No deja nada sobre lo que apoyar un diagnóstico.

El track entero, desde `L2` hasta los niveles avanzados, va a apoyarse en preguntas que esa frase no soporta: *"¿qué cambió en memoria entre el paso anterior y este?"*, *"¿qué dirección está realmente apuntando el `pc` cuando la función retorna?"*, *"¿qué valor tiene `r0` justo antes del salto?"*. Esas preguntas requieren un modelo donde la ejecución sea visible y descomponible. Sin ese modelo, las explicaciones posteriores se sostienen sólo si la persona tiene previamente algún equivalente, y se desploman silenciosamente cuando no lo tiene. El propósito de `L1` es construir ese modelo desde cero, antes de que ningún tema lo necesite.

## Qué piezas separa este nivel

El modelo que `L1` construye es deliberadamente austero. Reconoce cinco piezas y nada más: una **CPU** que ejecuta el paso actual, un conjunto de **registros** que hacen de cuaderno cercano a la CPU, una **memoria** organizada como secuencia de posiciones direccionables, un **programa** que vive en esa memoria como una serie de instrucciones, y un **program counter** —el `pc`— que indica cuál de esas instrucciones es la próxima en ejecutarse.

Cinco piezas alcanzan para mucho, pero no porque sean una simplificación de algún sistema real más complejo. Alcanzan porque la pregunta que el nivel ataca —*"¿qué significa exactamente que un programa se está ejecutando?"*— se contesta sin necesitar más. Agregar caches, predicción de saltos, MMUs o cualquier otra capa antes de que esta base esté firme no aclara nada; sólo distribuye la confusión sobre más vocabulario. Esos refinamientos vienen, pero no acá.

Lo que el nivel sí va a insistir, capítulo tras capítulo, es en distinguir entre estado y transición. El **estado** es la información actual del conjunto entero de piezas: qué hay en cada registro, qué hay en cada posición de memoria que importe, dónde apunta el `pc`. La **transición** es el cambio entre un estado y el siguiente, producido por una instrucción. Aprender a leer un programa en ejecución, en este nivel, es aprender a recorrer una secuencia de estados separados por transiciones bien definidas. Nada más, nada menos.

## La traza como herramienta de trabajo

La forma material en que `L1` materializa el modelo es una sola: la **traza tabular**. Una traza es una tabla con una fila por paso de ejecución, una columna por pieza relevante del estado, y una progresión visible de cómo cada pieza cambia. Casi todos los capítulos van a producir trazas; casi todos los ejercicios van a pedir leerlas o completarlas.

Un ejemplo mínimo, sólo para anclar la idea —los detalles van a aparecer en los capítulos siguientes:

| momento | `pc` | `r0` | `mem[40]` |
| ------- | ---- | ---- | --------- |
| inicio  | 0    | 0    | 7         |
| tras paso 1 | 1 | 7    | 7         |
| tras paso 2 | 2 | 8    | 7         |
| tras paso 3 | 3 | 8    | 8         |

Tres pasos, cuatro filas, todo el cambio visible. Esa visibilidad es la promesa del nivel. Cuando el nivel termine, la persona debería poder mirar una tabla así y reconstruir, sin ayuda, qué instrucción produjo cada transición y qué pieza del estado tocó.

Las trazas tienen una virtud que las metáforas no tienen: son comprobables. Si una traza dice que `r0` cambió de 7 a 8 en cierto paso, no hay interpretación; o cambió o no cambió. Esa rigidez es lo que las hace útiles como herramienta de aprendizaje. Una persona que confunde dos clases de instrucción puede creer que las entendió hasta que la traza desmiente esa creencia con una fila concreta.

## El ISA de juguete y por qué no es x86 todavía

Para escribir trazas hace falta un repertorio de instrucciones. Como el nivel no quiere atarse a ninguna arquitectura real, va a usar un **ISA de juguete**: un conjunto pequeño de instrucciones nominales —`LOAD`, `STORE`, `MOV`, `ADD`, `SUB`, `JMP`, `JNZ`— sin sintaxis específica de x86, ARM o cualquier otra ISA real. Las instrucciones se nombran de manera deliberadamente genérica para que el modelo se pueda construir sin que el ruido de una sintaxis particular interfiera.

Esa elección no es por timidez. Hay una razón concreta: cuando `L7` introduzca x86-64 real, la persona va a llegar con el modelo conceptual ya estabilizado y va a necesitar aprender solamente la sintaxis específica, los registros con sus nombres reales y los detalles de la ISA. Si en `L1` se usara x86 directamente, la dificultad de la sintaxis se mezclaría con la dificultad del modelo, y cada error sería ambiguo: ¿se confundió la persona con el concepto o con el formato? El ISA de juguete saca esa ambigüedad de la ecuación.

Una nota técnica para que no haya malentendidos en sentido contrario: el ISA de juguete no es una simplificación de ningún ISA real concreto. No "se parece a x86" ni "se parece a RISC-V". Está diseñado solamente para que las trazas sean legibles. Cualquier intento de mapearlo término a término con una arquitectura real va a fracasar, y eso es deliberado.

## Lo que el nivel deliberadamente no toca

Algunos temas que la palabra "computadora" suele evocar quedan **fuera** de `L1`, no por accidente sino porque admitirlos ahora confundiría más que aclararía. La representación binaria precisa de instrucciones y datos —cómo un `ADD r0, 1` se codifica en bits, qué endianness usa cada arquitectura— se trabaja en `L2`. El pipeline de compilación —cómo un archivo `.c` se transforma en un binario ejecutable— se trabaja en `L3`. El assembly real con sintaxis de una ISA específica entra recién en `L7`. Los detalles físicos del procesador (caches, predicción de saltos, microarquitectura) quedan fuera del track o aparecen mucho más adelante. El sistema operativo como capa formal aparece desde `L20`.

Esta lista no es burocracia. Es la condición para que el nivel pueda hacer lo que promete: construir un modelo que después se refine, en vez de un modelo que mezcla todo y obliga a desaprender. Cada vez que en algún capítulo aparezca la tentación de ir más allá del modelo mínimo —*"¿pero cómo se hace esto realmente en x86?"*— la respuesta es una sola: en `L7`, no acá.

## Lo que queda instalado al terminar el nivel

Después de los siete capítulos, la persona que terminó `L1` debería ser capaz de tomar un programa de juguete, ejecutarlo mentalmente o sobre el simulador del nivel, escribir la traza completa, y describir cualquier paso intermedio en términos de qué pieza del estado consultó la instrucción y qué pieza del estado modificó. No es una lista larga, pero es lo que el resto del track va a tratar como base.

Lo que `L0` dejó firme fue el laboratorio. Lo que `L1` deja firme es el lenguaje para hablar de lo que pasa dentro de cualquier programa que el laboratorio compile. Con esas dos bases —laboratorio operativo y modelo mínimo— el nivel siguiente puede empezar a discutir qué significa exactamente que algo esté representado en bits, sin que esa discusión se confunda con preguntas sobre qué es la memoria o qué hace la CPU.
