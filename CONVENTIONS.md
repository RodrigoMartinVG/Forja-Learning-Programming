# Convenciones del Repositorio

## Alcance de Base 0

Base 0 deja la forma del repo, no su operatividad completa.

En esta fase:

- si se crea la estructura raiz del monorepo
- si se fijan slugs y convenciones de contenido
- no se agregan archivos de tooling de Base 1
- no se agregan metadatos operativos de Base 2

Eso significa que en Base 0 no aparecen todavia `.devcontainer/`, `meta.yaml`, `project.yaml`, `paths.yaml`, `cross-refs.yaml`, `package.json` ni codigo ejecutable de la web.

## Idioma y estilo

- La prosa del repo se escribe en espanol.
- Los nombres de carpetas y slugs se mantienen en ASCII y en kebab-case.
- Los nombres visibles al usuario pueden conservar mayusculas, espacios o acentos cuando haga falta; los slugs no.

## Convencion para niveles teoricos

Cada nivel teorico usara un directorio con este patron:

- `L0-environment`
- `L1a-c-first-contact`
- `L1b-c-deep-fundamentals`
- `...`
- `L23-kernel`

Cuando llegue la fase de un nivel, su carpeta deberia contener como minimo:

- `README.md`
- `src/`
- `exercises.md`
- `meta.yaml` (desde Base 2 en adelante)

## Convencion para proyectos

Los proyectos viven en una de estas dos ramas:

- `content/projects/focused/`
- `content/projects/integrating/`

Los slugs de proyecto usan kebab-case ASCII. Ejemplos:

- `shell remoto TCP` -> `shell-remoto-tcp`
- `RAM-FileSystem` -> `ram-filesystem`
- `KVM mini-hypervisor` -> `kvm-mini-hypervisor`
- `Lógico` -> `logico`
- `HTTP server` -> `http-server`
- `TCP/IP stack` -> `tcp-ip-stack`

Cuando llegue la fase de un proyecto, su carpeta deberia contener como minimo:

- `project.yaml` (desde Base 2 en adelante)
- `c/` y/o `rust/`
- subdirectorios `phase-n/`
- `README.md`, `STUDY_GUIDE.md` e `IMPROVEMENTS.md` dentro de cada fase

## Placeholders en Base 0

En esta fase, los README de cada rama funcionan como placeholders trackeables. Las carpetas concretas de niveles y proyectos se iran materializando a medida que avance el plan o cuando una fase posterior necesite sembrarlas de forma masiva.

## Biblioteca local

La carpeta `libros-consulta/` queda reservada para materiales privados de consulta personal. Debe permanecer fuera de Git y del remoto.
