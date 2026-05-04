# La toolchain declarada y la toolchain disponible

## La frontera donde nacen los falsos diagnósticos

El capítulo anterior dejó separadas las cinco piezas del laboratorio y prometió que la toolchain era la frontera donde más errores nacen. La razón es que la toolchain combina dos categorías que, mezcladas, parecen una sola: lo que el repo **dice** que va a haber, y lo que dentro del contenedor **realmente responde** cuando se lo invoca. Mientras esas dos cosas coincidan, todo funciona y la distinción no se nota. Cuando dejan de coincidir, el síntoma típico es un comando que retorna `command not found` o, peor, una versión distinta de la esperada, y el origen del problema queda invisible si el lector no tiene presente que se trata de dos categorías distintas.

Este capítulo entra en esa frontera. Primero nombra qué herramientas integran la toolchain del repo, agrupadas por función. Después distingue tres estados posibles de cada una: declarada, instalada y disponible. Por último introduce dos comandos básicos —`--version` y `which`— que permiten observar empíricamente en cuál de esos estados está cada herramienta dentro del contenedor activo.

## Toolchain declarada por el repo

La declaración vive en archivos de texto del repo. El archivo central es el `Dockerfile` del devcontainer, donde cada línea `RUN apt install ...`, `RUN curl ... | sh`, `RUN cargo install ...` o equivalente describe una intención de instalación. Una declaración completa se lee linealmente: el paquete X se instala con el comando Y como parte de la capa Z de la imagen.

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential clang gdb lldb valgrind strace ltrace \
      cmake ninja-build make file binutils \
      python3 jq git curl ca-certificates
```

El fragmento es ilustrativo, no idéntico al `Dockerfile` actual del repo: lo que importa es la forma. Cada nombre listado es una declaración: el repo pretende que esa herramienta esté disponible cuando alguien abra una terminal dentro del contenedor. Hasta acá, **no existe ninguna garantía** de que efectivamente lo esté. Lo único que existe es la intención escrita.

El segundo lugar donde el repo declara herramientas, ya por afuera del `Dockerfile`, es el script `verify-setup.sh` (que se trata en detalle en [03-verify-setup.md](03-verify-setup.md)). Cada `run_check` del script es, en sí mismo, una declaración: si el repo se molesta en chequear `gdb`, es porque el repo afirma que `gdb` debe estar.

## Toolchain de C: compilador, linker, debugger

La toolchain de C en el repo se organiza alrededor de tres roles que conviene tener nombrados desde ahora, aunque los detalles aparezcan en `L3` y siguientes. El **compilador** traduce código C a código objeto: en el repo aparecen `gcc` y `clang` como dos compiladores distintos cubriendo el mismo rol, y cualquiera de los dos sirve para los ejercicios del nivel. El **linker** combina código objeto y bibliotecas en un ejecutable; en este momento del track no se invoca explícitamente porque el compilador suele llamarlo por debajo, pero su presencia está garantizada por el paquete `binutils`, que también provee las herramientas de inspección (`nm`, `objdump`, `readelf`, `ar`, `ranlib`, `ldd`, `file`). El **debugger** permite suspender un programa y observar su estado; en el repo viven dos: `gdb`, asociado al ecosistema GCC, y `lldb`, asociado al ecosistema LLVM/Clang.

A esas piezas se suman las herramientas de observabilidad y construcción que el repo declara. `valgrind` y los sanitizers (incorporados como flags al compilador) cubren el dominio de errores de memoria. `strace` y `ltrace` permiten observar las llamadas al sistema y a bibliotecas dinámicas que un proceso emite. `make`, `cmake` y `ninja` cubren la automatización de builds. La existencia de cada una de estas herramientas dentro del contenedor es prerrequisito de los niveles que las usan; `L0` solo las verifica.

## Toolchain de Rust: rustc, cargo y satélites

El ecosistema de Rust se gestiona con `rustup`, que instala y administra varias toolchains (estable, nightly y otras) y permite que `rustc` y `cargo` apunten a la toolchain activa. El compilador es `rustc`, pero rara vez se lo invoca directamente: la herramienta de uso cotidiano es `cargo`, que orquesta builds, tests, dependencias y publicación.

Alrededor de `cargo` viven varios subcomandos que el repo declara. `cargo fmt` formatea código según el estilo estándar de la comunidad. `cargo clippy` corre un linter con cientos de reglas. `cargo expand` muestra el código después de la expansión de macros, herramienta útil cuando un macro produce un comportamiento inesperado. `cargo audit` revisa el grafo de dependencias contra una base de datos de vulnerabilidades. `cargo flamegraph` produce visualizaciones de profiling. `cbindgen` y `bindgen` generan bindings entre C y Rust en ambas direcciones, y aparecen sobre todo en proyectos que combinan los dos lenguajes.

La toolchain `nightly` es opcional y aparece más adelante en el track, asociada a `miri` (un intérprete que verifica comportamiento indefinido en código Rust). En `L0` basta con saber que existe y que el script de verificación la marca como `[skip]` cuando no está instalada en el perfil base, en lugar de fallar.

## Herramientas de observabilidad como presencia comprobable

Hay un grupo de herramientas que el repo trata con cuidado especial: las de observabilidad de procesos en ejecución. `gdb`, `lldb`, `valgrind`, `strace`, `ltrace`, `perf`. Su uso real se posterga a `L5` y `L6`, donde aparecen los conceptos de proceso, syscalls y debugging dinámico. Pero su **disponibilidad** se exige desde `L0`, por una razón concreta: querer aprenderlas en `L5` con un contenedor donde alguna de ellas no está instalada produce el peor de los mundos, donde el alumno no sabe distinguir entre fallar al usarla y no tenerla. Verificar la presencia ahora previene esa frustración después.

La verificación, en este nivel, no entra en cómo se usan. Una invocación con `--version` (o `-V` cuando la herramienta no acepta `--version`, como ocurre con `ltrace`) basta para confirmar que el ejecutable está en el `PATH` y responde. La diferencia entre "responde" y "hace algo útil" se trata en los niveles destinatarios.

## Declarar, instalar y estar disponible no son lo mismo

Conviene fijar la distinción de tres estados con cuidado, porque el resto del capítulo se apoya en ella.

**Declarado** significa que el repo, en alguno de sus archivos de declaración, afirma que la herramienta debería existir en el contenedor. La declaración es estática: se lee con un editor de texto, no necesita que el contenedor esté corriendo. Si el `Dockerfile` lista `gdb`, `gdb` está declarado.

**Instalado** significa que la imagen, al construirse, materializó esa declaración: el ejecutable correspondiente quedó copiado en algún directorio del sistema de archivos de la imagen. La instalación ocurre durante el `docker build`. Si la línea `apt install` se ejecutó sin errores, los binarios quedaron instalados en la imagen.

**Disponible** significa que, cuando alguien abre una terminal dentro del contenedor activo, ese ejecutable responde a su invocación. Disponibilidad implica al menos dos cosas: que el ejecutable exista en disco (instalado) y que su directorio esté en el `PATH` del shell de la sesión. Una herramienta puede estar instalada y no estar disponible si su ubicación no entró al `PATH`. Y al revés, una herramienta puede aparecer disponible pero apuntar a una versión distinta de la esperada si el `PATH` resuelve a un binario equivocado.

La asimetría va en una sola dirección: declarado no implica instalado, instalado no implica disponible, disponible no implica que sea la versión correcta. Cada paso a la derecha agrega información que solo se confirma observando.

## Comprobaciones puntuales con `--version` y `which`

Las dos comprobaciones operativas del capítulo son `--version` y `which`. Cada una responde a una pregunta distinta y, juntas, cierran el caso para una herramienta puntual.

`<herramienta> --version` responde la pregunta *"¿la herramienta está disponible y qué versión es?"*. Si el comando devuelve una línea con la versión, el ejecutable está en el `PATH` y se ejecutó correctamente. Si devuelve `command not found`, la herramienta no está disponible en esta sesión, y la siguiente pregunta es por qué: ¿no está instalada, está instalada pero fuera del `PATH`, o el `PATH` actual está roto?

```bash
$ gcc --version
gcc (Debian 12.2.0-14) 12.2.0
Copyright (C) 2022 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

$ rustc --version
rustc 1.78.0 (9b00956e5 2024-04-29)

$ gdb --version | head -1
GNU gdb (Debian 13.1-3) 13.1
```

`which <herramienta>` responde la pregunta *"¿de qué archivo en disco viene esta invocación?"*. Su salida es la ruta absoluta del ejecutable que el shell elegiría al invocarla. Esa ruta sirve para confirmar dos cosas: primero, que la herramienta efectivamente existe en disco; segundo, que viene del lugar esperado. Si `which gcc` devuelve `/usr/bin/gcc`, viene del paquete del sistema que el `Dockerfile` instaló. Si devuelve algo bajo `/usr/local/bin/` o `/home/...`, fue instalada por otra vía y conviene saberlo.

```bash
$ which gcc
/usr/bin/gcc

$ which cargo
/usr/local/cargo/bin/cargo

$ which inexistente
$ echo $?
1
```

La combinación de los dos comandos sobre la misma herramienta produce un diagnóstico minúsculo pero completo: `which` confirma de dónde viene, `--version` confirma qué versión responde. Repetir esa pareja sobre cada herramienta de la toolchain es exactamente el trabajo que `verify-setup.sh` automatiza, y el próximo capítulo abre ese script para ver cómo lo hace.
