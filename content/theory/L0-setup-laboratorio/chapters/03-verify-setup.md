# `verify-setup.sh` como contrato observable

## Del comando suelto al contrato condensado

Comprobar manualmente cada herramienta con `--version` y `which`, como hizo el [capítulo anterior](02-toolchain.md), funciona perfectamente la primera vez. Funciona también la segunda. A partir de la tercera, repetir treinta invocaciones a mano deja de tener sentido: la rutina se vuelve tediosa, propensa a saltearse un paso por descuido, y poco confiable como evidencia de que el laboratorio efectivamente está sano. El repo resuelve esa fricción con un script que vive en la raíz: `verify-setup.sh`. Su función no es mágica; es exactamente lo que el alumno haría manualmente, pero condensado en una sola pasada y con un formato de salida pensado para leerse rápido.

Este capítulo abre el script y lo presenta como lo que es: la formalización ejecutable del contrato del laboratorio. *Formalización* porque pone en código lo que de otro modo viviría en la cabeza del que armó el repo. *Ejecutable* porque cualquiera puede correrlo y ver el resultado. *Contrato* porque cada chequeo del script representa una afirmación del repo sobre cómo debe estar el laboratorio para que el resto del track funcione. Entender la salida del script, línea por línea, es entender ese contrato.

## El esqueleto del script

Antes de mirar la salida, conviene mirar la forma. El script entero se construye alrededor de una función pequeña, `run_check`, que recibe una etiqueta y un comando, lo ejecuta, y reporta si pasó o falló. Después de definir esa función, el cuerpo del script no es más que una lista larga de invocaciones a `run_check`, una por herramienta o por condición a verificar.

```bash
#!/usr/bin/env bash
set -euo pipefail

failures=0

run_check() {
  local label="$1"
  local command="$2"
  local output

  if output=$(bash -lc "$command" 2>&1); then
    output=$(printf '%s\n' "$output" | head -n 1)
    if [[ -n "$output" ]]; then
      printf '%-22s [ok] %s\n' "$label" "$output"
    else
      printf '%-22s [ok]\n' "$label"
    fi
  else
    output=$(printf '%s\n' "$output" | head -n 1)
    printf '%-22s [fail] %s\n' "$label" "$output"
    failures=$((failures + 1))
  fi
}
```

La función ejecuta el comando dentro de un sub-shell que carga el entorno completo (eso es lo que hace `bash -lc`), captura la primera línea de la salida, e imprime una etiqueta padded a 22 caracteres seguida de `[ok]` o `[fail]` según el código de salida del comando. Si falla, además incrementa un contador. Al final del archivo, ese contador decide si el script termina con código 0 (todo pasó) o código 1 (algo falló).

Esa simpleza es deliberada. El script no descubre cosas inteligentemente; lo único que hace es **invocar comandos que el alumno también podría invocar a mano**, y reportar el resultado en formato uniforme. Saber esto importa por una razón pedagógica: si una línea del script reporta `[fail]`, el siguiente paso natural es copiar el comando equivalente de la lista y correrlo a mano para ver el mensaje de error completo, sin la abreviación a una línea que `run_check` aplica.

## Las clases de chequeo que hace el script

La lista de invocaciones a `run_check` no es plana en cuanto a su intención; agrupa varias clases de verificación que conviene ver por separado, aunque en el archivo aparezcan mezcladas en orden lineal.

La primera clase, y la mayoritaria, es la **verificación de disponibilidad de herramientas en el `PATH`**. La forma típica es `<herramienta> --version`, exactamente como en el capítulo anterior. Cubren esta clase los chequeos de `gcc`, `clang`, `gdb`, `lldb`, `valgrind`, `make`, `cmake`, `ninja`, `strace`, `ltrace`, `nm`, `objdump`, `readelf`, `ar`, `ranlib`, `ldd`, `file`, `git`, `gh`, `python3`, `jq`, `yq`, `hyperfine`, `rustup`, `cargo` y los subcomandos de `cargo` (`fmt`, `clippy`, `expand`, `audit`, `flamegraph`), `cbindgen` y `bindgen`. Ninguno de estos chequeos hace nada con la salida más allá de exigir código de retorno cero: la presencia se infiere de que el comando responda.

La segunda clase es la **verificación condicional con fallback explícito**. Solo aparece para la toolchain `nightly` de Rust y para `miri`, que no son obligatorias en el perfil base. El script primero pregunta si `nightly` está instalada, y solo entonces invoca los chequeos correspondientes; si no lo está, imprime `[skip]` con una nota que explica por qué.

```bash
if rustup toolchain list | grep -q '^nightly'; then
  run_check "nightly toolchain" "rustup toolchain list | grep -q '^nightly'"
  run_check "miri" "rustup run nightly cargo miri --version"
else
  printf '%-22s [skip] not installed in base profile\n' "nightly toolchain"
  printf '%-22s [skip] not installed in base profile\n' "miri"
fi
```

`[skip]` es la tercera variante de salida del script (junto con `[ok]` y `[fail]`), y existe precisamente para no inflar el contador de errores cuando una pieza opcional ausente no rompe el laboratorio.

La tercera clase es la **verificación de presencia de bibliotecas y headers**, que no se hace con `--version` sino preguntándole a `pkg-config` si conoce ciertos paquetes, o listando archivos en rutas conocidas del sistema:

```bash
run_check "liburing" "pkg-config --exists liburing"
run_check "libseccomp" "pkg-config --exists libseccomp"
run_check "linux headers" "ls /usr/src | grep -q '^linux-headers-'"
```

Estas verificaciones no responden la pregunta *"¿la herramienta está disponible?"* sino *"¿el material que algunas piezas del track necesitan para compilar contra él está presente?"*. La diferencia es que acá no hay un binario que ejecutar; el chequeo se construye sobre `pkg-config --exists` (que devuelve 0 si conoce el paquete) o sobre comprobaciones de archivos.

## La salida cuando el laboratorio está sano

Con el script entendido como una lista larga de chequeos individuales, su salida deja de parecer un muro de texto y se vuelve legible. Una corrida completa con todo en orden produce algo así:

```text
gcc                    [ok] gcc (Debian 12.2.0-14) 12.2.0
clang                  [ok] Debian clang version 14.0.6
gdb                    [ok] GNU gdb (Debian 13.1-3) 13.1
lldb                   [ok] lldb version 14.0.6
valgrind               [ok] valgrind-3.19.0
make                   [ok] GNU Make 4.3
cmake                  [ok] cmake version 3.25.1
...
rustup                 [ok] rustup 1.27.1 (54dd3d00f 2024-04-24)
cargo                  [ok] cargo 1.78.0 (54d8815d0 2024-03-26)
cargo fmt              [ok] rustfmt 1.7.0-stable (9b00956e 2024-04-29)
...
nightly toolchain      [skip] not installed in base profile
miri                   [skip] not installed in base profile
liburing               [ok]
libseccomp             [ok]
linux headers          [ok]

Setup verification passed.
```

Cada línea sigue el mismo patrón: nombre de la herramienta padded a 22 caracteres, estado (`[ok]`, `[fail]`, `[skip]`), y opcionalmente la primera línea de la salida del comando. La línea final, `Setup verification passed`, aparece solo si el contador de fallos quedó en cero. Cuando aparece, el script terminó con código de salida 0, lo que en el shell se traduce en `$?` igual a cero.

Mirar la salida con esta clave —cada línea es un chequeo individual con su origen identificable— es lo que vuelve al script herramienta de diagnóstico, no oráculo. Si `valgrind` aparece como `[ok]`, alguien antes en el script lo invocó con `valgrind --version` y obtuvo respuesta. Si aparece como `[fail]`, esa misma invocación falló, y el siguiente paso no es desesperar sino correrla a mano fuera del script.

## La salida cuando algo falta

Para entender el otro extremo, conviene ver cómo se comporta el script cuando una herramienta no está disponible. La forma más fácil de provocarlo, para el ejercicio mental, es imaginar que `valgrind` no está instalado:

```text
valgrind               [fail] bash: line 1: valgrind: command not found
```

La etiqueta sigue siendo la misma. El estado pasa de `[ok]` a `[fail]`. El texto que sigue es la primera línea de la salida del comando que falló, que en este caso es el mensaje del shell informando que el comando no se encontró. El script no detiene la ejecución por un solo `[fail]`: gracias a `set -euo pipefail` combinado con la captura del estado dentro de `run_check`, el fallo queda contenido en ese chequeo y el script continúa con los siguientes. Recién al final, si el contador de fallos quedó en algo distinto de cero, imprime la línea de resumen y termina con código 1:

```text
Setup verification failed: 3 check(s) missing.
```

Tener varios fallos en una sola corrida es preferible a tener uno solo, porque permite ver el patrón. Si las tres herramientas faltantes pertenecen a la toolchain de C, el problema probablemente está en `build-essential` o en la línea del `Dockerfile` que instala esa familia. Si las tres pertenecen a Rust, el problema es del lado de `rustup`. La salida agrupada del script vuelve visible esos patrones que en una verificación manual fragmentada quedarían disimulados.

## Lo que el script no comprueba (y por qué)

El script tiene un alcance muy específico: comprueba **disponibilidad de herramientas** y **presencia de bibliotecas y headers conocidos**. No comprueba muchas otras cosas que también podrían formar parte del contrato del laboratorio, y la decisión de no hacerlo es deliberada.

No verifica que las versiones de las herramientas coincidan con un mínimo. Reportar la versión sirve como información, pero el script acepta cualquier versión que responda a `--version`. Comparar versiones contra mínimos es ruido temprano: un compilador uno o dos minor por detrás del esperado casi siempre alcanza para los ejercicios de los primeros niveles, y exigirlo numéricamente convertiría el script en barrera burocrática.

No verifica que las herramientas se comporten correctamente más allá de responder a `--version`. Que `gcc` responda con su versión no garantiza que pueda compilar un programa C. Esa garantía requeriría compilar de hecho un programa, lo que añadiría latencia y complejidad al script sin pagar dividendos en este nivel: si `gcc` responde y el `Dockerfile` no fue alterado, su capacidad de compilar está implicada por construcción.

No verifica el estado del workspace montado, ni la red, ni permisos de archivos, ni configuración de Git. Cada una de esas cosas son verdaderas piezas del laboratorio en el sentido amplio, pero el script eligió mantenerse en el subconjunto de afirmaciones cuyo fallo es definitivo: si `gdb` no responde, hay un problema; si la red está lenta, no necesariamente. El script reporta lo primero y deja lo segundo para diagnóstico humano.

Esta delimitación es importante por una razón pedagógica concreta: ver pasar `verify-setup.sh` no equivale a "todo va a funcionar". Equivale, exactamente, a "las herramientas listadas responden y los headers listados existen". Es mucho más que nada y mucho menos que todo. Diagnosticar un problema en `L5` mirando solo la salida de `verify-setup.sh` puede dar falsa confianza si lo que falla en `L5` está fuera del alcance del script. La rutina de trabajo del próximo capítulo agrega un sanity check manual mínimo precisamente para cubrir parte de esa zona.
