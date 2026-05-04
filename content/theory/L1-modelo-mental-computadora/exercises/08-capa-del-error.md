# Ejercicio 08 — Identificar la capa donde vive el error

## Contexto

El [capítulo 07](../chapters/07-codigo-datos-programa.md) separó cuatro capas que el uso corriente colapsa: source (texto en disco), código cargado (instrucciones en la memoria del proceso), datos (valores en la memoria del proceso), proceso en ejecución (la actividad de aplicar el ciclo paso a paso). Errores y fenómenos que parecen contradictorios se vuelven legibles cuando se identifica en qué capa vive cada cosa.

Este ejercicio pone esa separación a trabajar sobre tres situaciones concretas. Para cada situación, hay que identificar qué capa o capas están involucradas y por qué el fenómeno deja de ser sorprendente una vez que las capas están separadas.

## Consigna

Para cada situación, responder:

1. ¿En qué capa(s) vive el cambio o el problema?
2. ¿Qué confusión típica se evita al separarlas? Una oración corta.

### Situación A

Un programador edita un archivo `.c`, lo guarda, y vuelve a la terminal donde un proceso lanzado a partir de ese archivo (compilado y ejecutado hace unos minutos) sigue corriendo. Se sorprende de que el comportamiento del proceso no haya cambiado.

### Situación B

Un proceso está corriendo. En cierto momento, su memoria contiene `mem[40] = 7`. Diez segundos después, `mem[40] = 200`. El proceso no ha terminado. ¿Qué capa explica el cambio?

### Situación C

Un proceso lee un archivo de configuración del disco, lo carga en memoria, y comienza a operar con esa configuración. El usuario edita el archivo de configuración mientras el proceso sigue corriendo. El proceso no parece notar el cambio. ¿Por qué?

## Resultado esperado

Tres respuestas, una por situación, cada una identificando capa(s) y la confusión que la separación evita.

## Verificación

**Situación A.**

Capas involucradas: el cambio que el programador hizo vive en la capa **source** (modificó el archivo `.c` en disco). El proceso que sigue corriendo vive en la capa **proceso en ejecución**, con su propio **código cargado** y sus propios **datos** en memoria —cosas que se poblaron en el momento del lanzamiento original, antes de la edición.

Confusión que se evita: pensar que "modificar el código" cambia el comportamiento de un programa que ya está corriendo. No: cambia el archivo, que es source. Para que el cambio afecte el comportamiento, hace falta recompilar, regenerar el ejecutable, y lanzar un proceso nuevo. El proceso original ya tiene su código cargado y, hasta que termine, va a seguir ejecutando ese código.

**Situación B.**

Capas involucradas: el cambio vive en la capa **datos** del proceso, específicamente en una posición de memoria. La explicación más probable es que el propio proceso, en algún paso entre los dos momentos, ejecutó una instrucción `STORE` (o equivalente) que escribió 200 en `mem[40]`.

Confusión que se evita: pensar que un cambio en la memoria del proceso requiere intervención externa. No: la memoria del proceso es estado modificable por las instrucciones del propio proceso. Un programa que se ejecuta está cambiando constantemente sus datos —es exactamente lo que un programa hace.

(Una variante posible, más rara: que otro proceso o el sistema operativo haya escrito en esa memoria. En sistemas reales, eso requiere mecanismos específicos —memoria compartida, debugger adjunto, syscall— y no ocurre sin causa identificable. En `L1` la respuesta más limpia es la primera: el propio proceso escribió.)

**Situación C.**

Capas involucradas: el archivo de configuración vive en la capa **source-equivalente** (es un archivo en disco; no es source de código pero comparte la propiedad de ser estático y persistente). Lo que el proceso cargó en memoria son **datos** del proceso —la configuración, leída en un momento, copiada a la memoria del proceso. Después de la carga, los datos viven en la memoria del proceso, independientemente del archivo en disco.

Confusión que se evita: pensar que el archivo en disco y los datos en memoria del proceso son la misma cosa, sólo porque uno se "originó" en el otro. No: la lectura del archivo fue un acto puntual; los datos en memoria son una copia del momento de la lectura. Editar el archivo después no toca esa copia. Para que el proceso "note" el cambio, tendría que volver a leer el archivo —cosa que no hace automáticamente, salvo que esté programado para hacerlo.

## Criterio de finalización

Las tres respuestas identifican correctamente la(s) capa(s) involucrada(s) y describen la confusión que la separación evita. Si alguna situación se respondió colapsando capas (por ejemplo, llamando "código" a los datos del proceso, o llamando "programa" tanto al archivo como al proceso), queda anotada esa confusión.
