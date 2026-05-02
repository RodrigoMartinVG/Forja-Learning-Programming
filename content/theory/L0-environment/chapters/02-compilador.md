# El pipeline de compilación

Cuando escribís `gcc hello.c -o hello` y el binario aparece, parece una caja negra. Hay un archivo de texto que entra y un ejecutable que sale. ¿Qué pasó en el medio?

La respuesta no es un truco de compilador. Es una cadena de transformaciones bien definidas, cada una con una responsabilidad clara. Entender ese pipeline es entender por qué los errores aparecen donde aparecen, por qué cambiar un flag cambia el comportamiento, y qué diferencia hay entre compilar para debugging y compilar para producción.

Este conocimiento es permanente: todo lo que hagás en Forja —debuggear con `gdb`, inspeccionar con `objdump`, entender qué hace el kernel al cargar un proceso— requiere saber qué hay dentro del binario y cómo llegó ahí.

## Las cuatro fases

```
  ┌─────────────────────────────┐
  │     código fuente  (.c)     │
  └──────────────┬──────────────┘
                 │  gcc -E   preprocesador: expande macros e #includes
                 ▼
  ┌─────────────────────────────┐
  │      preprocesado  (.i)     │
  └──────────────┬──────────────┘
                 │  gcc -S   compilador: genera instrucciones
                 ▼
  ┌─────────────────────────────┐
  │      ensamblador   (.s)     │
  └──────────────┬──────────────┘
                 │  as        ensamblador: produce código máquina
                 ▼
  ┌─────────────────────────────┐
  │  objeto  (.o)  ELF reloc.   │
  └──────────────┬──────────────┘
                 │  ld        linker: resuelve símbolos y une
                 ▼
  ┌─────────────────────────────┐
  │  ejecutable    ELF exec.    │
  └─────────────────────────────┘
```

### 1. Preprocesamiento

El preprocesador expande macros, incluye archivos de cabecera y procesa directivas `#if`. El resultado es un archivo `.i`: C puro, sin directivas.

```bash
gcc -E hello.c -o hello.i
```

Abrí el `.i` resultante. Vas a ver decenas de miles de líneas provenientes de `<stdio.h>` y sus dependencias. Lo que hace `#include` es literalmente copiar y pegar. Eso tiene consecuencias: si incluís un header que incluye otro que incluye otro, compilás todo ese árbol cada vez. Es la razón por la que los sistemas de build modernos y las "unity builds" existen, pero eso está fuera del scope de L0.

Algo útil para entender un error de preprocesador: `gcc -E -dM hello.c` imprime todas las macros definidas (incluyendo las predefinidas del sistema) en un momento dado.

### 2. Compilación propiamente dicha

El compilador toma el C preprocesado y lo convierte en código ensamblador. El resultado es un `.s` legible por humanos.

```bash
gcc -S hello.i -o hello.s
# o directamente desde C
gcc -S hello.c -o hello.s
```

Mirá el `.s`. Vas a ver instrucciones como `movl`, `call printf`, `ret`. Eso es el corazón de lo que tu programa le ordena al procesador.

En L1b vas a leer y escribir ensamblador en serio: la ABI de x86-64, los registros, el stack frame, las convenciones de llamado. Por ahora, alcanza con saber que la fase de compilación transforma C en instrucciones de CPU y que podés verlas.

### 3. Ensamblado

El ensamblador convierte el `.s` en código de máquina real: un archivo objeto `.o`. Es binario, no legible directamente. Su formato es **ELF relocatable**: tiene secciones (`.text` para código, `.data` para datos inicializados, `.bss` para datos sin inicializar), una tabla de símbolos con los nombres que define y los que referencia externamente, y tablas de reubicación para que el linker pueda ajustar las direcciones.

```bash
gcc -c hello.s -o hello.o
# o desde C directamente
gcc -c hello.c -o hello.o
```

Podés ver el contenido de un `.o`:

```bash
nm hello.o             # tabla de símbolos: U = referenciado pero no definido (undefined), T = definido en .text
objdump -d hello.o     # disensamblar el código (las direcciones son relativas, aún no definitivas)
```

> **Nota sobre ELF**: el formato ELF (Executable and Linkable Format) es el formato de binarios de Linux. Los `.o`, los ejecutables y las bibliotecas `.so` son todos archivos ELF con distintas variantes. En L0 solo necesitás saber que existen. En L7 vas a leer la spec y diseccionar un ELF sección por sección, entender qué hace el cargador dinámico al arrancar un proceso y escribir código que lee y modifica ELFs. Esa profundidad tiene su lugar natural después de estudiar memoria virtual.

### 4. Enlazado (linking)

El linker toma uno o más `.o` y los une con las bibliotecas necesarias para producir el ejecutable final. Su trabajo principal es **resolver símbolos**: cuando `hello.o` referencia a `printf` (marcada como `U` = undefined en `nm`), el linker encuentra esa función en `libc` y conecta la referencia.

```bash
# GCC llama al linker automáticamente cuando no usás -c
gcc hello.o -o hello
```

#### Linking estático vs dinámico

Hay dos formas de enlazar una biblioteca:

**Dinámico** (default): el ejecutable no contiene el código de `printf`. Solo contiene una referencia al nombre `printf@libc`. Cuando el OS ejecuta el binario, el **cargador dinámico** (`ld-linux.so`) carga `libc.so` en memoria y resuelve la referencia antes de que el programa arranque.

```bash
# Ver qué bibliotecas dinámicas necesita un binario
ldd ./hello
```
```
        linux-vdso.so.1 (0x00007ffc...)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f...)
        /lib64/ld-linux-x86-64.so.2 (0x00007f...)
```

**Estático** (`-static`): el linker copia el código de todas las bibliotecas dentro del ejecutable. El resultado es mucho más grande pero no tiene dependencias externas. Lo usarás en contextos de contenedores muy pequeños o binarios "standalone".

```bash
gcc -static hello.c -o hello_static
ls -la hello hello_static        # diferencia de tamaño enorme
ldd hello_static                # "not a dynamic executable"
```

La mayoría del tiempo trabajarás con linking dinámico. El linking estático existe, pero tiene sus propios problemas (actualizaciones de seguridad de libc no se propagan automáticamente, entre otros).

> **Profundidad de linking**: cómo el linker resuelve símbolos, qué son las tablas de reubicación, cómo funciona `-fPIC` (Position Independent Code) para bibliotecas compartidas, y cómo el cargador dinámico mapea librerías en el espacio de direcciones son temas de L7 y del proyecto `mini-linker`. Requieren entender memoria virtual primero.

#### Múltiples archivos objeto

En proyectos reales compilás múltiples `.c` por separado y los enlazás juntos:

```bash
gcc -c main.c -o main.o
gcc -c utils.c -o utils.o
gcc main.o utils.o -o programa   # linker los une
```

Esto importa porque permite recompilar solo los archivos que cambiaron. Es la base de cómo funcionan los Makefiles.

## Hacer todo en un solo comando

```bash
gcc hello.c -o hello
```

GCC invoca las cuatro fases en orden. Si querés ver exactamente qué comandos ejecuta, usá `-v`:

```bash
gcc -v hello.c -o hello 2>&1 | head -50
```

Vas a ver los paths reales de `cpp`, `cc1`, `as` y `ld` que usa tu instalación.

## Los flags que más importan ahora

Los flags de compilación no son opcionales. Dos programas compilados del mismo código pero con distintos flags son programas distintos.

```bash
# Máxima información de warnings — usalo siempre
gcc -Wall -Wextra hello.c -o hello

# Información de debug — necesario para gdb y valgrind
gcc -g hello.c -o hello

# Modo debug completo: sin optimizaciones, con debug
gcc -Wall -Wextra -g -O0 hello.c -o hello

# Modo "parecido a producción": optimizaciones agresivas
gcc -Wall -Wextra -O2 hello.c -o hello
```

**`-Wall -Wextra`** activan la mayoría de los warnings razonables. Un warning no es un error de compilación, pero sí es información: el compilador te está diciendo que algo puede ser un problema. Ignorar warnings en C es garantía de bugs.

**`-g`** incluye información de debug en el binario: nombres de variables, números de línea, información de tipos. Sin esto, `gdb` y `valgrind` trabajan a ciegas. El binario crece, pero eso no importa en desarrollo.

**`-O0`** deshabilita optimizaciones. El código compilado tiene una correspondencia mucho más directa con el código fuente. El ensamblador generado es más largo pero más legible.

**`-O2`** activa un nivel agresivo de optimizaciones. Variables que desaparecen, bucles que se transforman, funciones que se inline. El código es más rápido pero más difícil de debuggear. Para producción o benchmarks.

> **Regla de oro**: en desarrollo, usá siempre `-Wall -Wextra -g -O0`. Para producción o benchmarks, `-O2` o `-O3` sin `-g`.

### `-fsanitize`: el compilador como detector de bugs

GCC y Clang pueden compilar chequeadores de errores directamente en el binario:

```bash
gcc -Wall -Wextra -g -O0 -fsanitize=address -fsanitize=undefined hello.c -o hello
```

**AddressSanitizer** (`-fsanitize=address`) detecta: accesos fuera de bounds, use-after-free, use-after-return, desbordamientos de stack.

**UndefinedBehaviorSanitizer** (`-fsanitize=undefined`) detecta: integer overflow con signo, null dereference, bit shifts inválidos, acceso a miembros de punteros mal alineados.

Úsalos durante el desarrollo. Son más rápidos que `valgrind` y detectan errores en el momento exacto en que ocurren. Más sobre esto en la sección de herramientas.

## GCC vs Clang: ¿cuál usar?

Ambos producen código correcto. Las diferencias que importan para aprender:

- **Clang** tiene mensajes de error más claros y más informativos. Cuando hay un error de tipos o algo ambiguo, Clang generalmente explica mejor qué pasó. El flag `-fcolor-diagnostics` hace que los errores sean más fáciles de leer visualmente.
- **GCC** es el estándar histórico en Linux y tiene mejor soporte para algunas arquitecturas embebidas, extensiones específicas y el ecosistema de herramientas (algunos scripts asumen GCC).
- **Para Forja**: usá `gcc` como compilador principal. Cuando tengas un error confuso, compilá el mismo código con `clang` y mirá si el mensaje es más claro:

```bash
clang -Wall -Wextra -g -O0 hello.c -o hello
```

## Makefiles: automatizar la cadena

Repetir el comando de compilación a mano es tedioso y propenso a errores. Un `Makefile` codifica las reglas de compilación:

```makefile
CC     = gcc
CFLAGS = -Wall -Wextra -g -O0

# Regla: cómo construir 'hello' desde 'hello.c'
# La dependencia es explícita: si hello.c cambia, hello se recompila
hello: hello.c
	$(CC) $(CFLAGS) hello.c -o hello

# Para un proyecto con múltiples archivos:
# programa: main.o utils.o
#	$(CC) main.o utils.o -o programa

# Regla phony: no crea un archivo llamado 'clean'
.PHONY: clean
clean:
	rm -f hello *.o
```

```bash
make          # compila si el fuente cambió (compara timestamps)
make clean    # elimina los binarios
make -n       # muestra qué haría sin ejecutarlo (dry run)
```

`make` usa **timestamps** para decidir qué recompilar: si `hello.c` es más nuevo que `hello`, recompila. Si no cambió nada, no hace nada. Para proyectos con decenas de archivos, eso ahorra tiempo significativo.

### Variables especiales en Make

```makefile
$@   # el target (lo que estás construyendo)
$<   # la primera dependencia (el fuente principal)
$^   # todas las dependencias

# Ejemplo de regla genérica (pattern rule):
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@
```

En los proyectos de Forja cada uno viene con su `Makefile`. Entender qué hace es parte del ejercicio, no un detalle a ignorar.

> **Más allá de Make**: para proyectos más grandes, CMake y Meson son sistemas de build más modernos que generan Makefiles u otros backends. Son herramientas legítimas y se usan en producción. L0 no los cubre porque Make es suficiente para este nivel y porque las abstracciones adicionales no se justifican antes de entender la compilación básica.

## Inspeccionar el resultado

Una vez que tenés un binario, podés inspeccionarlo:

```bash
file hello                    # tipo de ejecutable, arquitectura, si tiene debug symbols
nm hello                      # tabla de símbolos (funciones y variables del binario)
nm -u hello                   # solo los símbolos undefined (dependencias externas)
objdump -d hello              # desensamblar el código ejecutable
objdump -d hello | grep -A10 '<main>'   # solo la función main
ldd hello                     # bibliotecas dinámicas que necesita
```

Estas herramientas trabajan con el binario ya compilado y son complementarias al pipeline: `nm` muestra qué hay en la tabla de símbolos (fase 3-4), `ldd` muestra las dependencias dinámicas (fase 4), `objdump` muestra el código máquina (fase 2-3).

`readelf` es la herramienta más completa para inspeccionar ELF:
```bash
readelf -h hello              # header: tipo, arquitectura, entry point
readelf -S hello              # tabla de secciones
readelf -d hello              # sección .dynamic: dependencias y rpath
```

Por ahora es suficiente saber que existen. En L7 las vas a usar de forma sistemática cuando estudies el formato ELF en detalle.

## Lo que el pipeline te muestra

La cadena de compilación no es un detalle técnico. Es el mapa. Cuando un bug aparece solo con `-O2`, sabés que el compilador transformó el código de alguna manera relevante. Cuando `valgrind` te da la línea exacta de un error, sabés que funciona porque compilaste con `-g`. Cuando el linker se queja de un símbolo no definido, sabés que estás en la fase 4 y que falta un `.o` o una biblioteca.

Cada herramienta del laboratorio opera en alguna fase de este pipeline. Conocer el pipeline hace que el laboratorio tenga sentido.
