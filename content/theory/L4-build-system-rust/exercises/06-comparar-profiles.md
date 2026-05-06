# Ejercicio 06 — Comparar profiles

## Contexto

El [capítulo 06](../chapters/06-profiles.md) presentó `dev` y `release` como dos builds con flags distintas, no como dos modos del mismo build. Este ejercicio mide la diferencia material y obliga a justificar la elección para una tarea concreta.

## Consigna

1. Sobre un crate con un poco de cómputo (puede ser un binario que sume `0..1_000_000_000` en un loop, o cualquier cómputo numérico observable), correr `cargo build` y `cargo build --release`.
2. Comparar tamaños: `ls -lh target/debug/<bin> target/release/<bin>`.
3. Comparar metadatos del ELF: `file target/debug/<bin>` y `file target/release/<bin>`. Anotar la diferencia (en particular si aparece `with debug_info`).
4. Medir tiempo de ejecución del binario en cada profile: `time ./target/debug/<bin>` y `time ./target/release/<bin>`. Anotar el tiempo `real`.
5. Medir tiempo de compilación de cada profile, después de un `cargo clean`: `time cargo build` y `time cargo build --release`.
6. Producir una tabla resumen con cuatro filas: *tamaño del binario*, *debug info presente*, *tiempo de compilación*, *tiempo de ejecución*; y dos columnas: `dev`, `release`.
7. Para una tarea hipotética concreta —elegir una de las tres siguientes—, justificar qué profile elegir y por qué:
   - iterar agregando funcionalidades nuevas, recompilando seguido;
   - distribuir el binario a usuarias finales;
   - depurar un crash con `gdb` paso a paso.

## Resultado esperado

La tabla resumen completa, con las cuatro métricas observadas para los dos profiles. La justificación de la tarea elegida, anclada en al menos dos filas de la tabla.

## Verificación

Para un binario simple que hace cómputo:

- Tamaño: el de `release` debería ser entre 5x y 10x menor que el de `dev`.
- Debug info: `dev` lleva `with debug_info, not stripped`; `release` no menciona `with debug_info`.
- Tiempo de compilación: `release` tarda más, especialmente la primera vez. La diferencia depende del crate; para algo trivial puede ser pequeña.
- Tiempo de ejecución: para cómputo numérico, `release` puede ser un orden de magnitud o más rápido que `dev`. Para un programa que solo imprime una línea, la diferencia es invisible.

Justificaciones esperadas:
- iterar: `dev`, porque la velocidad de compilación domina y la velocidad de ejecución no importa para tests simples;
- distribuir: `release`, porque tamaño y rendimiento del binario importan más que el tiempo de build;
- depurar con `gdb`: `dev`, porque la debug info completa es lo que hace que `gdb` pueda mapear instrucciones a líneas de código fuente.

## Criterio de finalización

La tabla tiene las cuatro métricas observadas (no inferidas). La justificación cita filas concretas de la tabla, no apela a «porque sí».
