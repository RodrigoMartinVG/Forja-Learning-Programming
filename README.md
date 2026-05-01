# Forja

Forja es un monorepo de aprendizaje de programacion de sistemas centrado en C, Rust, sistemas operativos, compiladores y herramientas de bajo nivel.

## Estado actual

- Base 0 completada: estructura inicial del repo y convenciones de contenido
- Base 1 completada: devcontainer, script de verificacion y tooling comun
- Base 2 pendiente: metadata base, plantillas y web minima

## Documentos fuente

- `docs/forja-contenido.md`: especificacion curricular y bibliografia
- `docs/forja-arquitectura.md`: estructura objetivo del repo, metadata y web
- `docs/forja-construccion.md`: orden maestro de fases y criterio operativo

## Estructura actual

- `docs/`: documentos maestros del proyecto
- `.devcontainer/`: laboratorio Linux reproducible
- `verify-setup.sh`: verificacion comun del entorno
- `content/`: track teorico y track practico
- `metadata/`: relaciones globales reservadas para Base 2
- `web/`: futura aplicacion React + TypeScript + Vite
- `libros-consulta/`: carpeta local para referencias privadas, ignorada por Git

## Que todavia no existe

Base 2 sigue pendiente. Todavia no se incluyen:

- `meta.yaml` ni `project.yaml`
- `paths.yaml` ni `cross-refs.yaml`
- `package.json`, `vite.config.ts` ni app web ejecutable

## Convenciones

Las convenciones iniciales del repo viven en `CONVENTIONS.md`. Los slugs canonicos de niveles y proyectos viven en los README de `content/theory/` y `content/projects/`.

## Biblioteca local

Si quieres tener libros pagos o de consulta personal a mano, guardalos en `libros-consulta/`. Esa carpeta queda fuera de Git y debe usarse solo con materiales obtenidos legalmente.
