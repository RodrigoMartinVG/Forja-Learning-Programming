# Ejercicio 07 — Proponer un nuevo check para `verify-setup.sh`

## Contexto

`verify-setup.sh` cubre, según el [capítulo 03](../chapters/03-verify-setup.md), una lista finita de herramientas y una pequeña batería de verificaciones de entorno. Esa lista es razonable pero no exhaustiva: hay aspectos del laboratorio que el script no comprueba y que, si fallaran, producirían síntomas confusos en niveles posteriores. Algunos quedan deliberadamente fuera (estado del workspace, identidad del contenedor, configuraciones de usuario). Otros podrían entrar y no entran porque nadie los propuso todavía.

Este ejercicio pide identificar un check candidato y argumentar su pertinencia, sin implementarlo. La habilidad ejercitada es de diseño: distinguir lo que el script debe garantizar de lo que queda fuera de su alcance.

## Consigna

1. Identificar una herramienta, condición o propiedad del laboratorio que `verify-setup.sh` no comprueba actualmente y que, en opinión del lector, sí debería comprobar para que el contrato del nivel quede completo.
2. Justificar la propuesta respondiendo en un texto corto a estas tres preguntas:
   - **¿Qué se rompería en niveles posteriores si esto falla y no fue detectado por el script?** Citar concretamente qué tipo de actividad de `L1`, `L2` o más adelante se vería afectada.
   - **¿Es estática o dinámica la propiedad?** Es decir, ¿se puede comprobar con un comando que devuelve un código de salida (como los chequeos actuales), o requiere algo más complejo?
   - **¿Tiene relación con alguno de los aspectos que el [capítulo 03](../chapters/03-verify-setup.md) declaró fuera de alcance (estado del workspace, identidad del contenedor, configuraciones de usuario)?** Si sí, argumentar por qué a pesar de eso debería entrar.
3. Proponer una primera aproximación al comando que implementaría el check, sin pulirlo: una línea de bash que, idealmente, devuelva código 0 si el check pasa.

## Resultado esperado

Un mini-documento con tres partes: nombre y descripción de la propiedad propuesta, justificación con respuesta explícita a las tres preguntas, y una línea de bash candidata.

## Verificación

No hay respuesta única. Algunos candidatos razonables: comprobar que el directorio `/workspaces/Forja-Learning-Programming` existe y es escribible (cubre parte del workspace mount); comprobar que `cargo` puede acceder al registry (cubre red); comprobar que la versión instalada de `gcc` está por encima de un mínimo (cubre el aspecto de versiones que hoy no se chequea); comprobar que `git` puede leer el repo local sin error de permisos. Cualquiera de estos, bien argumentado, es un resultado válido.

Una propuesta es débil si la respuesta a la primera pregunta es genérica (*"podría haber problemas más adelante"*) sin citar actividad concreta de algún nivel posterior. Es débil también si ignora la tercera pregunta y propone algo que el [capítulo 03](../chapters/03-verify-setup.md) explícitamente sacó del alcance del script sin argumentar la excepción.

## Criterio de finalización

La propuesta tiene las tres partes. La justificación responde a las tres preguntas con contenido específico. La línea de bash es invocable: aunque no se pida ejecutarla, debe ser sintácticamente correcta y aproximarse a lo que el script real haría.
