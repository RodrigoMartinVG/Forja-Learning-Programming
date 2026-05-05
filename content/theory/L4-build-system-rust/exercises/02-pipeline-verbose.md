# Ejercicio 02 — Ver el pipeline subyacente

## Contexto

El [capítulo 01](../chapters/01-de-gcc-a-cargo.md) mostró que `cargo build` esconde un pipeline observable y que `cargo build -v` lo abre imprimiendo cada invocación de `rustc`. Este ejercicio toma esa salida y la disecciona.

## Consigna

1. Sobre el package del ejercicio 01 (o uno equivalente), correr `cargo clean` para vaciar la caché.
2. Correr `cargo build -v` y guardar la salida completa.
3. Aislar la línea (o bloque) que empieza con `Running '...rustc ... src/main.rs ...'`. Esa es la invocación principal.
4. Identificar al menos **tres flags** pasadas a `rustc` que no sean el archivo fuente, y para cada una explicar:
   - qué declara (a qué etapa del pipeline corresponde, o qué propiedad del build fija);
   - qué pasaría conceptualmente si se omitiera o se cambiara.
5. Responder: ¿hay flags que provienen del `Cargo.toml` del package? Identificar al menos una y citar la sección del manifiesto que la determina.

## Resultado esperado

La línea de invocación de `rustc` capturada literalmente, más una tabla de tres filas con columnas *flag*, *qué declara*, *qué pasa si cambia*. Una respuesta breve a la última pregunta con cita textual del `Cargo.toml`.

## Verificación

Flags candidatas para analizar (no es exhaustivo): `--crate-name <nombre>` (define el nombre del crate, viaja al artefacto y a los símbolos), `--edition=<año>` (selecciona la edición de Rust, viene del campo `edition` del manifiesto), `--crate-type bin` (define el tipo de artefacto a producir, lo determina la presencia de `src/main.rs` o una sección `[[bin]]`), `--out-dir target/debug/deps` (dónde dejar los artefactos, lo decide cargo según el profile activo), `-C debuginfo=2` (cantidad de debug info embebida, viene del profile `dev`), `--emit=dep-info,link` (qué tipos de salida producir).

La conexión con el manifiesto se observa en `--edition=<año>`: el campo `edition` de `[package]` aparece literalmente como flag.

## Criterio de finalización

Las tres flags elegidas no son arbitrarias: cada una se relaciona con una decisión concreta del build (etapa del pipeline o sección del manifiesto). La cita del `Cargo.toml` es literal, no paráfrasis.
