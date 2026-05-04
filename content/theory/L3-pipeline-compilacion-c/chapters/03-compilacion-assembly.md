# Compilación a assembly

## Del C al assembly como traducción

La segunda etapa del pipeline es la **compilación** propiamente dicha. Su trabajo es traducir el código C ya preprocesado a **assembly**: un lenguaje específico de la arquitectura del procesador, con una instrucción simbólica por cada operación que el procesador puede ejecutar. En una máquina x86-64 común, el assembly que produce gcc es x86-64 en sintaxis AT&T (o Intel, según la flag `-masm=`). En una máquina ARM, sería assembly ARM. La salida depende del procesador para el cual se compila.

A diferencia del preprocesado, esta etapa **sí entiende C**: chequea sintaxis, tipos, llamadas a funciones, declaraciones. Casi todos los errores que se asocian con "el compilador" —"variable no declarada", "tipos incompatibles", "función no toma esos argumentos"— se generan acá.

La flag `-S` le dice a gcc que se detenga después de esta etapa y deje el `.s` en disco:

```text
$ gcc -S hello.c -o hello.s
$ wc -l hello.s
37 hello.s
```

Treinta y siete líneas para un programa de ocho. El `.s` es texto, así que se puede mirar con `cat`:

```bash
$ cat hello.s
```

```asm
        .file   "hello.c"
        .text
        .section        .rodata
.LC0:
        .string "hola, pipeline"
        .text
        .globl  main
        .type   main, @function
main:
.LFB0:
        .cfi_startproc
        endbr64
        pushq   %rbp
        .cfi_def_cfa_offset 16
        .cfi_offset 6, -16
        movq    %rsp, %rbp
        .cfi_def_cfa_offset 16
        leaq    .LC0(%rip), %rax
        movq    %rax, %rdi
        call    puts@PLT
        movl    $0, %eax
        popq    %rbp
        .cfi_def_cfa_offset 8
        ret
        .cfi_endproc
.LFE0:
        .size   main, .-main
        .ident  "GCC: ..."
        .section        .note.GNU-stack,"",@progbits
```

(La salida exacta depende de la versión de gcc y de la arquitectura; lo de arriba es representativo de gcc reciente sobre x86-64 Linux con `-O0`.)

Este capítulo no busca enseñar a leer assembly —eso es trabajo de `L7`—. Lo que busca es que el `.s` deje de ser un archivo opaco y pase a ser un artefacto reconocible por su estructura.

## El `.s` como texto inspeccionable

Lo primero a reconocer son las **secciones**. Las líneas que empiezan con `.section` o con `.text`, `.data`, `.rodata` declaran zonas distintas del archivo:

- `.text`: el código ejecutable.
- `.rodata`: datos de solo lectura. Las cadenas literales como `"hola, pipeline"` viven acá.
- `.data`: datos modificables con valor inicial.
- `.bss`: datos modificables sin valor inicial (se inicializan en cero).

Estas secciones reaparecen en el `.o` y en el ejecutable, en su forma binaria. En el `.s` están declaradas en texto, lo que permite verlas sin herramientas especiales.

Lo segundo son las **etiquetas**. Cualquier línea que termina en `:` es una etiqueta: un nombre simbólico para una posición. En el ejemplo:

- `main:` es la etiqueta de la función `main`. Cuando el linker tenga que encontrar `main`, va a buscar esta etiqueta.
- `.LC0:` es una etiqueta interna del compilador (las que empiezan con `.L` son locales al archivo). Marca el inicio de la cadena `"hola, pipeline"` en `.rodata`.
- `.LFB0`, `.LFE0` (function begin / function end) son etiquetas que el compilador usa para producir información de debug. No afectan el programa.

Lo tercero son las **directivas del ensamblador**: líneas que empiezan con `.` y no son etiquetas. Estas no son instrucciones del procesador; son órdenes para el ensamblador (la etapa siguiente del pipeline). Algunas comunes:

- `.globl main`: la etiqueta `main` debe ser visible desde afuera de este archivo. Equivale a marcarla como exportada para el linker.
- `.string "hola, pipeline"`: define una cadena terminada en cero en el lugar donde aparece.
- `.cfi_*`: directivas para producir información de unwinding (necesaria para excepciones y stack traces).
- `.size`, `.type`: declaran propiedades del símbolo para que el `.o` las contenga.

Lo cuarto, en el medio de las directivas y etiquetas, son las **instrucciones de máquina** propiamente dichas: `pushq`, `movq`, `leaq`, `call`, `popq`, `ret`. Cada una corresponde a una operación del procesador. Lo que hace cada una es contenido de `L7`; lo que importa acá es reconocer que el bloque entre `main:` y `ret` es **el cuerpo de la función `main` traducido a operaciones del procesador**.

## Lo que reconocemos sin saber assembly todavía

Sin entrar a interpretar instrucciones individuales, hay varias cosas que se pueden leer del `.s`:

- **Qué funciones definidas hay en el archivo**: cada `nombre:` precedido por `.globl` o `.type ... @function` es una función exportada. En `hello.s`, una sola: `main`.
- **Qué funciones se llaman desde afuera**: cada `call X@PLT` o `call X` es una llamada. Si la función `X` no está definida en este `.s`, va a quedar como referencia a resolver. En `hello.s`: `puts@PLT` (el `@PLT` indica que la llamada pasa por la *Procedure Linkage Table*, mecanismo de bibliotecas dinámicas; aparece detallado en `L4`).
- **Qué constantes literales aparecen**: las cadenas en `.rodata` con `.string`, los números enteros con `.long` o `.quad`. En `hello.s`: una sola cadena, `"hola, pipeline"`.
- **Cuántas líneas de instrucciones tiene la función**: contar las líneas del cuerpo entre etiqueta inicial y `ret` da una medida de complejidad. Para `main` con `-O0`, son alrededor de 8 instrucciones; con `-O2`, suelen ser menos.

Estos cuatro puntos son suficientes para hacer comparaciones útiles entre dos `.s` distintos —del mismo `.c` con flags distintas, o de dos `.c` parecidos— sin tener que entender qué hace cada instrucción.

## El efecto visible del nivel de optimización

Las flags de optimización son `-O0` (sin optimización), `-O1`, `-O2` y `-O3` (cada vez más agresivas). El compilador, dependiendo de la flag, elige distintas estrategias para traducir C a assembly: `-O0` produce código directo y verboso, fácil de relacionar con el C original; `-O2` produce código más compacto y rápido pero menos legible.

Una comparación sobre `hello.c`:

```text
$ gcc -S -O0 hello.c -o hello-O0.s
$ gcc -S -O2 hello.c -o hello-O2.s
$ wc -l hello-O0.s hello-O2.s
  37 hello-O0.s
  31 hello-O2.s
```

La diferencia es chica para un programa tan simple, pero para programas más grandes la disparidad crece. En programas con loops y aritmética, `-O2` puede producir un `.s` la mitad de largo que el de `-O0`, con instrucciones que reordenan o elimina cálculos completos. La traducción sigue siendo "del mismo C", pero el cuerpo concreto cambia significativamente.

Una consecuencia importante: **dos compilaciones de un mismo `.c` con flags distintas no son intercambiables**. El `.s` cambia, el `.o` cambia (y su tamaño), el ejecutable cambia (y a veces su comportamiento observable, en programas con código inválido como undefined behavior que `-O2` puede ejecutar de manera distinta a `-O0`). La regla operativa: cuando se reporta un bug, indicar las flags con las que se compiló. Sin ese dato, el bug puede no reproducirse.

## Lo que se posterga al nivel de assembly

Lo que `L3` deliberadamente no hace es enseñar a leer assembly en serio. Las preguntas tipo *"¿qué hace `leaq .LC0(%rip), %rax`?"* o *"¿por qué hay un `pushq %rbp` al principio?"* son legítimas pero pertenecen a `L7`. En este nivel el `.s` se mira **estructuralmente**: secciones, etiquetas, llamadas externas, tamaño relativo. Eso alcanza para diagnosticar problemas de pipeline.

Tres ejemplos de cosas que `L3` no resuelve y `L7` sí:

- *"¿en qué registro pasa `puts` su argumento?"* La respuesta es la convención de llamada del System V AMD64 ABI (`%rdi` para el primer entero o puntero), pero su justificación pertenece a la alfabetización de assembly real.
- *"¿qué hace el `endbr64` que aparece arriba?"* Es una instrucción para protección de control flow integrity (CET). Parte del ABI moderno, contenido detallado de `L7`.
- *"¿qué cambia exactamente entre `-O0` y `-O2` para esta función?"* Comparar las dos versiones línea por línea requiere leer instrucciones, no solo contarlas. `L3` deja la comparación cualitativa; `L7` la hace cuantitativa.

Lo que sí queda instalado al cierre del capítulo es: el `.s` es un artefacto **legible** —no una caja negra—, su estructura es **reconocible** sin entender cada instrucción, y comparar dos `.s` del mismo `.c` con flags distintas es una operación **observable** que permite responder preguntas sobre el efecto de las flags.
