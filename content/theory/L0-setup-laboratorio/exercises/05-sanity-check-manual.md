# Ejercicio 05 — Sanity check manual con justificación

## Contexto

El [capítulo 04](../chapters/04-workflow.md) propuso un sanity check de tres comandos —`whoami`, `uname -a`, `cat /etc/os-release | head -3`— y justificó cada uno con un argumento sobre qué señal independiente aporta. La elección concreta no es la única posible. Lo que importa es el principio: tres señales que no se replican entre sí, suficientes para distinguir contenedor de host con confianza.

Este ejercicio pone a prueba ese principio pidiendo construir un sanity check alternativo, ejecutarlo, y argumentar por qué los tres comandos elegidos son independientes.

## Consigna

1. Elegir tres comandos distintos de los del [capítulo 04](../chapters/04-workflow.md) (no usar `whoami`, `uname -a`, ni `cat /etc/os-release`).
2. Ejecutar los tres dentro del contenedor del repo y registrar la salida exacta.
3. Para cada uno, escribir una oración que responda: *"¿qué señal aporta este comando que los otros dos no aportan?"*.
4. Argumentar en un párrafo corto por qué los tres en conjunto permiten distinguir un contenedor del host con razonable confianza, o reconocer si esa distinción no queda firme con la elección hecha.

## Resultado esperado

Un mini-documento con cuatro partes: lista de los tres comandos elegidos, salida literal de cada uno, oración de independencia por cada uno, y párrafo de cierre evaluando la combinación.

## Verificación

Los tres comandos elegidos son válidos si ninguno se puede reemplazar por otro de los dos sin perder información. Algunos ejemplos viables: `id` (información de usuario y grupos, distinta de `whoami`), `hostname` (nombre del contenedor), `cat /etc/debian_version`, `cat /proc/1/cgroup` (revela si el proceso 1 está en un cgroup de contenedor), `ls /.dockerenv`, `printenv | grep -i container`. Algunos ejemplos donde la independencia es débil: usar `id` y `whoami` juntos (replican información de usuario), o `uname -n` y `hostname` (replican el nombre).

Si la justificación de independencia se sostiene para los tres y el párrafo final reconoce honestamente la fortaleza del check construido (incluyendo si es más débil que el del capítulo, lo que es perfectamente aceptable), el ejercicio cumplió su objetivo.

## Criterio de finalización

Los tres comandos son distintos de los del [capítulo 04](../chapters/04-workflow.md). Cada uno tiene salida real y oración de independencia. El párrafo final no es una repetición del capítulo: argumenta sobre la combinación específica elegida.
