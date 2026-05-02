# Proyecto: Devcontainer Setup

**Nivel ancla**: L0 — Entorno y Toolchain  
**Tipo**: Proyecto focalizado  
**Entregable**: Un ambiente reproducible documentado y verificable

---

## Qué es este proyecto

La sección teórica del L0 explica qué es un contenedor, cómo funciona Docker, qué hay en el Dockerfile y el `devcontainer.json`, y por qué el ambiente reproducible importa. Este proyecto convierte ese conocimiento en algo que producís y garantizás vos.

La diferencia es importante: entender un Dockerfile no es lo mismo que poder construir, extender y verificar uno. Ese salto es el proyecto.

## Qué construís

### Fase 1: Verificación del ambiente

El repositorio ya incluye `verify-setup.sh`. Tu trabajo es:

1. **Leerlo y entenderlo línea por línea.** No alcanza con ejecutarlo: tenés que poder explicar qué hace cada `run_check`, por qué usa `bash -lc`, y qué diferencia hay entre un `[ok]` y un `[fail]`.

2. **Ejecutarlo y documentar el resultado.** Dentro del contenedor, corrés:
   ```bash
   bash verify-setup.sh
   ```
   Si algo falla, investigás por qué y lo arreglás (o documentás por qué es esperado).

3. **Agregar al menos un check propio.** Elegís una herramienta del laboratorio que te interese (puede ser `clang-format`, `cargo-expand`, `readelf`, o cualquier otra) y agregás un `run_check` para ella. El check debe:
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
- El check que agregaste está integrado al script y funciona.
- La herramienta que agregaste al Dockerfile se instala limpiamente en un rebuild.
- `ENVIRONMENT.md` existe y cubre los tres puntos de la Fase 3.
- Podés explicar qué diferencia hay entre montar un volumen y copiar archivos, y qué pasa con los binarios compilados si destruís y reconstruís el contenedor.

## Lo que este proyecto no pide

- No se pide entender cgroups o namespaces en profundidad. Eso es L20.
- No se pide escribir un Dockerfile desde cero. Se pide extender el que existe.
- No se pide configurar un registry de Docker ni CI. Solo trabajo local.

## Referencia

- Sección teórica: `content/theory/L0-environment/sections/01-laboratorio.md`
- Script de verificación: `verify-setup.sh` en la raíz del repositorio
- Dockerfile: `.devcontainer/Dockerfile`
- Configuración VS Code: `.devcontainer/devcontainer.json`

