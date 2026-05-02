# Ejercicios — L0

Todos los ejercicios son accionables: un comando a ejecutar, una salida a verificar, un error a provocar intencionalmente, o una opción correcta a identificar. La respuesta siempre es observable, no redactable.

---

## Serie A — Pipeline de compilación

**A1.** Compilá `src/hello.c` con tres configuraciones y comparaá los tamaños:

```bash
gcc src/hello.c -o a1_bare
gcc -g src/hello.c -o a1_debug
gcc -O2 src/hello.c -o a1_opt
ls -la a1_bare a1_debug a1_opt
```

¿Cuál es el más grande? ¿Cuántos bytes agrega `-g` respecto de la versión sin flags?

---

**A2.** Generá assembly en ambos modos y contá las líneas:

```bash
gcc -S -O0 src/hello.c -o hello_O0.s
gcc -S -O2 src/hello.c -o hello_O2.s
wc -l hello_O0.s hello_O2.s
```

Abrí `hello_O0.s` y encontrá la instrucción `call`. ¿A qué función llama?

---

**A3.** Opción múltiple: ¿qué flag detiene la compilación en la etapa de objeto (`.o`) sin producir ejecutable?

```
a) -S
b) -E
c) -c   ← CORRECTO
d) -g
```

Comprobalo:

```bash
gcc -c src/hello.c -o hello.o
file hello.o
# debe decir: ELF 64-bit relocatable, no "executable"
```

---

**A4.** Ejecutá el preprocesador y mirá el resultado:

```bash
gcc -E src/hello.c -o hello.i
wc -l hello.i
head -5 hello.i
```

El archivo tiene muchas más líneas que el fuente. Abrí `hello.i` y buscá el bloque de `<stdio.h>`. ¿Cuántas líneas ocupa solo ese header?

---

## Serie B — strace

**B1.** Filtrá solo las syscalls de escritura:

```bash
gcc src/hello.c -o hello_b
strace ./hello_b 2>&1 | grep write
```

¿Qué número aparece como primer argumento de `write(...)`? Ese número es el file descriptor de stdout.

---

**B2.** Opción múltiple: ¿cuál es siempre la primera syscall en la salida de `strace`?

```
a) open("/lib/libc.so", ...)
b) execve("./programa", ...)   ← CORRECTO
c) read(0, ...)
d) mmap(NULL, ...)
```

Comprobalo: `strace ./hello_b 2>&1 | head -1`

---

**B3.** Compará el total de syscalls entre dos versiones del programa:

```bash
strace -c ./hello_b 2>&1
```

Copiá `src/hello.c` a `hello2.c`, agregá un segundo `printf("Segunda línea\n");`, compilá y medí de nuevo:

```bash
gcc hello2.c -o hello2
strace -c ./hello2 2>&1
```

¿Cambió el conteo de `write`? ¿Cambió el de `execve`?

---

**B4.** Mirá qué archivos abre tu programa al arrancar:

```bash
strace -e trace=openat ./hello_b 2>&1 | head -20
```

Contá cuántas aperturas ocurren antes de llegar al `write`. ¿Qué está haciendo el sistema en esas líneas?

---

## Serie C — gdb

**C1.** Compilá con debug info y ejecutá esta secuencia exacta en gdb:

```bash
gcc -g -O0 src/hello.c -o hello_dbg
gdb ./hello_dbg
```

Dentro de gdb:
```gdb
break main
run
print __argc
print __argv[0]
next
continue
quit
```

Anotá qué imprimió cada `print`. `__argc` debe ser `1`; `__argv[0]` debe mostrar la ruta del ejecutable.

---

**C2.** Opción múltiple: ¿qué comando de gdb muestra la cadena de funciones que llevó hasta el punto actual?

```
a) info locals
b) list
c) backtrace   ← CORRECTO
d) print $rsp
```

---

**C3.** Compilá este programa con un crash intencional y usá gdb para localizar la línea exacta:

```c
/* crash.c */
#include <stdio.h>
int main(void) {
    int *p = 0;          /* null pointer */
    printf("%d\n", *p);  /* dereference → crash */
    return 0;
}
```

```bash
gcc -g -O0 crash.c -o crash
gdb ./crash
```

Dentro de gdb: `run` → `backtrace`. ¿En qué línea ocurre el crash?

---

**C4.** Compilá `src/hello.c` con `-O2` (sin `-g`) e intentá debuggear:

```bash
gcc -O2 src/hello.c -o hello_opt
gdb ./hello_opt
```

```gdb
break main
run
list
```

¿Qué dice gdb cuando intentás ver el fuente con `list`? ¿Por qué?

---

## Serie D — valgrind y sanitizers

**D1.** Introducí dos errores clásicos y observá cómo los detecta valgrind:

```c
/* bugs.c */
#include <stdlib.h>
int main(void) {
    int *arr = malloc(sizeof(int) * 10);
    arr[10] = 99;    /* out-of-bounds: índice 10 en array de 10 */
    /* falta free(arr) */
    return 0;
}
```

```bash
gcc -g -O0 bugs.c -o bugs
valgrind --leak-check=full ./bugs 2>&1
```

En la salida identificá:
- La línea que dice `Invalid write of size 4`
- La sección `definitely lost: N bytes`

¿Cuántos bytes se perdieron?

---

**D2.** Compilá el mismo `bugs.c` con AddressSanitizer y compará outputs:

```bash
gcc -g -O0 -fsanitize=address bugs.c -o bugs_asan
./bugs_asan
```

¿Cuál de las dos herramientas muestra el stack trace más completo para el out-of-bounds?

---

**D3.** Opción múltiple: ¿qué flag detecta overflow de enteros con signo (`INT_MAX + 1`)?

```
a) -fsanitize=address
b) -fsanitize=undefined   ← CORRECTO
c) -fsanitize=thread
d) -fstack-protector
```

Comprobalo:

```c
/* overflow.c */
#include <limits.h>
#include <stdio.h>
int main(void) {
    int x = INT_MAX;
    printf("%d\n", x + 1);   /* undefined behavior */
    return 0;
}
```

```bash
gcc -g -O0 -fsanitize=undefined overflow.c -o overflow
./overflow
# debe imprimir advertencia de UBSan
```

---

**D4.** Compará con y sin sanitizer:

```bash
gcc -g -O0 overflow.c -o overflow_plain
./overflow_plain
./overflow
```

¿Los valores impresos son distintos? ¿Cuál es más confiable?

---

## Serie E — Rust en el laboratorio

**E1.** Compilá `src/hello.rs` y verificá la syscall que usa:

```bash
rustc src/hello.rs -o hello_rust
./hello_rust
strace ./hello_rust 2>&1 | grep write
```

¿Usa la misma syscall `write` que el programa en C?

---

**E2.** Compará las dependencias dinámicas:

```bash
ldd ./hello_b
ldd ./hello_rust
```

¿Cuál de los dos enlaza `libc.so`? ¿El otro enlaza alguna biblioteca de Rust?

---

**E3.** Medí el tiempo de ejecución de ambos:

```bash
time ./hello_b
time ./hello_rust
```

¿Qué mide `real`? ¿Qué mide `user`? Para un programa tan simple, ¿qué domina el tiempo total?

---

## Criterio de salida

Completaste L0 cuando podés ejecutar cada uno de estos comandos y predecir el resultado antes de verlo.
