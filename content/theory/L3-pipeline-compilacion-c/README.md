# L3 - El pipeline de compilacion en C

> README editorial del nivel.
>
> Este archivo fija alcance, estructura, artefactos y estado de trabajo de `L3`. No reemplaza capitulos, ejercicios ni `src/`: sirve para mantener estable el contrato curricular del nivel dentro del repo.
>
> Diseno curricular -> `docs/forja-contenido.md`
> Introduccion general -> `content/intro/workspace/workspace.md`
> Outline del nivel -> `outline.md`
> Artefactos del nivel -> `src/ARTIFACTS.md`

## Estado editorial

- Objetivo del nivel: volver observable la cadena `source -> preprocesado -> assembly -> objeto -> ejecutable`, separar roles de preprocesador, compilador, assembler, linker y loader, e introducir una automatizacion minima con `make` sin convertir todavia el foco en lenguaje C ni en build systems grandes.
- Proyecto asociado: ninguno.
- Estado actual: `outline.md`, los diez capitulos (`00` a `09`), los doce ejercicios (`01` a `12`) y los ejemplos `src/hello` y `src/split` forman una base de trabajo repetible sobre artefactos reales del toolchain.
- Nota de alcance: `L3` usa C como superficie guiada para seguir artefactos del pipeline. No intenta ensenar aun C como lenguaje en profundidad, ni assembly completo, ni formatos objeto al detalle total. Esos temas reaparecen y se profundizan en niveles posteriores.

## Prerequisitos

- L2

## Proyectos asociados

- Sin proyectos asociados todavia.

## Capitulos del nivel

| Archivo | Titulo | Nota |
|---|---|---|
| `chapters/00-introduccion.md` | Por que este nivel existe | Abre el pipeline detras de `gcc archivo.c -o programa` y enumera las cuatro etapas y los cinco artefactos. |
| `chapters/01-source-artefactos-ejecutable.md` | Source, artefactos y ejecutable | Fija los cinco artefactos como entidades distintas y presenta las flags de control de etapa. |
| `chapters/02-preprocesado.md` | Preprocesado | Separa includes, macros y compilacion condicional como manipulacion textual sin C. |
| `chapters/03-compilacion-assembly.md` | Compilacion a assembly | Usa el `.s` como salida intermedia legible y muestra el efecto del nivel de optimizacion. |
| `chapters/04-ensamblado-codigo-objeto.md` | Ensamblado y codigo objeto | Abre el `.o` como ELF relocatable con secciones binarias y tabla de simbolos. |
| `chapters/05-simbolos-referencias.md` | Simbolos y referencias no resueltas | Distingue definir y referenciar y lee la salida de `nm` con sus codigos `T`/`U`/etc. |
| `chapters/06-linking.md` | Linking | Combina secciones, resuelve referencias y asigna direcciones definitivas. |
| `chapters/07-libs-estaticas-dinamicas.md` | Bibliotecas estaticas y dinamicas | Contrasta `.a` y `.so` y aisla `undefined reference` de `cannot open shared object file`. |
| `chapters/08-flags.md` | Flags del compilador como modificadores observables | Trata cada flag como un cambio observable en algun artefacto, no como conjuro. |
| `chapters/09-make.md` | Make como automatizacion del pipeline | Cierra el nivel con reglas, prerrequisitos y la propiedad de regeneracion selectiva. |

## Ejercicios del nivel

| Archivo | Titulo | Nota |
|---|---|---|
| `exercises/01-cinco-artefactos.md` | Producir los cinco artefactos | Genera `.c`, `.i`, `.s`, `.o` y ejecutable y los identifica con `file`. |
| `exercises/02-comparar-c-i.md` | Comparar `.c` y `.i` | Mide la explosion del preprocesado y verifica que `GREETING` desaparece. |
| `exercises/03-comparar-s-optimizacion.md` | Comparar `.s` con dos niveles de optimizacion | Compara `-O0` y `-O2` sobre el mismo `.c`. |
| `exercises/04-tabla-simbolos.md` | Leer la tabla de simbolos del `.o` | Clasifica cada simbolo de `nm` como definido o referenciado. |
| `exercises/05-undefined-reference.md` | Provocar y leer "undefined reference" | Aisla un error del linker y lo resuelve agregando un `.c` con la definicion. |
| `exercises/06-enlazar-varios-o.md` | Enlazar varios `.o` | Recorre el split por etapas y cruza simbolos entre los dos `.o`. |
| `exercises/07-ldd-dependencias.md` | Inspeccionar dependencias dinamicas | Lee la salida de `ldd` y describe cada dependencia. |
| `exercises/08-error-libreria-dinamica.md` | Provocar error de biblioteca dinamica | Construye una `.so` propia y la rompe para provocar un error de carga. |
| `exercises/09-flag-observable.md` | Efecto observable de una flag | Compara dos compilaciones para describir que cambia una flag concreta. |
| `exercises/10-makefile-minimo.md` | Makefile minimo | Reconstruye el pipeline como Makefile y verifica regeneracion selectiva. |
| `exercises/11-prediccion-recompilacion.md` | Prediccion de recompilacion | Predice que se recompila ante cuatro tipos de cambio en el split. |
| `exercises/12-diagnostico-cruzado.md` | Diagnostico cruzado por etapa | Clasifica cinco errores reales del pipeline por etapa y comando confirmatorio. |

## Artefactos de apoyo

| Ruta | Uso |
|---|---|
| `src/hello/hello.c` | Ejemplo minimo de un solo archivo para seguir el pipeline completo. |
| `src/split/main.c` | Punto de entrada del ejemplo de varias unidades de compilacion. |
| `src/split/greet.c` | Definicion separada para abrir linking y resolucion de simbolos. |
| `src/split/greet.h` | Contrato minimo compartido entre unidades de compilacion. |
| `src/split/Makefile` | Automatizacion minima del flujo manual del ejemplo `split/`. |

## Proximo paso

El trabajo pendiente ya no es abrir etapas nuevas, sino sostener continuidad con `L4`, decidir si este nivel necesita una solapa `pipeline` propia y preservar que los ejemplos sigan siendo deliberadamente chicos, observables y subordinados al modelo del toolchain.
