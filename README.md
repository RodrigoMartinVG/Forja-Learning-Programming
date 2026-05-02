# Forja

Forja es un monorepo de aprendizaje de programacion de sistemas centrado en C, Rust, sistemas operativos, compiladores y herramientas de bajo nivel.

## Estado actual

- Base 0 completada: estructura inicial del repo y convenciones de contenido
- Base 1 completada: devcontainer, script de verificacion y tooling comun
- Base 2 en curso: metadata local/global, plantillas y web minima ya sembradas

## Documentos fuente

- `docs/forja-contenido.md`: especificacion curricular, niveles y navegacion del plan
- `docs/forja-proyectos.md`: catalogo de proyectos, taxonomia y arcos integradores
- `docs/forja-arquitectura.md`: estructura objetivo del repo, metadata y web
- `docs/forja-construccion.md`: orden maestro de fases y criterio operativo

## Estructura actual

- `docs/`: documentos maestros del proyecto
- `.devcontainer/`: laboratorio Linux reproducible para C, Rust y herramientas de sistemas
- `verify-setup.sh`: verificacion comun del laboratorio C/Rust
- `scripts/forja.py`: scaffolder de Base 2 para niveles, proyectos y metadata base
- `content/`: track teorico y track practico
- `metadata/`: metadata global base (`paths.yaml` y `cross-refs.yaml`)
- `web/`: app React + TypeScript + Vite del MVP, a ejecutar desde el host
- `libros-consulta/`: carpeta local para referencias privadas, ignorada por Git

## Entornos de trabajo

- Dev container: compilar, depurar y experimentar C/Rust dentro de un Linux reproducible.
- Host del usuario: instalar dependencias de la web y correr `npm run dev`, `npm run build` y `npm run preview`.
- Si el repo se abre desde WSL o dentro del devcontainer, ese terminal no ve el Node instalado en Windows. La web debe correrse desde el host que tenga Node disponible.

## Que sigue pendiente

- completar el contenido real de niveles y proyectos sobre el esqueleto de Base 2
- validar la web minima desde un host con Node disponible
- cerrar Base 2 con betatest de navegacion, metadata y comandos documentados

## Convenciones

Las convenciones iniciales del repo viven en `CONVENTIONS.md`. Los slugs canonicos de niveles viven en `metadata/levels.yaml`; los de proyectos viven en `project.yaml` dentro de `content/projects/`.

## Biblioteca local

Si quieres tener libros pagos o de consulta personal a mano, guardalos en `libros-consulta/`. Esa carpeta queda fuera de Git y debe usarse solo con materiales obtenidos legalmente.
