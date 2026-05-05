# Ejercicio 03 — Agregar una dependencia ligera

## Contexto

El [capítulo 03](../chapters/03-cargo-toml.md) introdujo `[dependencies]` como contrato declarativo y el [capítulo 04](../chapters/04-cargo-lock.md) mostró que `Cargo.lock` registra las versiones exactas resueltas. Este ejercicio aplica los dos sobre un cambio mínimo.

## Consigna

1. Sobre el package binario del ejercicio 01 (o uno equivalente), confirmar que **no existe** `Cargo.lock` antes de empezar (`ls Cargo.lock` debería fallar). Si existe, borrarlo.
2. Compilar con `cargo build` y verificar que ahora `Cargo.lock` apareció. Guardar una copia (`cp Cargo.lock Cargo.lock.antes`).
3. Agregar la dependencia `anyhow` (versión `"1"` o cualquier requisito compatible con la última estable disponible) editando `Cargo.toml` a mano **o** corriendo `cargo add anyhow`.
4. Compilar de nuevo con `cargo build`. Comparar el lockfile actual con el guardado (`diff Cargo.lock.antes Cargo.lock`).
5. Responder, citando el diff:
   - ¿Qué entradas `[[package]]` aparecieron y cuál desapareció (si alguna)?
   - ¿La entrada de tu propio package quedó igual o cambió? ¿Qué campo cambió y por qué?
6. Correr `cargo update`. Capturar la salida y observar si el lockfile cambió. Razonar por qué cambió o por qué no.

## Resultado esperado

El diff del lockfile antes y después del `cargo add`, con anotaciones sobre qué entradas aparecieron y por qué. La respuesta a la última pregunta, sustentada en la salida de `cargo update` y en el contenido del nuevo lockfile.

## Verificación

Después del `cargo add anyhow`, el lockfile gana al menos una entrada `[[package]] name = "anyhow"` con su `version`, `source = "registry+https://github.com/rust-lang/crates.io-index"` y un `checksum`. La entrada del propio package gana en su sección `dependencies` la línea ` "anyhow",`. La línea de versión del propio package no cambia (la versión la fija el manifiesto, no la resolución de dependencias).

`cargo update` no modifica el lockfile si no hay versiones nuevas compatibles con los rangos del manifiesto. Si imprime `Locking 0 packages to latest Rust ... compatible version`, eso es lo esperado. Si imprime una línea `Updating anyhow vX -> vY`, el lockfile se actualizó.

## Criterio de finalización

El diff está capturado y anotado. La distinción entre «el manifiesto declara un rango» y «el lockfile registra la versión exacta resuelta» queda formulada con palabras propias en la respuesta.
