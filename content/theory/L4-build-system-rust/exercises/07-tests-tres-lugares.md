# Ejercicio 07 — Tests en tres lugares

## Contexto

El [capítulo 07](../chapters/07-test-doc.md) mostró que cargo reconoce tres ubicaciones canónicas para tests: módulos `#[cfg(test)]` dentro del propio archivo, archivos `tests/*.rs` para tests de integración, y bloques de código dentro de comentarios de documentación (doctests). Este ejercicio agrega los tres a un mismo crate y observa cómo `cargo test` los reporta.

## Consigna

1. Crear un crate biblioteca: `cargo new --lib tres-tests`.
2. En `src/lib.rs`, dejar la función `add` por defecto, asegurando que tiene `pub`. Agregar (si no está ya) el módulo `#[cfg(test)] mod tests` con un test unitario sobre `add`.
3. Agregar un comentario de documentación a `add` que incluya un bloque de código de ejemplo —rodeado por triple backtick— que use `add` y verifique con `assert_eq!` un caso concreto.
4. Crear el archivo `tests/integracion.rs` con un test de integración que importe `tres_tests::add` y verifique otro caso.
5. Correr `cargo test`. Capturar la salida completa.
6. Identificar en la salida los tres bloques separados:
   - `Running unittests src/lib.rs` (los tests del módulo `mod tests`);
   - `Running tests/integracion.rs` (los tests de integración);
   - `Doc-tests tres-tests` (los doctests).
7. Responder:
   - ¿Cuántos tests reporta cada bloque y qué binario los corre?
   - ¿Por qué el doctest aparece como un test separado y no fusionado con los unitarios?
   - ¿Qué pasa si el doctest tiene `assert_eq!` con un valor incorrecto? Hacer la prueba modificando el ejemplo del comentario para que falle, correr `cargo test`, capturar el error y restaurar el código.

## Resultado esperado

La salida de `cargo test` con los tres bloques marcados. Las respuestas a las tres preguntas, con cita de los reportes para el conteo de tests. La salida del doctest fallido, con el mensaje de error `rustdoc` produce.

## Verificación

La salida tiene tres secciones encabezadas por «Running» o «Doc-tests», y cada sección termina con un `test result:` propio. El total de tests sumados es 3 (uno por ubicación).

Los doctests aparecen separados porque `rustdoc` —no `rustc` directamente— los compila como crates ad hoc temporales y los ejecuta. La separación permite que cada doctest fallido reporte la línea del comentario donde estaba.

Un doctest con `assert_eq!` incorrecto produce un error como `assertion failed` que incluye el snippet del comentario, la línea, y un panic similar al de un test ordinario. La diferencia es que el archivo y la línea apuntan al `.rs` original donde estaba el comentario, no a un test sintetizado.

## Criterio de finalización

Los tres tests están escritos y compilan. La salida de `cargo test` se incluye con los tres bloques visibles. El experimento de doctest fallido se ejecutó y capturó el error.
