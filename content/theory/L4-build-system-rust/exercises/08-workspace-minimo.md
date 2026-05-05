# Ejercicio 08 — Workspace mínimo

## Contexto

El [capítulo 08](../chapters/08-workspaces-y-cierre.md) mostró que un workspace agrupa varios packages en un único `Cargo.lock` y un único `target/`. Este ejercicio convierte un package suelto en un workspace de dos miembros, uno binario y uno biblioteca.

## Consigna

1. Crear un directorio raíz nuevo, por ejemplo `mini-ws/`, y entrar a él.
2. Adentro, crear dos packages como subdirectorios:
   - `cargo new --lib calculadora-lib`
   - `cargo new --bin calculadora-bin`
3. Crear el `Cargo.toml` del workspace en la raíz con esta forma:
   ```toml
   [workspace]
   resolver = "3"
   members = ["calculadora-bin", "calculadora-lib"]
   ```
4. En `calculadora-lib/src/lib.rs`, exponer una función pública (por ejemplo `pub fn sumar(a: i64, b: i64) -> i64`).
5. En `calculadora-bin/Cargo.toml`, agregar la dependencia por path:
   ```toml
   [dependencies]
   calculadora-lib = { path = "../calculadora-lib" }
   ```
6. En `calculadora-bin/src/main.rs`, importar la función con `use calculadora_lib::sumar;` (atender la conversión guión → guión bajo) y usarla en un `println!`.
7. Desde la raíz, correr `cargo build`. Capturar la salida y observar las líneas `Compiling X` para ambos miembros.
8. Verificar que **no existen** `Cargo.lock` ni `target/` adentro de los miembros, y que **sí existen** en la raíz: `ls calculadora-lib calculadora-bin` y `ls mini-ws`.
9. Correr `cargo run -p calculadora-bin` y verificar que el binario funciona.

## Resultado esperado

El árbol resultante (`tree -L 3 mini-ws/` o equivalente). La salida de `cargo build` con las dos líneas `Compiling`. La verificación de que `Cargo.lock` y `target/` viven solo en la raíz. La salida de `cargo run -p calculadora-bin` con el resultado de la suma.

## Verificación

Después del build, el árbol tiene esta forma:

```text
mini-ws/
├── Cargo.toml             # del workspace, con [workspace]
├── Cargo.lock             # único, en la raíz
├── target/                # única, en la raíz
├── calculadora-bin/
│   ├── Cargo.toml         # con [package] y dependencia por path
│   └── src/main.rs
└── calculadora-lib/
    ├── Cargo.toml         # con [package]
    └── src/lib.rs
```

`ls calculadora-lib` y `ls calculadora-bin` muestran solo `Cargo.toml` y `src/`; ningún `Cargo.lock`, ningún `target/`. `cargo build` desde la raíz produce dos líneas `Compiling`, una por miembro, y un único `Finished`. `cargo run -p calculadora-bin` ejecuta el binario y produce la salida esperada (por ejemplo `2 + 3 = 5`).

## Criterio de finalización

El workspace compila desde la raíz, el binario corre y produce la salida correcta, y la verificación del paso 8 confirma que la unificación de lockfile y caché es real (no hay duplicación en los miembros). El árbol se incluye en el resultado, no se describe en prosa solamente.
