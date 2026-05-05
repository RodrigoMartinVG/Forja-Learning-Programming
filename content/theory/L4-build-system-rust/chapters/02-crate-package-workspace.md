# Crate, package y workspace

## Tres palabras que la documentación mezcla

Los tutoriales de Rust, los mensajes de error de `cargo`, las páginas de `crates.io` y la documentación oficial usan tres términos —*crate*, *package*, *workspace*— a veces como sinónimos, a veces con distinciones que no siempre se explican. Sin separarlos, el primer `Cargo.toml` que el lector encuentra mezcla «este es el crate `saludo`» con «este package depende de `anyhow`» y la diferencia se diluye. Este capítulo separa los tres, en orden de abajo hacia arriba: primero el crate (la unidad más chica), después el package (la unidad de manifiesto), después el workspace (la unidad de coordinación).

## Crate como unidad de compilación

Un **crate** es la unidad mínima de compilación de Rust. Cada crate produce **un** artefacto, y el tipo de ese artefacto es uno de dos:

- un **crate binario**, que produce un ejecutable;
- un **crate biblioteca**, que produce una biblioteca (concretamente, un archivo `.rlib` que otros crates pueden enlazar).

Cada crate tiene un único **crate root**: el archivo que `rustc` recibe como punto de entrada. Para un crate binario el crate root convencional es `src/main.rs`; para uno biblioteca, `src/lib.rs`. Los demás archivos `.rs` del proyecto se incorporan al crate desde el crate root mediante declaraciones de módulos —`mod foo;`, `mod bar;`— pero el compilador siempre arranca leyendo el crate root.

La regla es estricta: una invocación de `rustc` compila exactamente un crate. Cuando `cargo build -v` muestra varias líneas `Running rustc ...`, cada una está compilando un crate distinto del grafo. La línea «Compiling anyhow v1.0.102» que apareció en el capítulo anterior compiló el crate biblioteca `anyhow`; la línea «Compiling saludo v0.1.0» compiló el crate binario `saludo`. Aunque `cargo` orquestó las dos, la compilación de cada una fue una operación separada.

`cargo new` crea por defecto un crate binario, dejando un `src/main.rs` con un `Hello, world!`:

```text
$ cargo new --bin saludo
    Creating binary (application) `saludo` package
$ cat saludo/src/main.rs
fn main() {
    println!("Hello, world!");
}
```

Con `--lib` crea un crate biblioteca, dejando un `src/lib.rs`:

```text
$ cargo new --lib utilidades
    Creating library `utilidades` package
$ cat utilidades/src/lib.rs
pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
```

Ambos comandos imprimen «Creating binary package» o «Creating library package»: aunque en este nivel el lector se enfoque en el crate, lo que `cargo new` está creando del todo es un **package** que incluye ese crate. Esa observación abre la unidad siguiente.

## Package como unidad de manifiesto

Un **package** es lo que se publica, se distribuye y se versiona como un todo. Cada package está gobernado por un único `Cargo.toml`, que vive en su raíz y que entre otras cosas declara:

- la identidad del package: nombre, versión, edición de Rust;
- las dependencias que el package necesita;
- los crates que el package contiene.

El último punto es el que más confunde, porque la mayoría de los packages contienen exactamente un crate, y el crate y el package suelen llamarse igual. En el ejemplo anterior, el package `saludo` contiene un único crate binario también llamado `saludo`, con crate root en `src/main.rs`. El package `utilidades` contiene un único crate biblioteca también llamado `utilidades`, con crate root en `src/lib.rs`. La distinción entre uno y otro queda invisible mientras los términos coincidan.

La distinción aparece apenas un package contiene **más de un crate**. Las reglas son simples:

- un package puede tener **a lo sumo un crate biblioteca** (con crate root en `src/lib.rs`);
- un package puede tener **uno o más crates binarios**, declarados con `[[bin]]` en `Cargo.toml` o con archivos en `src/bin/`;
- un package puede combinar el crate biblioteca y crates binarios en el mismo árbol, y eso es de hecho un patrón común: la lógica vive en `src/lib.rs` y los binarios en `src/bin/*.rs` la consumen como dependencia interna.

Un esqueleto típico de package que combina lib y bin:

```text
mi-herramienta/
├── Cargo.toml
└── src/
    ├── lib.rs           # crate biblioteca: mi_herramienta
    ├── main.rs          # crate binario: mi-herramienta
    └── bin/
        ├── analizar.rs  # crate binario: analizar
        └── reportar.rs  # crate binario: reportar
```

Ese package contiene cuatro crates: una biblioteca y tres binarios. Los binarios pueden usar la biblioteca como `use mi_herramienta::...` (notar el guión bajo: los slugs ASCII de `cargo` permiten guiones, pero los identificadores de Rust no, y la conversión es automática). El `Cargo.toml` puede dejar los binarios implícitos —`cargo` los detecta por convención de carpetas— o declararlos explícitamente con `[[bin]]` cuando hace falta darles configuración propia.

Resumen operativo: si alguien pregunta «¿este es un crate o un package?», la respuesta corta es **«es un package que contiene este crate»**. La unidad que se publica a `crates.io` o se distribuye como zip es el package; la unidad que se compila por separado y produce un artefacto es el crate. Cada package tiene su `Cargo.toml`; cada crate tiene su crate root.

## Workspace como coordinación de packages

Un **workspace** es un conjunto de packages que comparten lockfile y caché de artefactos. Un workspace típico aparece cuando un proyecto crece más allá de un único package y necesita coordinar varios sin duplicar dependencias ni recompilar todo en cada uno. La estructura mínima es:

```text
ws/
├── Cargo.toml              # manifiesto del workspace (no del package)
├── calculadora-bin/
│   ├── Cargo.toml          # package miembro
│   └── src/main.rs
└── calculadora-lib/
    ├── Cargo.toml          # package miembro
    └── src/lib.rs
```

El `Cargo.toml` raíz no declara un package. Declara un workspace:

```toml
[workspace]
resolver = "3"
members = ["calculadora-bin", "calculadora-lib"]
```

Cada package miembro tiene su propio `Cargo.toml` ordinario. La consecuencia material de tener un workspace es directa: `cargo build` corrido desde la raíz construye **todos** los miembros con un único `Cargo.lock` y un único `target/` compartido entre todos:

```text
$ cargo build
   Compiling calculadora-lib v0.1.0 (/tmp/l4-lab/ws/calculadora-lib)
   Compiling calculadora-bin v0.1.0 (/tmp/l4-lab/ws/calculadora-bin)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.31s
$ ls
Cargo.lock  Cargo.toml  calculadora-bin  calculadora-lib  target
```

El `Cargo.lock` es uno solo para todo el workspace y el directorio `target/` también: las dependencias comunes a varios miembros se compilan una vez, no una por miembro. Esa es la razón material por la que los proyectos Rust grandes tienden a organizarse en workspace casi desde el principio: sin él, cinco packages que comparten cinco dependencias terminan compilando esas dependencias cinco veces y arrastrando cinco lockfiles posiblemente desincronizados.

Un workspace puede declarar dependencias compartidas en `[workspace.dependencies]` que los miembros heredan, perfiles compartidos en `[profile.<nombre>]` aplicados a todo el workspace, y configuración global como la edición por defecto. La forma exacta de esos bloques se trata en [08-workspaces-y-cierre.md](08-workspaces-y-cierre.md); acá lo que importa es la unidad: un workspace **coordina** packages, no los reemplaza.

## Por qué los tres términos se confunden

El motivo principal es que en los ejemplos más comunes los tres niveles **colapsan**. `cargo new --bin saludo` crea un package llamado `saludo`, que contiene un crate llamado `saludo`, que vive sin workspace alrededor. Decir «el crate `saludo`», «el package `saludo`» o «el proyecto `saludo`» refiere, en la práctica, al mismo árbol de archivos. La distinción solo se vuelve necesaria cuando alguno de los tres niveles deja de coincidir con los otros, y eso ocurre apenas el proyecto crece.

El motivo secundario es que la documentación oficial es deliberadamente fluida: usa «crate» en el sentido de unidad de compilación cuando habla del compilador, y «crate» en el sentido de package cuando habla de `crates.io`. Es la misma palabra cubriendo dos roles. La lectura cuidadosa del manifiesto —`Cargo.toml` declara un package y enumera sus crates— resuelve la ambigüedad cada vez que aparece.

## Cierre

Después de este capítulo, mirar un `Cargo.toml` ajeno permite responder con precisión:

- ¿este package contiene un crate o varios? (mirar si hay `src/lib.rs`, `src/main.rs`, `src/bin/`, `[[bin]]`);
- ¿de qué tipo es cada crate? (binario si proviene de un `main.rs` o `[[bin]]`, biblioteca si proviene de `lib.rs` o `[lib]`);
- ¿este `Cargo.toml` describe un package o un workspace? (mirar si tiene `[package]` o solo `[workspace]`).

El próximo capítulo abre el manifiesto sección por sección y muestra cómo se lee como contrato declarativo, ahora que las tres unidades —crate, package, workspace— están separadas.
