# Ejercicio 11 — Diagnóstico cruzado

## Contexto

Cada capítulo del nivel instaló una convención de lectura. El ejercicio final del nivel pone a prueba la pregunta operativa central que `L2` viene construyendo: dado un patrón de bytes en memoria, ¿qué valor representa? La respuesta no existe sin una convención, y este ejercicio entrena la habilidad de **proponer convenciones plausibles** y elegir entre ellas según el contexto.

A diferencia de los ejercicios anteriores —donde la convención venía dada—, acá hay que mirar el patrón, considerar varias lecturas, y justificar cuál es la coherente con la situación descrita.

## Consigna

Un programa C inicializa una variable y vuelca sus 4 bytes en memoria. El dump muestra:

```
00000100: ffff ffff                                ....
```

Un colega abre el debugger, mira esos bytes, y dice: *"este valor es enorme, casi 4 mil millones, no debería ser tan grande, hay un bug en algún lado"*.

La consigna es:

1. Dar **tres convenciones** distintas bajo las cuales esos 4 bytes podrían leerse, calculando el valor que produce cada una.
2. Identificar **bajo qué tipo declarado** la variable produciría cada lectura.
3. Decidir cuál de las tres lecturas es coherente con el comentario del colega ("casi 4 mil millones, no debería ser tan grande"), y cuál sería la lectura **correcta** si el programa estaba trabajando con valores con signo.

## Resultado esperado

- Una tabla con tres convenciones, los tres valores que producen, y los tipos C correspondientes.
- Una decisión justificada sobre qué pasó: cuál es la lectura que vio el colega, cuál sería la lectura correcta, y qué inconsistencia entre tipo declarado y tipo asumido produjo el bug.

## Verificación

Los 4 bytes en memoria, en orden físico: `0xFF`, `0xFF`, `0xFF`, `0xFF`. Asumiendo little-endian (x86-64, ARM en modo común), el valor de 32 bits reconstruido es `0xFFFFFFFF`.

**Tres convenciones plausibles:**

| Convención | Tipo C | Valor |
|---|---|---|
| Entero sin signo de 32 bits | `uint32_t` | $2^{32} - 1 = 4\,294\,967\,295$ |
| Entero con signo de 32 bits, complemento a dos | `int32_t` | $-1$ |
| `float` IEEE 754 | `float` | NaN (exponente todo en uno, mantisa no cero) |

**Lectura del colega:**

El comentario "casi 4 mil millones" corresponde al valor $4\,294\,967\,295$, que es el resultado de leer el patrón como `uint32_t`. El debugger probablemente está mostrando la variable bajo esa convención por defecto.

**Lectura correcta si la variable es con signo:**

Si la variable fue declarada como `int32_t` (que es el tipo de un `int` típico en C en una máquina de 64 bits), el valor que representa el patrón es **−1**. Eso es bastante distinto de "casi 4 mil millones": es el valor habitual que devuelven funciones de error en C (`read`, `write`, `open` retornan −1 en caso de fallo).

**Diagnóstico:**

El bug que el colega ve no es de aritmética: es de **interpretación**. El patrón `0xFFFFFFFF` es una señal coherente —probablemente un error indicado por una función— y la variable lo está conteniendo correctamente. Lo que está mal es la convención bajo la cual se está leyendo: el debugger muestra `uint32_t` cuando la variable es `int32_t`, o el código que asigna el valor lo trata como `uint32_t` cuando debería compararlo como `int32_t`.

La pregunta operativa del nivel —*patrón más convención produce valor*— es exactamente lo que hay que aplicar para resolver el malentendido. El patrón es uno solo (`0xFFFFFFFF`); las lecturas son tres; la coherencia con el contexto del programa es la que decide cuál es la "verdadera". En este caso, si el programa estaba esperando un código de error, la lectura correcta es −1, y la lectura como entero sin signo enorme es un artefacto del debugger o de una conversión implícita mal hecha en algún punto del código.

Si el ejercicio se resolvió con menos de tres convenciones, las que faltaron probablemente fueron `float` (que requiere notar que el exponente todo en uno y la mantisa no cero indican NaN) o la lectura como `int32_t` (que requiere recordar que `0xFFFFFFFF` en complemento a dos es −1, igual que `0xFF` es −1 en 8 bits).

## Criterio de finalización

Tres convenciones distintas con sus valores calculados, tipos C asociados, y decisión justificada sobre cuál es la lectura coherente con el comentario del colega y cuál sería la lectura correcta. La justificación se apoya explícitamente en la convención (`uint32_t` vs `int32_t` vs `float`) y no en intuiciones sobre "qué número es razonable".
