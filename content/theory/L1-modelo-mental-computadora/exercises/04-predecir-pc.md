# Ejercicio 04 — Predecir el `pc` siguiente

## Contexto

El [capítulo 06](../chapters/06-flujo-de-control.md) describió `JNZ` como la primera instrucción del nivel donde el flujo depende del estado del programa. Este ejercicio pone a prueba esa dependencia: ante un `JNZ` con un estado dado, hay que predecir cuál va a ser el valor del `pc` después del paso, y la predicción debe apoyarse en el valor del registro evaluado, no en una lectura textual del programa.

Es un ejercicio de respuesta cerrada con tres variantes. Lo que se busca instalar es el reflejo: *"primero miro el registro, después decido si la instrucción salta o no"*.

## Consigna

Para cada una de las tres situaciones que siguen, predecir el valor del `pc` después de aplicar la instrucción `JNZ` que se indica. Justificar la respuesta con una oración que cite el valor del registro evaluado.

### Variante A

Estado antes del paso: `pc = 5`, `r0 = 0`, `r1 = 7`.

Instrucción a aplicar: `JNZ r0, 12`.

¿Cuánto vale el `pc` después del paso?

- (a) 6
- (b) 12
- (c) 0
- (d) 5

### Variante B

Estado antes del paso: `pc = 5`, `r0 = 0`, `r1 = 7`.

Instrucción a aplicar: `JNZ r1, 12`.

¿Cuánto vale el `pc` después del paso?

- (a) 6
- (b) 12
- (c) 7
- (d) 5

### Variante C

Estado antes del paso: `pc = 5`, `r0 = -3`, `r1 = 0`.

Instrucción a aplicar: `JNZ r0, 12`.

¿Cuánto vale el `pc` después del paso?

- (a) 6
- (b) 12
- (c) -3
- (d) 5

## Resultado esperado

Tres respuestas (una opción por variante) y, para cada una, una oración que indique el valor del registro evaluado y por qué ese valor produce salto o no produce salto.

## Verificación

**Variante A**: la respuesta correcta es **(a) 6**. Justificación: `JNZ r0, 12` evalúa `r0`. `r0` vale 0, así que la condición *distinto de cero* no se cumple, no hay salto, y el `pc` avanza secuencialmente de 5 a 6.

**Variante B**: la respuesta correcta es **(b) 12**. Justificación: `JNZ r1, 12` evalúa `r1`. `r1` vale 7, distinto de cero, así que la condición se cumple, hay salto, y el `pc` queda en 12.

**Variante C**: la respuesta correcta es **(b) 12**. Justificación: `JNZ r0, 12` evalúa `r0`. `r0` vale -3, distinto de cero, así que la condición se cumple. El signo no importa: la condición es *distinto de cero*, no *positivo*. Hay salto, y el `pc` queda en 12.

Un error común en la variante C es elegir (c) o suponer que un valor negativo no satisface la condición. La instrucción `JNZ` evalúa solamente si el valor es cero o no; cualquier otro valor —positivo o negativo— produce salto.

Un error común en la variante A es elegir (b) sin mirar el registro. Si la lectura del ejercicio se hace mecánicamente —"`JNZ` es un salto, así que el `pc` va a 12"—, se ignora la condicionalidad. El reflejo correcto es: leer `JNZ`, mirar el registro citado en el primer operando, decidir si vale cero o no.

## Criterio de finalización

Las tres respuestas son correctas y las justificaciones citan el valor concreto del registro evaluado. Si alguna estuvo errada, queda anotado si el error fue por confundir el registro evaluado, por suponer que el signo importa, o por ignorar la condicionalidad.
