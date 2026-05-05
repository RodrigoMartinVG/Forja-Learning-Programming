# Ejercicio 05 — Caché de artefactos

## Contexto

El [capítulo 05](../chapters/05-target.md) presentó `target/` como caché segmentada que evita recompilar lo ya compilado. Este ejercicio mide el efecto de la caché sobre el mismo crate en tres condiciones distintas.

## Consigna

1. Sobre el package del ejercicio 03 (con `anyhow` como dependencia), correr `cargo clean` para vaciar la caché.
2. Medir el primer build: `time cargo build`. Anotar el tiempo `real`.
3. Sin tocar nada, correr de nuevo `time cargo build`. Anotar el tiempo `real` y comparar con el anterior.
4. Modificar **mínimamente** `src/main.rs` (por ejemplo, agregar una línea de comentario o cambiar un literal). Correr de nuevo `time cargo build`. Anotar el tiempo `real`.
5. Modificar `Cargo.toml` agregando un campo opcional al `[package]` (por ejemplo `description = "..."`). Correr `cargo build`. Anotar el tiempo y observar qué crates se recompilan, leyendo las líneas `Compiling X` de la salida.
6. Listar el contenido de `target/debug/` y anotar qué archivos cambiaron de timestamp en cada paso (`ls -lt target/debug/ | head -10`).

## Resultado esperado

Una tabla con cuatro filas (paso 2, 3, 4, 5) y columnas: *acción*, *tiempo real*, *qué se recompiló*. Más una observación al final sobre por qué el patrón de tiempos tiene la forma que tiene.

## Verificación

Para un crate trivial con `anyhow` como única dependencia:

- Paso 2 (build desde cero): del orden de 1–2 segundos. Compila `anyhow` y el package.
- Paso 3 (build sin cambios): centésimas de segundo. Cargo verifica que nada cambió y termina sin recompilar.
- Paso 4 (cambio en `main.rs`): décimas de segundo. Recompila solo el crate del package, no `anyhow`.
- Paso 5 (cambio cosmético en `Cargo.toml`): décimas de segundo si solo cambió un campo metadata; podría disparar más recompilación si el cambio toca `[dependencies]` o profile.

La observación final debería conectar los tres efectos con la lógica de `target/.fingerprint/`: cargo guarda huellas que registran el estado de cada crate y solo invalida las que cambiaron.

## Criterio de finalización

La tabla está completa y los cuatro tiempos siguen el patrón esperado (con tolerancia: lo importante es el **orden de magnitud**, no los milisegundos exactos). La observación final usa el término «huella» o «fingerprint» y conecta con archivos concretos dentro de `target/`.
