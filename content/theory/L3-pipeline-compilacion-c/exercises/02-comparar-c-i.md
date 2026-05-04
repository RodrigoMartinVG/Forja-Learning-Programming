# Ejercicio 02 — Comparar `.c` y `.i`

## Contexto

El preprocesador es la primera etapa del pipeline y su trabajo es manipulación textual: `#include` pega archivos, `#define` reemplaza nombres, `#ifdef` filtra líneas. El `.i` es el resultado: C válido sin directivas. Comparar `.c` con `.i` muestra de manera concreta cuánto trabajo hace el preprocesador.

## Consigna

Sobre [`src/hello/hello.c`](../src/hello/hello.c):

1. Medir la longitud en líneas del `.c` y del `.i`.
2. Identificar tres declaraciones (de funciones, de tipos o de macros) que aparecen en el `.i` y que provienen de `<stdio.h>`.
3. Confirmar que la macro `GREETING` ya no aparece en el `.i`.

## Resultado esperado

```text
$ gcc -E hello.c -o hello.i
$ wc -l hello.c hello.i
   8 hello.c
 743 hello.i
 751 total
```

(El número exacto depende de la versión de glibc; lo importante es que el `.i` es órdenes de magnitud más grande.)

Para encontrar declaraciones de `<stdio.h>`, basta `grep`:

```text
$ grep -n "puts\|printf\|FILE" hello.i | head
```

Tres ejemplos típicos que aparecen:

- `extern int puts (const char *__s);`
- `extern int printf (const char *__restrict __format, ...);`
- `typedef struct _IO_FILE FILE;`

Para confirmar que `GREETING` desapareció:

```text
$ grep GREETING hello.i
$
```

(Sin salida.) En cambio, la cadena literal aparece donde estaba la macro:

```text
$ grep "hola, pipeline" hello.i
    puts("hola, pipeline");
```

## Verificación

Las tres comprobaciones:

- `wc -l` reporta dos longitudes muy distintas (típicamente 100×).
- `grep` encuentra al menos tres declaraciones de `<stdio.h>` en el `.i`.
- `grep GREETING hello.i` no devuelve nada, pero `grep "hola, pipeline" hello.i` sí.

## Criterio de finalización

Se completó cuando se puede explicar por qué el `.i` es tanto más largo que el `.c`, y se puede señalar concretamente qué partes del `.i` vinieron del header y cuáles de la macro.

## Error que detecta

Creer que el preprocesador "solo saca comentarios" o "solo procesa los `#include`". El ejercicio muestra que el `#include <stdio.h>` puede traer cientos de líneas de declaraciones, y que `#define` desaparece dejando rastro únicamente en el reemplazo.
