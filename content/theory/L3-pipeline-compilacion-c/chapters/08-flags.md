# Flags del compilador como modificadores observables

## Flag como modificación observable de un artefacto

Las flags de gcc se copian de tutoriales y Makefiles ajenos sin saber qué hacen, y eso vuelve cualquier comportamiento inesperado del build una caja negra. La clave para sacar la magia: cada flag **modifica algo observable** en uno o más de los cinco artefactos del pipeline. Si la flag no produce un cambio observable, no sirve. Si lo produce, ese cambio es lo que define qué hace.

La consigna operativa es: para entender una flag desconocida, **compilar el mismo programa con y sin la flag**, comparar los artefactos resultantes, y describir la diferencia en términos concretos. Esa es la única manera fiable de saber qué hace una flag, sin depender del manual o de explicaciones de internet.

Las clases de flags que importan en este nivel son cinco:

1. **Control de etapa**: `-E`, `-S`, `-c`. Ya tratadas en capítulos anteriores. Detienen el pipeline en cierta etapa.
2. **Nivel de optimización**: `-O0`, `-O1`, `-O2`, `-O3`. Cambian el `.s` y todo lo que viene después.
3. **Información de debug**: `-g`. Agrega metadata al `.o` y al ejecutable.
4. **Warnings**: `-Wall`, `-Wextra`, `-Werror`. Cambian qué reporta el compilador, no el artefacto.
5. **Búsqueda de headers y bibliotecas**: `-I`, `-L`, `-l`. Cambian cómo el preprocesador y el linker encuentran archivos.

## Niveles de optimización y su efecto en el `.s`

La flag de optimización es el factor más visible que distingue dos compilaciones del mismo `.c`. `-O0` produce código directo y verboso, ideal para debugging porque cada línea de C se traduce a instrucciones identificables. `-O2` produce código más rápido pero que reorganiza, elimina, fusiona y especializa instrucciones de manera que el assembly resultante puede no parecer tener relación obvia con el C original.

Una comparación sobre `hello.c` (de `src/hello/`):

```text
$ gcc -S -O0 hello.c -o hello-O0.s
$ gcc -S -O2 hello.c -o hello-O2.s
$ wc -l hello-O0.s hello-O2.s
  37 hello-O0.s
  31 hello-O2.s
```

Para programas más complejos —con loops, condiciones, llamadas a funciones internas— la diferencia se vuelve dramática:

| Característica | `-O0` | `-O2` |
|---|---|---|
| Tamaño del `.s` | grande | chico |
| Cantidad de instrucciones | alta | baja |
| Funciones inlineadas | ninguna | muchas |
| Variables en stack | todas | pocas (las demás en registros) |
| Loops desenrollados | nunca | a veces |
| Cálculos eliminados | ninguno | los que el compilador prueba que son innecesarios |

Una consecuencia importante: el ejecutable producido con `-O2` se ejecuta más rápido pero es **más difícil de debuggear**. Las variables del C pueden no existir en el ejecutable como tales —el compilador las eliminó o las puso en registros que cambian rápido—, y el debugger no puede mostrarlas. Para desarrollo se usa `-O0`; para releases se usa `-O2`.

Un caso particular: en programas con código que tiene **undefined behavior** (UB), como una lectura fuera de array o un overflow con signo no protegido, `-O0` y `-O2` pueden producir comportamientos distintos. El compilador asume que el UB no ocurre y aprovecha esa asunción para optimizar. Si el UB sí ocurre, el programa puede comportarse "razonablemente" con `-O0` y "absurdamente" con `-O2`, no porque `-O2` esté mal sino porque la asunción que el optimizador hizo dejó de valer. El UB es contenido detallado de `L11`, pero su existencia explica por qué un bug "que no aparece con `-O0`" puede aparecer con `-O2`: el bug siempre estuvo, lo que cambió es cómo se manifestó.

## Información de debug y su efecto en el `.o` y el ejecutable

La flag `-g` le dice a gcc que agregue **información de debug** al `.o` y al ejecutable resultante. Esa información permite que un debugger (`gdb`, `lldb`) muestre el código fuente original mientras el programa se ejecuta paso a paso, asocie variables del C con sus posiciones en registros o memoria, y resuelva backtraces en términos de funciones y líneas.

Sin `-g`:

```text
$ gcc -c hello.c -o hello-no-debug.o
$ ls -l hello-no-debug.o
-rw-r--r-- 1 user user 1664 ... hello-no-debug.o
```

Con `-g`:

```text
$ gcc -c -g hello.c -o hello-debug.o
$ ls -l hello-debug.o
-rw-r--r-- 1 user user 4504 ... hello-debug.o
```

El `.o` con `-g` es aproximadamente tres veces más grande para un programa trivial. La información extra vive en secciones específicas (`.debug_info`, `.debug_line`, `.debug_str`, etc.) y se puede listar:

```text
$ objdump -h hello-debug.o | grep debug
  4 .debug_info   ...
  5 .debug_abbrev ...
  6 .debug_line   ...
  7 .debug_str    ...
```

`-g` **no afecta el código generado**: el `.text` con y sin `-g` es idéntico (con la misma `-O`). Solo agrega metadata aparte. Por eso `-g` no hace que el programa sea más lento ni más rápido; solo lo hace más grande.

Una pregunta legítima es por qué no usar `-g` siempre. Las razones típicas: el binario crece (en programas grandes, mucho), la información de debug puede revelar nombres de funciones internas y variables que no se quieren publicar, y en distribución el debug normalmente se separa del binario (con `objcopy --only-keep-debug` y `strip`). Para desarrollo, `-g` es el default razonable; para release, depende de la política de la organización.

## Warnings como filtro temprano

La flag `-Wall` activa una colección de warnings que el compilador emite cuando detecta patrones sospechosos en el código C. No son errores —el compilador sigue produciendo el `.o`—, pero son señales de problemas potenciales que típicamente preceden bugs si se ignoran.

Una compilación de un programa con un bug típico:

```c
// bad.c
int main(void) {
    int x;
    return x;
}
```

Sin `-Wall`:

```text
$ gcc -c bad.c -o bad.o
$
```

Compilación silenciosa. Con `-Wall`:

```text
$ gcc -Wall -c bad.c -o bad.o
bad.c: In function 'main':
bad.c:3:12: warning: 'x' is used uninitialized [-Wuninitialized]
    3 |     return x;
      |            ^
```

El warning identifica el problema —`x` se usa sin inicializar— y cita la línea exacta. El bug existe en los dos casos; con `-Wall` se ve, sin `-Wall` se queda escondido hasta que el programa se ejecute (y devuelva un valor cualquiera, lo que estuviera en stack en ese momento).

Las flags de warnings más usadas:

- `-Wall`: la colección "razonable" (que el nombre sugiere "all" pero no lo es: hay warnings más estrictos que no se incluyen).
- `-Wextra`: warnings adicionales que `-Wall` no incluye, algunos un poco ruidosos.
- `-Werror`: convierte cualquier warning en error. Útil para CI: cualquier código con warnings rompe el build.
- `-Wpedantic`: warnings sobre uso no estrictamente estándar de C.

La regla operativa: empezar con `-Wall -Wextra` y, si el proyecto puede tolerarlo, agregar `-Werror`. Es mucho más fácil arreglar 50 warnings cuando aparecen que arreglar 50 bugs en producción.

## Búsqueda de headers y bibliotecas

Las flags `-I`, `-L`, `-l` controlan dónde el compilador y el linker buscan archivos.

- **`-I directorio`**: agrega `directorio` a la lista de paths donde el preprocesador busca headers. Cuando se encuentra un `#include "foo.h"` o `#include <foo.h>`, el preprocesador prueba en orden los directorios estándares y los agregados con `-I`.
- **`-L directorio`**: agrega `directorio` a la lista de paths donde el linker busca bibliotecas. Necesario cuando una biblioteca vive en un lugar no estándar.
- **`-l nombre`**: le dice al linker que busque `lib{nombre}.{so,a}` y la enlace.

Un ejemplo combinado: si el programa usa funciones matemáticas (`sin`, `cos`, `sqrt`), `<math.h>` declara las firmas pero las definiciones viven en `libm`, no en `libc`. La compilación requiere `-lm`:

```text
$ cat trig.c
#include <math.h>
int main(void) { return (int)sin(1.0); }
$ gcc trig.c -o trig
/usr/bin/ld: ... undefined reference to `sin'
$ gcc trig.c -lm -o trig
$ # ahora funciona
```

Sin `-lm`, el linker no busca en `libm` y no encuentra `sin`. La solución no está en el código C: es una flag de invocación.

Otro ejemplo con `-I` y `-L`:

```text
$ gcc -I/opt/foo/include -L/opt/foo/lib programa.c -lfoo -o programa
```

Esa invocación dice: para los `#include`, mirá también en `/opt/foo/include`; para enlazar bibliotecas, mirá también en `/opt/foo/lib`; y enlazá `libfoo.{a,so}`. Es la forma estándar de usar bibliotecas instaladas fuera de los paths del sistema.

## Cómo elegir la flag mirando el efecto, no el manual

Para cerrar el capítulo, una rutina aplicable a cualquier flag desconocida:

1. Compilar el mismo `.c` con y sin la flag, y producir todos los artefactos (`-E`, `-S`, `-c`, ejecutable).
2. Comparar los pares de artefactos:
   - Para flags que afectan el preprocesado: comparar `.i`.
   - Para flags que afectan compilación: comparar `.s` y `.o`.
   - Para flags que afectan linking: comparar el ejecutable con `nm`, `objdump`, `ldd`.
3. Si la flag tiene un efecto observable en alguno, ahí está su trabajo. Si no tiene efecto en ningún artefacto, probablemente sea una flag para una situación que el programa actual no pisa (por ejemplo, `-fPIC` no cambia nada en un ejecutable común; cambia el `.o` cuando se enlaza como `.so`).

Esta rutina convierte la lectura de flags en una operación experimental: mirar el artefacto, no el manual. Es una versión específica del principio general del nivel —**inspeccionar entre etapas**—, ahora aplicado a la pregunta "qué cambia esta flag en concreto". Cuando una flag aparece en un Makefile heredado y nadie sabe por qué está, esta rutina permite contestar la pregunta sin pedir el folklore del proyecto.

A partir del próximo capítulo, el último, las flags y los artefactos del pipeline se integran en la herramienta que automatiza el build completo: `make`.
