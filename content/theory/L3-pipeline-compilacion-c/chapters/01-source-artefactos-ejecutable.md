# Source, artefactos y ejecutable

## Los cinco artefactos materiales

El pipeline produce cinco artefactos en disco si se le pide a gcc que se detenga en cada etapa. Para `hello.c`, los cinco son:

```text
hello.c        # código fuente
hello.i        # preprocesado
hello.s        # assembly
hello.o        # código objeto
hello          # ejecutable
```

Cada uno se obtiene con una flag específica de gcc:

```bash
$ gcc -E hello.c -o hello.i      # solo preprocesar
$ gcc -S hello.i -o hello.s      # preprocesar (ya hecho) + compilar
$ gcc -c hello.s -o hello.o      # ensamblar
$ gcc hello.o -o hello           # link
```

Las cuatro flags principales son:

| Flag | Significado | Etapa hasta donde llega |
|---|---|---|
| `-E` | solo preprocesar | preprocesado |
| `-S` | preprocesar + compilar | compilación a assembly |
| `-c` | preprocesar + compilar + ensamblar | ensamblado |
| (ninguna) | pipeline completo | linking, produce ejecutable |

gcc es lo suficientemente flexible como para aceptar cualquiera de los cinco artefactos como entrada y arrancar el pipeline desde el punto que corresponda. Pasarle un `.s` saltea preprocesado y compilación; pasarle un `.o` salta directamente al linker. Esto permite cortar la cadena en cualquier punto y reanudarla más tarde.

## Qué se puede inspeccionar en cada uno

Cada artefacto tiene un formato y una herramienta canónica para mirarlo. La primera y más simple es `file`, que lee un archivo y dice qué tipo cree que es:

```text
$ gcc -E hello.c -o hello.i
$ gcc -S hello.c -o hello.s
$ gcc -c hello.c -o hello.o
$ gcc hello.c -o hello
$ file hello.c hello.i hello.s hello.o hello
hello.c: C source, ASCII text
hello.i: C source, ASCII text
hello.s: assembler source, ASCII text
hello.o: ELF 64-bit LSB relocatable, x86-64, version 1 (SYSV), not stripped
hello:   ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, ...
```

Los tres primeros son texto: el `.c` y el `.i` son C válido (el `.i` es C ya preprocesado), el `.s` es assembly. Los dos últimos son binarios ELF —el formato de archivos objeto y ejecutables en Linux—, con tipos distintos: el `.o` es *relocatable* (todavía no ejecutable), el ejecutable final es *pie executable* (Position Independent Executable, listo para correr).

Para los archivos de texto, las herramientas son las del shell: `cat`, `head`, `tail`, `wc -l`, un editor. Para los binarios hay herramientas específicas:

| Herramienta | Para qué sirve | Cuándo usarla |
|---|---|---|
| `file` | identificar el tipo del artefacto | confirmar qué hay en un archivo |
| `nm` | listar la tabla de símbolos | ver qué define y qué referencia un `.o` o un ejecutable |
| `objdump -h` | listar secciones | ver `.text`, `.data`, etc. |
| `objdump -d` | desensamblar la sección de código | ver el assembly que quedó en el binario |
| `readelf -a` | volcar todo lo que ELF puede contener | inspección detallada |
| `ldd` | listar dependencias dinámicas | solo aplicable a ejecutables y bibliotecas dinámicas |

En este capítulo solo se introducen los nombres. Cada herramienta vuelve a aparecer en el capítulo del artefacto que ayuda a inspeccionar.

La especialización de las herramientas, vista de cerca, no es accidental: es la misma forma que tiene el pipeline. `nm` no abre un `.c` ni un `.s`; `ldd` no entiende un `.o`; `objdump -d` no sabe nada de `#include` ni de macros. Cada cual hace una sola cosa sobre un solo formato. Esa división del trabajo entre herramientas es el reflejo, hacia el lado del diagnóstico, de la división del trabajo que ya hay entre etapas: cada etapa transforma un formato en el siguiente y nadie hace dos etapas a la vez.

## Cuál sirve para qué pregunta

Los cinco artefactos no son intercambiables: cada uno responde a una pregunta distinta sobre el programa. La tabla siguiente lista preguntas típicas y el artefacto que tiene la respuesta:

| Pregunta | Artefacto que la responde |
|---|---|
| "¿qué incluyó realmente este `#include`?" | `.i` |
| "¿qué assembly generó el compilador para esta función?" | `.s` |
| "¿qué símbolos define y qué necesita este archivo objeto?" | `.o` |
| "¿qué bibliotecas dinámicas necesita el binario final?" | ejecutable |
| "¿en qué dirección virtual quedó la sección `.text`?" | ejecutable |
| "¿con qué optimización se compiló esto?" | `.s` (visualmente) o ejecutable (con `objdump`) |

La pregunta dirige el artefacto. Buscar bibliotecas dinámicas en un `.o` no tiene sentido: el `.o` no las conoce todavía. Buscar el assembly generado en el ejecutable es posible —con `objdump -d`— pero pasa por una capa más; el `.s` lo muestra directamente. Buscar `#include` expandidos en el `.s` es buscar en el lugar equivocado: ya no hay rastro de los includes, eso es preprocesado.

## Herramientas básicas de inspección por artefacto

Para fijar la rutina, cinco comandos sobre los cinco artefactos del programa `hello`:

```text
$ wc -l hello.c hello.i hello.s
   8 hello.c
 743 hello.i
  37 hello.s
$ file hello.o
hello.o: ELF 64-bit LSB relocatable, x86-64, version 1 (SYSV), not stripped
$ nm hello.o
0000000000000000 T main
                 U puts
$ ldd hello
        linux-vdso.so.1 (0x00007ffd...)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f...)
        /lib64/ld-linux-x86-64.so.2 (0x00007f...)
```

Cada salida dice algo distinto:

- `wc -l` muestra el explosión de tamaño del `.c` al `.i` —8 a 743 líneas, casi 100×—, que es consecuencia del `#include <stdio.h>`. El `.s` queda chico porque el compilador descarta lo que no usa.
- `file hello.o` confirma que es un objeto relocatable, no ejecutable.
- `nm hello.o` muestra dos símbolos: `main` definido (T) y `puts` referenciado pero no definido (U). El `puts` lo va a aportar el linker desde `libc`.
- `ldd hello` muestra que el ejecutable depende de `libc.so.6` —donde vive `puts`— y del dynamic linker `ld-linux-x86-64.so.2`.

Las cifras concretas pueden variar según la distribución y la versión de gcc, pero las relaciones cualitativas se mantienen: el `.i` es órdenes de magnitud más grande que el `.c`, el `.o` no tiene `puts` definido, el ejecutable depende de `libc`.

## Por qué hablar de "el programa" no alcanza

En conversaciones de debugging, "el programa" se usa indistintamente para el `.c`, el `.o`, el ejecutable y el proceso vivo. Mientras todo funciona, la ambigüedad no daña; cuando hay que diagnosticar, daña.

Tres ejemplos concretos donde la distinción importa:

- *"El programa no compila."* Con cuatro etapas, esto puede significar al menos cuatro cosas distintas. Saber **qué artefacto fue el último que sí se produjo** es el primer paso del diagnóstico.
- *"El programa tiene `printf`."* El `.c` lo llama, el `.o` lo referencia (símbolo `U`), el ejecutable lo tiene resuelto contra `libc.so.6`. Las tres frases son verdaderas pero hablan de cosas distintas: una llamada en el código, un símbolo no resuelto, una dependencia de biblioteca.
- *"El programa cambia de tamaño con `-O2`."* El `.s` cambia, el `.o` cambia, el ejecutable cambia. El `.c` no cambia. La pregunta "¿cuánto cambia?" requiere especificar de qué artefacto se habla.

A partir del próximo capítulo, cuando se hable del programa se va a especificar el artefacto. Esta disciplina chica es la que vuelve diagnosticables los errores que suelen sentirse mágicos.
