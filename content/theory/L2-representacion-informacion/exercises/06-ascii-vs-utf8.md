# Ejercicio 06 — Distinguir bytes ASCII de bytes UTF-8 multibyte

## Contexto

El [capítulo 07](../chapters/07-utf8.md) mostró que en UTF-8 los caracteres no-ASCII ocupan más de un byte, y que los bits altos de cada byte señalan su rol: ASCII puro (`0xxxxxxx`), inicio de 2/3/4 bytes (`110xxxxx`/`1110xxxx`/`11110xxx`), o continuación (`10xxxxxx`).

Este ejercicio entrena la lectura de esos bits de cabecera sobre un dump real, separando una cadena UTF-8 en sus caracteres componentes.

## Consigna

El siguiente dump corresponde al archivo `mixto.txt`, generado con:

```
echo -n "Café €1" > mixto.txt
xxd mixto.txt
```

Salida:

```
00000000: 4361 66c3 a920 e282 ac31                 Caf...€1
```

Los nueve bytes en orden:

| Posición | Byte |
|---|---|
| 0 | `0x43` |
| 1 | `0x61` |
| 2 | `0x66` |
| 3 | `0xC3` |
| 4 | `0xA9` |
| 5 | `0x20` |
| 6 | `0xE2` |
| 7 | `0x82` |
| 8 | `0xAC` |
| 9 | `0x31` |

(El dump muestra 10 posiciones; la columna ASCII de `xxd` esconde los bytes multibyte como puntos.)

Para cada byte, indicar:

- los **bits altos** que determinan el rol (escribirlos en binario);
- el **rol**: ASCII de 1 byte / inicio de 2 bytes / inicio de 3 bytes / inicio de 4 bytes / continuación;
- a qué **caracter** pertenece (numerar los caracteres de la cadena: 1, 2, 3, ...).

## Resultado esperado

La tabla completa con las tres columnas extra. Al final, indicar cuántos caracteres tiene la cadena y cuántos bytes ocupa, y verificar la diferencia.

## Verificación

| Pos | Byte | Bits altos | Rol | Caracter |
|---|---|---|---|---|
| 0 | `0x43` | `0` | ASCII (1 byte) | C (1) |
| 1 | `0x61` | `0` | ASCII (1 byte) | a (2) |
| 2 | `0x66` | `0` | ASCII (1 byte) | f (3) |
| 3 | `0xC3` | `110` | inicio de 2 bytes | é (4), parte 1 |
| 4 | `0xA9` | `10` | continuación | é (4), parte 2 |
| 5 | `0x20` | `0` | ASCII (1 byte) | (espacio) (5) |
| 6 | `0xE2` | `1110` | inicio de 3 bytes | € (6), parte 1 |
| 7 | `0x82` | `10` | continuación | € (6), parte 2 |
| 8 | `0xAC` | `10` | continuación | € (6), parte 3 |
| 9 | `0x31` | `0` | ASCII (1 byte) | 1 (7) |

La cadena tiene **7 caracteres** (`C`, `a`, `f`, `é`, espacio, `€`, `1`) pero ocupa **10 bytes** en UTF-8. La diferencia es de 3 bytes, que es exactamente el costo de tener un caracter de 2 bytes (`é` aporta 1 byte extra) y uno de 3 bytes (`€` aporta 2 bytes extra) en lugar de los 1 byte que tendrían si toda la cadena fuera ASCII.

Si alguna fila se clasificó mal, los errores típicos son: confundir `0x82` (binario `10000010`, byte de continuación) con un valor numérico autónomo, o leer `0xC3` como inicio de 3 bytes (la cabecera de 3 bytes empieza con `1110`, no con `110`).

## Criterio de finalización

La tabla coincide con la verificación, y la cuenta caracteres vs bytes está hecha y verificada (7 caracteres, 10 bytes). Si hubo errores, queda registrado en qué byte se confundió la cabecera y por qué.
