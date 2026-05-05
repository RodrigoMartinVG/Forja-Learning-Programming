# Outline: L4 — El sistema de build de Rust

> Documento de diseño interno. No se sirve en la web. Guía para escribir capítulos y ejercicios de `L4`. Voz y prosa: [estandar_editorial_forja.md](../../../estandar_editorial_forja.md). Estructura: [CONVENTIONS.md](../../../CONVENTIONS.md).

---

## Metadatos

- **Prerrequisitos:** `L3`.
- **Bloque editorial de entrada recomendado:** `content/intro/forja/forja.md`, `content/intro/workspace/workspace.md`.
- **Proyectos asociados:** ninguno propio. Sirve de base para `hello-rust`, `fizzbuzz-rust` y `mini-calculator` en `L14`.
- **Desbloquea:** `L5`, y en particular el flujo Rust de `L14`.
- **Fuente curricular:** [docs/forja-contenido.md §6 L4](../../../docs/forja-contenido.md).

---

## Objetivo del nivel

Que la persona pueda crear un crate Rust con dependencia y tests, identificar las piezas materiales que `cargo` manipula (`Cargo.toml`, `Cargo.lock`, `target/`), explicar qué hace `cargo` en cada subcomando como orquestación de pasos sobre esas piezas, y comparar ese flujo con el pipeline manual de `L3`.

---

## Contrato conceptual

Lo que `L4` debe dejar instalado:

- `cargo` como **orquestador** de un pipeline equivalente al de `L3`, no como herramienta misteriosa: bajo el capó sigue habiendo `rustc` invocado con flags y un linker;
- la unidad **crate** como unidad mínima de compilación de Rust (un crate produce un artefacto: binario o biblioteca);
- la unidad **package** como unidad de distribución y manifiesto, que puede contener uno o más crates;
- `Cargo.toml` como contrato declarativo: nombre, versión, dependencias, edición, perfiles;
- `Cargo.lock` como registro reproducible de versiones exactas resueltas, distinto del manifiesto;
- el directorio `target/` como **caché de artefactos** del build, segmentada por profile y por tipo de salida;
- `dev` y `release` como **profiles** con flags y trade-offs distintos (debug info vs optimización), no como sinónimos del mismo build;
- `cargo build`, `cargo run`, `cargo test`, `cargo doc` como interfaces unificadas sobre el mismo grafo de compilación;
- `crates.io` como registry público y la noción de dependencia versionada (semver, requisitos de versión, fuente alternativa por `path` o `git`);
- `workspace` como manera de coordinar varios packages que comparten `Cargo.lock` y `target/`;
- el contraste explícito entre el flujo manual de `L3` (un comando por etapa, pegado por scripts o `make`) y el flujo de `cargo` (manifiesto declarativo, resolución de dependencias, caché reproducible).

Lo que `L4` **no** instala (se posterga con cita):

- el lenguaje Rust en sí: `L14` y siguientes. Acá Rust aparece como contenido mínimo necesario para que un crate compile;
- el sistema de tipos, ownership, traits: `L15`, `L16`;
- macros y `cargo expand` en profundidad: `L16`;
- detalles de internals de `rustc` (MIR, codegen, LLVM): queda fuera del track o aparece como mención en `L40`/`L54`;
- publicación a `crates.io`, firmado, supply chain: queda fuera;
- build scripts (`build.rs`) avanzados: aparecen como existencia, no como tema central;
- toolchains alternativas (`rustup`) más allá de mención: el laboratorio de `L0` ya las dejó verificadas.

---

## Decisiones de diseño curricular

- **Continuidad explícita con `L3`.** Cada concepto nuevo se introduce contrastándolo con la pieza equivalente del flujo C: manifiesto vs invocación manual, lockfile vs ausencia de versionado, `target/` vs archivos sueltos, profile vs flags ad hoc. La decisión es deliberada: sin esa continuidad, `cargo` queda como magia.
- **`cargo` no es magia.** El nivel insiste en que `cargo build` invoca un pipeline observable: hay un grafo de unidades, hay flags, hay un linker. Se usa `cargo build -v` o `--verbose` como anclaje material para ver las invocaciones de `rustc`.
- **Crate, package, workspace tienen capítulo propio o sección destacada.** Es la confusión número uno del nivel: el lector mezcla los tres términos.
- **`Cargo.lock` se trata como capítulo independiente, no como nota al pie.** La diferencia entre manifiesto y lockfile es estructural y se vuelve crítica cuando reaparezcan dependencias en `L14`.
- **Profiles se introducen tarde.** Antes hay que entender que `target/` ya está segmentado por profile; recién después tiene sentido explicar `dev` vs `release`.
- **Tests y docs como parte del build, no como herramientas externas.** `cargo test` y `cargo doc` se presentan como subcomandos sobre el mismo grafo, no como islas.
- **Ningún ejemplo Rust de este nivel exige entender ownership.** Los crates de práctica son del estilo `fn main()` con un cálculo trivial y un test de igualdad. Todo lo que pide razonar sobre tipos vive en `L14`.
- **Workspaces aparecen al final como cierre conceptual.** No son urgentes para `L14`, pero ordenan la cabeza para todo proyecto Rust no trivial que aparece después.
- **El nivel usa un crate concreto de referencia** (un binario pequeño con una función pura y un test), análogo al `hello.c` que `L3` usa como hilo conductor.

---

## Continuidad interna con niveles vecinos

Para el redactor, no para el cuerpo del capítulo (estandar_editorial_forja §R7).

- **Desde `L3`:** el pipeline `.c → .i → .s → .o → ejecutable` y la lógica de invocar herramientas por etapa son la base contrastada en cada capítulo. `cargo build -v` muestra que detrás sigue habiendo invocaciones equivalentes.
- **Desde `L0`:** la toolchain Rust ya quedó verificada; acá se usa, no se instala.
- **Hacia `L5`/`L6`:** las herramientas de observabilidad (`rust-analyzer`, `clippy`, `rustfmt`) se van a profundizar después; este nivel las nombra al final como existencia disponible.
- **Hacia `L14`:** los tres proyectos `hello-rust`, `fizzbuzz-rust` y `mini-calculator` arrancan asumiendo que el lector ya sabe crear un crate, agregar una dependencia y correr `cargo test`.
- **Hacia `L15`/`L16`:** `Cargo.toml` reaparecerá con dependencias reales, features y workspaces no triviales. Acá quedan instalados los esqueletos sin esos detalles.
- **Hacia `L18`:** `bindgen` y `cbindgen` aparecerán como dependencias declaradas en `Cargo.toml`; el manifiesto deja de ser ornamental.

---

## Capítulos

### Capítulo 00 — Introducción

**Archivo:** `chapters/00-introduccion.md`

**Objetivo:** abrir el problema del nivel — después de pasar `L3` invocando `gcc -E`, `gcc -S`, `gcc -c` y el linker a mano, `cargo build` se siente como un retroceso a la caja negra — y declarar que el nivel abre esa caja para mostrar el mismo pipeline detrás de un orquestador declarativo.

**Problema técnico que abre:** sin entender qué hace `cargo`, cualquier error de build en Rust es indistinguible de un error del lenguaje. La frontera entre "Rust se queja" y "el sistema de build está mal configurado" desaparece.

**Modelo mental que instala:** `cargo` como capa de orquestación sobre un pipeline equivalente al de `L3`, con un manifiesto declarativo y un lockfile reproducible donde antes había scripts y `make`.

**Secciones planificadas (H2):**
- `## Por qué cargo se siente opaco después de L3`
- `## Lo que vamos a abrir en este nivel`
- `## El crate concreto que vamos a usar todo el nivel`
- `## Lo que queda afuera y a qué nivel se posterga`

**Materialidad obligatoria:**
- `cargo new --bin hola` o equivalente, con listado de archivos generados (`ls -la`);
- `cargo build` y luego `ls target/debug/` para ver los artefactos producidos;
- mención al `cargo build -v` que aparecerá en capítulos siguientes para ver el pipeline subyacente.

**Confusiones que desmonta:**
- "cargo es Rust";
- "cargo es opuesto al pipeline manual";
- creer que el nivel enseña Rust como lenguaje (no lo hace).

**Cierre conceptual:** la persona sabe qué archivos componen un crate recién creado y dónde van a aparecer los artefactos cuando se compile.

**Epígrafe:**

> ¿Quién construyó Tebas, la de las siete puertas?
> En los libros figuran sólo los reyes.
> — *Bertolt Brecht, Preguntas de un obrero que lee (1935)*

Tangencial: el poema separa al nombre que aparece en los libros del trabajo que efectivamente se hizo. En `L4` `cargo build` figura como quien construye, pero el trabajo material lo hacen `rustc`, el linker y las dependencias resueltas. La cita habla de ciudades y reyes, no de software; el lector reinterpreta la imagen al pisar el contenido. Fuente firme (poema de 1935). No cae en vetos.

**Guiño previsto:** [01-de-gcc-a-cargo.md](chapters/01-de-gcc-a-cargo.md), tras mostrar `cargo build -v` por primera vez. Eco léxico apuntando a los obreros invisibles del comando: una formulación breve sobre que detrás de la línea «Compiling foo v0.1.0» hay invocaciones concretas a `rustc` que el flag verbose hace visibles. Sin nombrar a Brecht ni a Tebas.

**Notas v2:** capítulo de máximo riesgo de plantilla (`Qué cubre / Qué no cubre / Cómo trabajarlo / El nivel siguiente`). Vetada por estandar §A5/§A6/§B4. Las exclusiones se mencionan en una oración. La transición a `L5` y a `L14` vive en el `README.md`.

---

### Capítulo 01 — De gcc a mano a un build system declarativo

**Archivo:** `chapters/01-de-gcc-a-cargo.md`

**Objetivo:** mostrar la equivalencia material entre el flujo manual de `L3` y lo que hace `cargo build`, sin todavía mirar `Cargo.toml`.

**Problema técnico que abre:** decir "cargo compila" sin más es lo mismo que decir "gcc compila": esconde un pipeline. Hay que abrirlo.

**Modelo mental que instala:**
- `cargo build` invoca `rustc` (el compilador) más un linker, con flags concretas;
- el resultado son artefactos en disco igual que en `L3`, solo que ubicados dentro de `target/`;
- `cargo build -v` o `--verbose` muestra las invocaciones reales;
- el flujo declarativo (decir qué se quiere) y el flujo imperativo (invocar herramientas) producen el mismo tipo de pipeline.

**Secciones planificadas (H2):**
- `## El pipeline detrás de cargo build`
- `## Ver las invocaciones reales con cargo build -v`
- `## Equivalencia con L3 etapa por etapa`
- `## Qué aporta cargo además de invocar el compilador`

**Materialidad obligatoria:**
- ejecución de `cargo build -v` con su salida real (al menos las líneas de `Running rustc ...`);
- comparación lado a lado: invocación manual de `gcc` en `L3` vs invocación de `rustc` que aparece en la salida verbose;
- listado del contenido de `target/debug/` antes y después del build.

**Confusiones que desmonta:**
- "cargo no usa un linker";
- creer que `rustc` no se puede invocar a mano;
- creer que `cargo` y `rustc` son la misma herramienta.

**Cierre conceptual:** la persona puede señalar dónde está el `rustc` dentro del flujo de `cargo` y nombrar al menos una flag que `cargo` está pasando.

---

### Capítulo 02 — Crate, package y workspace

**Archivo:** `chapters/02-crate-package-workspace.md`

**Objetivo:** separar tres unidades que el lector va a confundir si nadie las nombra.

**Problema técnico que abre:** "crate", "package" y "workspace" se usan indistintamente en tutoriales, documentación y mensajes de error. Sin separarlos, `Cargo.toml` parece arbitrario.

**Modelo mental que instala:**
- **crate:** unidad mínima de compilación. Produce **un** artefacto: un binario o una biblioteca. Tiene un crate root (`src/main.rs` o `src/lib.rs`);
- **package:** unidad de distribución gobernada por un `Cargo.toml`. Puede contener uno o más crates (típicamente uno binario y/o uno biblioteca);
- **workspace:** conjunto de packages que comparten `Cargo.lock` y `target/`, coordinados por un `Cargo.toml` raíz con sección `[workspace]`;
- la mayoría de los ejemplos de tutoriales son **un package con un crate**: por eso los términos se mezclan.

**Secciones planificadas (H2):**
- `## Crate como unidad de compilación`
- `## Package como unidad de manifiesto`
- `## Workspace como coordinación de packages`
- `## Por qué los tres términos se confunden`

**Materialidad obligatoria:**
- `cargo new --bin holabin` y `cargo new --lib holalib`, mostrando los dos `Cargo.toml` resultantes y los crate roots distintos;
- ejemplo mínimo de package con un crate binario y un crate biblioteca conviviendo;
- mención visual de un `Cargo.toml` con sección `[workspace]` (sin desarrollar el ejemplo todavía; se cierra en el capítulo final).

**Confusiones que desmonta:**
- "crate y package son lo mismo";
- creer que un package solo puede tener un binario o una librería, no ambos;
- creer que para usar `cargo` ya hace falta workspace.

**Cierre conceptual:** la persona puede mirar un `Cargo.toml` y decir cuántos crates produce el package y de qué tipo.

---

### Capítulo 03 — Cargo.toml como manifiesto declarativo

**Archivo:** `chapters/03-cargo-toml.md`

**Objetivo:** leer el `Cargo.toml` como contrato, no como configuración decorativa.

**Problema técnico que abre:** los tutoriales muestran `Cargo.toml` con campos copiados sin justificación. Sin entender qué declaran, cada error que los menciona es ruido.

**Modelo mental que instala:**
- `[package]`: identidad del package (nombre, versión, edición de Rust);
- `[dependencies]`: contrato de qué necesita este crate para compilar;
- `[dev-dependencies]`: dependencias usadas solo en tests, benchmarks y ejemplos;
- `[build-dependencies]`: dependencias del `build.rs` cuando exista (mención breve);
- `[[bin]]`, `[lib]`, `[[example]]`: cómo declarar más de un artefacto en el mismo package;
- las versiones declaradas son **requisitos**, no fijaciones; la fijación vive en `Cargo.lock` (capítulo siguiente).

**Secciones planificadas (H2):**
- `## El manifiesto como contrato`
- `## Identidad del package y edición`
- `## Dependencias declaradas como requisitos`
- `## dev-dependencies y build-dependencies`
- `## Declarar varios artefactos en el mismo package`

**Materialidad obligatoria:**
- `Cargo.toml` real del crate del nivel, con cada sección comentada;
- ejemplo de declaración de una dependencia ligera de `crates.io` (algo de scope acotado, p. ej. `anyhow` o equivalente) y verificación de que el build sigue verde;
- mismo crate con una `dev-dependency` agregada y observación de que el binario final no la incluye.

**Confusiones que desmonta:**
- creer que la versión declarada es la versión usada;
- mezclar `[dependencies]` con `[dev-dependencies]`;
- creer que cada crate exige `[lib]` y `[[bin]]` explícitos.

**Cierre conceptual:** la persona puede leer un `Cargo.toml` ajeno y decir qué declara y qué no.

---

### Capítulo 04 — Cargo.lock y la reproducibilidad

**Archivo:** `chapters/04-cargo-lock.md`

**Objetivo:** instalar `Cargo.lock` como pieza distinta del manifiesto y como respuesta concreta al problema de reproducibilidad que `L3` no abordaba.

**Problema técnico que abre:** "compila en mi máquina y no en la tuya" es una de las fuentes más comunes de fricción en proyectos sin lockfile. En el flujo de `L3` esto quedó implícito; acá se vuelve explícito y resuelto.

**Modelo mental que instala:**
- `Cargo.toml` declara **rangos** de versiones aceptables; `Cargo.lock` registra las versiones **exactas** resueltas;
- el lockfile lo genera o actualiza `cargo` y se commitea en proyectos binarios; en bibliotecas la convención es no commitearlo;
- `cargo build` lee el lockfile si existe y respeta sus versiones; si no existe, las resuelve y crea uno;
- `cargo update` reabre la resolución; sin `cargo update`, las versiones quedan fijas;
- el lockfile más el registry hacen que dos máquinas con el mismo commit produzcan el mismo grafo de dependencias.

**Secciones planificadas (H2):**
- `## El problema de la reproducibilidad`
- `## Manifiesto y lockfile son cosas distintas`
- `## Cuándo se actualiza el lockfile`
- `## Cuándo commitear Cargo.lock y cuándo no`
- `## Reproducir un build en otra máquina`

**Materialidad obligatoria:**
- diff entre `Cargo.lock` antes y después de agregar una dependencia;
- diff entre `Cargo.lock` antes y después de `cargo update` cuando hay nuevas patch versions;
- comparación con `L3`: en el flujo `gcc + make` no había lockfile equivalente, y por qué eso se vuelve un problema en proyectos no triviales.

**Confusiones que desmonta:**
- "el lockfile es generado, no me importa";
- creer que editar `Cargo.lock` a mano es lo correcto;
- creer que `cargo build` siempre toma versiones nuevas.

**Cierre conceptual:** la persona puede explicar qué pasa en otra máquina si entrega `Cargo.toml` solo, vs si entrega `Cargo.toml` + `Cargo.lock`.

---

### Capítulo 05 — El directorio target/ como caché de artefactos

**Archivo:** `chapters/05-target.md`

**Objetivo:** abrir `target/` como pieza material observable en lugar de tratarlo como ruido.

**Problema técnico que abre:** `target/` aparece la primera vez que se compila y crece sin que el lector tenga modelo de qué hay adentro ni por qué.

**Modelo mental que instala:**
- `target/` es la **caché de artefactos** del build: si nada cambió, `cargo` no rehace trabajo;
- la caché está segmentada por **profile** (`debug/`, `release/`) y por **tipo de salida** (binarios, bibliotecas, deps, examples, doc);
- los artefactos finales viven en `target/<profile>/`;
- los artefactos intermedios y de dependencias viven en `target/<profile>/deps/` y `target/<profile>/build/`;
- borrar `target/` con `cargo clean` invalida la caché; el siguiente build la rearma desde cero;
- la información de huellas para invalidación incremental vive dentro de `target/` y no se inspecciona a mano en este nivel.

**Secciones planificadas (H2):**
- `## target/ como caché del build`
- `## Segmentación por profile y por tipo de salida`
- `## Dónde aparece el binario final`
- `## cargo clean y reconstrucción desde cero`
- `## Por qué el primer build es lento y los siguientes no`

**Materialidad obligatoria:**
- `tree -L 3 target/` o equivalente sobre el crate del nivel después de un build;
- comparación de tiempos entre primer `cargo build`, segundo `cargo build` sin cambios, y `cargo build` después de modificar `main.rs`;
- `cargo clean` y verificación de que `target/` desaparece.

**Confusiones que desmonta:**
- "target/ es output";
- creer que `target/` se commitea;
- creer que cada build empieza de cero.

**Cierre conceptual:** la persona puede decir, antes de correr el build, dónde va a aparecer el binario final y qué se va a regenerar si toca solo un archivo.

---

### Capítulo 06 — Profiles: dev y release

**Archivo:** `chapters/06-profiles.md`

**Objetivo:** mostrar `dev` y `release` como dos builds con flags distintas, no como dos modos del mismo build.

**Problema técnico que abre:** la diferencia entre `cargo build` y `cargo build --release` se trata casi siempre como "uno tiene optimizaciones". Esa frase no alcanza para tomar decisiones.

**Modelo mental que instala:**
- profile como **conjunto de flags y opciones de codegen** aplicado al build (nivel de optimización, debug info, LTO, panics, codegen-units, etc.);
- `dev`: optimización baja, debug info completa, builds rápidos, ejecutables grandes y lentos;
- `release`: optimización alta, debug info reducida, builds más lentos, ejecutables más rápidos y chicos;
- otros profiles (`test`, `bench`) existen y son configurables, pero quedan como mención;
- el profile influye en el tiempo de compilación, en el tamaño del binario y en la facilidad para depurarlo;
- los profiles se configuran en `Cargo.toml` con la sección `[profile.<nombre>]`.

**Secciones planificadas (H2):**
- `## Profile como conjunto de flags`
- `## dev vs release: qué cambia y qué cuesta`
- `## Cómo elegir profile según la tarea`
- `## Configurar un profile en Cargo.toml`
- `## Otros profiles que existen y se postergan`

**Materialidad obligatoria:**
- `cargo build` y `cargo build --release` sobre el mismo crate, con `ls -lh target/debug/<bin>` y `ls -lh target/release/<bin>` mostrando tamaños;
- al menos una medición simple de tiempo de ejecución del binario en `dev` vs `release`;
- ejemplo de override de un parámetro de profile en `Cargo.toml` (p. ej. `opt-level` en `[profile.dev]`).

**Confusiones que desmonta:**
- "release siempre conviene";
- "dev no optimiza nada";
- creer que el binario de `release` no tiene debug info en absoluto sin configurarlo.

**Cierre conceptual:** la persona puede justificar para qué tarea elige `dev` o `release` y cuánto le va a costar la otra opción.

---

### Capítulo 07 — cargo test y cargo doc como interfaces unificadas

**Archivo:** `chapters/07-test-doc.md`

**Objetivo:** mostrar que tests y documentación no son herramientas externas en Rust: son subcomandos sobre el mismo grafo de compilación.

**Problema técnico que abre:** en C, tests y documentación son herramientas separadas que cada proyecto integra a su manera. En Rust son parte del build system; tratarlos como externos lleva a configuraciones torcidas.

**Modelo mental que instala:**
- `cargo test` compila los crates con un harness de testing implícito y corre los tests encontrados; usa profile `test`;
- los tests pueden vivir en el mismo archivo del código (`#[cfg(test)] mod tests`), en `tests/` (tests de integración) o como ejemplos de doctests dentro de comentarios;
- `cargo doc` invoca `rustdoc` sobre los crates del package y genera HTML navegable;
- los doctests se compilan y se corren como parte de `cargo test`;
- todos estos subcomandos comparten resolución de dependencias, lockfile y `target/`: no son scripts paralelos.

**Secciones planificadas (H2):**
- `## Tests como parte del build`
- `## Dónde viven los tests`
- `## Doctests como tests reales`
- `## cargo doc y rustdoc`
- `## Por qué unificar test, doc y build importa`

**Materialidad obligatoria:**
- agregar un test unitario al crate del nivel y correr `cargo test`;
- agregar un test de integración en `tests/` y observar que `cargo test` los corre todos;
- `cargo doc --open` y screenshot conceptual de la página generada (referencia textual).

**Confusiones que desmonta:**
- "los tests en Rust necesitan un framework externo";
- creer que `cargo doc` genera comentarios planos;
- creer que doctests no se ejecutan.

**Cierre conceptual:** la persona puede decir qué se compila y qué se ejecuta cuando corre `cargo test` sobre un package con tests unitarios, integración y doctests.

---

### Capítulo 08 — Workspaces y comparación final con C

**Archivo:** `chapters/08-workspaces-y-cierre.md`

**Objetivo:** cerrar el nivel mostrando workspaces como herramienta para coordinar packages y consolidando la comparación con el flujo C.

**Problema técnico que abre:** apenas un proyecto Rust crece más allá de un crate, aparece la pregunta de cómo coordinar múltiples crates sin duplicar dependencias ni `target/`.

**Modelo mental que instala:**
- workspace como `Cargo.toml` raíz con sección `[workspace]` que lista miembros;
- los miembros comparten `Cargo.lock` y `target/`;
- las dependencias comunes pueden centralizarse en `[workspace.dependencies]`;
- `cargo build` y `cargo test` desde la raíz operan sobre todos los miembros;
- esto es lo que el flujo de `L3` resolvía con `make` y convención manual: workspace lo formaliza;
- cierre: `cargo` no es magia. Es un manifiesto declarativo, un lockfile reproducible, una caché segmentada y subcomandos sobre un mismo grafo. Cada pieza tiene equivalente conceptual en el mundo C; la diferencia es qué viene resuelto por defecto.

**Secciones planificadas (H2):**
- `## Cuándo aparece la necesidad de workspace`
- `## Estructura mínima de un workspace`
- `## Lockfile y target/ compartidos`
- `## Lo que en C resolvíamos a mano`
- `## Lo que queda instalado al cerrar el nivel`

**Materialidad obligatoria:**
- workspace mínimo con dos miembros (un binario y una biblioteca) cuyo `Cargo.toml` raíz se muestra en el capítulo;
- `cargo build` desde la raíz mostrando que se compilan ambos miembros;
- tabla resumen `pieza Rust ↔ pieza equivalente en el flujo de L3`.

**Confusiones que desmonta:**
- "workspace es solo para proyectos enormes";
- creer que cada miembro tiene su propio `target/`;
- volver al modelo "cargo es magia" después de haberlo abierto.

**Cierre conceptual:** la persona puede mirar un repositorio Rust no trivial y reconocer si es un package o un workspace, y qué piezas materiales lo componen.

---

## Ejercicios planificados

Los ejercicios producen evidencia observable: salida de comando, archivo en disco, diff entre dos estados. No piden ensayos. Numeración tentativa para `exercises/`.

1. **Crear un crate y nombrar sus piezas.** Ejecutar `cargo new --bin <nombre>`, listar los archivos generados y describir qué declara cada uno.
2. **Ver el pipeline subyacente.** Ejecutar `cargo build -v` y extraer la línea de invocación de `rustc`; identificar al menos tres flags pasadas y explicar qué etapa del pipeline cubre cada una.
3. **Agregar una dependencia ligera.** Editar `Cargo.toml` para agregar una dependencia de `crates.io`, compilar, y registrar el diff de `Cargo.lock`.
4. **Romper la reproducibilidad y restaurarla.** Borrar `Cargo.lock`, recompilar, y verificar si las versiones resueltas coinciden o no con las anteriores.
5. **Caché de artefactos.** Tomar tiempos de tres builds consecutivos: primero, sin cambios, y con un cambio en `main.rs`; explicar las diferencias usando `target/`.
6. **Comparar profiles.** Compilar el mismo crate en `dev` y `release`; registrar tamaños de binario y tiempo de ejecución de una función simple; argumentar la elección para una tarea concreta.
7. **Tests en tres lugares.** Agregar un test unitario, uno de integración y un doctest al mismo crate; correr `cargo test` y verificar que los tres se ejecutan.
8. **Workspace mínimo.** Convertir un package único en un workspace con dos miembros (binario que usa una biblioteca propia) y verificar que `cargo build` desde la raíz compila ambos.

---

## Notas de continuidad pendientes

- Cuando se redacte el capítulo 03 conviene confirmar qué dependencia ligera se elige como ejemplo. Buenos candidatos: `anyhow`, `clap` con `derive` desactivado, o una crate sin macros para no anticipar `L16`.
- El crate concreto del nivel debería poder reaparecer en `L14` como base de `hello-rust`, sin reescribirse desde cero.
- Si más adelante se decide ampliar este nivel con un capítulo de `build.rs`, la decisión debe documentarse acá; hoy queda como mención breve para no inflar el alcance.
