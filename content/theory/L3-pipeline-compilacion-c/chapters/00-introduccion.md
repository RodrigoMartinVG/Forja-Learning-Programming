# Por qué este nivel existe

## Un comando que esconde un pipeline

En un terminal Linux con gcc instalado, compilar un programa C de un solo archivo se hace con un solo comando:

```
$ gcc hello.c -o hello
$ ./hello
hola, pipeline
```

Dos líneas y aparece un ejecutable funcionando. Visto así, "compilar" parece una operación atómica: se entrega un archivo `.c`, sale un programa. La realidad detrás del comando es bastante distinta. `gcc hello.c -o hello` no es una sola transformación: es una **secuencia de cuatro etapas**, cada una con su propio programa, su propio formato de entrada, su propio formato de salida y sus propios errores característicos. El comando único agrupa la cadena entera y borra los artefactos intermedios cuando termina, pero la cadena está ahí.

Mientras todo funcione, el pipeline puede ignorarse. El problema es que cuando algo falla —y la primera vez que falla suele ser pronto—, el mensaje de error no dice "el comando gcc tuvo un problema": dice algo específico de la etapa que falló. *"undefined reference to `printf`"*, *"error: too few arguments to function"*, *"shared library not found"*, *"fatal error: stdio.h: No such file or directory"*. Cuatro mensajes, cuatro etapas distintas, cuatro causas distintas, cuatro herramientas distintas para diagnosticar. Si las cuatro etapas se viven como una sola "compilación", el diagnóstico se vuelve adivinanza. Si están separadas, el mensaje localiza el problema directamente.

`L1` instaló el modelo de máquina —piezas, instrucciones, ejecución—. `L2` instaló las convenciones de representación —enteros, texto, endianness, floats—. Este nivel instala la cadena que **conecta** un archivo `.c` que escribe el programador con un binario ejecutable que el sistema operativo puede correr. La conexión no es directa: pasa por cuatro transformaciones y produce, en el camino, cinco artefactos materiales que se pueden inspeccionar uno por uno.

## Las cuatro etapas y los cinco artefactos

El pipeline de C tiene cuatro etapas sucesivas:

1. **Preprocesado**: maneja directivas como `#include`, `#define`, `#ifdef`. Es manipulación textual: pega archivos, reemplaza nombres por su definición, filtra líneas según condiciones. No entiende C.
2. **Compilación**: traduce el código C ya preprocesado a **assembly** específico de la arquitectura del procesador (en una máquina x86-64 común, assembly x86-64).
3. **Ensamblado**: traduce el assembly a **código objeto**, que es el assembly convertido a bytes binarios pero todavía con direcciones provisionales y referencias a símbolos sin resolver.
4. **Linking**: combina varios códigos objeto y bibliotecas, resuelve las referencias entre ellos, asigna direcciones definitivas, y emite un **ejecutable** (o una biblioteca).

Entre etapa y etapa hay un artefacto material —un archivo en disco con un formato específico—. El pipeline completo, con sus cinco artefactos:

```
hello.c   ──preprocesado──▶   hello.i   ──compilación──▶   hello.s
                                                              │
                                                          ensamblado
                                                              ▼
hello                ◀──────  linking  ───────                hello.o
(ejecutable)
```

- **`.c`**: código fuente. Lo escribe el programador.
- **`.i`**: código C preprocesado. Sigue siendo C válido, pero sin directivas: los `#include` ya pegaron sus headers, las macros ya están expandidas. Es texto plano, legible.
- **`.s`**: assembly. Texto que un humano puede leer en principio, aunque interpretarlo a fondo es trabajo de `L7`. En este nivel solo se reconoce su estructura.
- **`.o`**: código objeto. Archivo binario con secciones (`.text`, `.data`, etc.) y una tabla de símbolos. No se ejecuta directamente.
- **ejecutable**: archivo binario final. Lo carga el sistema operativo y lo corre como proceso.

Cada uno de los cinco se puede producir explícitamente, inspeccionar con herramientas, y comparar con el siguiente. El comando `gcc hello.c -o hello` produce los cinco internamente y borra los tres del medio cuando termina; pidiendo cada etapa por separado, los cinco quedan en disco.

## Inspeccionar entre etapas como método de trabajo

La habilidad central que el nivel busca instalar es **inspeccionar el artefacto producido por cada etapa**. Cada uno tiene su herramienta de inspección por defecto:

| Artefacto | Herramienta principal | Qué se ve |
|---|---|---|
| `.c` | un editor de texto, `cat` | código fuente C tal como se escribió |
| `.i` | un editor de texto, `wc -l`, `head`, `tail` | código C preprocesado, mucho más largo que el `.c` |
| `.s` | un editor de texto, `cat` | assembly específico de la arquitectura |
| `.o` | `file`, `nm`, `objdump -h`, `readelf` | secciones binarias y tabla de símbolos |
| ejecutable | `file`, `nm`, `ldd`, `objdump`, `readelf` | binario final con todas sus dependencias |

Las herramientas de inspección no son opcionales para este nivel: son la materialidad del trabajo. Diagnosticar un problema de pipeline sin inspeccionar artefactos es como debuggear un programa sin imprimir variables. La regla operativa que el nivel deja instalada es: cuando algo falla, el primer reflejo es **mirar el artefacto producido por la última etapa que sí completó** y verificar que es lo que se esperaba antes de seguir.

## Los errores típicos y la etapa donde nacen

Una primera muestra de errores y dónde se originan, anticipando el resto del nivel:

- **`fatal error: stdio.h: No such file or directory`**: error del **preprocesador** (etapa 1). El `#include <stdio.h>` no encontró el archivo. La causa es de búsqueda de headers, no de C.
- **`error: too few arguments to function 'foo'`**: error del **compilador** (etapa 2). Hay una llamada que no respeta la firma de la función. La causa es de C como lenguaje.
- **`undefined reference to 'foo'`**: error del **linker** (etapa 4). El compilador y el ensamblador no se quejaron porque `foo` estaba declarada; pero al combinar todos los `.o` no apareció ninguna definición. La causa es de organización del código en archivos, no del cuerpo de las funciones.
- **`error while loading shared libraries: libfoo.so.1: cannot open shared object file`**: error del **loader** del sistema operativo (no es etapa del pipeline, ocurre al ejecutar). El ejecutable se construyó bien pero su biblioteca dinámica no se encuentra al cargar.

Los cuatro mensajes parecen "cosas que rompen el build", pero solo el segundo es estrictamente del compilador. El primero es de búsqueda de archivos. El tercero ocurre después de que el compilador ya terminó. El cuarto ocurre después de que todo el build ya terminó. Confundirlos lleva a cambiar código C cuando el problema es una flag, o cambiar el Makefile cuando el problema es una variable de entorno. Separarlos es la habilidad práctica que `L3` busca instalar.

## El programa que va a usar el nivel entero

Para que la inspección sea concreta, el nivel trabaja sobre dos programas C reales que viven en el repositorio: [`src/hello/hello.c`](../src/hello/hello.c), un programa de un solo archivo que imprime un saludo, y [`src/split/`](../src/split/), un programa dividido en dos archivos `main.c` y `greet.c` con un header `greet.h`. El primero sirve para mirar las cuatro etapas con una sola unidad de compilación; el segundo, para abrir el linking de varios `.o`.

Los dos son intencionalmente minúsculos. El objetivo no es que los programas hagan algo interesante: es que sean lo suficientemente chicos como para que los `.i`, `.s` y `.o` que producen quepan en pantalla y puedan inspeccionarse de cabo a rabo. Cualquier programa más grande oculta lo que el nivel quiere mostrar.

Lo que `L3` deja por fuera es deliberado y se posterga a niveles posteriores. El contenido detallado del assembly generado pertenece a `L7`. La estructura interna del formato ELF —que es el que tienen los `.o` y los ejecutables en Linux— se abre en `L4`. La carga del proceso, el layout de memoria virtual y el dynamic linker en detalle aparecen en `L4` y `L9`. C como lenguaje —tipos, punteros, gestión manual de memoria— pertenece a `L8`, `L9` y siguientes. En este nivel C es la **superficie** sobre la cual se observa el pipeline; lo central es la cadena de transformaciones y los artefactos que produce.

A partir del próximo capítulo, los cinco artefactos pasan a ser entidades concretas con sus propios nombres, herramientas y errores. La pregunta operativa del nivel —*"si esto falla, ¿en qué etapa nació el problema?"*— va a ser la misma en cada paso.
