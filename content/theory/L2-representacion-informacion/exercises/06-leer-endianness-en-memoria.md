# Leer endianness en memoria

Este ejercicio trabaja sobre memoria visible byte a byte. La tarea no es adivinar, sino reconstruir un valor multi-byte sabiendo qué convención de orden se está usando.

> Laboratorio: mové la ventana tipada sobre un rango fijo de bytes y alterná entre little endian y big endian sin cambiar la memoria subyacente.

## Caso A

Una lectura de `u32` empieza en `mem[0x20]` y la máquina usa **big endian**.

| Dirección | Byte |
|---|---|
| `0x20` | `0x12` |
| `0x21` | `0x34` |
| `0x22` | `0x56` |
| `0x23` | `0x78` |

Valor reconstruido: `?`

Rango de direcciones ocupado: `?`

## Caso B

Una lectura de `u32` empieza en `mem[0x20]` y la máquina usa **little endian**.

| Dirección | Byte |
|---|---|
| `0x20` | `0x78` |
| `0x21` | `0x56` |
| `0x22` | `0x34` |
| `0x23` | `0x12` |

Valor reconstruido: `?`

Rango de direcciones ocupado: `?`

La pregunta no es qué bytes hay sueltos en memoria, sino cómo esos mismos bytes se agrupan para formar un valor lógico cuando conocés la convención de orden.