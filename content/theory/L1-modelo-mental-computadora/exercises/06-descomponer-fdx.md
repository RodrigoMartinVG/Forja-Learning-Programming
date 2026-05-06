# Ejercicio 06 — Descomponer pasos en fetch / decode / execute

## Contexto

El [capítulo 05](../chapters/05-fetch-decode-execute.md) abrió el paso interno y mostró que cada paso macro (una fila de la traza) se descompone en tres subpasos: fetch (localizar la instrucción señalada por el `pc`), decode (reconocer qué clase y operandos tiene), execute (aplicar el efecto sobre el estado y avanzar el `pc`). Este ejercicio pone la descomposición a trabajar: dada una mini-traza de tres pasos, hay que escribir las tres líneas de fetch / decode / execute para cada paso.

El valor del ejercicio no está en la mecánica —escribir las líneas es directo una vez entendido el ciclo— sino en el reflejo de no colapsar los subpasos. Confundir fetch con decode o decode con execute es una de las fallas más comunes en niveles posteriores cuando aparecen errores que requieren ubicar exactamente qué subpaso falló.

## Programa

| dirección | contenido |
| --------- | --------- |
| 0 | `MOV r0, 4` |
| 1 | `LOAD r1, [40]` |
| 2 | `ADD r1, r0` |
| 3 | `(fin)` |
| ... | ... |
| 40 | 6 |

Estado inicial: `pc = 0`, `r0 = 0`, `r1 = 0`, `mem[40] = 6`.

## Consigna

Para cada uno de los tres pasos macro, escribir tres líneas:

1. **Fetch**: qué dirección se lee y qué contenido se obtiene. La fórmula es: *"la CPU lee el `pc` (vale X), accede a `mem[X]`, obtiene 〈contenido〉"*.
2. **Decode**: qué clase es la instrucción y cuáles son sus operandos (con su tipo: registro, memoria, valor inmediato).
3. **Execute**: qué se lee del estado, qué se computa si corresponde, qué se escribe en el estado, y cómo queda el `pc` después.

Total: nueve líneas (tres pasos × tres subpasos).

## Resultado esperado

Una secuencia de nueve líneas, agrupadas en tres bloques de tres, que describe la ejecución completa del programa. Cada línea es corta —una o dos oraciones— pero específica: cita valores concretos, registros concretos, direcciones concretas.

## Verificación

**Paso 1.**

- Fetch: la CPU lee el `pc` (vale 0), accede a `mem[0]`, obtiene `MOV r0, 4`.
- Decode: clase movimiento; primer operando registro `r0` (destino), segundo operando valor inmediato `4` (fuente).
- Execute: escribe el valor 4 en `r0`. Incrementa el `pc` a 1.

**Paso 2.**

- Fetch: la CPU lee el `pc` (vale 1), accede a `mem[1]`, obtiene `LOAD r1, [40]`.
- Decode: clase acceso a memoria; primer operando registro `r1` (destino), segundo operando dirección `[40]` (fuente).
- Execute: lee `mem[40]` (vale 6). Escribe 6 en `r1`. Incrementa el `pc` a 2.

**Paso 3.**

- Fetch: la CPU lee el `pc` (vale 2), accede a `mem[2]`, obtiene `ADD r1, r0`.
- Decode: clase aritmética; primer operando registro `r1` (lectura+escritura), segundo operando registro `r0` (lectura).
- Execute: lee `r1` (vale 6) y `r0` (vale 4). Computa 6 + 4 = 10. Escribe 10 en `r1`. Incrementa el `pc` a 3.

Errores recurrentes para anotar si aparecen:

- *Confundir fetch con decode*: escribir en la línea de fetch la clase de la instrucción. Fetch sólo trae el contenido; reconocer su clase es trabajo de decode.
- *Confundir decode con execute*: escribir en la línea de decode los valores leídos del estado. Decode sólo identifica la clase y los operandos como nombres; los valores concretos se leen recién en execute.
- *Olvidar el incremento del `pc` en execute*: la actualización del `pc` ocurre al final de execute, no en una "fase aparte". Si la respuesta no menciona cómo queda el `pc`, falta esa parte.

## Criterio de finalización

Las nueve líneas están escritas, cada una en su subpaso correspondiente, sin colapsar fetch/decode/execute. Si alguna línea cruzó la frontera entre subpasos (por ejemplo, mencionando valores concretos en decode, o reconocimiento de clase en fetch), queda anotado cuál fue la confusión.
