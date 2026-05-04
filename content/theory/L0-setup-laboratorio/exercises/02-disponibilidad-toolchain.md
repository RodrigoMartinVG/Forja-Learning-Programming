# Ejercicio 02 — Disponibilidad real de la toolchain

## Contexto

El [capítulo 02](../chapters/02-toolchain.md) distinguió tres estados de una herramienta: declarada (mencionada en el `Dockerfile`), instalada (presente como archivo en disco dentro del contenedor) y disponible (alcanzable desde el shell con su nombre corto). La distinción importa porque las tres pueden no coincidir, y los síntomas de cada falla son diferentes.

Este ejercicio comprueba el tercer estado —la disponibilidad— para cinco herramientas representativas, y obliga a separar dos preguntas que suelen confundirse: *"¿el shell la encuentra?"* y *"¿qué versión devuelve?"*.

## Consigna

Dentro del contenedor del repo, ejecutar para cada una de estas cinco herramientas el par de comandos correspondiente y registrar la salida exacta:

| Herramienta | Comando 1 | Comando 2 |
| --- | --- | --- |
| `cc` | `which cc` | `cc --version` |
| `rustc` | `which rustc` | `rustc --version` |
| `cargo` | `which cargo` | `cargo --version` |
| `gdb` | `which gdb` | `gdb --version \| head -1` |
| `strace` | `which strace` | `strace --version \| head -1` |

Registrar la salida tal cual aparece, sin reformatear. El ejercicio busca la salida literal, no un resumen.

## Resultado esperado

Una tabla con cinco filas y tres columnas: *herramienta*, *salida de `which`*, *primera línea de `--version`*. Las cinco filas deben tener resultado real; ninguna debe quedar como *"no probado"*.

## Verificación

En un contenedor sano construido con el `Dockerfile` actual del repo, las cinco herramientas tienen que devolver una ruta absoluta en `which` (típicamente bajo `/usr/bin/` o `/usr/local/bin/` o, para `rustc` y `cargo`, bajo `~/.cargo/bin/`) y una línea de versión con un número y una fecha o etiqueta de build. Si alguna devuelve cadena vacía o error en `which`, la herramienta no está disponible aunque pueda estar instalada, y eso ya es un hallazgo: el ejercicio terminó con información útil.

Comparar la salida con la sección de la toolchain del [capítulo 02](../chapters/02-toolchain.md) y con la salida agregada por `verify-setup.sh`. Las versiones reportadas por `--version` deberían ser consistentes con lo que el script reporta como `[ok]`. Una discrepancia (el script dice `[ok]` pero `--version` devuelve algo distinto, o viceversa) es material para el [capítulo 05](../chapters/05-diagnostico.md).

## Criterio de finalización

Las cinco filas están completas con salida literal. Si alguna falló, hay una nota corta indicando cuál y con qué mensaje, sin intentar corregirla en este ejercicio.
