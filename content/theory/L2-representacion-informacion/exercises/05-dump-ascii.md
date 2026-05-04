# Ejercicio 05 — Leer un dump ASCII

## Contexto

El [capítulo 06](../chapters/06-texto-ascii.md) mostró que un archivo de texto en disco es una secuencia de bytes, sin marca de fin de cadena, donde cada byte representa un caracter de la tabla ASCII si el contenido es texto inglés simple. Este ejercicio fija la lectura concreta de un dump producido por `xxd` sobre un archivo creado a mano.

A diferencia de los ejercicios anteriores, este es **observable**: requiere ejecutar comandos en una terminal y comparar la salida con la transcripción manual.

## Consigna

Producir el dump y la transcripción de un archivo de texto corto.

1. Crear un archivo `saludo.txt` con la cadena `"Hello, World!"` —sin newline final—. En una terminal Unix:
   ```
   echo -n "Hello, World!" > saludo.txt
   ```
2. Mirar el archivo con `xxd`:
   ```
   xxd saludo.txt
   ```
3. Anotar los 13 bytes en hex en una columna de una tabla.
4. Para cada byte, escribir al lado el caracter ASCII correspondiente, mirando la tabla del [capítulo 06](../chapters/06-texto-ascii.md). No usar la columna ASCII de `xxd` —el objetivo es hacer la traducción a mano—.
5. Comparar la columna de caracteres reconstruida con la cadena original.

## Resultado esperado

- El archivo `saludo.txt` existe en el sistema y tiene 13 bytes.
- El dump de `xxd` con 13 bytes en hex.
- Una tabla con 13 filas, cada una con un byte y su caracter ASCII reconstruido.
- La cadena reconstruida coincide con `"Hello, World!"`.

## Verificación

El dump esperado:

```text
00000000: 4865 6c6c 6f2c 2057 6f72 6c64 21          Hello, World!
```

La tabla esperada:

| Byte | Caracter |
|---|---|
| `0x48` | `H` |
| `0x65` | `e` |
| `0x6C` | `l` |
| `0x6C` | `l` |
| `0x6F` | `o` |
| `0x2C` | `,` |
| `0x20` | (espacio) |
| `0x57` | `W` |
| `0x6F` | `o` |
| `0x72` | `r` |
| `0x6C` | `l` |
| `0x64` | `d` |
| `0x21` | `!` |

Si en lugar de 13 bytes hay 14, lo más probable es que el archivo haya sido creado con `echo` sin la flag `-n`, lo que agrega un byte `0x0A` (line feed) al final. La cadena original no tiene newline; el archivo, en ese caso, sí. La diferencia es invisible en un editor de texto pero los bytes están todos.

## Criterio de finalización

Los 13 bytes del dump y los 13 caracteres de la cadena original se corresponden uno a uno, en el mismo orden. Si la transcripción manual difiere de la cadena original en alguna posición, queda registrado qué byte se leyó mal y por qué (típicamente confusión entre dígitos hex similares como `6` y `8`, o lectura de un caracter de una columna equivocada de la tabla ASCII).
