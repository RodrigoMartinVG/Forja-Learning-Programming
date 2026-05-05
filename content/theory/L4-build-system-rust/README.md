# L4 — El sistema de build de Rust

> Documento de diseño interno del nivel. Voz y prosa: [estandar_editorial_forja.md](../../../estandar_editorial_forja.md). Estructura: [CONVENTIONS.md](../../../CONVENTIONS.md). Plan de capítulos y ejercicios: [outline.md](outline.md).

## Estado editorial

- Authoría real abierta.
- Outline aprobado.
- Capítulos `chapters/00`–`chapters/08` redactados.
- Ejercicios en `exercises/` con un archivo por consigna.

## Prerrequisitos

- [`L3`](../L3-pipeline-compilacion-c) — el pipeline de compilación en C como hilo conductor. Cada capítulo de `L4` contrasta una pieza de `cargo` con su equivalente en el flujo `gcc + make` de `L3`. Sin ese punto de comparación, varias decisiones de cargo quedan sin contexto.

## Bloque editorial de entrada recomendado

Antes de empezar `L4` conviene haber leído [content/theory/forja.md](../forja.md) y [content/theory/README.md](../README.md), y haber completado los capítulos centrales de `L3`. Este nivel no enseña Rust como lenguaje: enseña el **build system** que cualquier proyecto Rust usa, asumiendo que la toolchain ya está instalada (lo dejó verificado `L0`).

## Objetivo del nivel

Que la persona pueda crear un crate Rust con dependencia y tests, identificar las piezas materiales que `cargo` manipula (`Cargo.toml`, `Cargo.lock`, `target/`), explicar qué hace `cargo` en cada subcomando como orquestación de pasos sobre esas piezas, y comparar ese flujo con el pipeline manual de `L3`.

## Capítulos

1. [Por qué `cargo` se siente opaco después de `L3`](chapters/00-introduccion.md)
2. [De `gcc` a mano a un build system declarativo](chapters/01-de-gcc-a-cargo.md)
3. [Crate, package y workspace](chapters/02-crate-package-workspace.md)
4. [`Cargo.toml` como manifiesto declarativo](chapters/03-cargo-toml.md)
5. [`Cargo.lock` y la reproducibilidad](chapters/04-cargo-lock.md)
6. [El directorio `target/` como caché de artefactos](chapters/05-target.md)
7. [Profiles: `dev` y `release`](chapters/06-profiles.md)
8. [`cargo test` y `cargo doc` como interfaces unificadas](chapters/07-test-doc.md)
9. [Workspaces y comparación final con C](chapters/08-workspaces-y-cierre.md)

## Ejercicios

Los ejercicios viven en [exercises/](exercises/), un archivo por consigna. Cada uno produce evidencia observable (un comando con su salida, un diff, un binario que corre) y se apoya en un capítulo concreto. La progresión sigue el orden de los capítulos:

1. [Crear un crate y nombrar sus piezas](exercises/01-crear-crate.md) — capítulo 02.
2. [Ver el pipeline subyacente](exercises/02-pipeline-verbose.md) — capítulo 01.
3. [Agregar una dependencia ligera](exercises/03-agregar-dependencia.md) — capítulos 03 y 04.
4. [Romper la reproducibilidad y restaurarla](exercises/04-reproducibilidad.md) — capítulo 04.
5. [Caché de artefactos](exercises/05-cache-de-artefactos.md) — capítulo 05.
6. [Comparar profiles](exercises/06-comparar-profiles.md) — capítulo 06.
7. [Tests en tres lugares](exercises/07-tests-tres-lugares.md) — capítulo 07.
8. [Workspace mínimo](exercises/08-workspace-minimo.md) — capítulo 08.

## Proyectos asociados

`L4` no tiene proyectos propios. Sirve de base para `hello-rust`, `fizzbuzz-rust` y `mini-calculator` en `L14`, que asumen que la persona ya sabe crear un crate, agregar una dependencia y correr `cargo test`.

## Próximo paso después de `L4`

`L5` y los niveles inmediatamente siguientes profundizan herramientas asociadas a la toolchain Rust (`rust-analyzer`, `clippy`, `rustfmt`) sobre la maquinaria que `L4` deja instalada. `L14` reabre cargo desde el lado del lenguaje: con un build system entendido, las preguntas sobre por qué `cargo` hace X dejan de competir con las preguntas sobre el lenguaje en sí.

## Notas de mantenimiento

- Si la toolchain Rust del devcontainer cambia de versión, revisar las salidas de `cargo build -v` y `cargo update` reproducidas en los capítulos: las flags y los hashes pueden cambiar.
- El crate de referencia del nivel es un binario trivial (`saludo`) con `anyhow` como dependencia ligera. Si se decide reemplazar `anyhow`, el cambio toca los capítulos 01, 03 y 04.
- Si la documentación oficial de cargo cambia las convenciones para commitear `Cargo.lock` en bibliotecas, revisar el capítulo 04.
- Los ejemplos de `[profile.dev]` y `[profile.release]` del capítulo 06 se basan en los defaults de cargo al momento de redacción; si Rust modifica esos defaults en una edición futura, actualizar la tabla comparativa.
