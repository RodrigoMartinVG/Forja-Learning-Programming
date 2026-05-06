# Ejercicio 06 — Diagnóstico dirigido: `cargo` no responde

## Contexto

El [capítulo 05](../chapters/05-diagnostico.md) presentó cinco escenarios de fallo y, para cada uno, propuso ubicar la capa antes de actuar. Este ejercicio pone esa habilidad a prueba en formato breve. Es el único de la serie que es de respuesta cerrada: no busca producir evidencia nueva sino comprobar que, dado un síntoma, se puede señalar la capa probable sin antes haber tocado nada.

## Consigna

Considerar el siguiente síntoma:

> Acabo de abrir el contenedor del repo. La rutina del [capítulo 04](../chapters/04-workflow.md) pasó sin problemas: `verify-setup.sh` reportó `Setup verification passed`, y el sanity check manual confirmó que estoy dentro del contenedor. Sin embargo, cuando ejecuto `cargo build` en un proyecto nuevo creado con `cargo new`, el comando se cuelga sin imprimir nada durante varios minutos.

Elegir entre las siguientes opciones cuál es la **capa más probable** del problema y justificar la elección en dos o tres oraciones:

- **A.** El `Dockerfile` no instala `cargo` correctamente.
- **B.** El contenedor está corriendo con la imagen vieja porque no se reconstruyó después de modificar el `Dockerfile`.
- **C.** La toolchain está disponible y el contenedor está sano, pero el comando `cargo build` falla en una capa más allá de las cinco que `L0` cubre (red, caché del proyecto, dependencias).
- **D.** El workspace no está bien montado y `cargo` está leyendo un proyecto vacío.

## Resultado esperado

Una opción elegida (A, B, C o D) y un párrafo corto justificando la elección con argumentos derivados del síntoma, no de intuiciones genéricas.

## Verificación

La respuesta correcta es **C**. El razonamiento esperado: `verify-setup.sh` pasó (descarta A, porque el script verifica que `cargo` esté disponible); el sanity check manual confirmó el contenedor (debilita B, aunque no la descarta del todo si el rebuild se omitió y la imagen vieja casualmente también tenía `cargo`, lo que es poco probable); el síntoma —"cuelga sin imprimir nada durante varios minutos"— es consistente con `cargo` intentando descargar dependencias por red o resolver el registry (escenario 5 del capítulo de diagnóstico). D queda descartada porque `cargo new` mismo creó archivos visibles, lo que requiere workspace montado y escritura funcionando.

Si la respuesta fue B, la lectura confunde "contenedor sano" con "contenedor reconstruido": el sanity check no asegura que la imagen activa sea la última construida, sólo que hay un contenedor válido. Esa confusión es la que el [capítulo 05](../chapters/05-diagnostico.md) busca prevenir; releer el escenario 3 antes de seguir.

Si la respuesta fue A o D, el ejercicio reveló una grieta entre el modelo de capas del [capítulo 01](../chapters/01-devcontainer.md) y la lectura del síntoma. Releer las primeras dos secciones de ese capítulo y volver a intentarlo.

## Criterio de finalización

Una opción elegida con justificación que cite explícitamente al menos dos elementos del síntoma (`verify-setup.sh` pasó, sanity check pasó, el comando se cuelga, no hay output, etc.) como evidencia para descartar las opciones rivales.
