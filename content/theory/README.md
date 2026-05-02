# Track Teorico

Este directorio aloja el cuerpo teorico vigente del proyecto.

El plan canonico de niveles vive en `metadata/levels.yaml` y la descripcion curricular humana vive en `docs/forja-contenido.md`.

Este arbol no necesita conservar la historia del rediseño: contiene el material actual y la estructura minima esperada para seguir construyendo.

Cada nivel canonico `L0-L49` tiene su propio directorio `L<orden>-<slug>` bajo `content/theory/`.

## Estructura esperada por nivel

Cada nivel deberia terminar con esta forma minima:

```text
Lx-slug/
├── README.md
├── chapters/
├── outline.md
├── src/
├── exercises.md
└── meta.yaml
```

En Base 0 este README fija la estructura minima; el detalle del recorrido vive en `metadata/levels.yaml` y en `docs/forja-contenido.md`.
