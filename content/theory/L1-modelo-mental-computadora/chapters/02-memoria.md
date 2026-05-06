# Memoria como espacio direccionable

## Direcciones como nombres de posiciones

El [capítulo anterior](01-maquina-de-estado.md) usó la palabra "memoria" sin abrirla mucho: una secuencia de posiciones, cada una identificada por una dirección, cada una con un valor. La traza de cierre mostró una memoria pequeña con cuatro instrucciones y un dato, y todo funcionó porque la idea de "dirección 40" se aceptó sin discusión. Pero esa aceptación fácil esconde una confusión que después se vuelve costosa: la confusión entre dirección y contenido.

Empezar por algo concreto. Una memoria, en el modelo de `L1`, se ve así:

| dirección | contenido |
| --------- | --------- |
| 0  | 12 |
| 1  | 45 |
| 2  | 8  |
| 3  | 0  |
| 4  | 200 |
| 5  | 33 |

Seis filas, dos columnas. La columna *dirección* contiene los nombres de las posiciones; la columna *contenido* contiene lo que hay almacenado en cada una. Esto es la memoria entera, en este modelo. No hay capas, no hay celdas físicas, no hay distinción entre RAM y disco. Hay una secuencia de posiciones nombradas con direcciones, y cada posición tiene un valor.

La idea central, que va a ser repetida varias veces a lo largo del capítulo: **una dirección es un nombre, no un valor especial**. La dirección 4 es el nombre de una posición específica. El número 4, escrito en cualquier otro contexto, no es esa posición; es el número 4, sin más. Que las direcciones suelan escribirse como números enteros es una convención de notación, no una propiedad mística. Podrían tener nombres arbitrarios y el modelo seguiría funcionando.

## Contenido y dirección no son la misma cosa

Volviendo a la tabla anterior: la dirección 4 contiene el valor 200. Eso significa, leído despacio, que en la posición de memoria llamada *cuatro* hay almacenado el valor *doscientos*. La dirección y el contenido son cosas distintas. Se hablan de manera distinta. Se manipulan con operaciones distintas.

La distancia entre las dos puede ilustrarse con una pregunta: *"¿qué hay en la dirección 4?"*. La respuesta correcta es *"el valor 200"*. La respuesta incorrecta —pero recurrente— es *"el valor 4"*. Confundir el nombre con el contenido es un error que parece ridículo escrito así, pero que aparece con regularidad cuando los valores y las direcciones empiezan a parecerse, especialmente en programas donde una dirección se almacena como contenido de otra dirección. Esa configuración, central para los punteros del [nivel 9](../../L9-punteros), depende absolutamente de mantener firme la distinción.

Un caso particular vale la pena traer acá. Considerar:

| dirección | contenido |
| --------- | --------- |
| 40 | 40 |

La dirección 40 contiene el valor 40. ¿Hay algo raro? No. La dirección y el contenido son cosas distintas que casualmente se escriben con el mismo símbolo. Eso pasa todo el tiempo en computadoras reales y no genera ninguna ambigüedad si la distinción está firme. Si en una traza aparece *"`LOAD r0, [40]`"*, esa instrucción dice: "cargar en `r0` el contenido de la posición cuyo nombre es 40". El primer 40 es una dirección. Lo que se carga es el valor 40 (el contenido). Después del `LOAD`, el registro `r0` vale 40 —porque el contenido era 40, no porque la dirección era 40.

Esta clase de coincidencias visuales son uno de los lugares donde la lectura de trazas requiere atención. Casi todos los ejercicios del nivel van a poner alguna posición de memoria en condiciones donde dirección y contenido se pueden confundir, para que la distinción se afirme con la práctica.

## Lectura y escritura como operaciones distintas

Sobre cualquier posición de memoria se pueden hacer dos cosas: **leer** su contenido o **escribir** un nuevo contenido. Las dos operaciones son distintas no sólo por el resultado sino por su efecto sobre el estado.

Una **lectura** consulta el contenido sin modificarlo. Después de una lectura, la posición de memoria sigue valiendo lo que valía antes. Lo que cambia es algún otro lugar del estado —típicamente un registro— donde el valor leído queda copiado. La instrucción `LOAD r0, [40]` es una lectura: copia el contenido de la posición 40 en `r0`, sin modificar la posición 40.

Una **escritura** modifica el contenido. Después de una escritura, la posición de memoria vale algo nuevo, y ese valor reemplaza al anterior, que se pierde. La instrucción `STORE r0, [40]` es una escritura: el contenido de `r0` se copia en la posición 40, y lo que estaba antes en la posición 40 deja de estar.

La asimetría es importante. Una lectura es no destructiva, una escritura sí lo es. Si en una traza aparece un `STORE` sobre una posición y, varios pasos después, otra instrucción intenta leer el valor anterior de esa posición, no lo va a encontrar; la escritura lo borró. Este punto va a volverse central cuando aparezcan stack frames y memoria dinámica, pero la base se instala acá.

Una observación menor, útil de tener desde ya: el `pc` es un caso especial. La CPU lo lee implícitamente al inicio de cada paso (para saber qué instrucción ejecutar) y lo escribe implícitamente al final (para señalar la próxima). Esa operación implícita es lo que el [capítulo 05](05-fetch-decode-execute.md) va a abrir bajo el ciclo `fetch-decode-execute`. Por ahora alcanza con anotar que el `pc` también es una pieza de estado que se lee y se escribe, sólo que el agente que lo manipula no es siempre una instrucción explícita.

## Memoria como soporte de instrucciones y de datos

La traza del [capítulo 01](01-maquina-de-estado.md) puso instrucciones en las direcciones 0–2 y un dato en la dirección 40. La memoria entera era la misma; lo que cambiaba era el rol de cada posición en la ejecución. La distinción rol/interpretación, central del nivel, vive justo acá.

Un ejemplo lo hace explícito. Considerar la siguiente memoria:

| dirección | contenido |
| --------- | --------- |
| 0 | `LOAD r0, [40]` |
| 1 | `STORE r0, [50]` |
| 2 | `(fin)` |
| ... | ... |
| 40 | 99 |
| 50 | 0 |

Las posiciones 0 y 1 contienen instrucciones. La posición 40 contiene un dato (un valor que las instrucciones van a manipular). La posición 50 contiene otro dato (un destino donde una instrucción va a escribir). La memoria es una sola; el rol de cada posición se decide por cómo la usa la ejecución.

Imaginar ahora una variante donde, después de ejecutar las dos instrucciones, alguien (otra instrucción que no aparece en este fragmento) escribe el valor `LOAD r1, [40]` —es decir, el patrón de bits que codificaría esa instrucción— en la posición 50. Y supongamos que después el `pc` llega a apuntar a la posición 50. En ese momento, lo que hasta entonces era un "dato" en la posición 50 se va a leer como una instrucción y se va a ejecutar. La materia no cambió; el rol cambió porque cambió cómo la ejecución la usa.

Este escenario no es teórico. Es la base mecánica de los punteros a función, las técnicas de JIT compilation que aparecen en niveles muy avanzados, y también, en el lado oscuro, de una clase entera de exploits. `L1` no entra en ninguno de esos temas, pero deja la base preparada para que cuando aparezcan no requieran reconstruir el modelo.

## Lo que el nivel todavía no asume sobre memoria

Para que el alcance del modelo quede claro y no se sobre-interprete, vale la pena ser explícito sobre qué propiedades de la memoria real `L1` deliberadamente no asume.

`L1` no asume tamaños concretos. Las direcciones son nombres; cuántos bits ocupa una dirección o un contenido no se discute hasta `L2`. Las posiciones tienen un valor y eso alcanza para escribir trazas. Cuando el [nivel 2](../../L2-representacion-informacion/) abra la representación binaria, esa indefinición se va a resolver con bytes y bits.

`L1` no asume jerarquía. No hay caches, no hay distinción entre memoria rápida y lenta, no hay localidad. Toda la memoria se accede igual. Las jerarquías reales de memoria existen y son centrales para la performance —tema que aparece mucho más adelante—, pero traerlas acá rompería el modelo mínimo sin compensar con claridad.

`L1` no asume protección. No hay regiones prohibidas, no hay distinción entre memoria del proceso y memoria del sistema operativo, no hay segfaults. El modelo es plano. La protección de memoria entra desde el `L20` cuando aparezcan procesos como entidades del sistema operativo.

`L1` no asume persistencia. La memoria es volátil en el sentido de que el modelo no dice qué pasa con su contenido cuando la ejecución termina. La distinción entre memoria volátil y almacenamiento persistente entra mucho más adelante.

Estas indefiniciones no son lagunas: son lo que permite que el modelo sea simple y verdadero al mismo tiempo. Lo que `L1` afirma sobre memoria es cierto en cualquier sistema real (toda memoria real se direcciona, todo contenido real se lee y se escribe, todo programa real comparte memoria con sus datos). Lo que omite es lo que cambia entre sistemas, y por lo tanto no se puede afirmar a este nivel sin atarse a un sistema particular.

Con la memoria abierta como espacio direccionable, queda preparada la pregunta del próximo capítulo: si las instrucciones y los datos están todos en memoria, ¿qué hace exactamente la CPU cuando ejecuta un paso, y qué papel juegan los registros que aparecieron sin explicación en las trazas hasta acá?
