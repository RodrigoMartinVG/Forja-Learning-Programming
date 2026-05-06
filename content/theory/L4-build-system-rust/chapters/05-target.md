# El directorio `target/` como caché de artefactos

## La carpeta que aparece sola

La primera vez que se ejecuta `cargo build` en un crate recién creado, una carpeta nueva aparece al lado de `Cargo.toml`: se llama `target/`. La carpeta crece de manera no obvia: para un crate trivial pesa unos pocos MB, pero para un workspace con varias dependencias puede llegar a cientos de MB sin que el código del proyecto haya crecido en absoluto. Sin un modelo de qué guarda y por qué, `target/` queda como ruido que el lector aprende a ignorar.

Este capítulo abre `target/` y muestra que es una **caché de artefactos** segmentada con reglas precisas. Cada archivo que aparece adentro responde a una decisión concreta del build system.

## `target/` como caché del build

La función material de `target/` es evitar que `cargo` rehaga trabajo que ya hizo. Cuando se compila un crate, el resultado de cada paso —el código objeto de cada dependencia, la biblioteca enlazada, las metadatas, las huellas que indican si una dependencia cambió— se deposita en `target/`. En la siguiente invocación, `cargo` consulta esos archivos y, si nada cambió, reutiliza lo que ya estaba en lugar de recompilar.

La forma más directa de comprobarlo es medir. Sobre el crate `saludo` con la dependencia `anyhow`, después de un `cargo clean` para vaciar la caché:

```text
$ cargo clean
$ time cargo build
   Compiling anyhow v1.0.102
   Compiling saludo v0.1.0 (/tmp/l4-lab/saludo)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 1.35s

real    0m1.402s
$ time cargo build
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.01s

real    0m0.052s
```

El primer build llevó 1.35 segundos porque tuvo que compilar `anyhow` y `saludo` desde cero. El segundo, sin haber tocado nada, terminó en 10 milésimas: cargo verificó que ningún archivo de origen había cambiado y declaró el build como ya completo. Esa diferencia es el efecto observable de la caché.

Si ahora se modifica `src/main.rs` —agregar un `println!` cualquiera— y se rebuilda:

```text
$ time cargo build
   Compiling saludo v0.1.0 (/tmp/l4-lab/saludo)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.27s

real    0m0.310s
```

Solo se recompiló `saludo`. `anyhow` no cambió, así que su artefacto se reutilizó tal cual. El build cambió de tiempo en función de qué cambió en disco, no de cuántos crates totales hay en el grafo. Esa propiedad —recompilación incremental por crate— es lo que hace que un proyecto Rust grande sea editable sin penalizar cada `cargo build` con varios minutos de espera.

## Segmentación por profile y por tipo de salida

`target/` no es plano: tiene una estructura interna que separa builds de profiles distintos y artefactos de tipos distintos. La capa principal son las subcarpetas `debug/` y `release/`, una por profile (los profiles se tratan en el [próximo capítulo](06-profiles.md)). Adentro de cada una, una segunda capa separa por tipo de salida.

```text
$ cargo build
$ find target -maxdepth 2 -type d
target
target/debug
target/debug/.fingerprint
target/debug/build
target/debug/deps
target/debug/examples
target/debug/incremental
$ ls target/debug/
build  deps  examples  incremental  saludo  saludo.d  .fingerprint
```

Cada una de esas piezas tiene un rol:

- **`target/debug/saludo`**: el binario final. Es el archivo ejecutable que `cargo run` lanza y el que se distribuiría. En un crate biblioteca aparecería en su lugar `target/debug/libutilidades.rlib` (la biblioteca enlazable por otros crates Rust).
- **`target/debug/saludo.d`**: archivo de dependencias en formato `make`. Lista qué archivos fuente alimentaron el binario; cargo lo usa para detectar cambios.
- **`target/debug/deps/`**: artefactos de cada crate del grafo —dependencias y crates del propio package—. Cada archivo tiene un sufijo de hash: `libanyhow-81e0f801a5d79612.rlib`, `saludo-fa76d3ee231746bb`, etc. El hash distingue versiones, profiles y configuraciones distintas que conviven en la misma caché.
- **`target/debug/build/`**: salidas de los `build.rs` de las dependencias. Para `anyhow`, hay una subcarpeta con el ejecutable `build-script-build` y los archivos que ese script produjo. Solo aparece si alguna dependencia tiene script de build.
- **`target/debug/.fingerprint/`**: huellas de invalidación. Cargo guarda acá metadatos por crate (timestamps, hashes de fuentes, hashes de flags) para decidir si reusa lo cacheado o si necesita recompilar. No se inspecciona a mano en este nivel.
- **`target/debug/incremental/`**: caché de compilación incremental de `rustc`, distinta de la caché de cargo. `rustc` puede reusar piezas internas de un compile previo del mismo crate cuando solo cambian fragmentos. La carpeta puede pesar mucho y se puede borrar sin perder el binario, solo se pierde la velocidad incremental.
- **`target/debug/examples/`**: binarios producidos a partir de archivos en `examples/` del package. Vacío en este crate.

`target/release/` tiene exactamente la misma estructura interna que `target/debug/`, pero aparece solo cuando se hace `cargo build --release`. Compilar en `dev` no compila en `release`, y viceversa: cada profile tiene su propio árbol porque las flags de codegen son distintas y los artefactos no son intercambiables.

```text
$ cargo build --release
   Compiling anyhow v1.0.102
   Compiling saludo v0.1.0 (/tmp/l4-lab/saludo)
    Finished `release` profile [optimized] target(s) in 0.62s
$ ls target/
debug  release
```

`target/doc/` aparece cuando se ejecuta `cargo doc`, y `target/<arquitectura>/` aparece cuando se compila para una arquitectura distinta a la del host (cross-compilation). Esos directorios extienden la misma lógica: una subcarpeta más para cada eje de variación que el build introduce.

## Dónde aparece el binario final

La pregunta práctica más común sobre `target/` es: «¿cuál de todos estos archivos lanzo?». La respuesta tiene una regla simple:

- el binario final del package, en profile `dev`, vive en `target/debug/<nombre-del-binario>`;
- el binario final, en profile `release`, vive en `target/release/<nombre-del-binario>`;
- las bibliotecas enlazables (`.rlib`) viven en `target/<profile>/lib<nombre>.rlib`;
- todo lo demás —`deps/`, `build/`, `incremental/`, `.fingerprint/`— es interno al build y no debería usarse desde fuera.

```text
$ ls -lh target/debug/saludo target/release/saludo
-rwxr-xr-x 2 vscode vscode 4.2M Nov 13 00:42 target/debug/saludo
-rwxr-xr-x 2 vscode vscode 436K Nov 13 00:43 target/release/saludo
```

El mismo crate, el mismo código fuente, dos binarios con tamaños distintos: 4.2 MB en `dev`, 436 KB en `release`. La diferencia de un orden de magnitud es la consecuencia material de las flags de codegen distintas; ese es el contenido del próximo capítulo.

`cargo run` invoca el binario de `target/debug/` por defecto y `cargo run --release` el de `target/release/`. Ninguno de los dos comandos copia el archivo a otro lugar: lo ejecuta desde `target/`. Distribuir el binario implica copiarlo afuera de `target/` por separado, o usar `cargo install` que lo copia a `~/.cargo/bin/`.

## `cargo clean` y reconstrucción desde cero

`cargo clean` borra `target/` entero:

```text
$ cargo clean
     Removed 36 files, 7.6MiB total
$ ls target
ls: cannot access 'target': No such file or directory
```

El siguiente `cargo build` reconstruye toda la caché desde cero: descarga de nuevo lo que falte (aunque la caché global de descargas en `~/.cargo/registry/` evita re-bajar de internet), recompila todas las dependencias y todos los crates del package, y vuelve a llenar `target/`. Es la operación más lenta del flujo y suele usarse solo cuando se sospecha que la caché quedó corrupta o cuando se quiere medir un build completo.

Que `cargo clean` solo borre `target/` y nada más es deliberado: los archivos del proyecto (`Cargo.toml`, `Cargo.lock`, `src/`, `tests/`) no se tocan. La caché es **derivada**: se puede regenerar a partir de las fuentes y del lockfile sin perder información humana.

## Por qué `target/` no se commitea

`cargo new` agrega `target/` al `.gitignore` por defecto, y eso refleja una decisión correcta: la caché de build es derivada, pesa, varía por máquina y se invalida con cada cambio. Versionarla introduciría diffs ruidosos en cada commit y conflictos de merge sin ningún beneficio. Lo que se versiona son las fuentes (`src/`, `tests/`, `examples/`), el manifiesto (`Cargo.toml`), el lockfile cuando corresponde (`Cargo.lock` para binarios), y eventualmente archivos de configuración del workspace o de la toolchain. Todo lo demás se regenera con `cargo build`.

Esa distinción —fuente versus derivado— es la misma que en el flujo de `L3` separaba `hello.c` de `hello.o`. La diferencia material es que `target/` agrupa explícitamente todo lo derivado en una sola carpeta, en lugar de dejar `.o` y ejecutables esparcidos al lado de los `.c`. Un `.gitignore` que excluye `target/` es suficiente; en C había que listar pacientemente cada extensión derivada o establecer convenciones de carpeta de build.

## Cierre

Después de este capítulo, antes de invocar `cargo build`, la persona puede anticipar:

- dónde va a aparecer el binario final (en `target/debug/<nombre>` por defecto, en `target/release/<nombre>` si se usa `--release`);
- qué partes de `target/` se van a regenerar si solo se modifica `src/main.rs` (las del crate del package, no las de las dependencias);
- qué partes se van a tirar y a reconstruir si se ejecuta `cargo clean` (todo `target/`);
- por qué un primer build después de `cargo clean` lleva mucho más tiempo que los siguientes (porque la caché está vacía).

El próximo capítulo trata las dos subcarpetas que ya aparecieron —`debug/` y `release/`— y muestra qué flags de codegen las separan, en qué se traduce esa diferencia para el binario producido y cómo se eligen para tareas distintas.
