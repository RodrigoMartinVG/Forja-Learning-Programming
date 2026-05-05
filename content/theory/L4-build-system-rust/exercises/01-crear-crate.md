# Ejercicio 01 — Crear un crate y nombrar sus piezas

## Contexto

El [capítulo 02](../chapters/02-crate-package-workspace.md) separó tres unidades —crate, package, workspace— que los tutoriales suelen mezclar. Este ejercicio fija la distinción aplicándola a un crate recién creado.

## Consigna

1. Crear un nuevo package binario con `cargo new --bin laboratorio-l4`.
2. Listar los archivos generados con `ls -la laboratorio-l4` y `ls -la laboratorio-l4/src`.
3. Para cada archivo o carpeta listado, escribir una oración corta que diga **qué declara** o **qué función cumple** dentro del package.
4. Responder, citando el contenido del `Cargo.toml` generado, dos preguntas:
   - ¿Cuántos crates produce este package y de qué tipo?
   - ¿Cuál es el crate root y por qué?
5. Repetir el experimento con `cargo new --lib utilidades` y comparar las dos salidas: qué archivos cambian, qué archivo desaparece, qué archivo nuevo aparece.

## Resultado esperado

Un documento corto con dos secciones (binario y biblioteca) y, en cada una, la lista de archivos con su rol declarado, más las respuestas a las preguntas. La comparación final puede ser una tabla.

## Verificación

Para el package binario: el `src/main.rs` con `fn main()` es el crate root del único crate (binario) que el package produce. `Cargo.toml` declara `[package]` con nombre, versión y edición; no declara `[lib]` ni `[[bin]]` porque el layout convencional alcanza. `.gitignore` excluye `target/`. Si no aparece `src/lib.rs`, el package no contiene crate biblioteca.

Para el package biblioteca: el `src/lib.rs` con la función `add` y un módulo `tests` es el crate root del único crate (biblioteca) del package. No aparece `src/main.rs`, así que el package no produce binario.

## Criterio de finalización

Las dos preguntas están respondidas con citas del `Cargo.toml`, no con paráfrasis. La tabla comparativa enumera al menos: presencia de `src/main.rs`, presencia de `src/lib.rs`, presencia del módulo `tests` por defecto, tipo de crate que el package contiene.
