# Proyecto: Devcontainer Setup

**Nivel ancla**: `L0` — Setup del laboratorio
**Tipo**: Proyecto focalizado
**Entregable**: el laboratorio del repo, extendido y documentado de manera tal que otra persona pueda reproducirlo y diagnosticarlo.

---

## De habitar el laboratorio a modificarlo

`L0` deja una capacidad concreta instalada: ante el laboratorio del repo, una persona puede abrirlo, identificar sus cinco piezas, comprobar que la toolchain declarada está disponible, leer la salida de `verify-setup.sh` y ubicar un fallo en la capa correcta antes de reaccionar. Esa capacidad alcanza para usar el laboratorio como entorno de trabajo del resto del track. Lo que no alcanza para hacer —y este proyecto cubre— es modificarlo de manera tal que la modificación se sostenga en el tiempo y pueda explicarse.

Hay una diferencia operativa entre leer un `Dockerfile` con comprensión y agregarle una línea sin romper el resto. La primera es lectura; la segunda exige decidir qué herramienta sumar, dónde declararla, cómo verificarla, y cómo dejar evidencia de que la decisión fue deliberada. Este proyecto pone en juego ese segundo conjunto de habilidades sobre el mismo laboratorio que `L0` ya volvió legible.

## Cómo recorrerlo junto a `L0`

Antes de empezar conviene haber leído los seis capítulos del nivel teórico. La condición operativa es la habitual: repo abierto en VS Code dentro del devcontainer, terminal con acceso a `.devcontainer/`, `verify-setup.sh` y al directorio del proyecto mientras se lee y se modifica.

La secuencia de trabajo se apoya directamente en lo que `L0` deja firme:

1. Abrir el repo en VS Code y entrar al devcontainer.
2. Reconocer el contrato del entorno con la cadena del [capítulo 01 del nivel](../../../theory/L0-setup-laboratorio/chapters/01-devcontainer.md).
3. Correr la verificación base con `bash verify-setup.sh` y leer la salida con el modelo del [capítulo 03](../../../theory/L0-setup-laboratorio/chapters/03-verify-setup.md).
4. Extender el contrato con un check y una herramienta nuevos.
5. Documentar el ambiente final como si otra persona fuera a depender de él.

Las tres fases del proyecto están organizadas exactamente alrededor de los pasos 3, 4 y 5 de esa secuencia.

## Fase 1 — Verificación del ambiente

La primera fase no agrega nada al laboratorio: lo lee. La distancia entre saber que `verify-setup.sh` existe y poder explicar línea por línea qué hace es la que esta fase cierra.

El trabajo concreto tiene tres pasos. Primero, leer el script entero, identificando la función central `run_check` y entendiendo qué hacen sus argumentos. El [ejercicio 03 de `L0`](../../../theory/L0-setup-laboratorio/exercises/03-leer-verify-setup.md) ya empezó este recorrido; el proyecto exige completarlo, no muestrearlo. Segundo, ejecutar el script dentro del contenedor:

```bash
$ bash verify-setup.sh
```

Si alguna línea reporta `[fail]`, hay que decidir si es un fallo real (corregirlo) o un comportamiento esperado (documentarlo, explicando por qué). Tercero, agregar al menos un `run_check` propio sobre una herramienta del laboratorio que sea relevante para el resto del track —`clang-format`, `cargo-expand`, `readelf`, o equivalente— respetando el patrón del script: label descriptivo, comando con código de salida significativo, mensaje claro cuando la herramienta no está.

El criterio para aceptar el check propio no es estético: tiene que ser indistinguible, en forma y comportamiento, de los que ya están en el script. Si se nota que es un agregado, no está terminado.

## Fase 2 — Extensión del `Dockerfile`

La segunda fase modifica la imagen. Es la primera vez en el track que el contrato declarado del laboratorio cambia por decisión de la persona que lo trabaja, no del autor del repo.

La consigna es agregar una herramienta al `Dockerfile` que no esté en la imagen base. La elección debe satisfacer tres criterios: ser una herramienta real que tenga uso en algún nivel posterior del track (no algo arbitrario por completar la tarea), instalarse de manera reproducible (con versión fija cuando sea posible), y aparecer como `[ok]` en `verify-setup.sh` después de reconstruir el contenedor.

El procedimiento operativo es directo: editar el `Dockerfile`, lanzar *"Dev Containers: Rebuild Container"* desde la paleta, y volver a correr `verify-setup.sh`. Si el rebuild falla, leer la salida del build identifica casi siempre la causa exacta —paquete inexistente, repositorio no agregado, conflicto de dependencias. Si pasa pero el script no reporta la herramienta como `[ok]`, la causa está en el lado del check: o no se agregó en la Fase 1, o el comando que usa para verificarla no devuelve código 0 para esa herramienta. Esas dos causas son las que el [escenario 2 del capítulo de diagnóstico](../../../theory/L0-setup-laboratorio/chapters/05-diagnostico.md) describe en detalle.

Lo importante de esta fase no es la herramienta elegida sino el ciclo completo: declarar, reconstruir, verificar. Ejecutar ese ciclo una vez, con éxito y de manera consciente, es lo que vuelve después rutina manejable cuando el `Dockerfile` haya que modificarlo por razones reales.

## Fase 3 — Documentación del ambiente

La tercera fase produce un archivo de texto. Eso suena modesto y no lo es: documentar el ambiente final fuerza a explicitar decisiones que durante las dos primeras fases pueden haber quedado implícitas, y confronta la coherencia interna del laboratorio extendido.

El archivo se llama `ENVIRONMENT.md` y vive dentro del directorio del proyecto, no en la raíz del repo. Cubre tres bloques de contenido.

El primero es **qué hay instalado y por qué**, presentado como una tabla con tres columnas: herramienta, propósito en Forja (no en general, sino para qué la usa el track), nivel donde aparece por primera vez. La tabla no es exhaustiva sobre todo lo que está en la imagen; es exhaustiva sobre lo que importa para el track. Una herramienta que está instalada pero ningún nivel la va a usar todavía no necesita aparecer.

El segundo es **cómo reconstruir el contenedor**, con los pasos exactos —desde abrir VS Code hasta confirmar que el rebuild terminó— incluyendo qué hacer si Docker Desktop no está corriendo. El criterio es que una persona que nunca usó el repo pueda seguir las instrucciones sin pedir ayuda.

El tercero es **qué hacer si una herramienta falla**, con al menos tres casos concretos y, para cada uno, el comando de diagnóstico, la causa probable y la corrección. Los cinco escenarios del [capítulo 05](../../../theory/L0-setup-laboratorio/chapters/05-diagnostico.md) son material de partida, pero la documentación tiene que estar especializada al laboratorio extendido del proyecto, no copiar el capítulo.

## Criterio de terminado

El proyecto está terminado cuando se cumplen, en este orden, las cinco condiciones siguientes:

1. `bash verify-setup.sh` pasa dentro del contenedor sin ningún `[fail]`.
2. El `run_check` agregado en la Fase 1 está integrado al script y reporta `[ok]` para la herramienta que verifica.
3. La herramienta agregada al `Dockerfile` en la Fase 2 se instala limpiamente al reconstruir el contenedor sobre una checkout limpia del repo.
4. `ENVIRONMENT.md` existe en el directorio del proyecto y cubre los tres bloques descritos en la Fase 3.
5. La persona que terminó el proyecto puede explicar, sin volver al texto, qué diferencia hay entre montar un volumen y copiar archivos, y qué pasa con los binarios compilados si se destruye y se reconstruye el contenedor.

La quinta condición no es ornamental. La extensión del laboratorio de las fases 1 y 2 sólo se sostiene si las dos preguntas centrales sobre persistencia y montaje quedan firmes; sin eso, cualquier rebuild posterior puede borrar trabajo sin que se vea venir.

## Lo que este proyecto no pide

Para que el alcance quede explícito y no se sobre-trabaje:

- Mecanismos internos de Docker (cgroups, namespaces, capas en profundidad) no entran. Ese arco aparece más adelante en el track, en `L21`.
- Escribir un `Dockerfile` desde cero no se pide; se pide extender correctamente el que ya existe.
- Registry de Docker, build pipelines o CI no entran. El foco está en trabajo local reproducible.

Estos límites son deliberados. El proyecto se queda corto a propósito en aspectos que requieren conocimiento todavía no construido, y se concentra en la habilidad —modificar y documentar el laboratorio del repo— que `L0` deja preparada y que el resto del track va a asumir disponible.

## Referencias

- Nivel teórico asociado: [content/theory/L0-setup-laboratorio/](../../../theory/L0-setup-laboratorio/)
- Script de verificación: `verify-setup.sh` en la raíz del repositorio.
- `Dockerfile` del laboratorio: `.devcontainer/Dockerfile`.
- Configuración de VS Code para el devcontainer: `.devcontainer/devcontainer.json`.
- Voz y prosa del proyecto: [estandar_editorial_forja.md](../../../../estandar_editorial_forja.md).
