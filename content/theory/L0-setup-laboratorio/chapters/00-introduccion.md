# Introduccion

L0 existe para evitar una confusion cara: pensar que un problema de entorno es un problema de programacion. Antes de tocar C, Rust o sistemas, Forja fija el laboratorio que va a sostener todo lo demas.

## Que es este nivel

Este nivel define el contrato minimo del laboratorio:

- donde se declara el entorno
- como se verifica rapido
- como distinguir cambios de codigo de cambios que obligan a reconstruir el contenedor
- como arrancar un diagnostico sin improvisar

No es un curso de Docker. Es una unidad de entrada para que el resto del plan no quede montado sobre un setup ambiguo.

## Que cubre

| Pieza | Para que entra en L0 |
|---|---|
| `chapters/01-devcontainer.md` | ubicar Dockerfile, `devcontainer.json` y el workspace real |
| `chapters/02-workflow.md` | fijar la rutina minima de apertura y verificacion |
| `chapters/03-diagnostico.md` | convertir fallos comunes en una cadena de evidencia corta |
| `devcontainer-setup` | extender el laboratorio una vez entendido el contrato base |

## Que toca superficialmente y por que

- Docker y devcontainers aparecen como herramientas operativas, no como tema profundo. A este nivel importa saber usarlos y auditarlos, no explicar sus capas internas.
- PATH, variables de entorno y toolchain se miran desde la observacion del repo. La teoria detallada de procesos, memoria y aislamiento llega mas adelante.
- Algunas herramientas de C y Rust aparecen por nombre aunque todavia no se usen en serio. Acá importan como parte del inventario del laboratorio.

## Que no cubre y por que

- cgroups, namespaces y aislamiento fuerte no entran aca; ese arco llega mucho mas adelante cuando el sistema operativo ya es parte del contenido, no solo del laboratorio.
- CI, registries o imagenes de produccion no entran aca; todavia no son el cuello de botella del recorrido.
- Compilacion de programas, warnings, debugging real y POSIX no entran aca; aparecen cuando haya suficiente contexto para que no se vuelvan lista de comandos sueltos.

## Como trabajarlo

Recorrido recomendado:

1. leer la introduccion general en `content/theory/README.md`
2. recorrer `01-devcontainer.md`, `02-workflow.md` y `03-diagnostico.md` en orden
3. ejecutar dentro del contenedor:

   ```bash
   bash verify-setup.sh
   bash content/theory/L0-setup-laboratorio/src/toolchain_snapshot.sh
   ```

4. resolver `exercises.md`
5. pasar al proyecto `devcontainer-setup`

La regla del nivel es simple: cada afirmacion importante sobre el entorno deberia poder apoyarse en un archivo o en un comando del repo.

## El nivel siguiente

Despues de L0 viene `L1`, donde el foco ya no es el entorno sino el modelo mental de una computadora. La gracia de cerrar bien L0 es que a partir de ahi las preguntas pueden moverse hacia CPU, memoria y programas sin seguir discutiendo si el laboratorio esta bien armado.