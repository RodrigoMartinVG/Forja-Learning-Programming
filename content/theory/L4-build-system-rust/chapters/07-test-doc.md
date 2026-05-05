# `cargo test` y `cargo doc` como interfaces unificadas

## Tests y documentación dejan de ser piezas externas

En el flujo de `L3`, tests y documentación eran problemas que cada proyecto resolvía a su manera. Para tests: agregar un framework externo (CUnit, Check, Unity), escribir un `Makefile` que los compile y ejecute, decidir convenciones de carpetas. Para documentación: instalar Doxygen, configurarlo, mantener el `Doxyfile`, decidir cómo se publica el HTML generado. Cada proyecto C grande tiene sus propias soluciones, y migrar entre proyectos exige reaprender el setup local.

Cargo trata las dos cosas como **subcomandos sobre el mismo grafo de compilación** que `cargo build` ya gestiona. La consecuencia material es directa: en cualquier crate, sin instalar nada extra, `cargo test` corre los tests y `cargo doc` genera la documentación. La uniformidad no es estética; es la propiedad del build system que permite trabajar en cualquier proyecto Rust del mundo con la misma interfaz.

## Tests como parte del build

Un test en Rust es una función con el atributo `#[test]`. Cuando `cargo test` se ejecuta, cargo compila los crates del package con un **harness implícito** —un `main` generado automáticamente que descubre todas las funciones marcadas con `#[test]` y las ejecuta— y produce un binario distinto del binario normal del package. Ese binario corre los tests, reporta resultados y devuelve un código de salida.

Sobre el crate biblioteca `utilidades` creado con `cargo new --lib`, el código generado por defecto ya incluye un test:

```rust
// src/lib.rs
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

`cargo test` lo compila y lo corre:

```text
$ cargo test
   Compiling utilidades v0.1.0 (/tmp/l4-lab/utilidades)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.34s
     Running unittests src/lib.rs (target/debug/deps/utilidades-3c7ae9ab8e9d1f02)

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

Tres observaciones operativas:

1. La línea `Finished 'test' profile` confirma que se usó el profile `test`, no `dev`. El binario de tests vive en `target/debug/deps/` y se reusa entre invocaciones.
2. El bloque `#[cfg(test)] mod tests` es código condicional: solo se compila cuando el profile es `test`. En un build de `dev` o `release` ese módulo se ignora completamente, así que las funciones de prueba no entran en el binario distribuible.
3. El reporte final discrimina passed, failed, ignored, measured, filtered. Cada uno es un estado posible del test que cargo y el harness reconocen sin que el proyecto los configure.

## Dónde viven los tests

Cargo reconoce tres ubicaciones canónicas para tests, cada una con semántica distinta:

**Tests unitarios** dentro del mismo archivo de código que están testeando, en un módulo marcado con `#[cfg(test)]`. Pueden acceder a todo lo que el módulo padre define, incluido lo privado. Es el lugar para tests que necesitan ver internals del crate. El ejemplo de `utilidades` arriba usa esta forma.

**Tests de integración** en archivos `.rs` dentro de un directorio `tests/` al lado de `src/`. Cada archivo es un crate independiente que importa el crate biblioteca como una dependencia externa, así que solo puede ver lo `pub`. Son el lugar para tests que validan la API pública. Agregando `tests/basics.rs` al crate `utilidades`:

```rust
// tests/basics.rs
use utilidades::add;

#[test]
fn suma_basica() {
    assert_eq!(add(2, 3), 5);
}
```

Después del cambio:

```text
$ cargo test
   Compiling utilidades v0.1.0 (/tmp/l4-lab/utilidades)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.40s
     Running unittests src/lib.rs (target/debug/deps/utilidades-3c7ae9ab8e9d1f02)

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running tests/basics.rs (target/debug/deps/basics-7e3b8a52c9f4d011)

running 1 test
test suma_basica ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

`cargo test` ahora invoca dos binarios distintos: el de unittests y el de integración. Cada uno reporta sus resultados separados. La organización ayuda a leer la salida cuando los tests crecen: los unitarios están en un binario, los de integración en otro.

**Doctests** dentro de comentarios de documentación (`///`) que contienen bloques de código:

```rust
/// Suma dos números.
///
/// # Ejemplos
///
/// ```
/// use utilidades::add;
/// assert_eq!(add(2, 3), 5);
/// ```
pub fn add(left: u64, right: u64) -> u64 {
    left + right
}
```

`rustdoc` —invocado por `cargo test` automáticamente— extrae cada bloque ` ``` ` de los comentarios, los compila como crates ad hoc y los ejecuta. Si el código del comentario no compila o falla en runtime, el test falla. La salida se agrega al reporte:

```text
   Doc-tests utilidades

running 1 test
test src/lib.rs - add (line 5) ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.13s
```

Los doctests cumplen una función doble: validan que la documentación es correcta (no muestran código que no compila) y dan ejemplos ejecutables de cómo usar la API. En proyectos Rust serios son el primer recurso para cubrir el contrato público de una biblioteca.

## `cargo doc` y `rustdoc`

`rustdoc` es una herramienta separada de `rustc` que vive en la misma toolchain. Lee comentarios de documentación —`///` para items, `//!` para módulos enteros— y produce HTML navegable. Cargo la invoca a través del subcomando `cargo doc`:

```text
$ cargo doc
 Documenting utilidades v0.1.0 (/tmp/l4-lab/utilidades)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.43s
   Generated /tmp/l4-lab/utilidades/target/doc/utilidades/index.html
```

El HTML resultante está en `target/doc/<crate>/index.html`. Abrir ese archivo en un navegador muestra la página típica de documentación de Rust: lista de módulos, lista de funciones, signaturas, comentarios renderizados como Markdown, ejemplos resaltados. La presentación es idéntica a la de `crates.io`, porque la documentación pública de los crates publicados se genera con el mismo `rustdoc` corriendo sobre el código fuente.

`cargo doc --open` invoca el comando, espera a que termine y abre el `index.html` en el navegador por defecto. `cargo doc --no-deps` evita generar la documentación de las dependencias del crate, lo cual es útil para acelerar la operación cuando el grafo es grande: solo interesa la doc del propio package.

La documentación generada respeta automáticamente la visibilidad: lo declarado `pub` se documenta y aparece en los índices, lo privado se omite. Para incluir lo privado —útil para documentación interna— se pasa `--document-private-items`.

## Por qué unificar test, doc y build importa

Que `cargo build`, `cargo test` y `cargo doc` operen sobre el mismo grafo tiene consecuencias materiales que el flujo de `L3` no entregaba:

1. **Lockfile compartido.** Los tres subcomandos resuelven dependencias contra el mismo `Cargo.lock`. No hay manera de que el binario distribuido use una versión de `serde` y los tests usen otra. La reproducibilidad del capítulo 04 se extiende a la suite de tests sin esfuerzo extra.
2. **Caché compartida.** Las dependencias se compilan una sola vez por profile y se reusan entre subcomandos. Construir el binario y correr los tests en `dev` no recompila `anyhow` dos veces.
3. **Configuración compartida.** Las features de cargo (atributos opcionales que un crate puede activar en sus dependencias) se aplican igual en build, test y doc. Si una feature está activa para el build, está activa para los tests y para los doctests.
4. **Convenciones uniformes.** Un proyecto Rust nuevo no necesita inventar dónde van los tests ni cómo se invoca la doc. El layout es siempre el mismo, y por eso `cargo test` corre en cualquier crate del ecosistema sin configuración previa.

En el flujo `gcc + make`, cada uno de esos puntos había que resolverlo a mano: definir reglas de Makefile para tests, mantener flags consistentes entre el binario y los tests, decidir cómo se versionan las dependencias del proyecto y de los tests por separado. Ninguna de esas decisiones era trivial y ninguna era compartida entre proyectos. Cargo las absorbe todas como parte del build system.

## Cierre

Después de este capítulo, frente a un crate ajeno la persona puede:

- localizar dónde viven los tests (en `src/` con `#[cfg(test)] mod tests`, en `tests/`, o en doctests dentro de los comentarios);
- predecir qué va a compilar `cargo test` y en qué binarios va a separar la salida;
- generar la documentación HTML con `cargo doc` y saber dónde aparece;
- entender por qué tests y documentación no necesitan herramientas externas en Rust, y qué les da esa unidad: el grafo compartido con el resto del build.

El próximo capítulo cierra el nivel con la unidad más grande del build system —workspaces— y consolida la comparación con el flujo de `L3` pieza por pieza.
