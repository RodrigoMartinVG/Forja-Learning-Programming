# Metadata Global

Este directorio queda reservado para la metadata global que no se derive de forma directa del contenido local.

## Archivos actuales de Base 2

- `paths.yaml`: los cuatro caminos de navegacion
- `cross-refs.yaml`: relaciones teoria <-> proyectos y notas transversales

## Regla importante

La fuente de verdad principal no vive aqui. La metadata local de cada nivel y de cada proyecto seguira viviendo junto al contenido mediante `meta.yaml` y `project.yaml`.

## Generacion y mantenimiento

- `scripts/forja.py` siembra la metadata local de niveles y proyectos, junto con la base de este directorio.
- La metadata global complementa al contenido local; no lo reemplaza.
