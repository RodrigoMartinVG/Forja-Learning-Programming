# Flotantes y aproximación

Este ejercicio no pide reconstruir IEEE 754. Pide algo más básico y más útil para `L2`: distinguir cuándo un valor decimal puede entrar exacto en binario finito y cuándo solo puede entrar como aproximación.

> Laboratorio: probá cada valor sobre una escena de float de juguete y fijate si el patrón binario se cierra o si obliga a cortar una secuencia periódica.

## Consigna

Para cada valor, elegí una sola etiqueta entre `exacto en binario finito` o `solo como aproximación`.

| Valor decimal | Etiqueta |
|---|---|
| `0.5` | `?` |
| `0.25` | `?` |
| `0.75` | `?` |
| `0.1` | `?` |
| `0.2` | `?` |
| `0.3` | `?` |
| `1.125` | `?` |

La pregunta no es si el número "parece simple" en decimal, sino si su expansión binaria puede cerrarse con una cantidad finita de bits.