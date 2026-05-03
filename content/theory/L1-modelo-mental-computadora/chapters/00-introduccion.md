# Introducción

L1 existe para evitar otra confusión cara: pensar que un programa corre por arte de magia. Después de fijar el laboratorio en `L0`, el paso siguiente es fijar un modelo mental mínimo de la máquina que va a ejecutar todo lo demás.

Antes de bits, compiladores, punteros o assembly, hace falta una idea más simple y más fuerte: una computadora como estado que cambia cuando una instrucción actúa sobre CPU, registros y memoria.

## Qué es este nivel

Este nivel fija ese modelo mínimo. El foco no está en escribir sistemas todavía, sino en poder decir con claridad:

- qué rol cumple la CPU
- qué son los registros
- qué significa que la memoria sea direccionable
- cómo cambia el estado cuando se ejecuta una instrucción
- por qué código y datos no son la misma cosa aunque ambos terminen viviendo en memoria

No es un curso de electrónica ni una materia completa de arquitectura de computadoras. Es una unidad conceptual para que el resto del track deje de apoyarse en intuiciones vagas.

## Qué cubre

El arco del nivel se organiza en cuatro bloques:

| Bloque | Para qué entra en L1 |
|---|---|
| La computadora como máquina de estado | reemplazar la idea difusa de "corre código" por estado, instrucciones y transiciones |
| CPU, registros y memoria | separar roles y evitar mezclar ejecutor, estado cercano y espacio direccionable |
| Fetch-decode-execute | seguir paso a paso qué cambia cuando una instrucción se ejecuta |
| Código, datos y programa en ejecución | distinguir source, código cargado, datos y proceso como programa con estado |

## Qué toca superficialmente y por qué

- Bits, bytes, overflow y endianness aparecen apenas como nombres de problemas. El detalle fuerte llega en `L2`.
- Source, ejecutable y artefactos de compilación se nombran solo para ubicar el mapa. El pipeline real llega en `L3`.
- La idea de instrucción puede apoyarse en notación mínima o trazas simples, pero la alfabetización assembly llega en `L7`.
- La palabra proceso entra solo como programa en ejecución con estado. Scheduler, syscalls y aislamiento quedan para mucho más adelante.

## Qué no cubre y por qué

- No cubre representación binaria en detalle. Si se mezcla demasiado pronto, CPU, memoria y direcciones quedan ocultas detrás de números.
- No cubre compilación o linking en serio. Eso llega cuando ya existe un modelo claro de qué máquina se está alimentando.
- No cubre punteros, stack frames o memoria en C. Esos temas necesitan primero esta base y después un lenguaje concreto.
- No cubre observabilidad fuerte ni debugging real. Primero hace falta saber qué se espera observar.

## Cómo trabajarlo

La regla operativa sigue siendo la misma que en todo Forja: repo abierto en la IDE, devcontainer operativo y lectura siempre pegada al workspace real. La web ayuda a recorrer el plan, pero no reemplaza ese entorno.

Recorrido recomendado:

1. leer este capítulo para fijar el mapa del nivel
2. seguir los capítulos en orden
3. detenerse en cada traza o ejemplo hasta poder explicar qué cambia en CPU, registros y memoria
4. usar `exercises.md` para comprobar si el modelo realmente quedó claro
5. volver a este capítulo si algún tema posterior empieza a sentirse mágico otra vez

La pregunta que conviene tener abierta durante todo L1 es esta: "si este programa hace algo, qué parte del estado está cambiando exactamente?"

## El nivel siguiente

Después de L1 viene `L2`, donde ese modelo mental recibe cuerpo en bits, bytes, enteros, overflow y endianness. L1 pone la forma de la máquina; L2 explica con qué materia están hechos sus datos.