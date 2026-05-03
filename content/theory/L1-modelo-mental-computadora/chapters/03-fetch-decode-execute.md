# El ciclo fetch-decode-execute

En `02` quedaron separadas las piezas del modelo: CPU, registros, memoria, direcciones y `pc`. Falta ver el movimiento mínimo que las conecta. Cuando se dice que una instrucción "se ejecuta", no ocurre un bloque mágico e indivisible. Ocurre una secuencia corta donde la CPU toma la instrucción señalada por el `pc`, la interpreta y produce un nuevo estado.

Para L1 alcanza con una versión simplificada del ciclo fetch-decode-execute. No hace falta describir pipelines reales, micro-operaciones ni detalles de hardware. Hace falta poder seguir, paso a paso, cómo una instrucción pasa de estar señalada por el `pc` a cambiar registros, memoria o flujo de control.

Vamos a sostener el mismo ejemplo del capítulo anterior:

```text
100: LOAD r0, [40]
101: ADD  r0, [41]
102: STORE r0, [42]
103: HALT
```

Y este estado inicial:

| Pieza | Valor inicial |
|---|---|
| `pc` | `100` |
| `r0` | `0` |
| `mem[40]` | `7` |
| `mem[41]` | `5` |
| `mem[42]` | `0` |

> Simulador: cambiá a modo `micro` y recorré un preset simple. Ahí `fetch`, `decode` y `execute` dejan de ser nombres recitados y pasan a verse como tres momentos distintos del mismo paso.

## Qué significa fetch

`fetch` es el paso donde la CPU usa el valor actual del `pc` para buscar cuál es la instrucción que toca considerar ahora.

Si el estado dice `pc=100`, entonces el fetch mira la dirección `100` y obtiene:

```text
LOAD r0, [40]
```

Conviene pensarlo así:

- el `pc` no guarda la instrucción misma; guarda dónde buscarla
- fetch no decide todavía qué significa la instrucción; solo la trae como paso actual
- si el `pc` apuntara a otra dirección, el fetch traería otra instrucción y la historia de ejecución sería distinta

En una tabla mínima, ese momento puede verse así:

| Estado relevante antes de fetch | Resultado de fetch |
|---|---|
| `pc=100` | la CPU toma `LOAD r0, [40]` como instrucción actual |

En L1 no hace falta decidir qué registros internos o qué buses intervienen. La intuición que importa es más chica: fetch responde la pregunta "¿qué instrucción toca ahora?".

## Qué significa decode

`decode` es el paso donde la CPU deja de ver solo una forma escrita y pasa a leer qué acción describe esa instrucción.

Con el mismo ejemplo:

- `LOAD r0, [40]` se decodifica como: leer el contenido de la dirección `40` y copiarlo en `r0`
- `ADD r0, [41]` se decodifica como: tomar el valor actual de `r0`, sumarle el contenido de `mem[41]` y dejar el resultado otra vez en `r0`
- `STORE r0, [42]` se decodifica como: copiar el valor actual de `r0` hacia `mem[42]`
- `HALT` se decodifica como: detener la ejecución

Si apareciera `MOV`, la idea sería igual de directa:

- `MOV r0, 5` se decodifica como: dejar el valor `5` en `r0`
- `MOV r1, r0` se decodifica como: copiar el valor actual de `r0` en `r1`

Eso también ayuda a que decode no mezcle cosas distintas: una instrucción puede querer leer memoria, escribir memoria, operar sobre registros o cambiar el flujo. `MOV` deja visible el caso más simple de movimiento interno de estado.

Decode no es todavía el cambio de estado. Es el momento donde queda claro qué partes del estado estarán involucradas si la instrucción se ejecuta.

Eso ayuda a separar tres cosas que suelen mezclarse:

- fetch responde qué instrucción toca
- decode responde qué operación describe
- execute responde qué cambió efectivamente en el estado

## Qué significa execute

`execute` es el paso donde la acción ya interpretada produce un cambio concreto en el estado de la máquina.

Con el estado inicial anterior, la traza principal queda así:

| Instrucción | Cambio principal en execute |
|---|---|
| `LOAD r0, [40]` | `r0` pasa de `0` a `7` |
| `ADD r0, [41]` | `r0` pasa de `7` a `12` |
| `STORE r0, [42]` | `mem[42]` pasa de `0` a `12` |
| `HALT` | la ejecución se detiene |

Acá aparece una idea importante del nivel: ejecutar no significa "resolver el programa entero". Significa aplicar una sola instrucción sobre un estado puntual y producir el estado siguiente.

Por eso una misma CPU puede repetir el mismo ciclo muchas veces seguidas:

1. fetch: ubica la instrucción actual
2. decode: interpreta qué pide esa instrucción
3. execute: cambia el estado

Después de eso, el sistema queda listo para que vuelva a empezar el mismo patrón con la instrucción siguiente o con la que indique un salto.

## Cómo avanza o cambia el program counter

Para L1 conviene usar una convención simple: después de ejecutar una instrucción secuencial común, el `pc` queda apuntando a la siguiente dirección del programa.

Con esa convención, la traza del ejemplo puede resumirse así:

| Paso | Instrucción ejecutada | `pc` antes | `pc` después |
|---|---|---|---|
| 1 | `LOAD r0, [40]` | `100` | `101` |
| 2 | `ADD r0, [41]` | `101` | `102` |
| 3 | `STORE r0, [42]` | `102` | `103` |
| 4 | `HALT` | `103` | ejecución detenida |

La utilidad del `pc` se vuelve más nítida cuando se lo mira así:

- antes de fetch, dice dónde buscar la instrucción actual
- después de una instrucción secuencial, queda listo para la siguiente
- si una instrucción altera el flujo, entonces el `pc` no sigue al vecino inmediato sino al destino indicado

No hace falta discutir todavía si una máquina real incrementa el `pc` en un momento ligeramente distinto del ciclo. Para este nivel alcanza con una pregunta operativa: después de este paso, ¿qué dirección queda señalada como la próxima?

## Saltos, bifurcaciones y loops

Los programas interesantes no siempre avanzan en línea recta. A veces el `pc` no pasa a la instrucción vecina, sino que cambia hacia otra dirección según una condición.

Una pseudotraza mínima puede verse así:

```text
200: LOAD r0, [50]
201: SUB  r0, 1
202: JNZ  r0, 201
203: HALT
```

Supongamos este estado inicial:

| Pieza | Valor inicial |
|---|---|
| `pc` | `200` |
| `r0` | `0` |
| `mem[50]` | `3` |

La lectura operativa de `JNZ r0, 201` es esta: si `r0` no vale cero, el próximo valor de `pc` pasa a ser `201`; si `r0` vale cero, el flujo sigue a `203`.

Con eso, la historia principal queda así:

| Momento | Estado relevante |
|---|---|
| después de `LOAD r0, [50]` | `pc=201`, `r0=3` |
| después de `SUB r0, 1` | `pc=202`, `r0=2` |
| después de `JNZ r0, 201` | `pc=201`, `r0=2` |
| después de otra vuelta por `SUB` | `pc=202`, `r0=1` |
| después de otro `JNZ` | `pc=201`, `r0=1` |
| después de la última vuelta por `SUB` | `pc=202`, `r0=0` |
| después del último `JNZ` | `pc=203`, `r0=0` |

Ese pequeño ejemplo alcanza para fijar dos ideas fuertes:

- una bifurcación es una instrucción cuyo execute puede dejar distintos valores de `pc`
- un loop no es una magia circular; es una secuencia donde el `pc` vuelve a una dirección anterior mientras se cumpla una condición

Con esto el ciclo fetch-decode-execute deja de sonar como una fórmula recitada y pasa a ser una forma concreta de leer trazas. En el capítulo siguiente ya será más fácil separar código, datos y programa en ejecución, porque el flujo de instrucciones y el cambio de estado ya tienen una forma visible.