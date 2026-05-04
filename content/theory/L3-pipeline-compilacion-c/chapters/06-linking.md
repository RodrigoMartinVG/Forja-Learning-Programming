# Linking

## Lo que recibe y lo que produce el linker

La cuarta etapa del pipeline es el **linking**. Su trabajo es tomar uno o varios archivos objeto, opcionalmente bibliotecas, y producir un único artefacto consolidado: un ejecutable, una biblioteca estática, o una biblioteca dinámica. El linker en Linux se llama `ld` y forma parte de las **binutils**; gcc lo invoca automáticamente cuando se ejecuta sin las flags `-E`/`-S`/`-c`.

Lo que el linker recibe:

- Una lista de **archivos objeto** (`.o`) producidos por etapas anteriores.
- Opcionalmente, una lista de **bibliotecas** (`.a` estáticas, `.so` dinámicas) donde buscar definiciones para símbolos no resueltos.
- Una lista de **flags** que controlan el tipo de salida, el orden de búsqueda, las direcciones base, y otros parámetros.

Lo que produce:

- Un **ejecutable** ELF con todas las referencias resueltas y un punto de entrada definido.
- O una **biblioteca estática** (`.a`): un archivo de archivos `.o` empaquetados, listo para que otros linkings la usen como repositorio de definiciones.
- O una **biblioteca dinámica** (`.so`): un ELF parecido a un ejecutable pero pensado para ser cargado dinámicamente, no ejecutado directamente.

Las tres salidas comparten el mismo proceso central —combinar secciones, resolver referencias, asignar direcciones— pero difieren en qué tan resueltas quedan las referencias y qué metadata adicional incluyen. Este capítulo se concentra en el caso del ejecutable; las bibliotecas tienen su capítulo dedicado.

## Combinación de secciones de varios `.o`

El primer paso del linker es **combinar las secciones equivalentes** de todos los `.o` en una sección única por tipo. Si tres `.o` tienen `.text`, el ejecutable resultante tiene una sola `.text` que contiene la concatenación de las tres. Lo mismo con `.data`, `.rodata`, `.bss`. Las direcciones internas se ajustan para que todo encaje en un único espacio de direcciones.

Para [`src/split/`](../src/split/) con dos `.o`:

```
main.o:
  .text  (contiene main, 0x18 bytes)
  .rodata (vacía)

greet.o:
  .text  (contiene greet, 0x10 bytes)
  .rodata (contiene "hola desde greet.c", 0x13 bytes)
```

El linker produce un ejecutable cuya `.text` tiene aproximadamente `0x18 + 0x10 = 0x28` bytes (más el código de arranque que gcc agrega), con `main` en una zona y `greet` en otra. La `.rodata` del ejecutable contiene la cadena de greet. Las direcciones que en los `.o` valían cero pasan a ser direcciones reales dentro del ejecutable.

## Resolución de referencias

El segundo paso es la parte central: **resolver cada referencia `U`** mirando las definiciones disponibles. El procedimiento, para cada símbolo `U` en cada `.o`:

1. Buscar una definición global (`T`, `D`, `R`, `B`) en alguno de los otros `.o` recibidos.
2. Si no hay, buscar en las bibliotecas listadas (en orden).
3. Si tampoco, fallar con `undefined reference`.

Cuando una referencia se resuelve, el linker hace dos cosas:

- **Llena el hueco** que la referencia había dejado en `.text` (o donde sea) con la dirección final del símbolo.
- **Aplica las relocations**: ajustes específicos al tipo de instrucción que estaba apelando al símbolo. En x86-64, una llamada `call` cercana usa un offset de 32 bits relativo al `pc`; una referencia a un dato puede usar `RIP-relative addressing`. Cada caso tiene su patrón de patch.

El detalle de cada tipo de relocation es contenido de `L4`. En este nivel basta saber que después del linking, **todas las referencias `U` que se podían resolver están resueltas**, y los huecos de `.text` están llenos.

Para el split:

```
$ gcc -c main.c -o main.o
$ gcc -c greet.c -o greet.o
$ gcc main.o greet.o -o app
$ nm app | head -20
```

Comparando con `nm main.o` (donde `greet` y `puts` aparecían como `U`), en el ejecutable `app` esos símbolos ya no son `U`: `greet` se resolvió contra `greet.o` y aparece como `T`; `puts` se resolvió contra `libc` y aparece —según la versión de gcc— como símbolo de la biblioteca dinámica, marcado `U` con un punto de carga distinto, o resuelto por la PLT.

## Asignación de direcciones

El tercer paso es **asignar direcciones definitivas** a cada símbolo y a cada relocation. En un ejecutable Linux moderno, el punto de partida típico es una dirección virtual que el dynamic linker más tarde puede ajustar (PIE, *Position Independent Executable*), pero las relaciones internas entre símbolos quedan fijas.

El comando `nm` aplicado al ejecutable muestra las direcciones finales:

```
$ nm app | grep -E 'main|greet'
0000000000001140 T main
0000000000001168 T greet
```

Las direcciones son ahora del orden de los `0x1000`+, que es donde Linux carga las secciones de código. La función `main` quedó en 0x1140; `greet` en 0x1168 (40 bytes después). El offset entre ambas es la suma del cuerpo de `main` más cualquier padding que el linker haya introducido para alineamiento.

Una propiedad importante: las direcciones del ejecutable se asignan **una sola vez**. Distintos linkings del mismo programa pueden producir direcciones distintas (porque el linker tiene libertad para reordenar), pero dentro de un mismo ejecutable las direcciones son fijas. Cuando el sistema operativo carga el proceso, puede ajustar todas las direcciones en bloque (con un offset constante, gracias a PIE), pero las posiciones relativas no cambian.

## Errores típicos y a qué corresponde cada uno

Los errores del linker tienen una estructura reconocible. Los más comunes:

- **`undefined reference to 'foo'`**: una referencia `U` no encontró definición. Causas típicas: olvidar pasarle al linker un `.o` que la define; nombre mal escrito (typo); función declarada pero nunca implementada; falta de una flag `-l` para linkear contra una biblioteca.
- **`multiple definition of 'foo'`**: dos `.o` definen el mismo símbolo global. Causas típicas: una variable global declarada en un header sin `extern` y por eso definida en cada `.c` que incluye el header; dos archivos que copian-y-pegan la misma función sin coordinarse.
- **`relocation R_X86_64_PC32 against ... can not be used`**: una relocation no aplica al modo de salida elegido. Suele aparecer al intentar producir una biblioteca dinámica con un `.o` compilado sin `-fPIC`. Pertenece a casos de `L4`.
- **`cannot find -lfoo`**: el linker no encontró la biblioteca `libfoo.{a,so}` en los directorios de búsqueda. Causa típica: la biblioteca no está instalada, o falta una flag `-L` con su directorio.

El primer y el segundo error son los más comunes y son exactamente los dos extremos del cruce de símbolos: el primero, no hay definición para una referencia; el segundo, hay demasiadas definiciones para un símbolo. Diagnosticarlos con `nm` sobre cada `.o` involucrado suele resolverlos en pocos pasos.

## Inspeccionar el ejecutable resultante

Para confirmar que el linking se hizo bien, las herramientas son las mismas del `.o` con dos agregadas: `ldd` (para dependencias dinámicas, que se trata en el capítulo siguiente) y la capacidad de **ejecutar** el archivo:

```
$ file app
app: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, ...
$ ./app
hola desde greet.c
$ nm app | grep main
0000000000001140 T main
$ nm app | grep greet
0000000000001168 T greet
$ ldd app
        linux-vdso.so.1 (...)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (...)
        /lib64/ld-linux-x86-64.so.2 (...)
```

Cuatro confirmaciones:

- `file` reporta `pie executable`, no `relocatable`: el archivo es ejecutable.
- Ejecutarlo produce la salida esperada.
- `main` y `greet` están en direcciones definitivas, ambas en `.text`.
- `ldd` muestra que `libc.so.6` es una dependencia: el `puts` se resolvió contra esa biblioteca, y se va a cargar al ejecutar.

## Linker como integrador, no como compilador

Una confusión frecuente es tratar al linker como "una etapa más del compilador". Funcionalmente es diferente: el compilador produce código a partir de C; el linker no produce ningún byte de código nuevo. Lo que el linker hace es **combinar y referenciar** bytes ya existentes. Si una función contiene un bug, el compilador es el responsable; el linker no puede corregirla porque no la entiende. Si dos `.o` definen el mismo símbolo, el linker reporta el problema pero no lo arregla.

La consecuencia práctica es que muchos errores del linker no se solucionan tocando código C: se solucionan tocando **cómo se invoca el linker** (qué `.o` se pasan, en qué orden, contra qué bibliotecas) o **cómo se organizan los símbolos en los archivos** (qué es global, qué es `static`, qué se declara en headers vs en `.c`). Esos son problemas de **organización**, no de **lógica del programa**.

A partir del próximo capítulo, el foco se desplaza al modo en que las bibliotecas externas —`libc` y otras— participan del linking, y al contraste entre incorporarlas estáticamente al ejecutable o dejarlas como dependencias dinámicas que se resuelven al cargar el proceso.
