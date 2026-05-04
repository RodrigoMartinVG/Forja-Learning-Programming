# Código, datos y programa en ejecución

## Cuatro capas que es fácil colapsar

Los seis capítulos anteriores construyeron el modelo de máquina del nivel: cinco piezas, una taxonomía de instrucciones, un ciclo de ejecución abierto, un flujo legible. Lo que falta no es agregar más al modelo, sino ponerlo en perspectiva: mostrar dónde vive el modelo dentro del panorama más amplio que la palabra *programa* suele evocar. Esa palabra, en el uso corriente, junta cuatro cosas distintas que `L1` necesita separar antes de cerrar.

Cuando alguien dice "tengo un programa que hace X", puede estar refiriéndose a un archivo de texto que el programador edita, a una secuencia de instrucciones cargadas en memoria, a los datos que ese código manipula, o a un proceso en ejecución que la computadora está corriendo en este momento. Las cuatro acepciones son legítimas en distintos contextos, pero confundirlas produce una clase recurrente de errores conceptuales: por ejemplo, *"editamos el archivo y el programa que ya está corriendo no se enteró"*, o *"el ejecutable es lo mismo que el proceso"*, o *"el programa son los datos y el código junto"*. Este capítulo separa las cuatro capas y las pone en relación.

La promesa no es introducir nada radicalmente nuevo —cada capa ya estuvo presente, en formas dispersas, en los capítulos anteriores. La promesa es nombrarlas y articularlas, para que el resto del track pueda apoyarse en una distinción explícita.

## Source no es programa cargado

El **source** es el texto que el programador edita. Vive típicamente como un archivo en disco —`programa.c`, `main.rs`, `mish.py`, según el lenguaje— y su contenido son caracteres legibles para humanos: nombres de funciones, palabras clave del lenguaje, comentarios, espacios. El source no es ejecutable directamente por la CPU del modelo de `L1`. La CPU no entiende `if`, no entiende `function`, no entiende `printf`. La CPU entiende, en el modelo del nivel, instrucciones nominales (`LOAD`, `STORE`, `MOV`, `ADD`, `JNZ`); en sistemas reales, entiende patrones de bits que codifican instrucciones de una ISA particular.

Para que un source se vuelva ejecutable hay un paso de **traducción** que lo convierte en una secuencia de instrucciones. Ese paso es el pipeline de compilación, tema central de [`L3`](../../L3-pipeline-compilacion-c/). En `L1` basta con anotar que existe y producir resultados —un binario, típicamente un archivo `.o` o un ejecutable— que sí contienen instrucciones en el formato que la CPU espera. Pero ese resultado tampoco es "programa cargado" todavía: es un archivo en disco con instrucciones adentro. Hace falta otro paso para que esas instrucciones efectivamente entren a la memoria que la CPU va a leer.

La distancia entre el source y el código cargado tiene una consecuencia operativa concreta: editar el source no cambia nada de un programa que ya está ejecutándose. El código que se está ejecutando vive en memoria, y esa memoria fue poblada con la traducción de cierta versión del source en cierto momento. Si después del momento de carga el source se modifica, esos cambios viven en disco, en el archivo, y no tienen ningún efecto sobre el código que la memoria del proceso ya tiene cargado. Reflejarlo en el proceso requiere recompilar y volver a cargar —y aún así, el proceso original no se entera; lo que cambia es que un nuevo proceso, lanzado a partir de allí, va a leer una memoria distinta.

Esta clase de error —"edité el archivo y la cosa no cambió"— es una de las primeras experiencias de cualquier programador. La explicación no requiere magia: requiere reconocer que source y programa cargado son cosas distintas, separadas por un acto de traducción y un acto de carga, y que entre ellas hay tiempo y materia.

## Código y datos comparten memoria pero no rol

Una vez cargado, el código vive en memoria. El [capítulo 02](02-memoria.md) ya estableció que código y datos comparten el mismo modelo de memoria: posiciones direccionables con valores adentro. Lo que distingue a unos de otros no es la materia sino el **rol** que cumplen en la ejecución. El código está en posiciones que el `pc` recorre durante los fetch; los datos están en posiciones que las instrucciones nombran como operandos.

Esta distinción rol/interpretación, que en los capítulos previos se introdujo como propiedad de la memoria, tiene su versión en este nivel de capas: hay una capa de **código cargado** y una capa de **datos** que comparten el sustrato (la memoria del proceso) pero cumplen funciones distintas. La traza típica del nivel pone instrucciones en direcciones bajas (digamos 0 a 5) y datos en direcciones más altas (digamos 40, 50, etcétera). Esa separación visual no es estructural; es solamente una convención del nivel para que las trazas se lean fácilmente. En sistemas reales hay reglas más estrictas sobre qué regiones de memoria son ejecutables y cuáles no, pero esas reglas son políticas del sistema operativo y del hardware, y `L1` no las necesita.

Lo que importa fijar acá: código y datos viven en la misma memoria, su rol depende del uso, y por lo tanto sería conceptualmente posible —y a veces es operativamente posible— que un valor que estaba siendo tratado como dato pase a ser tratado como código, o viceversa. Esa posibilidad es la base mecánica de fenómenos que niveles posteriores van a abrir con cuidado: punteros a función (datos —direcciones— que terminan en el `pc` para dirigir el flujo), JIT compilation (un programa que escribe nuevas instrucciones en memoria y luego salta a ellas), exploits de buffer overflow (datos que sobrescriben código o direcciones de retorno).

## Proceso en ejecución como estado evolucionando

La cuarta capa es el **proceso en ejecución**. Un proceso es la conjunción de tres cosas: una memoria poblada con código y datos, un estado de CPU (registros y `pc`), y la actividad efectiva de aplicar el ciclo `fetch-decode-execute` paso a paso. Es lo que `L1` modela como una secuencia de estados separados por transiciones.

La distinción entre un proceso en ejecución y los archivos del disco que dieron origen a ese proceso es, una vez explicitada, intuitiva. Un archivo en disco no se ejecuta —un archivo es estático, está ahí. Para que algo se ejecute hace falta que ese archivo haya sido cargado en memoria por alguna entidad (el sistema operativo, en sistemas reales, tema que aparece en `L20`), que se haya inicializado un estado de CPU, y que el ciclo `fetch-decode-execute` esté efectivamente corriendo sobre ese estado. Eso es el proceso. Cuando se dice "el programa está corriendo", lo que está corriendo es esa actividad, no el archivo.

Una consecuencia directa: cuando un proceso termina —porque ejecutó hasta el fin, porque se le dio una orden de terminar, porque el sistema operativo lo mató—, lo que desaparece es la actividad y el estado. La memoria del proceso se libera. Los registros se reinicializan. El `pc` ya no tiene sentido para ese proceso. Pero el archivo en disco que originó el proceso sigue ahí, intacto. Esa asimetría —el proceso es efímero, el archivo es persistente— es la base de la diferencia entre un programa "instalado" y un programa "ejecutándose". Las dos cosas usan la palabra "programa" pero no son lo mismo.

## Por qué este modelo explica errores que vendrán después

La utilidad de separar las cuatro capas se va a ver con regularidad en niveles posteriores. Algunos errores típicos, anticipados acá:

*"Cambié el código y el programa sigue haciendo lo mismo."* Casi siempre, lo que pasó es que el source se modificó pero el ejecutable no se regeneró, o el ejecutable se regeneró pero el proceso se está corriendo con la versión anterior cargada. Source ≠ código cargado.

*"El proceso terminó pero los datos siguen ahí."* Si los datos viven en disco (un archivo, una base de datos), eso es esperable y no tiene nada de raro: la persistencia de archivos no depende de que un proceso siga vivo. Si los datos viven sólo en la memoria del proceso, tienen que haber desaparecido cuando el proceso terminó. Si parecen seguir, alguien los persistió, o todavía hay un proceso vivo que la persona no estaba viendo. Memoria del proceso ≠ datos persistentes.

*"Tengo dos procesos del mismo programa y uno cambió, el otro no."* Por supuesto: cada proceso tiene su propia memoria; aunque hayan sido lanzados desde el mismo archivo, sus estados evolucionan independientemente. Archivo ≠ proceso, y dos procesos del mismo archivo no son el mismo proceso.

*"Mi programa modificó su propio código."* Conceptualmente posible —código y datos comparten memoria—, operativamente sujeto a fuertes restricciones en sistemas reales que `L1` no profundiza. Pero la posibilidad existe en el modelo, y eso ya basta para que el fenómeno no resulte mágico cuando aparezca.

Cada uno de estos errores se vuelve discutible —se puede formular, comprobar, corregir— una vez que las cuatro capas están separadas. Con todas colapsadas en una sola palabra "programa", los errores se viven como confusiones imposibles de articular.

## El nombre del modelo: arquitectura de Von Neumann

Las siete piezas que `L1` viene tratando como evidentes —memoria única direccionable, CPU con registros, `pc` que recorre la memoria, ciclo `fetch-decode-execute`, código y datos compartiendo el mismo sustrato— no son una invención del nivel. Son la descripción estándar de la **arquitectura de Von Neumann**, propuesta en 1945 en un reporte técnico que John von Neumann firmó (y que en realidad sintetizó trabajo colectivo del grupo del proyecto EDVAC). El reporte fijó, por primera vez en forma articulada, la idea que `L1` viene asumiendo: una computadora consiste en una CPU que lee instrucciones de una memoria única donde también viven los datos, y las aplica una por una siguiendo un ciclo regular.

Que el modelo tenga un nombre y una fecha tiene una consecuencia práctica: lo que se aprendió en `L1` no es propiedad del ISA de juguete del nivel ni del simulador. Es el esqueleto compartido por casi todas las computadoras reales que existen —desde la laptop con la que uno lee este texto hasta los servidores de datacenter, pasando por teléfonos, microcontroladores y placas embebidas. Cuando `L7` introduzca x86-64 real, las piezas van a tener nombres distintos (`rax`, `rip`, `mov`, `jmp`...) pero la estructura va a ser la misma: una memoria, una CPU con registros, un program counter, un ciclo de tres subpasos.

Una nota sobre el contraste con la **arquitectura de Harvard**, que aparece a veces como alternativa histórica. En Harvard, código y datos viven en memorias *fisicamente separadas*, con buses distintos. La CPU lee instrucciones por un canal y datos por otro. La consecuencia es que un programa Harvard estricto no puede modificar su propio código en tiempo de ejecución —la memoria de instrucciones no es escribible desde el código. Esto se usa, típicamente, en microcontroladores donde el código vive en flash y los datos en RAM. La mayoría de las computadoras de propósito general son Von Neumann (memoria única), aunque con jerarquías de cache que internamente separan código y datos por motivos de performance. Para `L1`, el modelo es Von Neumann puro; el matiz Harvard se menciona sólo para que el nombre tenga contraste y no aparezca más adelante como descubrimiento desorientador.

## Por qué este ISA mínimo alcanza, y qué le falta

Una pregunta razonable al cierre del nivel: si el repertorio del ISA de juguete tiene apenas siete instrucciones (`MOV`, `LOAD`, `STORE`, `ADD`, `SUB`, `JMP`, `JNZ`), ¿realmente alcanza para algo más que los ejemplos del simulador? La respuesta corta es sí: con memoria suficientemente grande, ese repertorio mínimo es **Turing-completo**, lo que significa, informalmente, que cualquier cómputo que se pueda hacer en cualquier lenguaje de programación puede traducirse, en principio, a una secuencia de esas siete instrucciones operando sobre esa memoria.

El argumento intuitivo no requiere maquinaria formal. Con `LOAD` y `STORE` sobre memoria arbitrariamente grande, se puede simular cualquier estructura de datos: arreglos, listas, árboles, lo que sea. Con `ADD` y `SUB`, se puede construir cualquier operación aritmética más compleja por composición (multiplicación por sumas repetidas, división por restas repetidas, comparaciones por restas y verificación de cero, etcétera). Con `JNZ` se puede expresar cualquier condicional y cualquier loop, y por lo tanto cualquier estructura de control. La Turing-completitud no requiere más que esos tres ingredientes —lectura/escritura en memoria ilimitada, aritmética básica, salto condicional— y este ISA los tiene todos.

La consecuencia teórica es importante: nada de lo que un programa real puede hacer requiere instrucciones que el nivel no haya visto. Compiladores, sistemas operativos, navegadores web, modelos de machine learning —todos, en última instancia, son secuencias de instrucciones de un ISA real ejecutándose sobre memoria, y en principio cualquiera de esas computaciones podría traducirse al ISA del nivel y producir el mismo resultado. Más lento, más verboso, pero el mismo resultado.

La palabra clave de ese párrafo es *en principio*. Lo que el ISA mínimo no provee es **conveniencia**: cada cosa que falta es algo que se puede simular sobre el repertorio básico, pero a un costo de programación y rendimiento que vuelve la simulación impracticable. Esa lista de carencias es, leída al revés, exactamente la lista de cosas que los niveles posteriores van a introducir como herramientas:

- **Multiplicación y división directas, operaciones de bits, comparaciones**: simulables con `ADD`/`SUB`/`JNZ` pero costosas. Aparecen en los ISAs reales de [`L7`](../../L7-alfabetizacion-assembly/) como instrucciones primitivas.
- **Llamadas a funciones y stack**: el ISA del nivel no tiene `CALL`/`RET`. Los programas no pueden estructurarse en subrutinas reutilizables sin convenciones explícitas. Esto es justamente lo que las *calling conventions* de `L7` y `L9` van a introducir como tema central.
- **Tipos de datos más ricos que un entero por celda**: el ISA trata cada posición de memoria como un entero genérico. Floats, strings, structs, arreglos multidimensionales son convenciones que `L2` (representación) y `L9` (punteros y memoria) van a desarrollar.
- **Entrada/salida**: el ISA no puede leer del teclado ni imprimir en pantalla. Los programas del nivel viven en un mundo cerrado, definido por su estado inicial. La I/O aparece como tema en `L20` (sistemas operativos) y antes, de manera más informal, cuando los lenguajes de alto nivel introducen `print` y `scanf`.
- **Interrupciones, modo privilegiado, memoria virtual, concurrencia**: todo el aparato que un sistema operativo necesita para correr varios programas a la vez en una sola máquina, tema central de `L20` y siguientes.
- **Tamaño fijo de memoria del simulador**: el simulador de `L1` tiene una grilla finita. La Turing-completitud, formalmente, requiere memoria *ilimitada*. El ISA en sí no impone límite; el simulador sí lo hace por practicidad. Cualquier ISA real también tiene límites prácticos, aunque mucho más grandes.

Esta lista no es una crítica al ISA del nivel: es una hoja de ruta. Cada cosa que falta es un nivel posterior, y cada nivel posterior se entiende mejor cuando uno reconoce qué problema viene a resolver. La pregunta guía al pasar a `L2` y `L3` no es *¿cuáles son las próximas instrucciones?*, sino *¿qué conveniencias agregan los niveles siguientes sobre lo que ya alcanzaba?*.

## Lo que `L2`, `L3` y `L7` van a volver más concreto

El modelo de cuatro capas que cierra este capítulo es deliberadamente abstracto. No dice cómo exactamente un source `.c` se traduce a instrucciones, no dice cómo exactamente las instrucciones se cargan en memoria, no dice cómo exactamente el sistema operativo arma un proceso. Esas concreciones aparecen en niveles siguientes y no entran en `L1`.

[`L2`](../../L2-representacion-informacion/) abre la representación binaria, cómo las instrucciones se codifican como patrones de bits, cómo los datos se representan, qué convenciones rigen la lectura. Profundiza la distinción rol/interpretación con detalle: el mismo patrón de bits puede leerse como entero, como caracter, como instrucción, según la convención que el contexto imponga.

[`L3`](../../L3-pipeline-compilacion-c/) abre el pipeline de compilación: cómo un archivo `.c` se transforma en un ejecutable a través de una serie de pasos (preprocesador, compilador, ensamblador, linker). Hace concreto el paso de traducción que este capítulo dejó como caja negra.

[`L7`](../../L7-alfabetizacion-assembly/) reemplaza el ISA de juguete por x86-64 real. Las cuatro clases de instrucciones del [capítulo 04](04-instrucciones-operandos.md) reaparecen con sintaxis y registros reales. El ciclo `fetch-decode-execute` sigue siendo el mismo, pero los detalles —qué bits codifican qué, qué registros existen y cómo se llaman— se vuelven concretos.

`L20` y siguientes abren el sistema operativo como capa formal: qué hace exactamente cuando carga un proceso, cómo gestiona la memoria, cómo coordina varios procesos, cómo provee servicios.

Lo que `L1` deja firme, después de los siete capítulos, es lo que ninguno de esos niveles posteriores va a tener que reconstruir: el modelo mínimo de máquina, el lenguaje del estado, la traza como herramienta, la distinción entre fluir secuencialmente y saltar, la diferencia entre code, datos, source y proceso. Sobre esa base, el resto del track tiene material para apoyarse sin tener que volver atrás.
