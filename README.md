# Forja

Forja es un monorepo de aprendizaje de programacion de sistemas centrado en C, Rust, sistemas operativos, compiladores, redes, persistencia, runtimes y herramientas de bajo nivel.

## Estado editorial actual

- El canon visible del repo ya esta fijado: `L0-L57` en teoria y el catalogo estructural actual de proyectos en `content/projects/**`.
- Solo `L0` esta hoy en authoria real dentro del track teorico.
- Solo `content/projects/focused/devcontainer-setup/README.md` esta hoy en authoria real como README raiz de proyecto.
- El resto del canon puede seguir viviendo como placeholder estructural honesto sin perder validez curricular.

## Como se organiza el repo

- `docs/`: documentos maestros del proyecto y del plan
- `content/`: contenido que la web realmente renderiza
- `metadata/`: catalogo canonico y relaciones globales (`levels.yaml`, `paths.yaml`, `cross-refs.yaml`)
- `.devcontainer/`: laboratorio Linux reproducible para C, Rust y herramientas de sistemas
- `verify-setup.sh`: verificacion comun del laboratorio dentro del devcontainer
- `scripts/forja.py`: scaffolder y validacion estructural
- `web/`: app React + TypeScript + Vite que lee el repo en build time
- `libros-consulta/`: carpeta local para referencias privadas, ignorada por Git

## Documentos maestros

- `docs/forja-contenido.md`: plan curricular humano, niveles y caminos de navegacion
- `docs/forja-proyectos.md`: catalogo de proyectos, taxonomia y arcos integradores
- `docs/forja-arquitectura.md`: estructura del repo, metadata, web y laboratorio
- `docs/forja-construccion.md`: orden maestro de construccion y criterio operativo

## Reglas de lectura rapidas

- `docs/` define el canon, la arquitectura y el orden de trabajo. Puede ir por delante del material todavia no escrito.
- `content/` contiene el cuerpo real que la web renderiza.
- `metadata/levels.yaml`, `meta.yaml` y `project.yaml` son la verdad estructural que repo y web consumen.
- La web no inventa contenido: solo navega archivos reales ya presentes en `content/` y `metadata/`.

## Validacion rapida

- Web desde host con Node: `cd web && npm run build`
- Laboratorio dentro del devcontainer: `bash ./verify-setup.sh`

## Entornos de trabajo

- Dev container: compilar, depurar y experimentar C/Rust dentro de un Linux reproducible.
- Host del usuario: instalar dependencias de la web y correr `npm run dev`, `npm run build` y `npm run preview`.
- Si el repo se abre desde WSL o dentro del devcontainer, ese terminal no ve el Node instalado en Windows. La web debe correrse desde el host que tenga Node disponible.

## Convenciones

Las reglas editoriales y estructurales viven en `CONVENTIONS.md`. Los slugs canonicos de niveles viven en `metadata/levels.yaml`; los de proyectos viven en `project.yaml` dentro de `content/projects/**`.

## Biblioteca local

Si quieres tener libros pagos o de consulta personal a mano, guardalos en `libros-consulta/`. Esa carpeta queda fuera de Git y debe usarse solo con materiales obtenidos legalmente.
