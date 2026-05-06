# `Cargo.toml` como manifiesto declarativo

## El manifiesto como contrato

En el flujo de `L3`, lo que un build "necesitaba" vivía repartido entre varios sitios: las flags de la línea de comandos, las reglas de un `Makefile`, las invocaciones a `pkg-config`, los scripts auxiliares del proyecto. Cada uno declaraba una parte del contrato y ninguno lo agrupaba. Apenas cambiaba la máquina o la persona que mantenía el proyecto, había que reconstruir el contrato leyendo todos los archivos juntos.

`Cargo.toml` resuelve esa fragmentación moviendo el contrato a un único archivo declarativo en formato TOML. Cada bloque del manifiesto fija un aspecto del package, y `cargo` lee todo el archivo en cada invocación de cualquier subcomando para decidir qué hacer. Leer un `Cargo.toml` ajeno y entender qué declara es, en este nivel, equivalente a mirar el `Makefile` y los scripts auxiliares de un proyecto C: es la fuente de verdad sobre qué necesita el package para construirse y cómo se identifica.

El manifiesto del crate `saludo` después de unos pocos comandos del nivel se ve así:

```toml
[package]
name = "saludo"
version = "0.1.0"
edition = "2024"

[dependencies]
anyhow = "1.0.102"
```

Cinco líneas no triviales. Cada bloque entre corchetes es una **sección**, y cada sección regula un aspecto distinto del package. Las que aparecen acá son las dos imprescindibles, pero el manifiesto admite varias más; se introducen progresivamente.

## Identidad del package y edición

La sección `[package]` declara la identidad del package. Tres campos son obligatorios:

- `name`: el nombre del package. Tiene que ser un slug ASCII válido. Se usa como nombre por defecto del crate principal y como identificador en `crates.io` si el package se publica.
- `version`: la versión del package, en formato semántico (`mayor.menor.parche`). `cargo new` la inicializa en `0.1.0`. Esa versión es lo que otros packages declaran cuando dependen de este.
- `edition`: la **edición de Rust** que el código del package usa. Las ediciones (`2015`, `2018`, `2021`, `2024`) son revisiones del lenguaje que cambian aspectos de sintaxis y resolución de nombres sin romper compatibilidad con código existente. `cargo new` toma la edición más reciente disponible en la toolchain actual.

Hay otros campos opcionales —`authors`, `description`, `license`, `repository`, `homepage`, `keywords`, `categories`— que solo importan si el package se publica a `crates.io`. Para uso interno se pueden omitir; el package compila igual sin ellos.

Una observación que ahorra confusión más adelante: el campo `name` del package no es el nombre con el que un crate consumidor lo importa en código Rust. El consumidor escribe `use anyhow::...` para usar `anyhow`, sí, pero internamente `cargo` traduce el nombre del package al nombre del crate que produce, y los identificadores de Rust no permiten guiones. Si un package se llama `mi-herramienta`, el código que lo usa escribe `use mi_herramienta::...` con guión bajo, no con guión. Esa traducción es automática y bidireccional: en `Cargo.toml` se escribe con guión, en Rust con guión bajo.

## Dependencias declaradas como requisitos

La sección `[dependencies]` enumera lo que el package necesita para compilar. Cada línea tiene la forma `<nombre> = "<requisito>"` o, para casos más complejos, `<nombre> = { ... }` con un mapa de opciones.

```toml
[dependencies]
anyhow = "1.0.102"
serde = { version = "1.0", features = ["derive"] }
mi-libreria = { path = "../mi-libreria" }
```

El valor a la derecha es un **requisito de versión**, no una versión exacta. La cadena `"1.0.102"` significa, según las reglas de cargo, "compatible con `1.0.102`": cualquier versión `1.x.y` con `x.y >= 0.102` es aceptable. Si mañana se publica `1.0.103`, esa versión satisface el requisito y un build nuevo en una máquina sin lockfile la elegiría. La fijación a una versión exacta no la hace el manifiesto: la hace el `Cargo.lock`, y eso se trata en el [próximo capítulo](04-cargo-lock.md).

Las dependencias pueden venir de tres fuentes principales:

- **`crates.io`** (default): se especifica solo el requisito de versión. `cargo` descarga el package del registry público.
- **una ruta del filesystem**: `mi-libreria = { path = "../mi-libreria" }`. Útil para desarrollar dos packages en paralelo sin publicarlos.
- **un repositorio Git**: `mi-libreria = { git = "https://github.com/...", branch = "main" }`. Útil para usar versiones aún no publicadas.

Las tres formas pueden coexistir en el mismo manifiesto. Se introducen acá para que el lector las reconozca cuando aparezcan; el flujo dominante en este nivel es `crates.io`.

`cargo add` permite agregar una dependencia sin editar el manifiesto a mano:

```text
$ cargo add anyhow
    Updating crates.io index
     Locking 1 package to latest Rust 1.95.0 compatible version
      Adding anyhow v1.0.102
```

Detrás del subcomando, `cargo add` consultó el registry, eligió la última versión compatible con la toolchain instalada, escribió la línea correspondiente en `[dependencies]` y actualizó `Cargo.lock`. El mismo efecto se obtiene editando `Cargo.toml` a mano y corriendo `cargo build`; `cargo add` solo automatiza el paso.

## `dev-dependencies` y `build-dependencies`

No todas las dependencias se necesitan al mismo tiempo. `Cargo.toml` admite tres secciones distintas:

- `[dependencies]`: lo que el código del package necesita para compilar. Se incorpora al binario o biblioteca finales.
- `[dev-dependencies]`: lo que el package necesita solo para correr tests, benchmarks o ejemplos. **No** se incorpora al binario o biblioteca finales.
- `[build-dependencies]`: lo que un eventual `build.rs` (script de build del package) necesita para correr. Se compila aparte y se ejecuta antes que el código del package, pero no se incorpora al artefacto.

La distinción importa por dos razones. La primera es trivial: si una dependencia solo se usa en tests, declararla en `[dependencies]` la arrastra innecesariamente al binario final, agrandándolo. La segunda es de seguridad: las `dev-dependencies` y `build-dependencies` no aparecen como dependencias transitivas del package cuando otro lo consume. Si el package `saludo` declara `proptest` en `[dev-dependencies]`, un consumidor de `saludo` no recibe `proptest` como dependencia heredada.

En el crate de referencia, agregar una `dev-dependency` ligera muestra que el binario final no la incluye:

```toml
[package]
name = "saludo"
version = "0.1.0"
edition = "2024"

[dependencies]
anyhow = "1.0.102"

[dev-dependencies]
pretty_assertions = "1"
```

`cargo build` no compila `pretty_assertions`. `cargo test` sí. La separación es operativa.

`[build-dependencies]` aparece solo cuando el package tiene un `build.rs` propio en su raíz. En la mayoría de los packages no hay `build.rs`, y la sección queda ausente.

## Declarar varios artefactos en el mismo package

Un package con un único crate binario o biblioteca no necesita decirle a `cargo` qué crates contiene: la convención —`src/main.rs` para binario, `src/lib.rs` para biblioteca— alcanza. Apenas el package contiene varios artefactos, las secciones `[lib]`, `[[bin]]` y `[[example]]` aparecen para configurarlos.

Un package con un crate biblioteca y dos binarios podría declararse así:

```toml
[package]
name = "mi-herramienta"
version = "0.1.0"
edition = "2024"

[lib]
name = "mi_herramienta"
path = "src/lib.rs"

[[bin]]
name = "analizar"
path = "src/bin/analizar.rs"

[[bin]]
name = "reportar"
path = "src/bin/reportar.rs"

[dependencies]
clap = "4"
```

La doble corchete (`[[bin]]`) es sintaxis de TOML para arrays de tablas: cada `[[bin]]` agrega una entrada al array, y por eso pueden aparecer varias. La corchete simple (`[lib]`) declara un único elemento.

Si los binarios viven en `src/bin/*.rs` y la biblioteca en `src/lib.rs`, las secciones `[lib]` y `[[bin]]` se pueden omitir: `cargo` los detecta por convención. Las secciones se vuelven necesarias cuando hace falta cambiar el nombre del crate, mover su archivo de origen, o pasarle configuración propia.

## Lo que el manifiesto no fija

Para evitar confusiones que aparecen seguido en proyectos reales, vale la pena declarar lo que `Cargo.toml` deliberadamente **no** decide:

- **Las versiones exactas de las dependencias.** El manifiesto declara requisitos; la fijación vive en `Cargo.lock`.
- **Las flags de codegen para `release` o `debug`.** Esas viven en la sección `[profile.<nombre>]` (capítulo 06), que puede aparecer en este mismo `Cargo.toml`, pero son una sección distinta de `[package]` y `[dependencies]`.
- **Qué toolchain de Rust se usa.** Eso lo decide `rustup`, basado en `rust-toolchain.toml` si existe, en el override del directorio si existe, o en la default de la máquina. `Cargo.toml` no la fija.
- **Dónde se publica el package.** Si el manifiesto no agrega `publish = false`, `cargo publish` lo subiría a `crates.io`. Para uso interno se suele declarar explícitamente `publish = false` para evitar publicaciones accidentales.

Esa lista es importante porque cada confusión típica con `cargo` —«por qué cambió la versión», «por qué `release` tarda más», «por qué el build usa `rustc` 1.91 si la máquina tiene 1.95»— suele resolverse mirando un archivo distinto del manifiesto.

## Cierre

Después de este capítulo, leer un `Cargo.toml` ajeno permite responder con precisión:

- ¿quién es este package y a qué versión apunta?
- ¿qué dependencias declara y de qué clase (runtime, dev, build)?
- ¿declara más de un crate, y de qué tipo?
- ¿qué cosas todavía no fija, y dónde van a quedar fijadas?

El próximo capítulo se ocupa de la última pregunta: cómo `Cargo.lock` traduce los requisitos del manifiesto en versiones exactas, y por qué eso es la primera forma material de reproducibilidad que el flujo de `L3` no había abordado.
