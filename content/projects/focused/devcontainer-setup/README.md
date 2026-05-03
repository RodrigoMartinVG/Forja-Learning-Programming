# Proyecto: Devcontainer Setup

**Nivel ancla**: L0 — Entorno y Toolchain  
**Tipo**: Proyecto focalizado  
**Entregable**: Un ambiente reproducible documentado y verificable

---

## Qué es este proyecto

La sección teórica del L0 explica qué es un contenedor, cómo funciona Docker, qué hay en el Dockerfile y el `devcontainer.json`, y por qué el ambiente reproducible importa. Este proyecto convierte ese conocimiento en algo que se produce y se garantiza de forma deliberada.

La diferencia es importante: entender un Dockerfile no es lo mismo que poder construir, extender y verificar uno. Ese salto es el proyecto.

Este proyecto no se trabaja como un documento aislado. La forma correcta de hacerlo es con el repositorio abierto en la IDE, idealmente VS Code, y con el devcontainer Linux de ese mismo repo ya levantado. Leer este README ayuda a orientarse, pero el trabajo real ocurre sobre ese entorno.

## Como recorrerlo junto a L0

Antes de tocar este proyecto conviene haber leido:

- `content/theory/L0-setup-laboratorio/outline.md`
- `content/theory/L0-setup-laboratorio/chapters/01-devcontainer.md`
- `content/theory/L0-setup-laboratorio/chapters/02-workflow.md`
- `content/theory/L0-setup-laboratorio/chapters/03-diagnostico.md`

Antes de empezar, la condicion operativa es esta: repo abierto en la IDE, terminal dentro del contenedor y acceso directo a `.devcontainer/`, `verify-setup.sh` y al directorio del proyecto mientras se lee y se modifica.

El orden recomendado es simple:

1. abrir el repo en VS Code y entrar al devcontainer
2. entender el contrato del entorno en L0
3. correr la verificacion base
4. extender ese contrato con un check y una herramienta nuevos
5. documentar el ambiente final como si otra persona fuera a depender de el

## Qué construís

### Fase 1: Verificación del ambiente

El repositorio ya incluye `verify-setup.sh`. Tu trabajo es:

1. **Leerlo y entenderlo línea por línea.** No alcanza con ejecutarlo: hay que poder explicar qué hace cada `run_check`, por qué usa `bash -lc`, y qué diferencia hay entre un `[ok]` y un `[fail]`.

2. **Ejecutarlo y documentar el resultado.** Dentro del contenedor, se corre:
   ```bash
   bash verify-setup.sh
   ```
   Si algo falla, se investiga por qué y se arregla (o se documenta por qué es esperado).

3. **Agregar al menos un check propio.** Se elige una herramienta del laboratorio que interese (puede ser `clang-format`, `cargo-expand`, `readelf`, o cualquier otra) y se agrega un `run_check` para ella. El check debe:
   - Usar el mismo patrón que el resto del script.
   - Tener un label descriptivo.
   - Fallar con un mensaje claro si la herramienta no está.

### Fase 2: Extensión del Dockerfile

Agregás una herramienta al Dockerfile que no esté instalada en la imagen base. Criterios:
- Debe ser una herramienta real que usarías en algún nivel de Forja (no algo arbitrario).
- Debe instalarse de forma reproducible (con versión fija si es posible).
- Después de reconstruir el contenedor (`Dev Containers: Rebuild Container`), el `verify-setup.sh` debe reportarla como `[ok]`.

### Fase 3: Documentación del ambiente

Creás un archivo `ENVIRONMENT.md` (dentro del directorio del proyecto, no en el repo raíz) que documenta:

1. **Qué hay instalado y por qué.** No una lista de herramientas: una tabla con tres columnas — herramienta, propósito en Forja, nivel donde aparece por primera vez.
2. **Cómo reconstruir el contenedor** (los pasos exactos, incluyendo qué hacer si Docker Desktop no está corriendo).
3. **Qué hacer si una herramienta falla.** Al menos tres casos concretos con su diagnóstico y solución.

## Criterio de terminado

El proyecto está terminado cuando:

- `bash verify-setup.sh` pasa sin ningún `[fail]` dentro del contenedor.
- El check agregado está integrado al script y funciona.
- La herramienta agregada al Dockerfile se instala limpiamente en un rebuild.
- `ENVIRONMENT.md` existe y cubre los tres puntos de la Fase 3.
- Se puede explicar qué diferencia hay entre montar un volumen y copiar archivos, y qué pasa con los binarios compilados si se destruye y se reconstruye el contenedor.

## Lo que este proyecto no pide

- No se pide entender cgroups o namespaces en profundidad. Eso es L21.
- No se pide escribir un Dockerfile desde cero. Se pide extender el que existe.
- No se pide configurar un registry de Docker ni CI. Solo trabajo local.

## Referencia

- Unidad teorica asociada: `content/theory/L0-setup-laboratorio/`
- Script de verificación: `verify-setup.sh` en la raíz del repositorio
- Dockerfile: `.devcontainer/Dockerfile`
- Configuración VS Code: `.devcontainer/devcontainer.json`

