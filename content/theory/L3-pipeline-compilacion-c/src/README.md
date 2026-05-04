# Artefactos mínimos para L3

Este directorio existe para darle a `L3` artefactos reales. No abre un proyecto paralelo ni un mini curso de C: aporta archivos chicos y deliberados sobre los que mirar pipeline, linking y una primera automatizacion con `make`.

## Estructura

- `hello/hello.c`: ejemplo mínimo de un solo archivo para seguir `source -> .i -> .s -> .o -> ejecutable`.
- `split/main.c`, `split/greet.c`, `split/greet.h`: ejemplo de varias unidades de compilación para abrir linking y errores de símbolo.
- `split/Makefile`: automatización mínima del flujo manual para el cierre del nivel.

## Cómo usarlo

- `chapters/01` a `chapters/04`: empezar por `hello/hello.c`.
- `chapters/05` y `chapters/06`: pasar a `split/` para observar linking, dependencias y composición de objetos.
- `chapters/07` y `chapters/08`: usar ambos ejemplos para practicar flags, conservar artefactos y automatizar el recorrido.

## Regla de uso pedagógico

Estos archivos no deben tratarse como una miniaplicación “para terminar”. Hay que tratarlos como evidencia material del pipeline.

La pregunta de trabajo no es “qué hace el programa” en abstracto. Hay que preguntar:

- qué archivo estoy mirando ahora
- qué comando produjo este artefacto
- qué parte del pipeline deja visible este ejemplo