# Workspaces y comparación final con C

## Cuándo aparece la necesidad de workspace

Un solo package alcanza para crates pequeños: una herramienta de línea de comandos, una biblioteca con su propio binario de prueba, un servicio chico. La necesidad de pasar a un workspace aparece cuando un proyecto crece de un modo concreto:

- el código del proyecto se quiere separar en varias bibliotecas con responsabilidades distintas, cada una versionable y testeable por separado, pero coordinadas;
- aparecen varios binarios que comparten lógica y conviene factorizar esa lógica en una biblioteca interna;
- una biblioteca propia quiere un crate de ejemplos no triviales o un crate de benchmarking aparte, sin contaminar el manifiesto principal con `dev-dependencies` que solo importan en esos contextos.

Sin workspace, cada uno de estos packages es un proyecto separado: cada uno descarga sus dependencias en su propio `target/`, mantiene su propio `Cargo.lock`, recompila independientemente. Para cinco packages que comparten cuatro dependencias pesadas, eso significa compilar las cuatro dependencias cinco veces y arrastrar cinco lockfiles que pueden divergir y producir builds incompatibles dentro del mismo proyecto.

Un workspace resuelve las dos cosas: caché única y lockfile único.

## Estructura mínima de un workspace

La forma más directa de un workspace es un directorio raíz con un `Cargo.toml` especial y subdirectorios para cada package miembro. El esqueleto del ejemplo `ws/` capturado en el laboratorio es:

```text
ws/
├── Cargo.toml              # manifiesto del workspace
├── calculadora-bin/
│   ├── Cargo.toml
│   └── src/main.rs
└── calculadora-lib/
    ├── Cargo.toml
    └── src/lib.rs
```

El `Cargo.toml` raíz **no** declara un package. Declara un workspace:

```toml
[workspace]
resolver = "3"
members = ["calculadora-bin", "calculadora-lib"]
```

`members` lista los packages incluidos. `resolver = "3"` selecciona la versión más reciente del algoritmo de resolución de dependencias de cargo, que es la que hace falta para edición 2024. El campo es obligatorio porque el resolver del workspace es independiente del resolver que declararía cada package suelto.

Cada package miembro tiene un `Cargo.toml` ordinario. El de la biblioteca:

```toml
[package]
name = "calculadora-lib"
version = "0.1.0"
edition = "2024"

[dependencies]
```

Y el del binario, que la consume vía dependencia por path:

```toml
[package]
name = "calculadora-bin"
version = "0.1.0"
edition = "2024"

[dependencies]
calculadora-lib = { path = "../calculadora-lib" }
```

La declaración `path = "../calculadora-lib"` es la pieza clave: dice «la dependencia `calculadora-lib` la encontrás en el filesystem en esa ruta relativa». Cuando el package está dentro del mismo workspace, `cargo` reconoce que la dependencia es un miembro y la incorpora al grafo del workspace en lugar de tratarla como una dependencia externa.

El código mínimo para que el ejemplo compile y funcione:

```rust
// calculadora-lib/src/lib.rs
pub fn sumar(a: i64, b: i64) -> i64 {
    a + b
}
```

```rust
// calculadora-bin/src/main.rs
use calculadora_lib::sumar;

fn main() {
    let a = 2;
    let b = 3;
    println!("{} + {} = {}", a, b, sumar(a, b));
}
```

(Recordar la conversión guión → guión bajo entre el nombre del package y el nombre del crate en código Rust.)

## Lockfile y `target/` compartidos

Construir el workspace desde la raíz produce esto:

```text
$ cd ws
$ cargo build
   Compiling calculadora-lib v0.1.0 (/tmp/l4-lab/ws/calculadora-lib)
   Compiling calculadora-bin v0.1.0 (/tmp/l4-lab/ws/calculadora-bin)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.31s
$ ls
Cargo.lock  Cargo.toml  calculadora-bin  calculadora-lib  target
$ ls calculadora-bin calculadora-lib
calculadora-bin:
Cargo.toml  src

calculadora-lib:
Cargo.toml  src
```

Hay un único `Cargo.lock` y un único `target/` en la raíz del workspace. Los packages miembros no tienen ninguno de los dos. La consecuencia es lo que se buscaba: cualquier dependencia común entre miembros se compila una sola vez, y la resolución de versiones se hace una sola vez para todo el conjunto, garantizando que dos miembros que dependen de `serde` usan la misma versión exacta sin riesgo de divergencia.

`cargo run -p calculadora-bin` ejecuta el binario:

```text
$ cargo run -p calculadora-bin
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.02s
     Running `target/debug/calculadora-bin`
2 + 3 = 5
```

`cargo test` desde la raíz corre los tests de **todos** los miembros. `cargo build -p <miembro>` construye un miembro específico sin tocar los otros (aunque las dependencias compartidas sí se compilan si hace falta). La granularidad existe; la unificación de caché la hace barata.

## Dependencias compartidas en el workspace

Cuando varios miembros usan la misma dependencia, en lugar de declararla en cada `Cargo.toml` de miembro se puede centralizar en el `Cargo.toml` raíz:

```toml
[workspace]
resolver = "3"
members = ["calculadora-bin", "calculadora-lib"]

[workspace.dependencies]
anyhow = "1.0"
```

Y cada miembro la hereda con la sintaxis `dep.workspace = true`:

```toml
[dependencies]
anyhow = { workspace = true }
```

La dependencia se declara una sola vez en la raíz, los miembros la consumen sin repetir versión. Si hay que actualizar `anyhow`, se cambia la línea raíz y todos los miembros pasan al mismo nuevo requisito a la vez. Lo mismo aplica a profiles: definir `[profile.release]` en el manifiesto raíz aplica las opciones a todos los miembros del workspace, evitando que cada uno mantenga su copia.

Estas centralizaciones no son obligatorias —un workspace funciona sin ellas—, pero quitan el problema de la deriva entre manifiestos a medida que el proyecto crece.

## Lo que en C resolvíamos a mano

Cada pieza que `L4` introdujo tiene un equivalente conceptual en el flujo `gcc + make` de `L3`. La diferencia material no es que una sea posible y la otra no: es qué viene resuelto por defecto y qué pide trabajo del proyecto.

| Pieza en Rust con `cargo`            | Equivalente conceptual en C (`L3`)                                              |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `cargo build` invoca `rustc`         | `gcc` invocado a mano o desde una regla de `make`                                |
| `Cargo.toml` declara dependencias     | listas de `-lXXX` en flags, headers en `pkg-config`, scripts ad hoc              |
| `[dev-dependencies]`                  | bibliotecas usadas solo en tests, separadas por convención del proyecto          |
| `Cargo.lock` fija versiones exactas  | (sin equivalente integrado: contenedores, `apt pin`, hashes en submódulos)       |
| `target/` como caché segmentada      | árboles `build/` con convenciones por proyecto, `.o` esparcidos                  |
| Profiles `dev`/`release`              | conjuntos de flags separadas por target de `make` (`make debug`, `make release`)  |
| `cargo test` con harness implícito    | framework externo (CUnit, Check), reglas de `make` para compilarlo y correrlo    |
| Doctests dentro de comentarios        | sin equivalente: el código de la documentación es texto inerte                   |
| `cargo doc` con `rustdoc`             | Doxygen u otra herramienta externa, configurada por proyecto                     |
| Workspace con miembros y `target/` único | árbol de subdirectorios coordinados por un `Makefile` raíz y convención       |
| `cargo new` produce esqueleto         | plantilla del proyecto a mano o por script propio                                |

La columna de la izquierda es resuelta por una sola herramienta con un único conjunto de archivos canónicos. La columna de la derecha es resoluble pero requiere decisiones del proyecto, dependencias externas y convenciones que cada equipo arma por separado. Esa es la diferencia material que `L4` deja instalada: no es que cargo invente capacidades nuevas, es que las **integra** detrás de una interfaz común.

## Lo que queda instalado al cerrar el nivel

Después de los nueve capítulos, frente a un repositorio Rust no trivial la persona puede:

- distinguir si el repositorio es un **package** (con un solo `Cargo.toml` y un `[package]`) o un **workspace** (con un `Cargo.toml` raíz que solo tiene `[workspace]` y miembros);
- enumerar los **crates** que produce cada package: binarios en `src/main.rs` o `src/bin/*.rs`, biblioteca en `src/lib.rs`;
- leer `Cargo.toml` y separar identidad, dependencias normales, `dev-dependencies`, `build-dependencies`, declaraciones explícitas de bin/lib, y configuración de profiles;
- distinguir el rol de `Cargo.lock` respecto al manifiesto, decidir si commitearlo y predecir el efecto de borrarlo;
- anticipar dónde van a aparecer los artefactos de `cargo build` dentro de `target/`, distinguir `debug/` de `release/` y reconocer las subcarpetas internas (`deps/`, `build/`, `incremental/`, `.fingerprint/`);
- elegir un profile en función de la tarea y configurar overrides puntuales cuando los defaults no alcanzan;
- localizar tests en sus tres ubicaciones canónicas y entender qué corre cada invocación de `cargo test`;
- generar documentación con `cargo doc` y entender por qué `rustdoc` está integrado al build y no es una herramienta paralela;
- explicar, con piezas concretas, qué invoca `cargo build` por debajo y por qué eso es continuo con el pipeline de `L3` y no opuesto.

El cierre conceptual del nivel se reduce a una afirmación simple: **`cargo` no es magia**. Es un manifiesto declarativo, un lockfile reproducible, una caché segmentada y un conjunto de subcomandos sobre un único grafo de compilación. Cada pieza tiene equivalente en el mundo C; lo que cambia es que en Rust están integradas y son las mismas para todos los proyectos del ecosistema.

## Hacia los niveles siguientes

`L4` deja la maquinaria del build system instalada. `L5` y los niveles que tocan herramientas asociadas (`rust-analyzer`, `clippy`, `rustfmt`) se apoyan en esa maquinaria sin volver a explicarla. `L14` —los tres proyectos `hello-rust`, `fizzbuzz-rust` y `mini-calculator`— asume que la persona ya sabe crear un crate, agregar una dependencia, correr `cargo test`. `L15` y `L16` reabren `Cargo.toml` con dependencias reales, features y workspaces no triviales, ahora apuntando al lenguaje en sí. `L18` agregará a `Cargo.toml` herramientas como `bindgen` y `cbindgen` cuando los crates empiecen a hablar con C; el manifiesto deja de ser ornamental.

Lo que `L4` no enseñó —el lenguaje Rust en profundidad, el sistema de tipos, ownership, traits, macros, internals de `rustc`— es contenido de los niveles propios. La separación es deliberada: poner el build system primero permite que cuando el lenguaje aparezca, las preguntas sobre «por qué cargo hace X» ya estén respondidas y no compitan por la atención con las preguntas sobre el lenguaje.
