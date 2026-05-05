# L0 — Setup del laboratorio

> Documento de diseño interno del nivel. Voz y prosa: [estandar_editorial_forja.md](../../../estandar_editorial_forja.md). Estructura: [CONVENTIONS.md](../../../CONVENTIONS.md). Plan de capítulos y ejercicios: [outline.md](outline.md).

## Estado editorial

- Authoría real abierta.
- Outline aprobado en mayo de 2026.
- Capítulos `chapters/00`–`chapters/05` redactados.
- Ejercicios en `exercises/` con un archivo por consigna.

## Prerrequisitos

Ninguno técnico. El nivel parte de una persona que tiene VS Code instalado, Docker funcionando en el host, y la capacidad de abrir una terminal y leer un archivo de texto. No se asumen conocimientos previos de Docker, ni de C, ni de Rust.

## Bloque editorial de entrada recomendado

Antes de empezar `L0` conviene haber leído [¿qué es Forja?](../../intro/forja/forja.md) y la [introducción al Workspace](../../intro/workspace/workspace.md). Esos dos archivos sitúan a Forja como track y al workspace como objeto de trabajo. `L0` empieza asumiendo ese contexto.

## Objetivo del nivel

Que la persona pueda abrir el repo en el devcontainer declarado, identificar las cinco piezas que componen el laboratorio, comprobar que la toolchain declarada por el repo está realmente disponible dentro del contenedor, ejecutar la verificación base con `verify-setup.sh`, y diagnosticar un fallo de entorno ubicándolo en la capa correcta antes de actuar.

## Capítulos

1. [Por qué este nivel existe](chapters/00-introduccion.md)
2. [El devcontainer como contrato de trabajo](chapters/01-devcontainer.md)
3. [La toolchain declarada y la toolchain disponible](chapters/02-toolchain.md)
4. [`verify-setup.sh` como contrato observable](chapters/03-verify-setup.md)
5. [Workflow del día cero](chapters/04-workflow.md)
6. [Diagnóstico y recuperación](chapters/05-diagnostico.md)

## Ejercicios

Los ejercicios viven en [exercises/](exercises/), un archivo por consigna. Cada uno produce evidencia observable (comando con salida, clasificación contra archivo, modificación reversible con diff) o es multiple choice con verificación empírica.

## Proyecto asociado

[content/projects/focused/devcontainer-setup](../../projects/focused/devcontainer-setup) profundiza la construcción del laboratorio: en `L0` se aprende a habitarlo y diagnosticarlo, en el proyecto se aprende a construirlo y modificarlo.

## Próximo paso después de `L0`

`L1 — Modelo mental de una computadora` empieza a construir el modelo de máquina que el resto del track va a usar (CPU, registros, memoria, ciclo fetch-decode-execute). Lo que `L0` deja firme es el laboratorio donde ese modelo va a comprobarse: contenedor sano, toolchain disponible, rutina de arranque reproducible. Sin esa base, los errores de `L1` y siguientes se confunden con errores del laboratorio, y el track pierde su capacidad de enseñar diagnóstico desde el primer día.

## Notas de mantenimiento

- Si el `Dockerfile` cambia (paquetes instalados, versiones de toolchain), revisar el [capítulo 02](chapters/02-toolchain.md) para que la lista de herramientas siga siendo coherente con lo declarado.
- Si `verify-setup.sh` cambia, revisar el [capítulo 03](chapters/03-verify-setup.md) y el ejercicio [03 sobre lectura de su salida](exercises/03-leer-verify-setup.md).
- El sanity check manual del [capítulo 04](chapters/04-workflow.md) usa `whoami`, `uname -a` y `cat /etc/os-release`. Si el devcontainer cambia de distribución base, ajustar la justificación de cada comando en consecuencia.
