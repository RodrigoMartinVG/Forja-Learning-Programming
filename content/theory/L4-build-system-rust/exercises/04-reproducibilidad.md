# Ejercicio 04 — Romper la reproducibilidad y restaurarla

## Contexto

El [capítulo 04](../chapters/04-cargo-lock.md) explicó por qué `Cargo.lock` es el archivo que separa una resolución oportunista de una resolución reproducible. Este ejercicio prueba la afirmación borrando y regenerando el lockfile.

## Consigna

1. Sobre el package del ejercicio 03 (con `anyhow` ya agregado y lockfile poblado), guardar una copia del lockfile actual: `cp Cargo.lock Cargo.lock.original`.
2. Borrar el lockfile: `rm Cargo.lock`.
3. Correr `cargo build` para forzar a cargo a regenerar el lockfile desde cero.
4. Comparar el nuevo lockfile con el original: `diff Cargo.lock.original Cargo.lock`.
5. Responder:
   - ¿Las versiones exactas de las dependencias coinciden con las anteriores? ¿Por qué?
   - ¿Cambian los `checksum`?
   - Si en este ejercicio salió todo igual, ¿en qué condiciones podrían diferir? Dar al menos una.
6. Restaurar el lockfile original: `cp Cargo.lock.original Cargo.lock`.
7. Probar `cargo build --locked` y verificar que ahora cargo se compromete a no modificar el lockfile.
8. Borrar **una entrada** del manifiesto (por ejemplo, comentar o eliminar la línea `anyhow = ...`) y correr `cargo build --locked`. Capturar el error.

## Resultado esperado

El diff del paso 4 (probablemente vacío o casi vacío en condiciones normales). La respuesta a las tres preguntas. El error capturado en el paso 8 (que mencione `--locked` y `lock file ... needs to be updated`).

## Verificación

En la mayoría de los casos, regenerar el lockfile inmediatamente después de borrarlo produce un archivo idéntico al original: el algoritmo de resolución es determinista respecto al estado del registry y de los rangos del manifiesto. Si no apareció ninguna versión nueva en `crates.io` desde el primer build, el resultado coincide.

Las versiones podrían diferir si: (a) entre los dos builds se publicó una versión nueva compatible y se forzó la actualización; (b) cambió el manifiesto entre los dos builds; (c) se usó `cargo update` antes del segundo build; (d) el algoritmo del resolver cambió entre versiones de cargo.

`cargo build --locked` con una dependencia ausente del lockfile imprime un error que menciona explícitamente que el lockfile necesita actualización y que `--locked` lo prohíbe.

## Criterio de finalización

Las tres preguntas tienen respuesta argumentada (no «sí/no»). El error del paso 8 está capturado literalmente. La distinción entre `cargo build` (puede actualizar el lockfile silenciosamente si hay cambios) y `cargo build --locked` (falla en lugar de actualizar) queda formulada con palabras propias.
