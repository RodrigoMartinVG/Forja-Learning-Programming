# Herramientas de observación

Programar en sistemas sin herramientas de observación es como operar a ciegas. Podés escribir el código, compilarlo, y ejecutarlo, pero si el comportamiento no es el esperado, ¿dónde mirás?

Las herramientas de esta sección te dan visibilidad en capas distintas del sistema: syscalls, memoria, ejecución paso a paso, rendimiento. Aprender a usarlas no es un detalle técnico: es lo que convierte los errores en información.

No hace falta dominarlas todas ahora. El objetivo de L0 es conocerlas: saber qué hace cada una y cuándo conviene usarla. Las vas a usar en profundidad a lo largo de todo el camino.

## strace — ver cada llamada al sistema

Todo lo que tu programa hace con el sistema operativo pasa por **syscalls**: abrir archivos, leer, escribir, asignar memoria, crear procesos, enviar señales. `strace` intercepta esas llamadas y las imprime en tiempo real.

```bash
strace ./hello
```

La salida tiene este aspecto:

```
execve("./hello", ["./hello"], 0x7ffdd4b8b0c0 /* 20 vars */) = 0
brk(NULL)                               = 0x55f3c4e2b000
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
...
write(1, "Hola, mundo\n", 12)           = 12
exit_group(0)                           = ?
```

Cada línea es una syscall: su nombre, sus argumentos y el valor de retorno. El `-1 ENOENT` que ves para `access("/etc/ld.so.preload")` no es un error de tu programa: es el cargador dinámico intentando leer un archivo opcional que no existe en este sistema. Esto es importante entenderlo para no confundir los errores del cargador con errores de tu código.

### Lo que strace te enseña

- Si un programa falla con "permiso denegado", `strace` te dice exactamente qué archivo intentó abrir.
- Si un servidor se queda colgado, `strace -p <pid>` te muestra en qué syscall está esperando.
- Cuando arrancás a estudiar procesos (L6), `strace` es la lupa con la que vas a mirar `fork`, `exec` y `wait` en detalle.
- Cuando estudies IPC (L11), vas a ver `pipe`, `mmap`, `socket` directamente.

Algunos flags útiles:

```bash
# Solo mostrar cierta familia de syscalls
strace -e trace=file ./hello      # solo syscalls de archivos
strace -e trace=network ./hello   # solo red
strace -e trace=memory ./hello    # solo asignación de memoria

# Timestamp relativo (tiempo entre syscalls)
strace -r ./hello

# Seguir procesos hijos (útil cuando el programa hace fork)
strace -f ./programa-con-fork

# Guardar a archivo (para programas con mucho output)
strace -o trace.txt ./hello

# Resumen estadístico: cuántas veces se llamó a cada syscall
strace -c ./hello
```

`strace -c` es especialmente útil como primera pasada sobre un binario desconocido: muestra el inventario de syscalls con su frecuencia, tiempo y errores sin inundarte con cada llamada individual.

### Entender qué hace una syscall: man 2

Cuando `strace` te muestra una syscall desconocida, la documentación está en la sección 2 del manual:

```bash
man 2 write      # syscall write: fd, buf, count
man 2 openat     # syscall openat: dirfd, pathname, flags
man 2 mmap       # syscall mmap: mapear memoria
man 2 ptrace     # syscall ptrace: la base de strace y gdb
```

La sección 2 son las syscalls del kernel. La sección 3 son las funciones de libc. La diferencia:

```bash
man 2 read       # la syscall read del kernel
man 3 fread      # la función fread de la C library (usa read internamente)
```

### Cómo funciona strace (brevemente)

`strace` usa la syscall `ptrace` del kernel para interceptar las syscalls del proceso. `ptrace` es el mecanismo de bajo nivel que también usa `gdb`. Cuando un proceso llama a `ptrace(PTRACE_SYSCALL, ...)`, el kernel pausa el tracee antes y después de cada syscall para que el tracer (strace/gdb) pueda examinar el estado.

Esto tiene una consecuencia práctica: `strace` hace que el programa sea mucho más lento, porque hay un context switch al tracer en cada syscall. Para medir rendimiento, no usís `strace`. En L6 vas a estudiar `ptrace` directamente cuando implementes un debugger básico.

### ltrace — llamadas a funciones de biblioteca

`ltrace` hace para las funciones de biblioteca lo que `strace` hace para las syscalls:

```bash
ltrace ./hello
```

```
__libc_start_main(0x55a..., 1, ...) = ...
printf("Hola desde Forja\n")          = 18
+++ exited (status 0) +++
```

Ves la llamada a `printf` —que es una función de libc, no una syscallá y su valor de retorno (18 bytes escritos). `ltrace` intercepta llamadas a funciones de bibliotecas dinámicas mediante PLT hooking. útil cuando querés ver qué hace un binario del que no tenés el fuente.

> `ltrace` y `strace` son complementarios: uno muestra llamadas a libc, el otro muestra syscalls. `printf` aparece en `ltrace`; `write` aparece en `strace`. Verlos juntos da el panorama completo.

## gdb — el debugger simbólico

`gdb` es el estándar para debuggear programas en Linux. Con un binario compilado con `-g`, podés pausar la ejecución en cualquier punto, inspeccionar variables, navegar el stack y ejecutar instrucción por instrucción.

Siempre compilá con `-g -O0` antes de debuggear:

```bash
gcc -g -O0 hello.c -o hola
gdb ./hello
```

### Los comandos esenciales

```gdb
(gdb) run                    # ejecutar el programa
(gdb) break main             # poner un breakpoint en la función main
(gdb) break hello.c:15        # poner un breakpoint en la línea 15 de hello.c
(gdb) next                   # ejecutar la próxima línea (sin entrar a funciones)
(gdb) step                   # ejecutar la próxima línea (entrando a funciones llamadas)
(gdb) continue               # continuar hasta el próximo breakpoint
(gdb) print nombre_variable  # imprimir el valor de una variable
(gdb) quit                   # salir
```

Una sesión típica:

```
$ gdb ./hello
(gdb) break main
Breakpoint 1 at 0x1149: file hello.c, line 5.
(gdb) run
Starting program: ./hello
Breakpoint 1, main () at hello.c:5
5           int x = 42;
(gdb) next
6           printf("x = %d\n", x);
(gdb) print x
$1 = 42
(gdb) continue
x = 42
[Inferior 1 (process 1234) exited normally]
(gdb) quit
```

### Comandos para inspección profunda

```gdb
(gdb) backtrace              # mostrar la cadena de frames (quién llamó a quién)
(gdb) info registers         # ver el estado de todos los registros
(gdb) info locals            # ver todas las variables locales del frame actual
(gdb) frame 2                # cambiar al frame 2 en el backtrace
(gdb) list                   # mostrar las líneas de fuente alrededor del punto actual
(gdb) x/10x $rsp             # ver 10 palabras en formato hex empezando en rsp
(gdb) x/s 0x4005d0           # interpretar la memoria en esa dirección como string
(gdb) disassemble main       # desensamblar la función main
```

### Watchpoints y breakpoints condicionales

```gdb
# Parar cuando el valor de la variable cambia
(gdb) watch nombre_variable

# Parar solo si se cumple una condición
(gdb) break funcion if parametro > 100

# Parar en la n-ésima vez que se alcanza el breakpoint
(gdb) break bucle_interno
(gdb) ignore 1 999    # ignorar las primeras 999 veces
```

Los watchpoints son especialmente útiles para bugs donde "el valor de esta variable cambió y no sí dónde": `gdb` para exactamente cuando ocurre el cambio.

### Modo TUI — interfaz de texto mejorada

`gdb` tiene un modo de texto que muestra el código fuente y el assembly en paneles:

```bash
gdb -tui ./hello
```

O desde dentro de `gdb`:
```gdb
(gdb) tui enable
(gdb) layout src     # panel de código fuente
(gdb) layout asm     # panel de assembly
(gdb) layout split   # ambos
```

> **Tip**: VS Code tiene integración con `gdb` vía el plugin `CodeLLDB` o la extensión C/C++. Podés poner breakpoints con click y ver las variables en un panel lateral. La experiencia visual facilita el aprendizaje inicial. Igualmente, aprendé los comandos de texto: en un servidor remoto sin GUI, `gdb` en línea de comandos es tu única opción.

> **Profundidad de gdb**: en L0 usís los comandos esenciales. El uso completo — scripting con Python, debugging de procesos multi-thread, debugging remoto via `gdbserver`, análisis de core dumps — se desarrolla progresivamente. En L1b vas a usar `gdb` para estudiar el assembly generado por el compilador. En L6 para debuggear procesos que hacen `fork`. En L9 para debuggear race conditions.

## valgrind — detectar errores de memoria

C no tiene garbage collector ni verificación de bounds. Esto significa que podés leer más allá del final de un array, usar memoria que ya liberaste, o nunca liberar memoria que sí reservaste. Esos errores a veces crashean el programa, pero muchas veces pasan silenciosamente y causan problemas mucho más tarde.

`valgrind` ejecuta tu programa en un intérprete instrumentado que detecta estos errores con precisión:

```bash
valgrind --leak-check=full --track-origins=yes ./hello
```

Si el programa tiene errores, la salida se ve así:

```
==12345== Invalid read of size 4
==12345==    at 0x1091A8: main (buggy.c:8)
==12345==  Address 0x4a47044 is 0 bytes after a block of size 16 alloc'd
==12345==    at 0x4848899: malloc (in /usr/lib/valgrind/vgpreload_memcheck.so)
==12345==    at 0x109189: main (buggy.c:5)
```

Eso te dice: en `buggy.c:8`, intentaste leer 4 bytes en una dirección que está 0 bytes después del final del bloque de 16 bytes que reservaste en `buggy.c:5`. La información es precisa.

Para un programa correcto, `valgrind` termina con:

```
==12345== All heap blocks were freed -- no leaks are possible
==12345== ERROR SUMMARY: 0 errors from 0 contexts
```

### Los errores más comunes que detecta

| Error | Descripción |
|---|---|
| `Invalid read/write of size N` | Accediste fuera de los bounds del bloque reservado |
| `Use of uninitialised value` | Usaste una variable que nunca fue inicializada |
| `Invalid free()` / `double free` | Liberaste memoria que no reservaste, o liberaste dos veces |
| `Memory leak (definitely lost)` | Reservaste memoria con `malloc` y nunca la liberaste |
| `Conditional jump depends on uninitialised` | Un `if` usa una variable sin inicializar |

### valgrind tiene más herramientas

`valgrind` es en realidad un framework. `memcheck` (el default) detecta errores de memoria. Pero hay más:

- **`helgrind`**: detecta data races en programas con threads ? se usa en L9
- **`drd`**: similar a helgrind, más rápido para ciertos patrones ? L9
- **`callgrind`**: profiling de llamadas a funciones ? análisis de rendimiento
- **`massif`**: profiling de uso de heap ? L8 (allocators)

```bash
valgrind --tool=helgrind ./programa-con-threads
```

Por ahora solo necesitás `memcheck`. Los otros tendrán sentido cuando llegues a los niveles correspondientes.

## Address Sanitizer (ASan) — más rápido, igual de útil

GCC y Clang incluyen sanitizers que hacen verificaciones similares a `valgrind` pero con mucho menos overhead, compilando el chequeo directamente en el binario:

```bash
gcc -g -O0 -fsanitize=address -fsanitize=undefined hello.c -o hello
./hello
```

**AddressSanitizer** (`-fsanitize=address`) detecta: desbordamientos de buffer (heap y stack), use-after-free, use-after-return, double free.

**UndefinedBehaviorSanitizer** (`-fsanitize=undefined`) detecta: overflow de enteros con signo, null dereference, bit shifts inválidos, acceso a punteros mal alineados.

**ThreadSanitizer** (`-fsanitize=thread`) detecta data races entre threads. No se puede combinar con ASan, pero se usa en L9 para diagnosticar condiciones de carrera.

### Cuándo usar cuál

| Herramienta | Velocidad | Cuándo usarla |
|---|---|---|
| `-fsanitize=address` | ~2x más lento | Desarrollo activo — siempre que programes |
| `-fsanitize=undefined` | < 1.5x más lento | Desarrollo activo — siempre que programes |
| `-fsanitize=thread` | ~10x más lento | Debuggear race conditions específicas |
| `valgrind --tool=memcheck` | ~20-50x más lento | Análisis exhaustivo de fugas de memoria |
| `valgrind --tool=helgrind` | ~30x más lento | Análisis exhaustivo de races |

> **Regla de práctica**: compilá con `-fsanitize=address -fsanitize=undefined` durante el desarrollo. Es más rápido que `valgrind` y detecta la mayoría de los errores en el momento en que ocurren. Usí `valgrind` cuando necesitás el análisis de fugas de memoria más completo.

## perf — rendimiento real

`perf` es la herramienta de profiling del kernel Linux. Mide cuánto tiempo pasa el programa en cada función, cuántos cache misses produce, cuántos branch mispredictions hay. Es la diferencia entre *intuir* que algo es lento y *medir* dónde está el cuello de botella.

```bash
# Estadísticas básicas de CPU para una ejecución
perf stat ./programa

# Grabar un perfil de muestreo
perf record ./programa
perf report
```

`perf stat` muestra una vista de alto nivel:

```
 Performance counter stats for './hello':

              0.47 msec task-clock                       #    0.612 CPUs utilized
                 0      context-switches                 #    0.000 /sec
                 0      cpu-migrations                   #    0.000 /sec
                54      page-faults                      #  114.407 K/sec
         1,087,432      cycles                           #    2.304 GHz
           724,309      instructions                     #    0.67  insn per cycle
           180,543      branches                         #  383.088 M/sec
             5,012      branch-misses                    #    2.78% of all branches
```

Esos números tienen significado. En L17 los vas a leer con precisión: cuántos ciclos por instrucción es aceptable, cómo los cache misses destruyen el rendimiento, cómo los branch mispredictions afectan el pipeline.

`perf` puede también generar flame graphs — representaciones visuales de dónde pasa el tiempo el programa, que permiten identificar de un vistazo los hot paths. Eso también es L17.

> L0 no es el lugar para profundizar en `perf`. Lo usarás seriamente en el nivel de rendimiento (L17) junto con `perf record`, `perf report`, flame graphs, y análisis de hardware counters. Por ahora alcanza con saber que existe y correr `perf stat` en un programa simple para ver qué métricas reporta.

> **Por qué perf requiere un nivel propio**: la interpretación de los counters de hardware (ciclos, instrucciones, cache hits/misses, branch mispredictions) requiere entender la microarquitectura de la CPU — pipelines, caches, out-of-order execution. Sin esa base, los números son solo ruido. L17 construye ese contexto primero y luego introduce `perf` con todo su poder.

## La filosofía del observador

Hay una mentalidad que estas herramientas instalan:

**No supongas, medí.** Si un programa parece lento, `perf` te dice dónde. Si crashea, `gdb` te dice en qué línea. Si filtra memoria, `valgrind` te dice exactamente qué línea la reservó y dónde debería haberla liberado. Si hace algo inesperado con el sistema, `strace` te dice exactamente qué syscalls emite.

La mayoría de los bugs en sistemas no son misteriosos cuando tenés visibilidad completa. Son predecibles, mecánicos, y entendibles. Lo que los hace parecer misteriosos es la falta de visibilidad.

Invertir tiempo en aprender estas herramientas al principio ahorra órdenes de magnitud de tiempo más adelante.
