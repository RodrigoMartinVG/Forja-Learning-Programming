# Preprocesado

## `#include` como inserción textual

La primera etapa del pipeline es el **preprocesador**. Su trabajo es procesar las directivas que empiezan con `#` —`#include`, `#define`, `#ifdef`, `#endif`, etc.— y producir un archivo que ya no las tiene. Lo que sale es **C válido sin directivas**, listo para que el compilador propiamente dicho lo lea.

La directiva más común es `#include`. La regla operativa es elemental: cuando el preprocesador encuentra un `#include "archivo.h"` o `#include <archivo.h>`, **busca el archivo correspondiente y lo pega en su lugar**. No "importa" en el sentido de los lenguajes modernos —no hay namespaces, no hay control de visibilidad, no hay análisis—: es pegado de texto. El archivo incluido reemplaza la línea con el `#include`, y lo que estaba antes y después queda como estaba.

Para [`src/hello/hello.c`](../src/hello/hello.c):

```c
#include <stdio.h>

#define GREETING "hola, pipeline"

int main(void) {
    puts(GREETING);
    return 0;
}
```

Ocho líneas. Después del preprocesado, ese mismo programa pasa a ser:

```
$ gcc -E hello.c -o hello.i
$ wc -l hello.i
743 hello.i
```

Casi 100 veces más largo. La razón es que `<stdio.h>` no es un archivo chico: declara cientos de funciones, estructuras y constantes. Y `<stdio.h>` a su vez incluye otros headers, que incluyen otros, en un árbol que se expande recursivamente. El preprocesador sigue el árbol y pega todo.

Mirando las primeras y últimas líneas de `hello.i`:

```
$ head -5 hello.i
# 0 "hello.c"
# 0 "<built-in>"
# 0 "<command-line>"
# 31 "/usr/include/stdc-predef.h" 1 3 4
# 32 "/usr/include/stdc-predef.h" 3 4
$ tail -10 hello.i
# 2 "hello.c" 2

# 3 "hello.c"

int main(void) {
    puts("hola, pipeline");
    return 0;
}
```

Tres cosas notables:

- Las líneas que empiezan con `#` y un número son **marcas de origen** que el preprocesador inserta para que el compilador, si encuentra un error, pueda reportarlo apuntando al archivo y a la línea original. No son directivas: son metadatos.
- La declaración de `puts` aparece en algún punto del medio del archivo, traída por `<stdio.h>`. Sin esa declaración, el compilador no sabría que `puts` existe ni qué firma tiene.
- En el `main` final, `GREETING` ya no aparece: fue **reemplazado** por la cadena `"hola, pipeline"`. Eso es el otro trabajo del preprocesador, las macros.

## Macros como reemplazo textual

La directiva `#define` define una **macro**: una asociación entre un nombre y un texto. Cuando el preprocesador encuentra el nombre, lo reemplaza por el texto. Igual que `#include`, es manipulación textual sin entender C.

En `hello.c`:

```c
#define GREETING "hola, pipeline"
```

El nombre `GREETING` queda asociado al texto `"hola, pipeline"`. Después del preprocesado, cualquier aparición de `GREETING` en el resto del archivo es reemplazada por la cadena. La macro **desaparece** del `.i`: solo queda el resultado del reemplazo. Esto explica por qué el `tail` del `.i` mostraba `puts("hola, pipeline")` directamente y no `puts(GREETING)`.

Las macros pueden tomar argumentos:

```c
#define MAX(a, b) ((a) > (b) ? (a) : (b))
```

Cuando aparece `MAX(x+1, y)`, el preprocesador reemplaza por `((x+1) > (y) ? (x+1) : (y))`. Los argumentos se sustituyen textualmente en el cuerpo. Lo importante es que **no hay verificación de tipos ni evaluación**: el preprocesador no entiende qué son `x` o `y`, solo pega texto. Por eso los paréntesis externos e internos son obligatorios en macros bien escritas: sin ellos, una expresión mayor con la macro adentro puede asociar los operadores de manera no deseada.

Una macro mal hecha:

```c
#define SQUARE(x) x*x
```

Si se invoca como `SQUARE(2+3)`, el preprocesador reemplaza por `2+3*2+3` = 11, no `25`. La causa es que la macro no es una función: no evalúa `2+3` antes de pasar el resultado, sino que pega el texto `2+3` en el lugar de cada `x`. Bugs como este no se detectan en preprocesado: aparecen en compilación o en ejecución como valores raros, y el diagnóstico requiere mirar el `.i` para ver el reemplazo expandido.

## Compilación condicional

La tercera función del preprocesador es **compilación condicional**: incluir o excluir bloques de código según condiciones evaluadas en preprocesado. Las directivas son `#if`, `#ifdef`, `#ifndef`, `#else`, `#elif`, `#endif`.

```c
#ifdef DEBUG
    fprintf(stderr, "debug: x = %d\n", x);
#endif
```

Si la macro `DEBUG` está definida —porque hay un `#define DEBUG` en algún lado, o porque la flag de compilación incluye `-DDEBUG`—, el bloque entre `#ifdef` y `#endif` queda en el `.i`; si no, **desaparece sin dejar rastro**. El compilador nunca ve el código eliminado, así que no lo verifica ni lo compila.

Esta capacidad explica por qué un mismo `.c` puede producir `.i` distintos según las flags. Un caso clásico:

```c
#ifndef GREET_H
#define GREET_H

const char *greet(void);

#endif
```

Esa estructura, llamada **header guard**, aparece en [`src/split/greet.h`](../src/split/greet.h). La primera vez que el preprocesador procesa el header, `GREET_H` no está definido, así que el contenido entre `#ifndef` y `#endif` se incluye y se define `GREET_H`. La segunda vez —si el mismo header se incluye dos veces, directa o indirectamente—, `GREET_H` ya existe, así que el bloque entero se omite. El header guard previene declaraciones duplicadas que romperían la compilación.

Sin header guards, un `.c` que incluye dos headers que a su vez incluyen un tercero ve ese tercero declarado dos veces, y el compilador (etapa siguiente) reporta error. La prevención es responsabilidad del preprocesador y se hace por convención.

## El `.i` como C sin directivas

Un dato importante sobre el `.i`: es **C válido**. Si se renombra a `.c` y se le pasa al compilador, compila igual:

```
$ gcc -E hello.c -o hello.i
$ gcc hello.i -o hello_from_i
$ ./hello_from_i
hola, pipeline
```

El compilador no nota la diferencia: lo que recibe es C sin `#include`, sin `#define`, sin `#ifdef`, ya con todos los reemplazos hechos y todos los headers pegados. Las marcas de origen que insertó el preprocesador (`# 32 "stdio.h" 3 4`) las usa el compilador para los mensajes de error pero no afectan al programa generado.

Esto da una herramienta práctica de diagnóstico: cuando un error reporta una línea que en el `.c` parece imposible —por ejemplo, "redefinition of struct foo" en una línea donde el `.c` no tiene ningún struct—, mirar el `.i` muestra qué fue lo que el compilador realmente vio. La mayoría de los errores extraños del compilador son consecuencias del preprocesado, no del código que el programador escribió.

## Errores que nacen acá y se ven más adelante

Tres patrones típicos donde el problema nace en preprocesado pero se manifiesta en otro lado:

- **Header no encontrado**. Mensaje: `fatal error: foo.h: No such file or directory`. Es del preprocesador, etapa 1. La causa es que el archivo `foo.h` no existe en ninguno de los directorios de búsqueda. Las flags `-I directorio` agregan paths a la búsqueda. La solución no está en el código C: está en cómo se invoca a gcc.
- **Macro mal definida**. Una macro como `SQUARE(x) x*x` produce código que compila pero da resultados incorrectos en algunos casos. El compilador no detecta el problema porque desde su perspectiva el código está bien escrito —ya pasó por preprocesado—. La diagnóstico requiere mirar el `.i` para ver el reemplazo expandido.
- **Definiciones duplicadas por falta de header guard**. Un `.c` incluye dos headers que internamente incluyen un tercero. El tercero, sin header guard, se pega dos veces. El compilador ve dos definiciones de la misma estructura y reporta error. El error parece de C, pero el origen es de preprocesado.

La regla operativa que el capítulo deja instalada: cuando el mensaje del compilador no encaja con lo que el `.c` parece decir, **mirar el `.i`**. Es el artefacto que muestra exactamente qué texto recibió el compilador. La mayoría de las veces, lo que ahí aparece explica el error directamente.
