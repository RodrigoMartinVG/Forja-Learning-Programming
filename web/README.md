# Web

Este directorio contiene la app web minima de Forja para navegar contenido y metadata de Base 2.

## Separacion de entornos

- La web se corre desde el host del usuario.
- El devcontainer no instala Node ni npm a proposito. Ese entorno queda reservado para C, Rust y tooling de sistemas.
- Si abriste el repo desde WSL o dentro del devcontainer, ese terminal no ve el Node de Windows. Para usar el Node de Windows, abre una terminal del host o una ventana de VS Code abierta desde Windows.

## Requisitos del host

- Node.js instalado en el host.
- npm disponible en `PATH`.

## Comandos

```sh
cd web
npm install
npm run dev
npm run build
npm run preview
```

## Alcance actual

- React + TypeScript + Vite para navegacion estatica.
- Carga de `meta.yaml`, `project.yaml`, `paths.yaml` y `cross-refs.yaml`.
- Render de Markdown para teoria y proyectos.
- Sin backend, sin auth y sin servicios remotos.
