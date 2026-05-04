# Ejercicio 03 — Leer `verify-setup.sh` como código

## Contexto

El [capítulo 03](../chapters/03-verify-setup.md) presentó `verify-setup.sh` como contrato observable y describió su anatomía sin abrir el código. Este ejercicio invierte la dirección: parte del código real del script y conecta cada chequeo con una entrada concreta de su salida cuando se ejecuta.

El objetivo no es entender bash en profundidad. Es comprobar que la mecánica del script es accesible: cada línea de salida `[ok|fail|skip]` proviene de una invocación identificable en el código.

## Consigna

1. Abrir `verify-setup.sh` en la raíz del repo y leerlo de principio a fin sin saltar.
2. Identificar la función central que produce cada línea de salida (su nombre empieza con `run_`).
3. Ejecutar `bash ./verify-setup.sh` y guardar la salida completa en un archivo de notas local.
4. Elegir tres líneas de la salida —una con `[ok]`, una con `[fail]` o `[skip]`, y una libre— y, para cada una, localizar en el código la invocación exacta que la produjo. Copiar esa línea de código.
5. Para cada uno de los tres pares (línea de salida ↔ línea de código), explicar en una o dos oraciones qué herramienta o condición se está chequeando y por qué la salida fue la que fue.

## Resultado esperado

Tres pares completos, cada uno con: línea exacta de la salida del script, línea exacta del código del script que la produjo, y la explicación corta.

## Verificación

La función central tiene una firma del tipo `run_check <nombre> <comando>` (o nombre similar), y se invoca decenas de veces en el cuerpo del script con argumentos distintos. Si la lectura no encuentra esa función o no logra reconocer el patrón de invocación, el ejercicio identificó una distancia real entre el modelo del [capítulo 03](../chapters/03-verify-setup.md) y el código presente; esa distancia merece quedar registrada en las notas.

La línea de salida con formato `%-22s [ok|fail|skip] %s\n` permite alinear visualmente el nombre de la herramienta con el `printf` que aparece dentro de la función `run_check`. Si los tres pares no se encuentran, releer la sección de anatomía del [capítulo 03](../chapters/03-verify-setup.md) y volver a intentarlo.

## Criterio de finalización

Tres pares correctos. Cada par tiene línea de salida, línea de código, y explicación corta. Si en el camino se encontró alguna inconsistencia entre el [capítulo 03](../chapters/03-verify-setup.md) y el código real, queda registrada como nota al final del ejercicio.
