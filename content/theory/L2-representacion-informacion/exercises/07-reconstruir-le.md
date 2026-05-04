# Ejercicio 07 — Reconstruir un entero LE desde un dump

## Contexto

El [capítulo 08](../chapters/08-endianness.md) mostró que en una arquitectura little-endian un entero multibyte aparece en memoria con los bytes en orden inverso a su escritura en hex: el byte menos significativo primero, el más significativo último. Reconstruir el valor a partir de un dump requiere invertir el orden de los bytes mentalmente.

Este ejercicio aplica esa reconstrucción sobre un valor producido por un programa C real, usando el toolchain del laboratorio del repositorio.

## Consigna

1. Escribir un programa C corto que declare un `uint32_t` con un valor conocido y vuelque sus 4 bytes en orden de memoria. Por ejemplo:
   ```c
   #include <stdint.h>
   #include <stdio.h>

   int main(void) {
       uint32_t x = 0xDEADBEEF;
       unsigned char *p = (unsigned char*)&x;
       for (int i = 0; i < 4; i++) printf("%02x ", p[i]);
       printf("\n");
       return 0;
   }
   ```
2. Compilar y ejecutar. La salida en una máquina little-endian (x86-64, ARM en modo común) son cuatro bytes en hex.
3. Anotar los cuatro bytes en orden de memoria (tal como los imprime el programa).
4. Reconstruir el valor original a partir del dump, **invirtiendo el orden** y combinando los cuatro bytes en un único valor de 32 bits.
5. Comparar con el valor original `0xDEADBEEF`.

## Resultado esperado

- El programa compila y ejecuta sin errores.
- La salida es una línea con cuatro bytes hex separados por espacios.
- La reconstrucción a partir de los bytes da exactamente `0xDEADBEEF`.

## Verificación

La salida esperada en una máquina little-endian:

```
ef be ad de
```

Reconstrucción:

| Byte en memoria | Posición en el valor | Hex parcial |
|---|---|---|
| `0xEF` | byte 0 (menos significativo) | `0x000000EF` |
| `0xBE` | byte 1 | `0x0000BE00` |
| `0xAD` | byte 2 | `0x00AD0000` |
| `0xDE` | byte 3 (más significativo) | `0xDE000000` |

Suma: `0xDE000000 + 0x00AD0000 + 0x0000BE00 + 0x000000EF = 0xDEADBEEF`. Coincide con el valor original.

Equivalente operativo: leer el dump al revés ("ef be ad de" → "de ad be ef") y agregar el prefijo `0x` da directamente `0xDEADBEEF`. La operación es la misma; cambia el camino mental.

Si la reconstrucción no da `0xDEADBEEF`, los errores típicos son: leer los bytes en el orden en que aparecen sin invertir (eso da `0xEFBEADDE`, que es un valor distinto) o invertir solo los nibbles de cada byte en lugar de los bytes (eso produce un valor sin relación con el original).

Si la salida del programa no es `ef be ad de` sino `de ad be ef`, la máquina podría estar configurada en big-endian, lo cual es inusual en hardware moderno pero posible en algunos servidores SPARC o en emuladores. En ese caso el programa funciona pero la reconstrucción es directa, sin invertir.

## Criterio de finalización

El programa fue compilado y ejecutado, la salida está anotada, la reconstrucción se hizo a mano, y el valor resultante coincide con `0xDEADBEEF`. Si hubo discrepancia, queda registrado el error: orden de bytes, agrupación, o endianness de la máquina.
