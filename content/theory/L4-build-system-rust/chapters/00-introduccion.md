# Por qué este nivel existe

> ¿Quién construyó Tebas, la de las siete puertas?
> En los libros figuran sólo los reyes.
> — *Bertolt Brecht, Preguntas de un obrero que lee (1935)*

## El retroceso aparente después de `L3`

`L3` cerró un trabajo paciente. La cadena que va de un archivo `.c` a un ejecutable se abrió en cuatro etapas, cada una con su artefacto material en disco —`.i`, `.s`, `.o`, ejecutable—, y cada artefacto pudo inspeccionarse con su herramienta. Cuando un comando como `gcc hello.c -o hello` agrupaba todas esas etapas en una sola línea, el costo del agrupamiento ya quedaba claro: el mensaje de error de cualquier etapa se confundía con un genérico "no compila" si el lector no sabía que adentro había una cadena.

Apenas se cruza la frontera a Rust, el primer comando que aparece en cualquier tutorial es `cargo build`, y el aprendizaje recién ganado se siente perdido. La pantalla muestra una línea corta:

```text
   Compiling saludo v0.1.0 (/tmp/l4-lab/saludo)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.78s
```

Sin más. No hay rastro de etapas, no hay artefactos visibles entre medio, no hay `.i` ni `.s` ni `.o` para inspeccionar. La cadena que `L3` había hecho transparente vuelve a estar tapada, y peor: tapada por una herramienta que parece distinta del compilador, con su propio archivo de configuración, su propio directorio de salida y su propio vocabulario. La sensación de retroceso es real, y este nivel existe para resolverla.

## Lo que el nivel cambia

`L4` no enseña un sistema de build distinto del que `L3` mostró. Enseña que **es el mismo pipeline subyacente**, ahora orquestado por una herramienta declarativa. La línea de `Compiling saludo` no reemplazó al pipeline; lo invocó. Detrás de esa línea hay un `rustc` que lee fuentes Rust, emite código objeto, lo entrega a un linker y produce un ejecutable, exactamente como en `L3` pasaba con `gcc` recorriendo preprocesado, compilación, ensamblado y linking. Lo que cambió no es la naturaleza del trabajo, sino quién lo orquesta y cómo se declara.

La pregunta operativa que el nivel deja respondida es: *"dado un comando de `cargo`, ¿qué pasa por debajo, sobre qué piezas materiales actúa, y qué quedó declarado en archivos del proyecto en lugar de pasarse en la línea de comandos?"*. Esa pregunta no es decorativa: el momento en que un build de Rust se rompe en producción —porque una versión de una dependencia cambió, porque un profile no era el esperado, porque una flag faltaba—, la única forma de diagnosticar es saber dónde se decidió qué cosa.

## Las piezas materiales que el nivel separa

El modelo que `L4` instala se apoya en cinco piezas, todas observables en disco una vez que se corre `cargo new`:

- el **manifiesto** `Cargo.toml`, archivo declarativo donde el package se identifica y enumera lo que necesita;
- el **lockfile** `Cargo.lock`, archivo generado donde quedan registradas las versiones exactas resueltas para esas dependencias;
- el directorio `target/`, **caché de artefactos** del build, segmentada por profile (`debug/`, `release/`) y por tipo de salida;
- el **crate** como unidad mínima de compilación, que produce un único artefacto (binario o biblioteca) y tiene un crate root como `src/main.rs` o `src/lib.rs`;
- el **package** como unidad de manifiesto, que puede contener uno o más crates conviviendo bajo el mismo `Cargo.toml`.

`cargo` aparece en el medio como **orquestador**: lee el manifiesto, consulta o produce el lockfile, decide qué del `target/` está fresco y qué hay que recompilar, invoca a `rustc` con flags concretas, llama al linker, y reporta el resultado. Ninguna de esas operaciones es nueva respecto a `L3`; lo nuevo es que están integradas detrás de un único subcomando, y cada parte del comportamiento se puede leer en algún archivo del proyecto.

## El crate de referencia que recorre el nivel

Casi todos los capítulos siguientes trabajan sobre el mismo crate concreto, creado con `cargo new --bin saludo`. Es un binario mínimo —un `main()` que imprime una línea— al que el nivel le va agregando piezas: una dependencia ligera de `crates.io`, un test unitario, un test de integración, un doctest, un perfil ajustado. Cada agregado introduce una pieza del sistema de build sin pedir conocimiento de Rust como lenguaje: la lógica del crate sigue siendo trivial; lo que cambia capítulo a capítulo es lo que `cargo` hace alrededor.

Hay también un segundo crate, `utilidades`, creado como biblioteca con `cargo new --lib`, que aparece cuando se necesita ilustrar la diferencia entre un crate binario y un crate biblioteca, y un workspace pequeño que reúne dos packages bajo un mismo `Cargo.toml` raíz para cerrar el nivel. Los tres ejemplos viven en `/tmp/l4-lab/` dentro del devcontainer y se pueden reproducir paso a paso.

## Lo que `L4` deliberadamente no enseña

Las exclusiones se declaran de entrada, porque su ausencia es decisión y no descuido. Este nivel no enseña Rust como lenguaje: aparece sólo el `Hello, world!` que `cargo new` genera, eventualmente con una firma de función y un test de igualdad. Todo lo que tenga que ver con tipos, ownership, borrow checker, traits o errores idiomáticos vive en `L14`–`L17` y no se asume previamente. Tampoco enseña internals de `rustc` (MIR, LLVM, codegen): el compilador aparece como caja invocada por `cargo`, no como objeto de estudio. Tampoco entra en publicación a `crates.io`, firmado, supply chain, ni en `build.rs` no triviales: las dependencias se declaran y se consumen, no se publican. Tampoco profundiza en `rustup` o en gestión de toolchains alternativas; eso quedó verificado en `L0` y se usa, no se discute. Cada exclusión tiene su nivel destinatario en [docs/forja-contenido.md](../../../docs/forja-contenido.md).

## Cómo se mueve el nivel

Los ocho capítulos que siguen forman una progresión con dirección. El primero ([01-de-gcc-a-cargo.md](01-de-gcc-a-cargo.md)) toca la equivalencia material entre `gcc` invocado a mano en `L3` y lo que `cargo build` hace por dentro, observando las invocaciones reales con `cargo build -v`. El segundo ([02-crate-package-workspace.md](02-crate-package-workspace.md)) separa tres unidades —crate, package, workspace— que tutoriales y mensajes de error mezclan. El tercero ([03-cargo-toml.md](03-cargo-toml.md)) lee el manifiesto sección por sección como contrato, no como configuración decorativa. El cuarto ([04-cargo-lock.md](04-cargo-lock.md)) presenta el lockfile como respuesta concreta al problema de reproducibilidad que `L3` no había abordado. El quinto ([05-target.md](05-target.md)) abre `target/` como caché segmentada y explica por qué el segundo build es siempre más rápido que el primero. El sexto ([06-profiles.md](06-profiles.md)) muestra `dev` y `release` como conjuntos de flags con trade-offs distintos, no como modos del mismo build. El séptimo ([07-test-doc.md](07-test-doc.md)) ubica `cargo test` y `cargo doc` como subcomandos sobre el mismo grafo, no como herramientas externas. El octavo ([08-workspaces-y-cierre.md](08-workspaces-y-cierre.md)) cierra el nivel con un workspace mínimo y una comparación pieza por pieza con el flujo C de `L3`.

El recorrido pide poco: tener `L0` verificado, haber atravesado `L1`, `L2` y `L3`, y aceptar que `cargo` no es magia. Lo que va a hacer ver es que cada línea corta de salida —`Compiling`, `Finished`, `Running`— condensa trabajo concreto que se puede destapar cuando hace falta.
