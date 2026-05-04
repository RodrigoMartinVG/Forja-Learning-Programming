# Predecir overflow y truncado

Este ejercicio fuerza a separar tres planos: el resultado ideal de la cuenta, el patrón que realmente cabe en el ancho activo y el nombre del fenómeno que explica esa diferencia.

> Laboratorio: usá ancho fijo y mirá siempre qué bits sobreviven. No te quedes solo con la cuenta matemática ideal.

## Consigna

Para cada caso, completá el resultado final almacenado y elegí una sola etiqueta entre `sin problema`, `overflow unsigned`, `overflow signed` o `truncado`.

| Caso | Resultado final almacenado | Etiqueta |
|---|---|---|
| unsigned de `8` bits: `255 + 1` | `?` | `?` |
| signed de `8` bits: `127 + 1` | `?` | `?` |
| signed de `8` bits: `-128 - 1` | `?` | `?` |
| recorte de unsigned de `16` a `8` bits: `300` | `?` | `?` |
| recorte de unsigned de `16` a `8` bits: `255` | `?` | `?` |

La pregunta no es solo si "se pasó" o no, sino qué patrón final quedó realmente disponible después de respetar el ancho activo.