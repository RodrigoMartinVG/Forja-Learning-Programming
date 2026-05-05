# De `gcc` a mano a un build system declarativo

## La línea corta y lo que esconde

`L3` cerró con un `gcc hello.c -o hello` que internamente recorría cuatro etapas y producía cinco artefactos. Pidiéndole al compilador que se detuviera en cada etapa con `-E`, `-S` y `-c`, los artefactos intermedios quedaban en disco y podían inspeccionarse uno por uno. Ese mismo modelo —comando único que esconde un pipeline— vuelve a aparecer ahora con `cargo build`, y vuelve con la misma falta de transparencia inicial. Sobre el crate de referencia recién creado con `cargo new --bin saludo`, `cargo build` produce esto:

```text
$ cargo build
   Compiling saludo v0.1.0 (/tmp/l4-lab/saludo)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.78s
```

Dos líneas. Ningún archivo intermedio listado, ninguna invocación visible al compilador, ninguna pista del linker. Una persona que viene de `L3` razonablemente sospecha que detrás tiene que haber lo mismo: un compilador, un código objeto, un linker, un ejecutable. La única manera de confirmar esa sospecha es pedirle a `cargo` que muestre lo que hace.

## Ver las invocaciones reales con `cargo build -v`

`cargo build` admite la flag `-v` (o `--verbose`) que cambia el modo de reporte: en lugar de imprimir solo los nombres de los crates compilados, imprime cada comando que ejecuta. Sobre el mismo crate, después de un `cargo clean` para forzar la recompilación, la salida se vuelve mucho más larga:

```text
$ cargo clean
$ cargo build -v
   Compiling saludo v0.1.0 (/tmp/l4-lab/saludo)
     Running `/home/vscode/.rustup/toolchains/stable-x86_64-unknown-linux-gnu/bin/rustc \
        --crate-name saludo --edition=2024 src/main.rs \
        --error-format=json --json=diagnostic-rendered-ansi,artifacts,future-incompat \
        --crate-type bin --emit=dep-info,link \
        -C embed-bitcode=no -C debuginfo=2 \
        --check-cfg 'cfg(docsrs,test)' --check-cfg 'cfg(feature, values())' \
        -C metadata=fec204d505c904b2 -C extra-filename=-fa76d3ee231746bb \
        --out-dir /tmp/l4-lab/saludo/target/debug/deps \
        -C incremental=/tmp/l4-lab/saludo/target/debug/incremental \
        -L dependency=/tmp/l4-lab/saludo/target/debug/deps`
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.15s
```

El comando completo se imprimió con saltos de línea agregados acá para que entre en pantalla; en la terminal aparece todo en una sola línea muy larga. Lo importante no es memorizar las flags: es reconocer que la línea **es** una invocación concreta a `rustc`. Aparece la ruta absoluta del compilador, el archivo fuente (`src/main.rs`), la edición del lenguaje (`--edition=2024`), el tipo de artefacto a producir (`--crate-type bin`), el directorio de salida (`--out-dir target/debug/deps`), y un puñado de flags de codegen que el manifiesto del crate determinó.

Detrás de la línea «Compiling saludo v0.1.0» que el modo no verbose imprime, ese comando estaba todo el tiempo. La diferencia entre los dos modos es de presentación, no de comportamiento: el trabajo que se hace es el mismo, solo que `cargo` filtra la salida por defecto y la reabre con `-v`. Esa observación tiene una consecuencia operativa que resuena con todo lo que `L4` va a mostrar: cada nombre que aparece en la salida resumida —«Compiling X», «Building X», «Locking N packages»— condensa invocaciones concretas a herramientas concretas, y cada una se puede destapar cuando hace falta diagnosticar algo.

## Aparece una segunda invocación cuando hay dependencias

El crate `saludo` recién creado no tiene dependencias, y por eso la salida verbose muestra una sola invocación a `rustc`. Apenas se le agrega una dependencia, el pipeline crece. `cargo add anyhow` modifica el manifiesto:

```text
$ cargo add anyhow
    Updating crates.io index
     Locking 1 package to latest Rust 1.95.0 compatible version
      Adding anyhow v1.0.102
```

Y un nuevo build verbose muestra varias invocaciones encadenadas, una por dependencia más una por el crate del proyecto:

```text
$ cargo clean
$ cargo build -v
 Downloading crates ...
  Downloaded anyhow v1.0.102
   Compiling anyhow v1.0.102
     Running `... rustc --crate-name build_script_build --edition=2021 \
        .../anyhow-1.0.102/build.rs --crate-type bin ...`
     Running `/tmp/l4-lab/saludo/target/debug/build/anyhow-cb87a3af1a123b00/build-script-build`
     Running `... rustc --crate-name anyhow --edition=2021 \
        .../anyhow-1.0.102/src/lib.rs --crate-type lib ...`
   Compiling saludo v0.1.0 (/tmp/l4-lab/saludo)
     Running `... rustc --crate-name saludo --edition=2024 src/main.rs \
        --crate-type bin ... --extern anyhow=.../libanyhow-81e0f801a5d79612.rlib`
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 1.35s
```

Tres invocaciones a `rustc` y una al script de build de `anyhow`. La primera invocación compila el `build.rs` de la dependencia (porque `anyhow` declara uno); la segunda lo ejecuta como binario auxiliar; la tercera compila la biblioteca propiamente dicha; la cuarta compila el crate del proyecto, que ahora pasa `--extern anyhow=...rlib` para enganchar la biblioteca recién producida. Cada paso es una herramienta llamada con sus argumentos. Detrás de las dos líneas «Compiling anyhow» y «Compiling saludo» que la salida resumida imprime, ese trabajo estaba ocurriendo entero.

Cada línea de la salida resumida nombra a un crate como si él se compilara solo, pero el verbose muestra otra cosa: detrás del nombre que figura en pantalla hay invocaciones concretas a `rustc`, a un linker, a un script de build, todas con argumentos específicos que `cargo` calcula a partir del manifiesto, del lockfile y del estado de `target/`. La línea corta es el reporte; el trabajo es la suma de las invocaciones que el flag verbose pone a la vista.

## Equivalencia con `L3` etapa por etapa

La cadena que `cargo build` ejecuta corresponde, pieza por pieza, con la cadena que `L3` mostró para C. La tabla siguiente alinea las dos:

| Pipeline de `L3` (C, manual)                     | Pipeline de `cargo build` (Rust)                                          |
|---|---|
| `gcc -E hello.c -o hello.i`                       | (no expuesto: no hay etapa de preprocesado separada en Rust)               |
| `gcc -S hello.i -o hello.s`                       | (interno a `rustc`: assembly intermedio inspeccionable con `--emit=asm`)   |
| `gcc -c hello.s -o hello.o`                       | `rustc --crate-type bin/lib ...` produce código objeto en `target/.../deps/` |
| `gcc hello.o -o hello`                            | linker invocado por `rustc` con flags pasadas por `cargo`                  |

No hay equivalente directo del preprocesador de C en Rust, porque el lenguaje no usa `#include` ni macros textuales: las macros de Rust se expanden adentro de `rustc` como parte del análisis sintáctico, no como una etapa textual previa. La compilación a assembly y el ensamblado tampoco aparecen como pasos separados en la salida de `cargo`, pero existen: `rustc` los hace internamente y, si se le pide con `--emit=asm` o `--emit=obj`, deja los artefactos correspondientes en disco. El linking final, en cambio, sí es un paso visible: en builds más grandes la línea «Compiling X» del crate raíz dispara una invocación a un linker (`ld`, `lld` o el que la toolchain elija), exactamente como en `L3`.

La diferencia material respecto al flujo de `L3` no es que el pipeline desapareció, es que **se movió de la línea de comandos al manifiesto**. En `L3` la decisión de qué optimizar, qué incluir como header, qué linkear y a dónde mandar el output viajaba como flags de `gcc` cada vez que se invocaba. En `L4` esa misma información vive en `Cargo.toml`, en `Cargo.lock` y en los profiles que se ven después; `cargo` lee todo eso y lo traduce a flags concretas de `rustc` y del linker. El comando corto que el lector escribe es el mismo (`cargo build`), pero las flags que se aplican vienen de archivos.

## Qué aporta `cargo` además de invocar el compilador

Si lo único que `cargo` hiciera fuera invocar a `rustc` con flags fijas, sería un wrapper trivial. Aporta algo más, y lo aporta justamente con las piezas que el resto del nivel separa:

1. **Resolución de dependencias.** Lee la lista de `[dependencies]` del manifiesto, consulta el registry, descarga lo que falta y construye un grafo de compilación que incluye todos los crates dependientes. La salida muestra una línea «Compiling X» por crate del grafo.
2. **Caché de artefactos.** Mantiene `target/` segmentada por profile y por tipo de salida, marca cada artefacto con un hash que depende de la versión, las flags y el código fuente, y reutiliza lo que sigue válido. Por eso un segundo `cargo build` sin cambios termina en milésimas de segundo, mientras que el primero después de `cargo clean` lleva todo el tiempo de compilar todo.
3. **Reproducibilidad.** Genera y respeta `Cargo.lock`, que registra las versiones exactas resueltas en un build dado, de modo que dos máquinas con el mismo commit obtengan el mismo grafo (capítulo 04).
4. **Subcomandos sobre el mismo grafo.** `cargo run`, `cargo test`, `cargo doc`, `cargo clippy` y otros operan sobre el mismo plan de compilación que `cargo build`, simplemente cambiando qué binario corren al final, qué profile usan o qué herramienta posprocesa el output.

Ninguna de estas funciones es exclusiva de Rust como lenguaje. En el flujo `gcc + make` de `L3` aparecían piezas equivalentes —reglas de `make` para no recompilar lo ya hecho, `pkg-config` para resolver flags de bibliotecas, scripts auxiliares para correr tests—, pero quedaban distribuidas entre archivos y costumbres del proyecto. La novedad de `cargo` no es inventar ninguna de estas funciones, es **integrarlas todas detrás de un único subcomando declarativo**, con archivos canónicos y con convenciones uniformes a través de cualquier crate de Rust del mundo.

## Cómo se materializa esta equivalencia el resto del nivel

Los capítulos siguientes recorren cada pieza de esa integración. El próximo ([02-crate-package-workspace.md](02-crate-package-workspace.md)) separa las tres unidades que `cargo` manipula: crate, package y workspace. Después se entra al manifiesto ([03-cargo-toml.md](03-cargo-toml.md)) como contrato que sustituye a las flags de línea de comando, al lockfile ([04-cargo-lock.md](04-cargo-lock.md)) como registro reproducible, a `target/` ([05-target.md](05-target.md)) como caché material, a los profiles ([06-profiles.md](06-profiles.md)) como conjuntos de flags con trade-offs, y a tests y documentación ([07-test-doc.md](07-test-doc.md)) como subcomandos sobre el mismo grafo. El cierre ([08-workspaces-y-cierre.md](08-workspaces-y-cierre.md)) integra workspaces y vuelve a poner la tabla de equivalencias al lado de un proyecto C realista para confirmar que cada pieza tiene su correspondencia.

El cierre conceptual de este capítulo es modesto y suficiente: la persona puede señalar dónde está el `rustc` dentro del flujo de `cargo`, sabe que `cargo build -v` lo expone, y entiende que cada línea «Compiling X» que ve en pantalla es una abreviatura de varias invocaciones concretas a herramientas concretas. Lo que falta —de dónde salen las flags, qué fija las versiones, dónde va el binario— es lo que el resto del nivel va a destapar.
