# Tu primer recorrido completo

Las cuatro secciones anteriores construyeron el mapa conceptual: el laboratorio, el pipeline, la máquina, las herramientas. Ahora usás todo eso junto en un recorrido real, de principio a fin, con un programa real.

El objetivo de este recorrido no es que salga perfecto a la primera. Es que al terminar puedas ver el camino completo: desde un archivo `.c` hasta un syscall ejecutándose en el kernel, y puedas observar cada paso con precisión.

Este recorrido es intencionalmente simple. En L1b vas a repetir algo similar con un programa más complejo, con más comandos de `gdb`, con lectura sistemática del assembly generado, y con análisis del ELF. Por ahora, el objetivo es conectar todos los conceptos de L0 en un flujo real.

## Paso 0: verificar el ambiente

Antes de cualquier otra cosa:

```bash
bash verify-setup.sh
```

Si alguna herramienta falla, arreglalo antes de continuar. Un recorrido que falla a mitad porque falta `valgrind` no enseña lo que debería.
Verificá también que Rust compila (aunque el recorrido completo viene en L3):

```bash
rustc src/hello.rs -o hello_rs
./hello_rs
```

Si arroja `hello from L0 rust`, el toolchain de Rust está funcionando.
## El programa

Usaremos el programa más conocido de la historia, pero lo llevaremos más lejos de lo usual:

```c
// src/hello.c
#include <stdio.h>

int main(void) {
    const char msg[] = "hello from Forja\n";
    printf(msg);
    return 0;
}
```

Es minimalista, pero contiene lo que necesitamos: un string literal en el stack (no un puntero: `const char msg[]` es un array), una función de librería, y una llamada que eventualmente llega a ser una syscall.

## Paso 1: compilar con flags correctas

```bash
gcc -Wall -Wextra -g -O0 src/hello.c -o hello
```

¿Qué verificar?
- Que no haya warnings. Si los hay, leelos y entendelos antes de continuar.
- Que el binario fue creado: `ls -la hello`
- Que es un ELF ejecutable: `file hello`

```
hello: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked,
      interpreter /lib64/ld-linux-x86-64.so.2, ...
```

Leé eso con atención:
- **ELF 64-bit**: formato binario, arquitectura de 64 bits.
- **LSB**: Little-Endian byte order (los bytes menos significativos van primero en memoria).
- **pie executable**: Position Independent Executable — el binario puede cargarse en cualquier dirección. Necesario para que ASLR funcione.
- **dynamically linked**: las bibliotecas (libc, etc.) no están dentro del binario. El cargador dinámico las mapea en memoria al arrancar el proceso.
- **interpreter /lib64/ld-linux-x86-64.so.2**: ese es el cargador dinámico. Es el primer ejecutable que corre cuando ejecutás `./hola`. Carga las dependencias dinámicas y luego salta al `main` del programa.

> La estructura interna de un ELF (secciones, segmentos, la tabla de símbolos) es tema de L7. Por ahora este output de `file` es suficiente para entender qué tipo de binario tenés.

## Paso 2: inspeccionar las dependencias

```bash
ldd hello
```

```
        linux-vdso.so.1 (0x00007ffc...)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f...)
        /lib64/ld-linux-x86-64.so.2 (0x00007f...)
```

- `linux-vdso.so.1` no es un archivo en disco: es una biblioteca virtual que el kernel mapea en el proceso para syscalls rápidas. No necesitás buscarlo en `/lib`.
- `libc.so.6` es la C library estándar. Ahí vive `printf`.
- `ld-linux-x86-64.so.2` es el cargador dinámico.

```bash
nm -u hello    # símbolos undefined: los que necesita de bibliotecas externas
```

```
         U printf@@GLIBC_2.2.5
         U __libc_start_main@@GLIBC_2.34
```

`printf` y `__libc_start_main` (el arranque de la C library) son los dos símbolos externos. El resto de la lógica está en el binario.

## Paso 3: mirá el ensamblador

```bash
gcc -Wall -Wextra -S -O0 src/hello.c -o hello.s
cat hello.s
```

Buscá la función `main`. Vas a ver algo así:

```asm
main:
    push   rbp
    mov    rbp, rsp
    sub    rsp, 32             ; espacio para el array en el stack (alineado)
    ...
    lea    rdi, [rbp-...]      ; dirección del array msg → primer argumento
    call   printf              ; llamar a printf
    mov    eax, 0              ; valor de retorno = 0
    leave                      ; mov rsp, rbp; pop rbp
    ret
```

El array `msg` está en el stack: `sub rsp, 32` reserva espacio para él. `lea` carga la dirección del array en `rdi` (el primer argumento de una función en x86-64). Luego `call printf` salta a la función.

Ahora compilá con `-O2` y mirá la diferencia:

```bash
gcc -S -O2 src/hello.c -o hello_opt.s
diff hello.s hello_opt.s
```

Con `-O2` el compilador puede reemplazar `printf(msg)` con `puts` (un caso especial que el optimizador reconoce: cuando el string termina en `\n`, `printf` equivale a `puts`), o puede incluso emitir la llamada a `write` directamente. La función `main` con `-O2` es mucho más corta.

## Paso 4: strace — del printf al kernel

```bash
strace ./hello 2>&1 | grep -E 'write|execve|exit'
```

```
execve("./hello", ["./hello"], 0x...) = 0
write(1, "hello from Forja\n", 18)   = 18
exit_group(0)                         = ?
```

Lo que pasó:
1. `execve` cargó el programa.
2. `printf("hello from Forja\n")` eventualmente llamó a la syscall `write(1, ...)`, donde `1` es el file descriptor de stdout.
3. `exit_group(0)` terminó el proceso con código 0.

Entre `execve` y `write` hay decenas de syscalls del cargador dinámico: abrir `libc.so`, mapearla en memoria, resolver símbolos. Mirá la salida completa para verlas todas.

### ¿Por qué no hay llamada directa de printf a write?

Porque `printf` tiene un buffer interno. Por defecto, `stdout` está line-buffered cuando escribe a una terminal: acumula output y solo llama a `write` cuando encuentra un `\n`, cuando el buffer se llena, o cuando el programa termina. Esto explica que si tu programa se cuelga antes de imprimir el `\n`, podés no ver el output. Es también por qué `fflush(stdout)` existe.

Si `stdout` redirige a un archivo (`./hello > output.txt`), pasa a ser fully buffered. Con `strace` podés observar exactamente cuándo ocurre cada `write` y verificar este comportamiento.

### Contraste: `printf` vs `write` directa

`src/write_demo.c` llama a `write(2)` directamente, sin pasar por `printf`. Compilálo y corré ambos bajo `strace`:

```bash
gcc -g -O0 src/write_demo.c -o write_demo
strace ./hello    2>&1 | grep write
strace ./write_demo 2>&1 | grep write
```

En `hello`, `printf` pasa por la libc, que eventualmente llama a `write`. En `write_demo` la syscall aparece directamente, sin intermediarios de libc visibles. `strace` muestra la misma syscall `write(1, ...)` en los dos casos, pero la ruta hasta llegar ahí es diferente: unó pasa por 5+ llamadas de libc, el otro es una línea.

## Paso 5: gdb — ejecutar línea por línea

```bash
gdb ./hello
```

```gdb
(gdb) break main
(gdb) run
(gdb) list
(gdb) print msg
(gdb) print sizeof(msg)
(gdb) info registers
(gdb) next
(gdb) step
(gdb) backtrace
(gdb) continue
```

Observá:
- `print sizeof(msg)` da `18`, no `8`. Porque `msg` es un array de caracteres (`const char[]`), no un puntero. `sizeof` de un array da el tamaño real del array, incluyendo el `\0` al final.
- `info registers` muestra el estado de todos los registros en el momento en que estás parado. `rsp` apunta al tope del stack, `rip` a la próxima instrucción.
- `step` dentro de `printf` te lleva al interior de libc. Podés salir con `finish` (ejecutar hasta retornar del frame actual).
- `backtrace` muestra la pila de llamadas: `main` llamó a `printf` llamó a... Es el historial de cómo llegaste hasta donde estás.

Probar también:
```gdb
(gdb) x/s msg           # ver el contenido de 'msg' como string
(gdb) x/18c msg         # ver los 18 caracteres individuales con su código ASCII
(gdb) disassemble main      # ver el assembly de la función main
```

## Paso 6: valgrind — verificar que no hay errores de memoria

```bash
valgrind ./hello
```

Para un programa correcto:

```
==...== Memcheck, a memory error detector
hello from Forja
==...== All heap blocks were freed -- no leaks are possible
==...== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
```

Ahora introducí un error controlado para ver cómo funciona valgrind:

```c
// error.c — error intencional para entender valgrind
#include <stdlib.h>
#include <string.h>

int main(void) {
    char *buf = malloc(10);
    strcpy(buf, "hello world");  // ← writes 12 chars into 10 bytes: overflow
    free(buf);
    return 0;
}
```

```bash
gcc -g -O0 error.c -o error
valgrind ./error
```

La salida va a decirte exactamente en qué línea pasó el overflow y cómo. Eso es lo que querés: no solo saber que hay un error, sino saber dónde y cómo se produjo.

## Paso 7: compilar con sanitizers

```bash
gcc -g -O0 -fsanitize=address -fsanitize=undefined error.c -o error_asan
./error_asan
```

El runtime de AddressSanitizer detecta el overflow y para la ejecución con un mensaje detallado, mostrando el stack trace completo del punto donde ocurrió. Comparalo con el output de valgrind: son complementarios.

## Lo que registrás

Después de este recorrido, tenés algo concreto:

1. **El pipeline de compilación** en acción: preprocesamiento, compilación, ensamblado, linking.
2. **La diferencia entre `-O0` y `-O2`** en el ensamblador generado.
3. **Las syscalls que hace tu programa**: qué llamadas reales emite, en qué orden.
4. **Cómo se ve un programa en gdb**: el stack, los registros, las variables locales.
5. **Cómo detectar errores de memoria** antes de que causen problemas.
6. **Por qué el printf bufferea** y cuándo llama realmente a `write`.

## Qué no cubre L0 — y por qué

L0 es el punto de partida, no el destino. Lo que queda fuera de este nivel de forma intencional:

**Gestión manual de memoria** (`malloc`/`free` en profundidad) → **L2**. No se toca en L0 porque sin entender el heap, los patrones de ownership y los errores más comunes, solo verías funciones sin contexto. L2 arranca desde el modelo mental correcto y construye desde ahí.

**El formato ELF en detalle** (secciones, segmentos, relocations, tabla de símbolos) → **L7**. Requiere entender memoria virtual primero. Sin saber qué son las páginas y cómo el kernel las mapea, el ELF es solo un formato de archivo. Con ese contexto, el ELF es el mapa de cómo un programa vive en memoria.

**Linking en profundidad** (resolución de símbolos, tablas de reubicación, `-fPIC`, bibliotecas dinámicas) → **L7** + proyecto `mini-linker`. El proyecto implementa un linker real. Requiere ELF primero.

**Assembly en serio** (escribir, leer con propósito, ABI completa) → **L1b**. En L1b vas a analizar exactamente qué hace el compilador con código C real, entender las convenciones de llamado, y usar `gdb` a nivel de instrucción.

**Procesos y señales** (`fork`, `exec`, `kill`, ciclo de vida) → **L6**. `strace` muestra syscalls, pero qué significa cada una en el modelo de procesos de Unix requiere estudio propio. L6 incluye implementar un shell básico.

**Memoria virtual** (páginas, tablas de página, `mmap`, `brk`, ASLR) → **L7**. Ya aparece mencionada en L0 porque es imposible hablar de direcciones sin ella, pero la mecánica completa tiene su lugar natural en L7.

**Concurrencia** (threads, mutexes, variables atómicas, race conditions) → **L9 y L10**. Requiere entender procesos, memoria compartida y modelos de memoria antes de tener valor real.

**Rust** → **L3a y L3b**. En L0 solo verificás que `rustc` funciona. Rust aparece en L3 con todo el contexto necesario: la razón por la que su sistema de tipos existe, qué problemas de C resuelve, y cómo funciona ownership desde cero.

**Rendimiento profundo** (`perf` con hardware counters, cache behavior, flame graphs) → **L17**. Interpretar los números de `perf` requiere entender microarquitectura de CPU. L17 construye ese contexto.

---

El laboratorio está listo. Las herramientas están instaladas. Sabés compilar, observar, y debuggear. Lo que viene ahora son las cosas reales: memoria, procesos, syscalls, concurrencia.

Continuá con los ejercicios de este nivel y el proyecto `devcontainer-setup`. Después, seguí el mapa hacia L1a.
