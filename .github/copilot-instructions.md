# Forja — instrucciones para sesiones de Copilot

Este archivo es el **punto de reencuentro** de cada sesión nueva de Copilot/AI en este repo. Léelo antes de tocar nada. No duplica los documentos maestros: los referencia.

## Regla número uno

Si el pedido implica **crear o modificar contenido** (niveles teóricos, capítulos, ejercicios, READMEs de proyectos, outlines, placeholders, prosa visible al usuario), el resultado **debe cumplir** los tres documentos canónicos:

1. [CONVENTIONS.md](../CONVENTIONS.md) — estructura, nombres, layout, estados (placeholder vs authoría real), `outline.md` antes de `chapters/`, `00-introduccion.md` obligatorio, etc.
2. [estandar_editorial_forja.md](../estandar_editorial_forja.md) — voz, prosa, tono, anti-patrones, plantillas vetadas, contrato del capítulo 00, protocolo de revisión.
3. Los `docs/forja-*.md` correspondientes — canon curricular y de arquitectura cuando el cambio toca el plan, los proyectos, la web o el orden de construcción.

Antes de empezar a redactar o crear archivos de contenido, **abrir y releer** las secciones relevantes de esos documentos. No confiar en lo que parezca recordado de sesiones anteriores: el estándar evoluciona y las plantillas viejas pueden estar vetadas.

Si hay conflicto entre lo que pide el usuario y estos documentos, avisar antes de proceder en vez de inventar una solución intermedia.

## Qué es Forja

Monorepo de aprendizaje de programación de sistemas (C, Rust, sistemas operativos, compiladores, redes, persistencia, runtimes, herramientas de bajo nivel). El canon curricular son los niveles `L0`–`L57` en [content/theory/](content/theory/) y los proyectos en [content/projects/](content/projects/). La web en [web/](web/) sólo navega archivos reales del repo; no inventa contenido.

## Estado real (no fingir authoría que no existe)

- Sólo algunos `Lx` (x es un número) están en authoría real dentro del track teórico.
- Sólo algunos projects en `content/projects/` está en authoría real de proyecto.
- El resto del canon vive como **placeholder estructural honesto**, y eso es válido. No completar contenido inventado para "rellenar".

## Documentos que mandan (en este orden)

1. [README.md](../README.md) — portada y orientación general.
2. [CONVENTIONS.md](../CONVENTIONS.md) — reglas estructurales y operativas (slugs, layout de niveles, placeholders, outline, proyectos).
3. [estandar_editorial_forja.md](../estandar_editorial_forja.md) — voz, prosa, tono, anti-patrones, protocolo editorial. Todo lo que se escribe en español visible cumple esto.
4. `docs/forja-*.md` — canon curricular y de arquitectura:
   - [docs/forja-contenido.md](../docs/forja-contenido.md): plan curricular y caminos.
   - [docs/forja-proyectos.md](../docs/forja-proyectos.md): catálogo de proyectos y arcos.
   - [docs/forja-arquitectura.md](../docs/forja-arquitectura.md): estructura del repo, metadata, web, laboratorio.
   - [docs/forja-construccion.md](../docs/forja-construccion.md): orden maestro de construcción.
5. `metadata/levels.yaml`, `meta.yaml` por nivel y `project.yaml` por proyecto: **fuente de verdad estructural**. Si un README discrepa con el YAML mientras el ítem está en placeholder, manda el YAML.

## Reglas operativas que se olvidan seguido

- Idioma de la prosa: español con tildes normales. Slugs y nombres de carpetas: ASCII `kebab-case`.
- Authoría real de un nivel **empieza por `outline.md`**, no por `chapters/` ni `exercises.md`.
- `00-introduccion.md` es obligatorio y usa exactamente ese nombre. El contrato editorial está en estándar v2 §6.4 (no la plantilla vieja "Qué es / Qué cubre / …").
- Nada queda colgado: si un tema se introduce parcial, se declara dónde se cierra (otro nivel, otro capítulo, etc.).
- Carpetas dummy de niveles/proyectos sin authoría real viven directamente bajo `content/theory/` o `content/projects/**/`, no en staging tipo `_planned/`.
- [libros-consulta/](../libros-consulta/) está fuera de Git; sólo material obtenido legalmente.

## Validación

- Web (desde host con Node): `cd web && npm run build`.
- Cualquier creación de contenido pasa primero por la **Regla número uno** de arriba

## Entornos

- **Dev container**: compilar/depurar C y Rust en Linux reproducible.
- **Host del usuario (Windows)**: correr la web (`npm run dev|build|preview`). Desde WSL o el devcontainer no se ve el Node del host.

## Para el agente

- No crear archivos `.md` "de resumen de cambios" salvo que se pidan.
- No agregar features, refactors o helpers fuera del pedido.
- Antes de redactar contenido editorial, releer [estandar_editorial_forja.md](../estandar_editorial_forja.md).
- Antes de mover/crear estructura de niveles o proyectos, releer [CONVENTIONS.md](../CONVENTIONS.md).
- Memoria de repo relevante vive en `/memories/repo/forja-*.md` y se carga automáticamente; consultarla en vez de re-explorar desde cero.
