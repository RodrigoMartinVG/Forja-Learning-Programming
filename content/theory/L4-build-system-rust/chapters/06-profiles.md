# Profiles: `dev` y `release`

## Dos builds, no dos modos del mismo build

`cargo build` y `cargo build --release` se presentan en muchos tutoriales como «el mismo build con o sin optimizaciones». Esa frase es engañosa: hace creer que `release` es un superconjunto de `dev` que solo agrega un paso extra. La realidad material es otra. Son **dos builds distintos**, con dos conjuntos completos de flags de codegen, que producen artefactos en carpetas separadas y con propiedades muy distintas. Ninguno es estrictamente mejor; cada uno hace trade-offs distintos.

El capítulo anterior ya mostró el efecto observable más claro: el binario en `target/debug/saludo` pesa 4.2 MB, el binario en `target/release/saludo` pesa 436 KB. Un orden de magnitud de diferencia para el mismo código fuente. La pregunta es por qué.

## Profile como conjunto de flags

Un **profile** en cargo es un conjunto nombrado de opciones de codegen aplicadas durante la compilación. Cargo trae cuatro profiles predefinidos:

- `dev`: usado por `cargo build` sin flags y por `cargo run`;
- `release`: usado por `cargo build --release` y por `cargo run --release`;
- `test`: usado internamente por `cargo test` para compilar los binarios de tests;
- `bench`: usado internamente por `cargo bench` para benchmarks.

Cada profile fija valores para varias opciones; las más relevantes son:

- **`opt-level`**: nivel de optimización, en una escala (`0`, `1`, `2`, `3`, `"s"`, `"z"`). `0` no optimiza nada; `3` aplica optimizaciones agresivas; `s` y `z` priorizan tamaño sobre velocidad.
- **`debuginfo`**: cantidad de información de depuración embebida en el binario. `0` ninguna, `1` solo símbolos para line tables, `2` (o `"full"`) información completa para debugging interactivo.
- **`overflow-checks`**: si las operaciones aritméticas con enteros chequean overflow en runtime y lanzan panic. En `dev` está activo; en `release` está desactivado para no penalizar el rendimiento.
- **`lto`** (Link-Time Optimization): si el linker realiza optimizaciones que cruzan crates. Costoso en tiempo de compilación, beneficioso para tamaño y velocidad final.
- **`codegen-units`**: en cuántas unidades se divide cada crate para paralelizar codegen. Valores altos compilan más rápido; valores bajos producen binarios más optimizados.
- **`panic`**: estrategia ante panic. `unwind` (default) permite que el panic se propague y se atrape; `abort` termina el proceso de inmediato y reduce código generado.

Los valores que cada profile asigna por defecto a estas opciones son lo que materialmente diferencia un build de otro.

## `dev` versus `release`: qué cambia y qué cuesta

Los defaults de los dos profiles principales, según la documentación de cargo:

| Opción              | `dev`        | `release`    |
| ------------------- | ------------ | ------------ |
| `opt-level`         | `0`          | `3`          |
| `debuginfo`         | `2` (full)   | `0` (none)   |
| `overflow-checks`   | `true`       | `false`      |
| `lto`               | `false`      | `false`      |
| `codegen-units`     | `256`        | `16`         |
| `panic`             | `unwind`     | `unwind`     |

La consecuencia operativa de esos valores se puede medir. En el crate `saludo`:

```text
$ cargo build
   Compiling saludo v0.1.0 (/tmp/l4-lab/saludo)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.78s
$ cargo build --release
   Compiling saludo v0.1.0 (/tmp/l4-lab/saludo)
    Finished `release` profile [optimized] target(s) in 0.62s
$ ls -lh target/debug/saludo target/release/saludo
-rwxr-xr-x 2 vscode vscode 4.2M Nov 13 00:42 target/debug/saludo
-rwxr-xr-x 2 vscode vscode 436K Nov 13 00:43 target/release/saludo
$ file target/debug/saludo
target/debug/saludo: ELF 64-bit LSB pie executable, x86-64, ...,
 with debug_info, not stripped
$ file target/release/saludo
target/release/saludo: ELF 64-bit LSB pie executable, x86-64, ...,
 not stripped
```

Las diferencias clave que esa salida confirma:

1. **Tamaño.** `4.2 MB` vs `436 KB`. La mayor parte de la diferencia viene de `debuginfo`: el binario `dev` lleva tablas completas de símbolos, líneas y tipos para que `gdb` y `lldb` puedan hablar del código fuente; el binario `release` no las lleva (`with debug_info` aparece en uno y no en el otro). Una parte menor viene de optimización: con `opt-level = 3`, código sin uso se elimina y funciones cortas se inlinear, dejando menos bytes en el ejecutable.
2. **Velocidad de ejecución.** Para un programa trivial como `saludo` la diferencia no es perceptible, pero para cualquier código con loops, asignaciones repetidas o cómputo numérico, la versión `release` puede ser un orden de magnitud o más rápida que la `dev`.
3. **Velocidad de compilación.** `dev` compila más rápido en proyectos grandes porque no aplica optimizaciones costosas y porque divide cada crate en muchas unidades de codegen paralelizables. Para `saludo`, que es trivial, la diferencia es mínima (0.78s vs 0.62s); para un crate de 50.000 líneas con varias dependencias pesadas, `release` puede tardar 5x o 10x más.
4. **Comportamiento.** En `dev`, `let x: u8 = 200; x + 100;` causa panic por overflow. En `release`, esa misma expresión devuelve un valor envuelto (`44`) sin chequeo. Cargo asume que el código se testea en `dev` —donde los overflows son ruidosos— y luego se distribuye en `release` —donde el costo del chequeo no se paga.

## Cómo elegir profile según la tarea

La elección no es ideológica, es operativa:

- **`dev`** sirve para el ciclo iterativo de desarrollo: editar, compilar, correr, depurar. La compilación rápida y la información de debugging completa pesan más que el rendimiento del binario.
- **`release`** sirve para distribuir el binario, para benchmarks reales y para tareas donde el tiempo de ejecución importa. La compilación más lenta es un costo aceptable porque se hace pocas veces.
- Para **probar la corrección** del código en condiciones realistas, conviene correr la suite de tests en ambos profiles cada tanto: hay errores que solo aparecen con optimizaciones (orden de evaluación, races latentes) y otros que solo aparecen sin (overflows aritméticos enmascarados). `cargo test` usa el profile `test`, que es similar a `dev` pero distinto; `cargo test --release` usa `release`.

«Siempre usar `release`» es un consejo malo: los tiempos de compilación en proyectos no triviales lo vuelven impráctico para iteración, y la pérdida de debug info dificulta diagnosticar errores. «Nunca usar `release`» también es malo: el binario `dev` no debe distribuirse y no es representativo del rendimiento real.

## Configurar un profile en `Cargo.toml`

Cargo permite sobrescribir cualquier opción de cualquier profile en el manifiesto del package. La sintaxis es:

```toml
[profile.dev]
opt-level = 1

[profile.release]
lto = true
codegen-units = 1
strip = "symbols"
```

Ese bloque le indica a cargo que en `dev` aplique optimización ligera (`opt-level = 1`), y que en `release` active LTO, fuerce una sola unidad de codegen para máxima optimización entre crates, y elimine los símbolos del binario final. Con esas opciones, el binario `release` queda más chico (típicamente otros 30-50% menos) y más rápido, a costa de un tiempo de compilación bastante mayor.

Override común para acelerar el desarrollo de proyectos numéricos: subir `opt-level` solo de las dependencias, dejando el código del propio package en `0`:

```toml
[profile.dev.package."*"]
opt-level = 2
```

Eso hace que las dependencias —que el lector no edita— se compilen optimizadas una vez y queden cacheadas, mientras que el código propio sigue compilando rápido sin optimización en cada cambio. Es un patrón útil cuando una dependencia hace cómputo pesado y la versión `dev` resulta demasiado lenta para iterar.

Cargo también permite definir profiles propios además de los cuatro predefinidos:

```toml
[profile.minimo]
inherits = "release"
opt-level = "z"
lto = true
strip = "symbols"
```

Y luego compilar con `cargo build --profile minimo`, que produce artefactos en `target/minimo/`. Los profiles personalizados son útiles para builds especializados —tamaño mínimo, perfilado, distribución— sin pisar las semánticas de `dev` y `release`.

## Otros profiles que existen y se postergan

`test` y `bench` son profiles activos pero invocados implícitamente. Cargo los selecciona cuando se ejecutan `cargo test` o `cargo bench`. Sus defaults son:

- `test` hereda casi todo de `dev`, pero compila el código con un harness de tests adicional;
- `bench` hereda casi todo de `release`, pero compila los benchmarks con un harness propio.

La razón por la que existen como profiles separados, en lugar de reusar `dev` y `release`, es que pueden configurarse independientemente. Un proyecto puede querer que sus tests corran con `opt-level = 1` (más rápido que `dev` puro pero compilable rápido) sin tocar el profile general. La sintaxis es la misma: `[profile.test]` y `[profile.bench]` en `Cargo.toml`.

Hay una capa adicional —`[profile.<nombre>.build-override]`— que controla cómo se compilan los `build.rs` de las dependencias, y otra —`[profile.<nombre>.package.<crate>]`— para configurar opciones por crate específico. Ambas son útiles en proyectos grandes y se postergan a `L14` y siguientes; mencionarlas acá deja la pista de que existen cuando reaparezcan.

## Cierre

Después de este capítulo, frente a la pregunta «¿uso `dev` o `release` para esta tarea?», la respuesta sale de los trade-offs concretos del profile, no de un default cultural:

- si el objetivo es iterar rápido y depurar: `dev`;
- si el objetivo es medir performance o distribuir un binario: `release`;
- si una dependencia pesada vuelve `dev` impráctico: override puntual de profile;
- si los defaults de `release` no alcanzan: bloque `[profile.release]` con `lto`, `codegen-units = 1` y `strip` activos.

El próximo capítulo trata otra dimensión que comparte el mismo grafo de compilación: tests y documentación. `cargo test` y `cargo doc` no son herramientas externas pegadas con scripts; son subcomandos sobre las mismas piezas que el resto del nivel ya separó.
