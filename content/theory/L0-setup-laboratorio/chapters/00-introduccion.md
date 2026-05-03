# Introducción

L0 existe para evitar una confusión cara: pensar que un problema de entorno es un problema de programación. Antes de tocar C, Rust o sistemas, Forja fija el laboratorio que va a sostener todo lo demás.

# Introducción

L0 existe para evitar una confusión cara: pensar que un problema de entorno es un problema de programación. Antes de tocar C, Rust o sistemas, Forja fija el laboratorio que va a sostener todo lo demás.

## Qué es este nivel

Este nivel define el contrato mínimo del laboratorio:

- cómo se abre el repo dentro del entorno esperado
- cómo se verifica rápido
- cómo distinguir cambios de código de cambios que obligan a reconstruir el contenedor
- cómo arrancar un diagnóstico sin improvisar

No es un curso de Docker. Es una unidad de entrada para que el resto del plan no quede montado sobre un setup ambiguo.

También fija una regla de uso para todo Forja: niveles, ejercicios y proyectos se trabajan con el repositorio abierto en la IDE y con el contenedor Linux de ese mismo repo operativo. La web sola no alcanza para sacarle jugo al recorrido.

## Qué cubre

| Pieza | Para qué entra en L0 |
|---|---|
| `chapters/01-devcontainer.md` | ubicar el contrato del entorno y separar imagen, contenedor y workspace |
| `chapters/02-workflow.md` | fijar la rutina mínima de apertura y verificación |
| `chapters/03-diagnostico.md` | convertir fallos comunes en una cadena de evidencia corta |

## Qué toca superficialmente y por qué

- Docker y devcontainers aparecen como herramientas operativas, no como tema profundo. A este nivel importa saber usarlos y auditarlos, no explicar sus capas internas.
- PATH, variables de entorno y toolchain se miran desde la observación del repo. La teoría detallada de procesos, memoria y aislamiento llega más adelante.
- Algunas herramientas de C y Rust aparecen por nombre aunque todavía no se usen en serio. Acá importan como parte del inventario del laboratorio.

## Qué no cubre y por qué

- cgroups, namespaces y aislamiento fuerte no entran acá; ese arco llega mucho más adelante cuando el sistema operativo ya es parte del contenido, no solo del laboratorio.
- CI, registries o imágenes de producción no entran acá; todavía no son el cuello de botella del recorrido.
- Compilación de programas, warnings, debugging real y POSIX no entran acá; aparecen cuando haya suficiente contexto para que no se vuelvan lista de comandos sueltos.

## Cómo trabajarlo

Recorrido recomendado:

1. leer la introducción general en `content/theory/README.md`
2. leer este capítulo para fijar el alcance de L0
3. recorrer `01-devcontainer.md`, `02-workflow.md` y `03-diagnostico.md` en orden
4. usar `exercises.md` para transformar lectura en verificación
5. cerrar el nivel con una idea simple: el laboratorio también es parte del contenido

La regla del nivel es simple: cada afirmación importante sobre el entorno debería poder apoyarse en un archivo o en un comando del repo.

## El nivel siguiente

Después de L0 viene `L1`, donde el foco ya no es el entorno sino el modelo mental de una computadora. La gracia de cerrar bien L0 es que a partir de ahí las preguntas pueden moverse hacia CPU, memoria y programas sin seguir discutiendo si el laboratorio está bien armado.

## El nivel siguiente

Después de L0 viene `L1`, donde el foco ya no es el entorno sino el modelo mental de una computadora. La gracia de cerrar bien L0 es que a partir de ahí las preguntas pueden moverse hacia CPU, memoria y programas sin seguir discutiendo si el laboratorio está bien armado.